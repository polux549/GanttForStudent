import React, { useState, useEffect, useRef } from 'react';
import { GanttProject, GanttItem, GanttItemType, Language, ZoomLevel } from './types/gantt';
import { 
  getProject, 
  saveProject, 
  createSampleProject, 
  getCodeFromUrl, 
  updateUrlCode, 
  generateRandomCode,
  normalizeCode 
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

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const [project, setProject] = useState<GanttProject | null>(null);
  const [zoom, setZoom] = useState<ZoomLevel>('days');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Modals & Views
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GanttItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Synchronized scroll refs
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const taskListScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const handleChartScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingScroll.current) return;
    if (!taskListScrollRef.current) return;
    isSyncingScroll.current = true;
    taskListScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const handleTaskListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingScroll.current) return;
    if (!chartScrollRef.current) return;
    isSyncingScroll.current = true;
    chartScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const rowHeight = 48;

  // On mount, check URL for project code
  useEffect(() => {
    const code = getCodeFromUrl();
    if (code) {
      const existing = getProject(code);
      if (existing) {
        setProject(existing);
      } else {
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

    const handlePopState = () => {
      const urlCode = getCodeFromUrl();
      if (urlCode) {
        const found = getProject(urlCode);
        if (found) setProject(found);
      } else {
        setProject(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL whenever project changes
  const handleSelectProject = (proj: GanttProject | null) => {
    setProject(proj);
    updateUrlCode(proj ? proj.code : null);
  };

  // Create new project from Home
  const handleCreateProject = (title: string, customCode?: string) => {
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

  // Open existing project from Home
  const handleOpenProjectByCode = (code: string) => {
    const norm = normalizeCode(code);
    let existing = getProject(norm);
    if (!existing) {
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
    
    const colWidth = zoom === 'days' ? 38 : zoom === 'weeks' ? 22 : 12;
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

    setProject(updatedProject);
    saveProject(updatedProject);
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

    setProject(updatedProject);
    saveProject(updatedProject);
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

    setProject(updatedProject);
    saveProject(updatedProject);
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
    setProject(updatedProject);
    saveProject(updatedProject);
  };

  // Move item to specific position (drag & drop in list)
  const handleMoveItem = (
    sourceId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ) => {
    if (!project) return;
    const reordered = moveItemToPosition(project.items, sourceId, targetId, position);
    const updatedProject: GanttProject = {
      ...project,
      items: reordered,
      updatedAt: new Date().toISOString(),
    };
    setProject(updatedProject);
    saveProject(updatedProject);
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
    setProject(updatedProject);
    saveProject(updatedProject);
  };

  const handleDeleteItem = (id: string) => {
    if (!project) return;

    const updatedItems = project.items
      .filter((i) => i.id !== id)
      .map((i) => {
        const itemCopy = { ...i };
        if (itemCopy.groupId === id) itemCopy.groupId = undefined;
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

    setProject(updatedProject);
    saveProject(updatedProject);

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
    setProject(updatedProject);
    saveProject(updatedProject);
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
        if (selectedItemId) {
          setSelectedItemId(null);
          return;
        }
      }

      if (isInput) return;

      // Don't trigger standard workspace hotkeys if a modal is open
      if (isTaskModalOpen || isExportModalOpen || isShortcutsModalOpen) {
        return;
      }

      if (!project) return;

      // Open shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
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
        setZoom((z) => (z === 'months' ? 'weeks' : 'days'));
        return;
      }

      // Zoom out
      if (e.key === '-') {
        e.preventDefault();
        setZoom((z) => (z === 'days' ? 'weeks' : 'months'));
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
    <div className="h-screen w-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Bar Header */}
      <Header
        project={project}
        lang={lang}
        onLanguageChange={setLang}
        zoom={zoom}
        onZoomChange={setZoom}
        onGoToday={handleGoToday}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenPresentation={() => setIsPresentationMode(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onBackToHome={() => handleSelectProject(null)}
        onUpdateProjectTitle={handleUpdateProjectTitle}
      />

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
          rowHeight={rowHeight}
          scrollRef={chartScrollRef}
          onScroll={handleChartScroll}
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
          saveProject(imported);
          setProject(imported);
        }}
        chartContainerRef={chartScrollRef}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
