import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  FolderPlus, 
  Flag, 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Link as LinkIcon, 
  ChevronUp,
  Layers,
  GripVertical,
  LogOut,
  FolderTree,
  Lock,
  Eye
} from 'lucide-react';
import { GanttItem, Language } from '../types/gantt';
import { translations } from '../utils/i18n';
import { getOrganizedItems, isDescendantOf } from '../utils/ganttEngine';
import { formatReadableDate } from '../utils/dates';

interface TaskListProps {
  items: GanttItem[];
  lang: Language;
  onAddItem: (type: 'task' | 'group' | 'milestone', parentGroupId?: string) => void;
  onEditItem: (item: GanttItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleGroupCollapse: (groupId: string) => void;
  onToggleCollapseAll?: () => void;
  onReorderItem: (id: string, direction: 'up' | 'down') => void;
  onMoveItem?: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onMoveToGroup: (itemId: string, targetGroupId: string | null) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  rowHeight: number;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isReadOnly?: boolean;
  theme?: 'dark' | 'light';
}

export const TaskList: React.FC<TaskListProps> = ({
  items,
  lang,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleGroupCollapse,
  onToggleCollapseAll,
  onReorderItem,
  onMoveItem,
  onMoveToGroup,
  selectedItemId,
  onSelectItem,
  rowHeight,
  scrollRef,
  onScroll,
  isReadOnly = false,
  theme = 'dark',
}) => {
  const t = translations[lang];
  const organized = useMemo(() => {
    return getOrganizedItems(items).filter((r) => r.isVisible);
  }, [items]);

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'after' | 'inside' } | null>(null);

