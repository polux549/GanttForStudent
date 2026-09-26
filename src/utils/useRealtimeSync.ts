import { useEffect, useRef, useState, useCallback } from 'react';
import { GanttProject, Language } from '../types/gantt';
import { Collaborator, SyncLog, getLocalUserProfile, saveLocalUserProfile } from './realtimeSync';
import { saveProject } from './storage';
import { translations } from './i18n';

export interface RealtimeSyncReturn {
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  collaborators: Collaborator[];
  currentUser: Collaborator;
  updateCurrentUser: (name: string, color: string) => void;
  recentLogs: SyncLog[];
  notification: { message: string; color?: string; id: number } | null;
  broadcastProjectChange: (newProject: GanttProject, logMessage?: string) => void;
  isRemoteSyncing: boolean;
}

export function useRealtimeSync(
  project: GanttProject | null,
  onRemoteProjectUpdate: (updatedProject: GanttProject) => void,
  lang: Language = 'fr'
): RealtimeSyncReturn {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentUser, setCurrentUser] = useState<Collaborator>(getLocalUserProfile);
  const [recentLogs, setRecentLogs] = useState<SyncLog[]>([]);
  const [notification, setNotification] = useState<{ message: string; color?: string; id: number } | null>(null);
  const [isRemoteSyncing, setIsRemoteSyncing] = useState(false);

  const t = translations[lang];
  const tRef = useRef(t);
  tRef.current = t;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const isRemoteUpdateRef = useRef(false);
  const currentProjectRef = useRef<GanttProject | null>(project);
  currentProjectRef.current = project;

  const showNotification = useCallback((message: string, color?: string) => {
    setNotification({ message, color, id: Date.now() });
    setTimeout(() => {
      setNotification((prev) => (prev && Date.now() - prev.id >= 3500 ? null : prev));
    }, 4000);
  }, []);

  // Update current user profile
  const updateCurrentUser = useCallback((name: string, color: string) => {
    const updated = saveLocalUserProfile({ name, color });
    setCurrentUser(updated);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update_user',
        user: updated,
      }));
    }
  }, []);

  // Broadcast local changes to peers
  const broadcastProjectChange = useCallback((newProject: GanttProject, logMessage?: string) => {
    // Prevent infinite sync loops: skip emit if this was triggered by a remote change
    if (isRemoteUpdateRef.current) {
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && newProject?.code) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'update_project',
          project: newProject,
          logMessage: logMessage || undefined,
        }));
      } catch (err) {
        console.error('[Sync] Error sending project update:', err);
      }
    }
  }, []);

  // Connect WebSocket & Join Room
  useEffect(() => {
    if (!project?.code) {
      setConnectionStatus('disconnected');
      setCollaborators([]);
      return;
    }

    let isUnmounted = false;

    function connect() {
      if (isUnmounted) return;
      setConnectionStatus('connecting');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/ws`;

      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isUnmounted) {
            socket.close();
            return;
          }
          setConnectionStatus('connected');

          // Send join message for current project room
          const profile = getLocalUserProfile();
          socket.send(JSON.stringify({
            type: 'join',
            roomCode: project?.code,
            user: profile,
            initialProject: currentProjectRef.current,
          }));
        };

        socket.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case 'room_joined': {
                setCollaborators(data.collaborators || []);
                if (data.recentLogs) {
                  setRecentLogs(data.recentLogs);
                }
                // If server has newer project data, sync it down
                if (data.serverProject && currentProjectRef.current) {
                  const serverUpdated = new Date(data.serverProject.updatedAt || 0).getTime();
                  const localUpdated = new Date(currentProjectRef.current.updatedAt || 0).getTime();
                  
                  if (serverUpdated > localUpdated) {
                    isRemoteUpdateRef.current = true;
                    setIsRemoteSyncing(true);
                    saveProject(data.serverProject);
                    onRemoteProjectUpdate(data.serverProject);
                    setTimeout(() => {
                      isRemoteUpdateRef.current = false;
                      setIsRemoteSyncing(false);
                    }, 100);
                  }
                }
                break;
              }

              case 'peer_joined': {
                if (data.collaborators) {
                  setCollaborators(data.collaborators);
                }
                if (data.user) {
                  showNotification(`${data.user.name} ${tRef.current.collabUserJoined}`, data.user.color);
                }
                break;
              }

              case 'peer_left': {
                if (data.collaborators) {
                  setCollaborators(data.collaborators);
                }
                if (data.user) {
                  showNotification(`${data.user.name} ${tRef.current.collabUserLeft}`);
                }
                break;
              }

              case 'collaborators_updated': {
                if (data.collaborators) {
                  setCollaborators(data.collaborators);
                }
                break;
              }

              case 'project_updated': {
                if (data.project) {
                  // Guard against circular echo
                  isRemoteUpdateRef.current = true;
                  setIsRemoteSyncing(true);

                  saveProject(data.project);
                  onRemoteProjectUpdate(data.project);

                  if (data.sender && data.sender.id !== currentUser.id) {
                    const actionText = data.logMessage || tRef.current.collabUpdatedGantt;
                    showNotification(`${data.sender.name} : ${actionText}`, data.sender.color);

                    const newLog: SyncLog = {
                      id: `log_${Date.now()}`,
                      userName: data.sender.name,
                      userColor: data.sender.color || '#6366f1',
                      action: actionText,
                      timestamp: data.timestamp || new Date().toISOString(),
                    };
                    setRecentLogs((prev) => [...prev.slice(-20), newLog]);
                  }

                  setTimeout(() => {
                    isRemoteUpdateRef.current = false;
                    setIsRemoteSyncing(false);
                  }, 120);
                }
                break;
              }

              default:
                break;
            }
          } catch (err) {
            console.error('[Sync] Error parsing message:', err);
          }
        };

        socket.onclose = () => {
          if (isUnmounted) return;
          setConnectionStatus('disconnected');
          // Reconnect with backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };

        socket.onerror = () => {
          // Will trigger onclose and attempt reconnect
        };
      } catch (err) {
        console.error('[Sync] Failed to initialize WebSocket:', err);
        setConnectionStatus('disconnected');
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 4000);
      }
    }

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [project?.code]);

  return {
    connectionStatus,
    collaborators,
    currentUser,
    updateCurrentUser,
    recentLogs,
    notification,
    broadcastProjectChange,
    isRemoteSyncing,
  };
}
