import React, { useState } from 'react';
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
  FolderTree
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
}) => {
  const t = translations[lang];
  const organized = getOrganizedItems(items);

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
        if (offsetY < height * 0.18) {
          setDropTarget({ id: targetItem.id, position: 'before' });
        } else if (offsetY > height * 0.82) {
          setDropTarget({ id: targetItem.id, position: 'after' });
        } else {
          setDropTarget({ id: targetItem.id, position: 'inside' });
        }
      } else {
        // Dragging a task or milestone
        if (offsetY < height * 0.25) {
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

  const handleDragLeaveRow = (e: React.DragEvent, itemId: string) => {
    if (dropTarget?.id === itemId) {
      setDropTarget(null);
    }
  };

  const handleDropOnRow = (e: React.DragEvent, targetItem: GanttItem) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (sourceId && sourceId !== targetItem.id && dropTarget) {
      if (dropTarget.position === 'inside') {
        onMoveToGroup(sourceId, targetItem.id);
      } else if (onMoveItem) {
        onMoveItem(sourceId, targetItem.id, dropTarget.position);
      }
    }
    setDraggedItemId(null);
    setDropTarget(null);
  };

  const handleDropOutGroup = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (sourceId) {
      onMoveToGroup(sourceId, null);
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
      className="w-64 sm:w-72 flex flex-col bg-[#0b0f19] border-r border-slate-800/80 shrink-0 select-none h-full transition-all"
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Synchronized Header: Exactly 64px (h-6 + h-10) to match GanttChart timeline */}
      <div className="h-6 border-b border-slate-800/80 px-2 flex items-center justify-between text-[10px] font-medium text-slate-400 bg-[#0d1322] shrink-0">
        {/* Arrow button to expand or collapse all groups */}
        <button
          onClick={onToggleCollapseAll}
          disabled={!hasGroups}
          className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 group/collapse-all"
          title={
            !hasGroups
              ? "Aucun groupe dans ce projet"
              : allGroupsCollapsed
              ? "Agrandir / Déplier tous les groupes"
              : "Réduire / Replier tous les groupes"
          }
        >
          {allGroupsCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover/collapse-all:scale-110 transition-transform" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-indigo-400 group-hover/collapse-all:scale-110 transition-transform" />
          )}
        </button>

        <div className="flex items-center gap-2 text-right pr-1">
          <span className="w-8 text-center">%</span>
          <span className="w-7 text-right">{t.dayShort}</span>
          <span className="w-14 text-right">Ordre</span>
        </div>
      </div>

      {/* Tier 2: Action buttons (40px = h-10) matching days tier */}
      <div className="h-10 border-b border-slate-800/90 px-2 flex items-center justify-between gap-1 bg-[#0f172a]/80 shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 pl-1">
          {items.length} {items.length > 1 ? 'éléments' : 'élément'}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onAddItem('task', selectedIsGroup && selectedItemId ? selectedItemId : undefined)}
            className="flex items-center gap-0.5 px-2 py-1 rounded bg-indigo-600/90 hover:bg-indigo-600 text-[10px] font-medium text-white transition-colors cursor-pointer shadow-xs"
            title={selectedIsGroup ? `Ajouter une tâche dans "${selectedItem.name}"` : "Ajouter une tâche (Touche T)"}
          >
            <Plus className="w-3 h-3" />
            <span>{t.task}</span>
          </button>

          <button
            onClick={() => onAddItem('group', selectedIsGroup && selectedItemId ? selectedItemId : undefined)}
            className="flex items-center gap-0.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[10px] font-medium text-slate-200 transition-colors cursor-pointer"
            title={selectedIsGroup ? `Créer un sous-groupe dans "${selectedItem.name}"` : "Ajouter un groupe (Touche G)"}
          >
            <FolderPlus className="w-3 h-3 text-indigo-400" />
            <span>{selectedIsGroup ? 'Sous-gr.' : t.group}</span>
          </button>

          <button
            onClick={() => onAddItem('milestone', selectedIsGroup && selectedItemId ? selectedItemId : undefined)}
            className="flex items-center gap-0.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[10px] font-medium text-amber-300 transition-colors cursor-pointer"
            title={selectedIsGroup ? `Ajouter un jalon dans "${selectedItem.name}"` : "Ajouter un jalon (Touche J)"}
          >
            <Flag className="w-3 h-3 text-amber-400" />
            <span>{t.milestone}</span>
          </button>
        </div>
      </div>

      {/* Drop zone to remove from group if item is inside a group */}
      {draggedItemId && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOutGroup}
          className="p-1.5 bg-indigo-950/50 border border-dashed border-indigo-500/70 text-[10px] text-indigo-300 text-center flex items-center justify-center gap-1.5 animate-pulse cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span>Glisser ici pour sortir du groupe (niveau principal)</span>
        </div>
      )}

      {/* Scrollable Task Rows with synchronized scrollRef */}
      <div 
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto divide-y divide-slate-800/40"
      >
        {items.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
            <p className="font-medium text-slate-400 mb-1">{t.noItemsYet}</p>
            <p className="text-[11px] leading-relaxed">{t.noItemsDesc}</p>
          </div>
        ) : (
          organized.map(({ item, level, isVisible }) => {
            if (!isVisible) return null;

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
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOverRow(e, item)}
                onDragLeave={(e) => handleDragLeaveRow(e, item.id)}
                onDrop={(e) => handleDropOnRow(e, item)}
                style={{ height: `${rowHeight}px` }}
                onClick={() => onSelectItem(item.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onEditItem(item);
                }}
                className={`group relative flex items-center justify-between px-2 text-xs transition-colors cursor-pointer border-l-2 ${
                  isDropInside
                    ? 'bg-indigo-950/70 ring-2 ring-indigo-400 border-indigo-400'
                    : isSelected
                    ? 'bg-indigo-950/40 border-indigo-500'
                    : isGroup
                    ? isSubGroup
                      ? 'bg-[#11192e]/85 border-transparent hover:bg-slate-800/50'
                      : 'bg-[#0e1628]/95 border-transparent hover:bg-slate-800/40'
                    : 'bg-transparent border-transparent hover:bg-slate-800/30'
                }`}
                title={
                  isGroup
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
                  <div className="absolute inset-0 z-30 bg-indigo-950/95 border-2 border-indigo-400 rounded flex items-center justify-between px-2 text-white font-medium text-[11px] shadow-lg pointer-events-none">
                    <div className="flex items-center gap-1.5 truncate">
                      <FolderTree className="w-3.5 h-3.5 text-indigo-300 shrink-0 animate-pulse" />
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
                  {/* Grip icon for all items */}
                  <span 
                    className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-indigo-300 opacity-40 group-hover:opacity-100 transition-all shrink-0 p-0.5"
                    title="Glisser pour changer l'ordre ou déplacer dans un groupe"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </span>

                  {level > 0 && (
                    <span className="text-slate-600 text-[10px] select-none shrink-0 -mr-0.5">
                      ↳
                    </span>
                  )}

                  {isGroup ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleGroupCollapse(item.id);
                      }}
                      className="p-0.5 text-slate-400 hover:text-white rounded shrink-0 cursor-pointer"
                      title={item.collapsed ? "Déplier le groupe" : "Replier le groupe"}
                    >
                      {item.collapsed ? (
                        <ChevronRight className="w-3 h-3 text-indigo-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-indigo-400" />
                      )}
                    </button>
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
                              ? 'font-bold text-indigo-200'
                              : 'font-bold text-slate-100'
                            : isMilestone
                            ? 'font-medium text-amber-200'
                            : 'text-slate-300'
                        }`}
                      >
                        {item.name}
                      </span>

                      {isSubGroup && (
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 shrink-0">
                          sous-gr.
                        </span>
                      )}

                      {isAuto && (
                        <span
                          className="shrink-0 text-[9px] text-indigo-400"
                          title="Mode automatique"
                        >
                          <LinkIcon className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="text-[9px] text-slate-500 font-mono truncate">
                      {formatReadableDate(item.startDate, lang)}
                      {!isMilestone && ` · ${item.duration}${t.dayShort}`}
                    </div>
                  </div>
                </div>

                {/* Right: Actions, Progress %, Duration, Up/Down, Edit */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Quick add in group buttons (visible on hover or focus) */}
                  {isGroup && (
                    <div className="flex items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddItem('group', item.id);
                        }}
                        className="p-1 text-indigo-400 hover:text-white hover:bg-indigo-900/60 rounded transition-colors cursor-pointer"
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
                        className="p-1 text-emerald-400 hover:text-white hover:bg-emerald-900/60 rounded transition-colors cursor-pointer"
                        title="Ajouter une tâche dans ce groupe"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Progress % */}
                  <span className="w-8 text-center font-mono text-[10px] text-slate-400">
                    {item.progress}%
                  </span>

                  {/* Duration */}
                  <span className="w-7 text-right font-mono text-[10px] text-slate-500">
                    {isMilestone ? '0' : item.duration}
                  </span>

                  {/* Move Up / Move Down buttons */}
                  <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderItem(item.id, 'up');
                      }}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded transition-colors cursor-pointer"
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
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded transition-colors cursor-pointer"
                      title="Descendre d'une position (Alt + ↓)"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item);
                    }}
                    className="p-1 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors opacity-50 group-hover:opacity-100 cursor-pointer"
                    title={t.editItem}
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