  const draggedItem = items.find((i) => i.id === draggedItemId);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverRow = (e: React.DragEvent, targetItem: GanttItem) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedItemId || draggedItemId === targetItem.id) return;

    const isDraggedGroup = draggedItem?.type === 'group';
    const isTargetGroup = targetItem.type === 'group';

    // Cycle prevention: a group cannot be dropped into itself or any of its descendants
    if (isDraggedGroup && (targetItem.id === draggedItem.id || isDescendantOf(items, targetItem.id, draggedItem.id))) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;

    if (isTargetGroup) {
      if (isDraggedGroup) {
        // Dragging a group onto another group: prioritize becoming a sub-group
        if (offsetY < height * 0.30) {
          setDropTarget({ id: targetItem.id, position: 'before' });
        } else if (offsetY > height * 0.70) {
          setDropTarget({ id: targetItem.id, position: 'after' });
        } else {
          setDropTarget({ id: targetItem.id, position: 'inside' });
        }
      } else {
        // Dragging a task or milestone: generous upper region to allow dragging UP above group
        if (offsetY < height * 0.40) {
          setDropTarget({ id: targetItem.id, position: 'before' });
        } else if (offsetY > height * 0.75) {
          setDropTarget({ id: targetItem.id, position: 'after' });
        } else {
          setDropTarget({ id: targetItem.id, position: 'inside' });
        }
      }
    } else {
      if (offsetY < height * 0.5) {
        setDropTarget({ id: targetItem.id, position: 'before' });
      } else {
        setDropTarget({ id: targetItem.id, position: 'after' });
      }
    }
  };

  // Auto-scroll when dragging near container boundaries (allows dragging up to items off-screen)
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!scrollRef?.current || isReadOnly) return;
    const container = scrollRef.current;
    const rect = container.getBoundingClientRect();
    const topDist = e.clientY - rect.top;
    const bottomDist = rect.bottom - e.clientY;
    if (topDist < 70 && container.scrollTop > 0) {
      const speed = Math.max(10, Math.round((70 - topDist) / 2));
      container.scrollTop -= speed;
    } else if (bottomDist < 70) {
      const speed = Math.max(10, Math.round((70 - bottomDist) / 2));
      container.scrollTop += speed;
    }
  };

  const handleDragLeaveRow = (e: React.DragEvent, itemId: string) => {
    // Prevent clearing drop target if moving between child elements of the same row
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dropTarget?.id === itemId) {
      setDropTarget(null);
    }
  };

  const handleDropOnRow = (e: React.DragEvent, targetItem: GanttItem) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!sourceId || sourceId === targetItem.id) {
      setDraggedItemId(null);
      setDropTarget(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;

    // Resilient fallback position if dropTarget state was momentarily uncommitted
    let pos = dropTarget?.position;
    if (!pos || dropTarget?.id !== targetItem.id) {
      if (targetItem.type === 'group') {
        pos = offsetY < height * 0.35 ? 'before' : offsetY > height * 0.70 ? 'after' : 'inside';
      } else {
        pos = offsetY < height * 0.5 ? 'before' : 'after';
      }
    }

    if (pos === 'inside') {
      onMoveToGroup(sourceId, targetItem.id);
    } else if (onMoveItem) {
      onMoveItem(sourceId, targetItem.id, pos);
    }

    setDraggedItemId(null);
    setDropTarget(null);
  };

  const handleDropOutGroup = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (sourceId) {
      if (organized.length > 0 && onMoveItem) {
        onMoveItem(sourceId, organized[0].item.id, 'before');
      } else {
        onMoveToGroup(sourceId, null);
      }
    }
    setDraggedItemId(null);
    setDropTarget(null);
  };

  const groups = items.filter((i) => i.type === 'group');
  const hasGroups = groups.length > 0;
  const allGroupsCollapsed = hasGroups && groups.every((g) => g.collapsed);

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const selectedIsGroup = selectedItem?.type === 'group';

  return (
    <div 
      className={`w-64 sm:w-72 flex flex-col shrink-0 select-none h-full transition-all border-r ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#08080a] border-zinc-800/80'
      }`}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Synchronized Header: Exactly 64px (h-6 + h-10) to match GanttChart timeline */}
      <div className={`h-6 border-b px-2 flex items-center justify-between text-[10px] font-medium shrink-0 ${
        theme === 'light'
          ? 'bg-slate-50 border-slate-200 text-slate-500'
          : 'bg-[#0c0c0e] border-zinc-800/80 text-zinc-400'
      }`}>
        {/* Arrow button to expand or collapse all groups */}
        <button
          onClick={onToggleCollapseAll}
          disabled={!hasGroups}
          className={`p-0.5 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 group/collapse-all ${
            theme === 'light'
              ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title={
            !hasGroups
              ? "Aucun groupe dans ce projet"
              : allGroupsCollapsed
              ? "Agrandir / Déplier tous les groupes"
              : "Réduire / Replier tous les groupes"
          }
        >
          {allGroupsCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-indigo-500 group-hover/collapse-all:scale-110 transition-transform" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500 group-hover/collapse-all:scale-110 transition-transform" />
          )}
        </button>

        <div className="flex items-center gap-2 text-right pr-1">
          <span className="w-8 text-center">%</span>
          <span className="w-7 text-right">{t.dayShort}</span>
          <span className="w-14 text-right">Ordre</span>
        </div>
      </div>

      {/* Tier 2: Action buttons or Drag Drop Zone (Strictly 40px = h-10 matching days tier) */}
      <div className={`h-10 border-b px-2 flex items-center justify-between gap-1 shrink-0 ${
        theme === 'light'
          ? 'bg-white border-slate-200'
          : 'bg-[#09090b] border-zinc-800/90'
      }`}>
        {isReadOnly ? (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-medium w-full justify-center shadow-xs border ${
            theme === 'light'
              ? 'bg-slate-100 border-slate-200 text-slate-600'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}>
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Mode lecture seule</span>
          </div>
        ) : draggedItemId ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOutGroup}
            className="w-full h-7 bg-indigo-950/70 border border-dashed border-indigo-400 text-[10px] text-indigo-200 rounded flex items-center justify-center gap-1.5 animate-pulse cursor-pointer"
          >
            <LogOut className="w-3 h-3 text-indigo-300" />
            <span>Glisser ici pour sortir du groupe (niveau principal)</span>
          </div>
        ) : (
          <>
            <span className={`text-[11px] font-semibold pl-1 ${
              theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
            }`}>
              {items.length} {items.length > 1 ? 'éléments' : 'élément'}
            </span>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onAddItem('task', selectedIsGroup && selectedItemId ? selectedItemId : undefined)}
                className={`flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-medium text-white transition-colors cursor-pointer shadow-xs ${
                  theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
                title={selectedIsGroup ? `Ajouter une tâche dans "${selectedItem.name}"` : "Ajouter une tâche (Touche T)"}
              >
                <Plus className="w-3 h-3 text-white" />
                <span className="text-white">{t.task}</span>
              </button>

              <button
                onClick={() => onAddItem('group', selectedIsGroup && selectedItemId ? selectedItemId : undefined)}
                className={`flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer border ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700/80 text-zinc-200'
                }`}
                title={selectedIsGroup ? `Créer un sous-groupe dans "${selectedItem.name}"` : "Ajouter un groupe (Touche G)"}
              >
                <FolderPlus className={`w-3 h-3 ${theme === 'light' ? 'text-slate-600' : 'text-indigo-400'}`} />
                <span>{selectedIsGroup ? 'Sous-gr.' : t.group}</span>
              </button>

              <button
                onClick={() => onAddItem('milestone', selectedIsGroup && selectedItemId ? selectedItemId : undefined)}
                className={`flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer border ${
                  theme === 'light'
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700/80 text-amber-300'
                }`}
                title={selectedIsGroup ? `Ajouter un jalon dans "${selectedItem.name}"` : "Ajouter un jalon (Touche J)"}
              >
                <Flag className="w-3 h-3 text-amber-500" />
                <span>{t.milestone}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Scrollable Task Rows with synchronized scrollRef */}
      <div 
        ref={scrollRef}
        onScroll={onScroll}
        onDragOver={handleContainerDragOver}
        className={`flex-1 overflow-y-auto divide-y transition-colors ${
          theme === 'light' ? 'divide-slate-200/70 bg-white' : 'divide-zinc-850/60 bg-transparent'
        }`}
      >
        {organized.length === 0 ? (
          <div className={`p-6 text-center text-xs ${
            theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
          }`}>
            <Layers className={`w-8 h-8 mx-auto mb-2 opacity-60 ${
              theme === 'light' ? 'text-slate-400' : 'text-zinc-600'
            }`} />
            <p className={`font-semibold mb-1 ${
              theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
            }`}>{t.noItemsYet}</p>
            <p className="text-[11px] leading-relaxed">{t.noItemsDesc}</p>
          </div>
        ) : (
          <>
            {/* Top Drop Zone: easily drag any element to the very top (first position) */}
            {!isReadOnly && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDropTarget({ id: '__TOP__', position: 'before' });
                }}
                onDragLeave={() => {
                  if (dropTarget?.id === '__TOP__') setDropTarget(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId = e.dataTransfer.getData('text/plain') || draggedItemId;
                  if (sourceId && organized.length > 0) {
                    if (onMoveItem) {
                      onMoveItem(sourceId, organized[0].item.id, 'before');
                    }
                  }
                  setDraggedItemId(null);
                  setDropTarget(null);
                }}
                className={`w-full transition-all duration-150 flex items-center justify-center text-[10px] font-semibold border-b ${
                  dropTarget?.id === '__TOP__'
                    ? theme === 'light'
                      ? 'h-8 bg-indigo-50 border-indigo-400 text-indigo-700 shadow-xs ring-1 ring-indigo-300'
                      : 'h-8 bg-indigo-950/95 border-indigo-400 text-indigo-200 shadow-md ring-1 ring-indigo-400'
                    : theme === 'light'
                    ? 'h-1 border-transparent hover:h-4 hover:bg-slate-100 hover:text-slate-600 text-transparent'
                    : 'h-1 border-transparent hover:h-4 hover:bg-zinc-850/60 hover:text-zinc-400 text-transparent'
                }`}
                title="Glissez ici pour placer l'élément tout en haut du planning"
              >
                <span>↑ Déposer tout en haut (1ère position)</span>
              </div>
            )}

            {organized.map(({ item, level }) => {

            const isGroup = item.type === 'group';
            const isSubGroup = isGroup && level > 0;
            const isMilestone = item.type === 'milestone';
            const isAuto = item.schedulingMode === 'auto';
            const isSelected = selectedItemId === item.id;
            const isDropBefore = dropTarget?.id === item.id && dropTarget.position === 'before';
            const isDropAfter = dropTarget?.id === item.id && dropTarget.position === 'after';
            const isDropInside = dropTarget?.id === item.id && dropTarget.position === 'inside';

            return (
              <div
                key={item.id}
                draggable={!isReadOnly}
                onDragStart={isReadOnly ? undefined : (e) => handleDragStart(e, item.id)}
                onDragOver={isReadOnly ? undefined : (e) => handleDragOverRow(e, item)}
                onDragLeave={isReadOnly ? undefined : (e) => handleDragLeaveRow(e, item.id)}
                onDrop={isReadOnly ? undefined : (e) => handleDropOnRow(e, item)}
                style={{
                  height: `${rowHeight}px`,
                  borderLeftColor: isGroup 
                    ? (item.color || '#475569') 
                    : isSelected 
                    ? (theme === 'light' ? '#2563eb' : '#6366f1') 
                    : 'transparent',
                }}
                onClick={() => onSelectItem(item.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onEditItem(item);
                }}
                className={`group relative flex items-center justify-between px-2 text-xs transition-colors cursor-pointer border-l-2 ${
                  isDropInside
                    ? theme === 'light'
                      ? 'bg-slate-100 ring-2 ring-slate-400'
                      : 'bg-indigo-950/70 ring-2 ring-indigo-400'
                    : isSelected
                    ? theme === 'light'
                      ? 'bg-blue-50/70 font-semibold'
                      : 'bg-indigo-950/40'
                    : isGroup
                    ? isSubGroup
                      ? theme === 'light'
                        ? 'bg-slate-100/90 hover:bg-slate-200/70'
                        : 'bg-[#0a0a0d]/90 hover:bg-zinc-800/50'
                      : theme === 'light'
                        ? 'bg-slate-100/65 hover:bg-slate-200/60'
                        : 'bg-[#0c0c0f]/95 hover:bg-zinc-800/40'
                    : theme === 'light'
                      ? 'bg-transparent hover:bg-slate-50'
                      : 'bg-transparent hover:bg-zinc-850/30'
                }`}
                title={
                  isReadOnly
                    ? `${item.name} · Double-clic pour consulter les détails`
                    : isGroup
                    ? isSubGroup
                      ? `Sous-groupe : ${item.name} (Glissez d'autres sous-groupes ou tâches dedans)`
                      : `Groupe : ${item.name} (Glissez pour réorganiser ou déposez des sous-groupes/tâches)`
                    : `${item.name} (${item.duration} ${t.days}) — Glissez pour réorganiser`
                }
              >
                {/* Visual Insertion Line Indicator */}
                {isDropBefore && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.9)] z-20 pointer-events-none" />
                )}
                {isDropAfter && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.9)] z-20 pointer-events-none" />
                )}

                {isDropInside && (
                  <div className={`absolute inset-0 z-30 border-2 rounded flex items-center justify-between px-2 font-medium text-[11px] shadow-lg pointer-events-none ${
                    theme === 'light'
                      ? 'bg-indigo-50/95 border-indigo-500 text-indigo-950'
                      : 'bg-indigo-950/95 border-indigo-400 text-white'
                  }`}>
                    <div className="flex items-center gap-1.5 truncate">
                      <FolderTree className="w-3.5 h-3.5 text-indigo-500 shrink-0 animate-pulse" />
                      <span className="truncate">
                        {draggedItem?.type === 'group'
                          ? `Transformer en sous-groupe de "${item.name}"`
                          : `Déposer dans "${item.name}"`}
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold bg-indigo-600 px-1.5 py-0.5 rounded text-white shrink-0 ml-1">
                      {draggedItem?.type === 'group' ? 'Sous-groupe' : 'Groupe'}
                    </span>
                  </div>
                )}

                {/* Left: Drag handle, Icon, Indent, Title */}
                <div
                  className="flex items-center gap-1 min-w-0 flex-1 pr-1.5"
                  style={{ paddingLeft: `${Math.min(64, level * 14)}px` }}
                >
                  {/* Grip icon for all items or Lock when read-only */}
                  {isReadOnly ? (
                    <span 
                      className={`cursor-not-allowed p-0.5 shrink-0 opacity-80 ${
                        theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
                      }`}
                      title="Glisser-déposer désactivé (Mode lecture seule)"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span 
                      className={`cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-all shrink-0 p-0.5 ${
                        theme === 'light'
                          ? 'text-slate-400 hover:text-indigo-600'
                          : 'text-zinc-500 hover:text-indigo-300'
                      }`}
                      title="Glisser pour changer l'ordre ou déplacer dans un groupe"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                  )}

                  {level > 0 && (
                    <span className={`text-[10px] select-none shrink-0 -mr-0.5 ${
                      theme === 'light' ? 'text-slate-400' : 'text-zinc-600'
                    }`}>
                      ↳
                    </span>
                  )}

                  {isGroup ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleGroupCollapse(item.id);
                        }}
                        className={`p-0.5 rounded shrink-0 cursor-pointer ${
                          theme === 'light'
                            ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                        title={item.collapsed ? "Déplier le groupe" : "Replier le groupe"}
                      >
                        {item.collapsed ? (
                          <ChevronRight className={`w-3 h-3 ${theme === 'light' ? 'text-slate-600' : 'text-indigo-400'}`} />
                        ) : (
                          <ChevronDown className={`w-3 h-3 ${theme === 'light' ? 'text-slate-600' : 'text-indigo-400'}`} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditItem(item);
                        }}
                        className="w-3 h-3 rounded-xs shrink-0 shadow-2xs border border-black/20 hover:scale-125 transition-transform cursor-pointer"
                        style={{ backgroundColor: item.color || '#475569' }}
                        title={`Couleur du groupe: ${item.color || '#475569'} (Cliquer pour modifier)`}
                      />
                    </div>
                  ) : isMilestone ? (
                    <span className="w-3 h-3 flex items-center justify-center shrink-0">
                      <span
                        className="w-2 h-2 rotate-45 rounded-xs"
                        style={{ backgroundColor: item.color || '#f59e0b' }}
                      />
                    </span>
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color || '#6366f1' }}
                    />
                  )}

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className={`truncate text-[11px] ${
                          isGroup
                            ? isSubGroup
                              ? theme === 'light'
                                ? 'font-bold text-slate-900'
                                : 'font-bold text-indigo-200'
                              : theme === 'light'
                                ? 'font-bold text-slate-900'
                                : 'font-bold text-zinc-100'
                            : isMilestone
                            ? theme === 'light'
                              ? 'font-medium text-amber-900'
                              : 'font-medium text-amber-200'
                            : theme === 'light'
                              ? 'text-slate-800 font-medium'
                              : 'text-zinc-300'
                        }`}
                      >
                        {item.name}
                      </span>

                      {isSubGroup && (
                        <span className={`text-[8px] font-mono px-1 py-0.2 rounded border shrink-0 ${
                          theme === 'light'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-indigo-950 text-indigo-300 border-indigo-800/60'
                        }`}>
                          sous-gr.
                        </span>
                      )}

                      {isAuto ? (
                        <span
                          className={`shrink-0 text-[9px] ${
                            theme === 'light' ? 'text-slate-500' : 'text-indigo-400'
                          }`}
                          title="Mode automatique"
                        >
                          <LinkIcon className="w-2.5 h-2.5" />
                        </span>
                      ) : item.predecessorId ? (
                        <span
                          className={`shrink-0 text-[9px] ${
                            theme === 'light'
                              ? 'text-slate-400 hover:text-slate-700'
                              : 'text-zinc-400 hover:text-indigo-300'
                          }`}
                          title={`Lié par flèche à : ${items.find((x) => x.id === item.predecessorId)?.name || 'élément précédent'}`}
                        >
                          <LinkIcon className="w-2.5 h-2.5 opacity-60" />
                        </span>
                      ) : null}
                    </div>

                    <div className={`text-[9px] font-mono truncate ${
                      theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                    }`}>
                      {formatReadableDate(item.startDate, lang)}
                      {!isMilestone && ` · ${item.duration}${t.dayShort}`}
                    </div>
                  </div>
                </div>

                {/* Right: Actions, Progress %, Duration, Up/Down, Edit */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Quick add in group buttons (visible on hover or focus) */}
                  {!isReadOnly && isGroup && (
                    <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddItem('group', item.id);
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          theme === 'light'
                            ? 'text-indigo-600 hover:bg-indigo-100'
                            : 'text-indigo-400 hover:text-white hover:bg-indigo-900/60'
                        }`}
                        title="Créer un sous-groupe dans ce groupe"
                      >
                        <FolderPlus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddItem('task', item.id);
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          theme === 'light'
                            ? 'text-emerald-600 hover:bg-emerald-100'
                            : 'text-emerald-400 hover:text-white hover:bg-emerald-900/60'
                        }`}
                        title="Ajouter une tâche dans ce groupe"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Progress % */}
                  <span className={`w-8 text-center font-mono text-[10px] ${
                    theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
                  }`}>
                    {item.progress}%
                  </span>

                  {/* Duration */}
                  <span className={`w-7 text-right font-mono text-[10px] ${
                    theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                  }`}>
                    {isMilestone ? '0' : item.duration}
                  </span>

                  {/* Move Up / Move Down buttons */}
                  {!isReadOnly && (
                    <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderItem(item.id, 'up');
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          theme === 'light'
                            ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                        title="Monter d'une position (Alt + ↑)"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderItem(item.id, 'down');
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          theme === 'light'
                            ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                        title="Descendre d'une position (Alt + ↓)"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Edit or View action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item);
                    }}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      theme === 'light'
                        ? 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/70'
                        : isReadOnly
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        : 'hover:text-indigo-400 hover:bg-zinc-800 opacity-50 group-hover:opacity-100'
                    }`}
                    title={isReadOnly ? "Consulter la tâche" : t.editItem}
                  >
                    {isReadOnly ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
          {/* Bottom spacing matching GanttChart perfectly (288px = 6 rows) */}
          <div 
            onDragOver={isReadOnly ? undefined : (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={isReadOnly ? undefined : handleDropOutGroup}
            onDoubleClick={isReadOnly ? undefined : () => onAddItem('task')}
            className={`h-72 shrink-0 flex flex-col items-center justify-start pt-6 transition-colors group/bottom-hint ${
              theme === 'light'
                ? 'text-slate-400/80 hover:text-slate-600'
                : 'text-zinc-600/70 hover:text-zinc-500'
            } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
            title={isReadOnly ? undefined : "Double-cliquez pour ajouter une tâche rapide"}
          >
            {!isReadOnly && (
              <div className={`opacity-0 group-hover/bottom-hint:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] font-medium border border-dashed rounded-lg px-3 py-1.5 pointer-events-none ${
                theme === 'light'
                  ? 'border-slate-300 bg-slate-50 text-slate-600'
                  : 'border-zinc-700/60 bg-zinc-900/40 text-zinc-400'
              }`}>
                <span>+ Double-clic pour ajouter</span>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
};
