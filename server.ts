import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Collaborator {
  id: string;
  name: string;
  color: string;
  joinedAt: string;
}

interface ClientMeta {
  ws: WebSocket;
  roomCode: string;
  user: Collaborator;
}

interface RoomState {
  code: string;
  clients: Map<WebSocket, ClientMeta>;
  lastProjectState?: any;
  lastUpdatedAt?: string;
  recentLogs: Array<{
    id: string;
    userName: string;
    userColor: string;
    action: string;
    timestamp: string;
  }>;
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/api/ws' });

  // In-memory room management for active projects
  const rooms = new Map<string, RoomState>();

  function getOrCreateRoom(code: string): RoomState {
    const norm = code.trim().toUpperCase();
    if (!rooms.has(norm)) {
      rooms.set(norm, {
        code: norm,
        clients: new Map(),
        recentLogs: [],
      });
    }
    return rooms.get(norm)!;
  }

  function broadcastToRoom(room: RoomState, message: any, excludeWs?: WebSocket) {
    const raw = JSON.stringify(message);
    for (const [ws, meta] of room.clients.entries()) {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(raw);
        } catch (err) {
          console.error(`[WS] Error sending message to client in room ${room.code}:`, err);
        }
      }
    }
  }

  function getCollaborators(room: RoomState): Collaborator[] {
    const list: Collaborator[] = [];
    for (const meta of room.clients.values()) {
      list.push(meta.user);
    }
    return list;
  }

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomCode: string | null = null;
    let currentUser: Collaborator | null = null;

    ws.on('message', (data: Buffer | string) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case 'join': {
            const { roomCode, user, initialProject } = msg;
            if (!roomCode || !user) return;

            const room = getOrCreateRoom(roomCode);
            currentRoomCode = room.code;
            currentUser = {
              id: user.id || `u_${Math.random().toString(36).substring(2, 9)}`,
              name: user.name || 'Étudiant anonyme',
              color: user.color || '#6366f1',
              joinedAt: new Date().toISOString(),
            };

            room.clients.set(ws, { ws, roomCode: room.code, user: currentUser });

            // If room has no project yet and joining user provided one, initialize room
            if (!room.lastProjectState && initialProject) {
              room.lastProjectState = initialProject;
              room.lastUpdatedAt = new Date().toISOString();
            }

            // Send room welcome state to the newcomer
            ws.send(JSON.stringify({
              type: 'room_joined',
              roomCode: room.code,
              self: currentUser,
              collaborators: getCollaborators(room),
              serverProject: room.lastProjectState || null,
              recentLogs: room.recentLogs.slice(-10),
            }));

            // Notify other peers in the room
            broadcastToRoom(room, {
              type: 'peer_joined',
              user: currentUser,
              collaborators: getCollaborators(room),
            }, ws);
            break;
          }

          case 'update_project': {
            if (!currentRoomCode || !currentUser) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const { project, logMessage } = msg;
            if (!project) return;

            room.lastProjectState = project;
            room.lastUpdatedAt = new Date().toISOString();

            if (logMessage) {
              const logEntry = {
                id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                userName: currentUser.name,
                userColor: currentUser.color,
                action: logMessage,
                timestamp: new Date().toISOString(),
              };
              room.recentLogs.push(logEntry);
              if (room.recentLogs.length > 25) {
                room.recentLogs.shift();
              }
            }

            // Broadcast real-time update to all other collaborators in the room
            broadcastToRoom(room, {
              type: 'project_updated',
              project,
              sender: currentUser,
              logMessage: logMessage || null,
              timestamp: new Date().toISOString(),
            }, ws);
            break;
          }

          case 'update_user': {
            if (!currentRoomCode || !currentUser) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            if (msg.user) {
              currentUser.name = msg.user.name || currentUser.name;
              currentUser.color = msg.user.color || currentUser.color;
              const meta = room.clients.get(ws);
              if (meta) meta.user = currentUser;

              broadcastToRoom(room, {
                type: 'collaborators_updated',
                collaborators: getCollaborators(room),
              });
            }
            break;
          }

          case 'request_sync': {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (room && room.lastProjectState) {
              ws.send(JSON.stringify({
                type: 'project_updated',
                project: room.lastProjectState,
                sender: { name: 'Serveur' },
                timestamp: room.lastUpdatedAt,
              }));
            }
            break;
          }

          // Direct P2P WebRTC signaling relay between peers in same room
          case 'p2p_signal': {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const { targetUserId, signal } = msg;
            for (const [targetWs, meta] of room.clients.entries()) {
              if (meta.user.id === targetUserId && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(JSON.stringify({
                  type: 'p2p_signal',
                  senderId: currentUser?.id,
                  signal,
                }));
                break;
              }
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('[WS] Parse error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomCode && rooms.has(currentRoomCode)) {
        const room = rooms.get(currentRoomCode)!;
        room.clients.delete(ws);

        if (currentUser) {
          broadcastToRoom(room, {
            type: 'peer_left',
            user: currentUser,
            collaborators: getCollaborators(room),
          });
        }

        // Clean up empty room after 1 hour of inactivity if empty
        if (room.clients.size === 0) {
          setTimeout(() => {
            const r = rooms.get(currentRoomCode!);
            if (r && r.clients.size === 0) {
              rooms.delete(currentRoomCode!);
            }
          }, 60 * 60 * 1000);
        }
      }
    });
  });

  // REST API status endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      activeRooms: rooms.size,
      time: new Date().toISOString(),
    });
  });

  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Gantt For Student Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
