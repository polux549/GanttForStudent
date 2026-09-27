import React, { useState, useEffect, useRef } from 'react';
import { GanttProject, GanttItem, GanttItemType, Language, ZoomLevel, TaskComment } from './types/gantt';
import { 
  getProject, 
  saveProject, 
  createSampleProject, 
  getCodeFromUrl, 
  updateUrlCode, 
  generateRandomCode,
  normalizeCode,
  isProjectOwner,
  setProjectOwnerKey
} from './utils/storage';
import { 
  recalculateSchedule, 
  reorderItems, 
  moveItemToPosition,
  setItemGroup 
} from './utils/ganttEngine';
import { getTodayString, diffDays, addDays } from './utils/dates';
import { HomePage } from './components/HomePage';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { GanttChart } from './components/GanttChart';
import { TaskModal } from './components/TaskModal';
import { ExportModal } from './components/ExportModal';
import { PresentationView } from './components/PresentationView';
import { ShortcutsModal } from './components/ShortcutsModal';
import { CollaborationModal } from './components/CollaborationModal';
import { WorkloadModal } from './components/WorkloadModal';
import { AccountingView } from './components/AccountingView';
import { AccountingLedger } from './types/accounting';
import { getLedger, saveLedger, createSampleLedger, normalizeAccountingCode } from './utils/accountingStorage';
import { useRealtimeSync } from './utils/useRealtimeSync';

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const [project, setProject] = useState<GanttProject | null>(null);
  const [accountingLedger, setAccountingLedger] = useState<AccountingLedger | null>(null);
  const [zoom, setZoom] = useState<ZoomLevel>('weeks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Undo / Redo history stacks
  const [undoStack, setUndoStack] = useState<GanttProject[]>([]);
  const [redoStack, setRedoStack] = useState<GanttProject[]>([]);

  // Features: Workload, Read-Only mode
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Modals & Views
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GanttItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isCollaborationModalOpen, setIsCollaborationModalOpen] = useState(false);

  // Real-time P2P synchronization without Firebase
  const {
    connectionStatus,
    collaborators,
    currentUser,
    updateCurrentUser,
    recentLogs,
    notification,
    broadcastProjectChange,
  } = useRealtimeSync(
    project,
    (remoteProject) => {
      setProject(remoteProject);
    },
    lang
  );

  const pushUndo = (prevProject: GanttProject) => {
    setUndoStack((prev) => [...prev.slice(-30), prevProject]);
    setRedoStack([]);
  };

  const updateAndBroadcastProject = (updatedProject: GanttProject, logMessage?: string) => {
    if (isReadOnly) return;
    if (project) {
      pushUndo(project);
    }
    setProject(updatedProject);
    saveProject(updatedProject);
    broadcastProjectChange(updatedProject, logMessage);
  };

  const handleUndo = () => {
    if (isReadOnly || undoStack.length === 0 || !project) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, project]);
    setProject(previous);
    saveProject(previous);
    broadcastProjectChange(previous, 'Annulation (Undo)');
  };

  const handleRedo = () => {
    if (isReadOnly || redoStack.length === 0 || !project) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, project]);
    setProject(next);
    saveProject(next);
    broadcastProjectChange(next, 'Rétablissement (Redo)');
  };

  // Synchronized scroll refs
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const taskListScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingChart = useRef(false);
  const isSyncingTaskList = useRef(false);

  const handleChartScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingChart.current) {
      isSyncingChart.current = false;
      return;
    }
    if (!taskListScrollRef.current) return;
    isSyncingTaskList.current = true;
    taskListScrollRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  const handleTaskListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingTaskList.current) {
      isSyncingTaskList.current = false;
      return;
    }
    if (!chartScrollRef.current) return;
    isSyncingChart.current = true;
    chartScrollRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  const rowHeight = 48;

  // On mount, check URL for project code, read-only mode and secret key
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const readOnlyParam = params.get('readonly') === 'true' || params.get('readonly') === '1';
    const keyParam = params.get('key');

    const code = getCodeFromUrl();
    if (code) {
      if (code.startsWith('$')) {
        const normLedger = normalizeAccountingCode(code);
        let existing = getLedger(normLedger);
        if (!existing) {
          existing = createSampleLedger(normLedger);
          saveLedger(existing);
        }
        setAccountingLedger(existing);
        setProject(null);
        setIsReadOnly(false);
      } else {
        const existing = getProject(code);
        if (existing) {
          setIsReadOnly(readOnlyParam);

          if (code === 'DEMO-ETUDIANT') {
            if (existing.items.length < 15) {
              const sample = createSampleProject(code, lang);
              saveProject(sample);
              setProject(sample);
            } else {
              setProject(existing);
            }
          } else {
            setProject(existing);
          }
        } else {
          setIsReadOnly(readOnlyParam);
          if (code === 'DEMO-ETUDIANT') {
            const sample = createSampleProject(code, lang);
            setProject(sample);
          } else {
            const newProj: GanttProject = {
              code,
              title: `Projet ${code}`,
              items: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            saveProject(newProj);
            setProject(newProj);
          }
        }
      }
    } else {
      setIsReadOnly(readOnlyParam);
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const readOnlyP = currentParams.get('readonly') === 'true' || currentParams.get('readonly') === '1';
      const keyP = currentParams.get('key');

      const urlCode = getCodeFromUrl();
      if (urlCode) {
        if (urlCode.startsWith('$')) {
          const normLedger = normalizeAccountingCode(urlCode);
          let existing = getLedger(normLedger);
          if (!existing) {
            existing = createSampleLedger(normLedger);
            saveLedger(existing);
          }
          setAccountingLedger(existing);
          setProject(null);
          setIsReadOnly(false);
        } else {
          const found = getProject(urlCode);
          if (found) {
            setIsReadOnly(readOnlyP);
            setProject(found);
            setAccountingLedger(null);
          }
        }
      } else {
        setProject(null);
        setAccountingLedger(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL whenever project changes
  const handleSelectProject = (proj: GanttProject | null) => {
    setProject(proj);
    setAccountingLedger(null);
    setUndoStack([]);
    setRedoStack([]);
    updateUrlCode(proj ? proj.code : null);
  };

  // Create new project from Home
  const handleCreateProject = (title: string, customCode?: string) => {
    if (customCode && customCode.startsWith('$')) {
      handleOpenProjectByCode(customCode);
      return;
    }
    const code = customCode ? normalizeCode(customCode) : generateRandomCode();
    const newProj: GanttProject = {
      code,
      title,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProject(newProj);
    handleSelectProject(newProj);
  };

  // Open existing project or secret accounting from Home
  const handleOpenProjectByCode = (code: string) => {
    if (code.startsWith('$')) {
      const normLedger = normalizeAccountingCode(code);
      let existing = getLedger(normLedger);
      if (!existing) {
        existing = createSampleLedger(normLedger);
        saveLedger(existing);
      }
      setAccountingLedger(existing);
      setProject(null);
      updateUrlCode(normLedger);
      return;
    }

    const norm = normalizeCode(code);
    let existing = getProject(norm);
    if (!existing || (norm === 'DEMO-ETUDIANT' && existing.items.length < 15)) {
      if (norm === 'DEMO-ETUDIANT') {
        existing = createSampleProject(norm, lang);
      } else {
        existing = {
          code: norm,
          title: `Projet ${norm}`,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveProject(existing);
      }
    }
    handleSelectProject(existing);
  };

  // Launch Sample Demo project
  const handleExploreDemo = () => {
    const demo = createSampleProject('DEMO-ETUDIANT', lang);
    handleSelectProject(demo);
  };

  // Go to Today in the Gantt viewport
  const handleGoToday = () => {
    if (!chartScrollRef.current || !project) return;
    const container = chartScrollRef.current;
    
    const colWidth = zoom === 'years' ? 5 : zoom === 'weeks' ? 24 : 12;
    const today = getTodayString();
    let minDate = project.items[0]?.startDate || today;
    for (const item of project.items) {
      if (item.startDate && item.startDate < minDate) minDate = item.startDate;
    }
    const daysOffset = diffDays(minDate, today) + 6;
    const targetX = Math.max(0, daysOffset * colWidth - container.clientWidth / 2);

    container.scrollTo({
      left: targetX,
      behavior: 'smooth',
    });
  };

  // Center on today on first load of a project
  useEffect(() => {
    if (project && project.items.length > 0) {
      setTimeout(() => {
        handleGoToday();
      }, 200);
    }
  }, [project?.code, zoom]);

  // Task creation/editing
  const handleAddItem = (type: 'task' | 'group' | 'milestone', parentGroupId?: string) => {
    const today = getTodayString();
    setEditingItem({
      id: '', // Empty indicates new item, modal will generate unique ID
      name: '',
      type,
      schedulingMode: type === 'group' ? 'auto' : 'manual',
      startDate: today,
      endDate: type === 'milestone' ? today : addDays(today, 5),
      duration: type === 'milestone' ? 0 : 6,
      progress: 0,
      color: type === 'milestone' ? '#f59e0b' : '#6366f1',
      groupId: parentGroupId,
      collapsed: false,
    });
    setIsTaskModalOpen(true);
  };

  // Quick create on double click at date (creates directly without opening edit modal)
  const handleQuickCreateAtDate = (date: string, type: GanttItemType) => {
    if (!project) return;
    const isMilestone = type === 'milestone';
    const isGroup = type === 'group';
    const newId = `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const defaultName = isGroup 
      ? (lang === 'fr' ? 'Nouveau groupe' : lang === 'de' ? 'Neue Gruppe' : lang === 'it' ? 'Nuovo gruppo' : 'New Group')
      : isMilestone
      ? (lang === 'fr' ? 'Nouveau jalon' : lang === 'de' ? 'Neuer Meilenstein' : lang === 'it' ? 'Nuova tappa' : 'New Milestone')
      : (lang === 'fr' ? 'Nouvelle tâche' : lang === 'de' ? 'Neue Aufgabe' : lang === 'it' ? 'Nuova attività' : 'New Task');

    const newItem: GanttItem = {
      id: newId,
      name: defaultName,
      type,
      schedulingMode: isGroup ? 'auto' : 'manual',
      startDate: date,
      endDate: isMilestone ? date : addDays(date, 5),
      duration: isMilestone ? 0 : 6,
      progress: 0,
      color: isMilestone ? '#f59e0b' : '#6366f1',
      collapsed: false,
    };

    const updatedItems = [...project.items, newItem];
    const calculated = recalculateSchedule(updatedItems);
    const updatedProject: GanttProject = {
      ...project,
      items: calculated,
      updatedAt: new Date().toISOString(),
    };

    updateAndBroadcastProject(updatedProject, `Création rapide : ${newItem.name}`);
    setSelectedItemId(newId);
  };

  const handleEditItem = (item: GanttItem) => {
    setEditingItem(item);
    setIsTaskModalOpen(true);
  };

  const handleSaveItem = (item: GanttItem) => {
    if (!project) return;

    let updatedItems = [...project.items];
    const index = updatedItems.findIndex((i) => i.id === item.id);

    if (index >= 0) {
      updatedItems[index] = item;
    } else {
      updatedItems.push(item);
    }

    const calculated = recalculateSchedule(updatedItems);
    const updatedProject: GanttProject = {
      ...project,
      items: calculated,
      updatedAt: new Date().toISOString(),
    };

    updateAndBroadcastProject(updatedProject, index >= 0 ? `Modification : ${item.name}` : `Ajout : ${item.name}`);
  };

  // Update item dates directly via Gantt drag / resize
  const handleUpdateItemDates = (id: string, newStartDate: string, newEndDate: string) => {
    if (!project) return;
    const updatedItems = project.items.map((it) => {
      if (it.id === id) {
        const isMilestone = it.type === 'milestone';
        const d = isMilestone ? 0 : Math.max(1, diffDays(newStartDate, newEndDate) + 1);
        return {
          ...it,
          startDate: newStartDate,
          endDate: isMilestone ? newStartDate : newEndDate,
          duration: d,
          schedulingMode: 'manual' as const, // Dragging manual dates converts to manual
        };
      }
      return it;
    });

    const calculated = recalculateSchedule(updatedItems);
    const updatedProject: GanttProject = {
      ...project,
      items: calculated,
      updatedAt: new Date().toISOString(),
    };

    updateAndBroadcastProject(updatedProject, 'Mise à jour des dates');
  };

  // Reorder item up or down
  const handleReorderItem = (id: string, direction: 'up' | 'down') => {
    if (!project) return;
    const reordered = reorderItems(project.items, id, direction);
    const calculated = recalculateSchedule(reordered);
    const updatedProject = {
      ...project,
      items: calculated,
      updatedAt: new Date().toISOString(),
    };
    updateAndBroadcastProject(updatedProject, 'Réorganisation des tâches');
  };

  // Move item to specific position (drag & drop in list)
  const handleMoveItem = (
    sourceId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ) => {
    if (!project) return;
    const effectiveTargetId = targetId === '__TOP__' ? (project.items[0]?.id || '') : targetId;
    if (!effectiveTargetId || effectiveTargetId === sourceId) return;

    const reordered = moveItemToPosition(project.items, sourceId, effectiveTargetId, targetId === '__TOP__' ? 'before' : position);
    const updatedProject: GanttProject = {
      ...project,
      items: reordered,
      updatedAt: new Date().toISOString(),
    };
    updateAndBroadcastProject(updatedProject, 'Déplacement dans la liste');
  };

  // Move item into a group (drag and drop)
  const handleMoveToGroup = (itemId: string, targetGroupId: string | null) => {
    if (!project) return;
    const updatedItems = setItemGroup(project.items, itemId, targetGroupId);
    const calculated = recalculateSchedule(updatedItems);
    const updatedProject = {
      ...project,
      items: calculated,
      updatedAt: new Date().toISOString(),
    };
    updateAndBroadcastProject(updatedProject, 'Déplacement dans un groupe');
  };

  const handleDeleteItem = (id: string) => {
    if (!project) return;

    const targetItem = project.items.find((i) => i.id === id);
    const parentGroupId = targetItem?.groupId;

    const updatedItems = project.items
      .filter((i) => i.id !== id)
      .map((i) => {
        const itemCopy = { ...i };
        if (itemCopy.groupId === id) itemCopy.groupId = parentGroupId;
        if (itemCopy.predecessorId === id) {
          itemCopy.predecessorId = undefined;
          itemCopy.schedulingMode = 'manual';
        }
        return itemCopy;
      });

    const calculated = recalculateSchedule(updatedItems);
    const updatedProject: GanttProject = {
      ...project,
      items: calculated,
      updatedAt: new Date().toISOString(),
    };

    updateAndBroadcastProject(updatedProject, `Suppression : ${targetItem?.name || 'élément'}`);

    if (selectedItemId === id) setSelectedItemId(null);
  };

  const handleToggleGroupCollapse = (groupId: string) => {
    if (!project) return;
    const updatedItems = project.items.map((i) => {
      if (i.id === groupId) {
        return { ...i, collapsed: !i.collapsed };
      }
      return i;
    });

    const updatedProject: GanttProject = {
      ...project,
      items: updatedItems,
    };
    setProject(updatedProject);
    saveProject(updatedProject);
  };

  // Toggle reduce/expand all groups
  const handleToggleCollapseAll = () => {
    if (!project) return;
    const groups = project.items.filter((i) => i.type === 'group');
    if (groups.length === 0) return;
    const allCollapsed = groups.every((g) => g.collapsed);
    const newCollapsedState = !allCollapsed;

    const updatedItems = project.items.map((i) => {
      if (i.type === 'group') {
        return { ...i, collapsed: newCollapsedState };
      }
      return i;
    });

    const updatedProject: GanttProject = {
      ...project,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };
    setProject(updatedProject);
    saveProject(updatedProject);
  };

  // Update project title (keeping project code unchangeable)
  const handleUpdateProjectTitle = (newTitle: string) => {
    if (!project) return;
    const updatedProject: GanttProject = {
      ...project,
      title: newTitle.trim() || project.title,
      updatedAt: new Date().toISOString(),
    };
    updateAndBroadcastProject(updatedProject, `Titre renommé : ${newTitle.trim()}`);
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.isContentEditable
      );

      // Escape always closes any open modal or presentation view
      if (e.key === 'Escape') {
        if (isWorkloadModalOpen) {
          setIsWorkloadModalOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isPresentationMode) {
          setIsPresentationMode(false);
          return;
        }
        if (isTaskModalOpen) {
          setIsTaskModalOpen(false);
          return;
        }
        if (isExportModalOpen) {
          setIsExportModalOpen(false);
          return;
        }
        if (isCollaborationModalOpen) {
          setIsCollaborationModalOpen(false);
          return;
        }
        if (selectedItemId) {
          setSelectedItemId(null);
          return;
        }
      }

      if (isInput) return;

      // Undo: Ctrl+Z or Cmd+Z (without shift)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Don't trigger standard workspace hotkeys if a modal is open
      if (isTaskModalOpen || isExportModalOpen || isShortcutsModalOpen || isWorkloadModalOpen || isCollaborationModalOpen) {
        return;
      }

      if (!project) return;

      // Open shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Toggle Workload Modal (W key)
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setIsWorkloadModalOpen((prev) => !prev);
        return;
      }

      // Add Task
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleAddItem('task');
        return;
      }

      // Add Group
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleAddItem('group');
        return;
      }

      // Add Milestone
      if (e.key === 'j' || e.key === 'J' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleAddItem('milestone');
        return;
      }

      // Delete selected item
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItemId) {
          e.preventDefault();
          handleDeleteItem(selectedItemId);
        }
        return;
      }

      // Edit / Rename selected item
      if (e.key === 'Enter' || e.key === ' ') {
        if (selectedItemId) {
          const item = project.items.find((i) => i.id === selectedItemId);
          if (item) {
            e.preventDefault();
            handleEditItem(item);
          }
        }
        return;
      }

      // Toggle Presentation mode
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPresentationMode((prev) => !prev);
        return;
      }

      // Toggle Export modal
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsExportModalOpen((prev) => !prev);
        return;
      }

      // Zoom in
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((z) => (z === 'years' ? 'months' : 'weeks'));
        return;
      }

      // Zoom out
      if (e.key === '-') {
        e.preventDefault();
        setZoom((z) => (z === 'weeks' ? 'months' : 'years'));
        return;
      }

      // Reorder item with Alt+ArrowUp or Alt+ArrowDown
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        if (selectedItemId) {
          e.preventDefault();
          handleReorderItem(selectedItemId, e.key === 'ArrowUp' ? 'up' : 'down');
          return;
        }
      }

      // Navigate between items with arrow keys
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (project.items.length === 0) return;
        const currentIndex = project.items.findIndex((i) => i.id === selectedItemId);
        if (e.key === 'ArrowDown') {
          const nextIndex = currentIndex < project.items.length - 1 ? currentIndex + 1 : 0;
          setSelectedItemId(project.items[nextIndex].id);
        } else {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : project.items.length - 1;
          setSelectedItemId(project.items[prevIndex].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    project,
    selectedItemId,
    isPresentationMode,
    isTaskModalOpen,
    isExportModalOpen,
    isShortcutsModalOpen,
    lang,
  ]);

  // If secret accounting ledger active, render Accounting View!
  if (accountingLedger) {
    return (
      <AccountingView
        ledger={accountingLedger}
        onUpdateLedger={(updated) => {
          saveLedger(updated);
          setAccountingLedger(updated);
        }}
        onBackToHome={() => {
          setAccountingLedger(null);
          updateUrlCode(null);
        }}
      />
    );
  }

  // If no project selected, render Home Page
  if (!project) {
    return (
      <HomePage
        lang={lang}
        onLanguageChange={setLang}
        onCreateProject={handleCreateProject}
        onOpenProjectByCode={handleOpenProjectByCode}
        onExploreDemo={handleExploreDemo}
      />
    );
  }

  // If Presentation Mode active, render dedicated Presentation View
  if (isPresentationMode) {
    return (
      <PresentationView
        project={project}
        lang={lang}
        zoom={zoom}
        onZoomChange={setZoom}
        onClose={() => setIsPresentationMode(false)}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#050507] text-zinc-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Bar Header */}
      <Header
        project={project}
        lang={lang}
        zoom={zoom}
        onZoomChange={setZoom}
        onGoToday={handleGoToday}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenPresentation={() => setIsPresentationMode(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenCollaboration={() => setIsCollaborationModalOpen(true)}
        onOpenWorkload={() => setIsWorkloadModalOpen(true)}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isReadOnly={isReadOnly}
        collaboratorCount={collaborators.length || 1}
        connectionStatus={connectionStatus}
        collaborators={collaborators}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onBackToHome={() => handleSelectProject(null)}
        onUpdateProjectTitle={handleUpdateProjectTitle}
      />

      {/* Real-time Collaboration Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900/95 border border-zinc-700/80 text-white text-xs font-medium rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 duration-200 pointer-events-none">
          <span 
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
            style={{ backgroundColor: notification.color || '#6366f1' }} 
          />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Workspace (Left Sidebar + Gantt Chart) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Task List */}
        {isSidebarOpen && (
          <TaskList
            items={project.items}
            lang={lang}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onToggleGroupCollapse={handleToggleGroupCollapse}
            onToggleCollapseAll={handleToggleCollapseAll}
            onReorderItem={handleReorderItem}
            onMoveItem={handleMoveItem}
            onMoveToGroup={handleMoveToGroup}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            rowHeight={rowHeight}
            scrollRef={taskListScrollRef}
            onScroll={handleTaskListScroll}
            isReadOnly={isReadOnly}
          />
        )}

        {/* Right Gantt Chart Viewport with Synchronized Scroll */}
        <GanttChart
          items={project.items}
          lang={lang}
          zoom={zoom}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
          onEditItem={handleEditItem}
          onQuickCreateAtDate={handleQuickCreateAtDate}
          onUpdateItemDates={handleUpdateItemDates}
          onMoveItem={handleMoveItem}
          rowHeight={rowHeight}
          scrollRef={chartScrollRef}
          onScroll={handleChartScroll}
          isReadOnly={isReadOnly}
        />
      </div>

      {/* Task & Milestone Editor Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveItem}
        onDelete={editingItem?.id ? handleDeleteItem : undefined}
        item={editingItem}
        allItems={project.items}
        lang={lang}
        isReadOnly={isReadOnly}
      />

      {/* Export Presentation Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        lang={lang}
        zoom={zoom}
        onEnterPresentationMode={() => setIsPresentationMode(true)}
        onImportProject={(imported) => {
          updateAndBroadcastProject(imported, 'Import du projet');
        }}
        chartContainerRef={chartScrollRef}
      />

      {/* Workload Management Modal */}
      <WorkloadModal
        isOpen={isWorkloadModalOpen}
        onClose={() => setIsWorkloadModalOpen(false)}
        items={project.items}
        onSelectTask={(taskId) => {
          setIsWorkloadModalOpen(false);
          setSelectedItemId(taskId);
          const target = project.items.find((it) => it.id === taskId);
          if (target) handleEditItem(target);
        }}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        lang={lang}
      />

      {/* Real-time P2P Collaboration Modal */}
      <CollaborationModal
        isOpen={isCollaborationModalOpen}
        onClose={() => setIsCollaborationModalOpen(false)}
        project={project}
        collaborators={collaborators}
        currentUser={currentUser}
        connectionStatus={connectionStatus}
        recentLogs={recentLogs}
        onUpdateCurrentUser={updateCurrentUser}
        lang={lang}
      />
    </div>
  );
}
