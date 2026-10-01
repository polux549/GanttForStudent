import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Flag, 
  FolderPlus, 
  Calendar, 
  User, 
  Link as LinkIcon, 
  MoreVertical, 
  ArrowRight, 
  ArrowLeft,
  Trash2,
  Edit2,
  Check
} from 'lucide-react';
import { GanttItem, GanttItemType, Language } from '../types/gantt';
import { translations } from '../utils/i18n';
import { formatReadableDate } from '../utils/dates';
import { extractProjectMembers } from '../utils/ganttEngine';
import { AssigneePickerPopover } from './AssigneePickerPopover';

interface KanbanViewProps {
  items: GanttItem[];
  allItems: GanttItem[];
  lang: Language;
  theme?: 'dark' | 'light';
  isReadOnly?: boolean;
  onEditItem: (item: GanttItem) => void;
  onAddItem: (type: GanttItemType) => void;
  onDeleteItem?: (id: string) => void;
  onUpdateItem: (item: GanttItem) => void;
  projectMembers?: string[];
  onAddProjectMember?: (member: string) => void;
  onOpenTeamModal?: () => void;
}

type KanbanColumnId = 'todo' | 'in_progress' | 'review' | 'done';

interface KanbanColumnConfig {
  id: KanbanColumnId;
  titleKey: 'kanbanTodo' | 'kanbanInProgress' | 'kanbanReview' | 'kanbanDone';
  defaultProgress: number;
  colorClass: string;
  badgeBg: string;
}

const COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'todo',
    titleKey: 'kanbanTodo',
    defaultProgress: 0,
    colorClass: 'border-slate-500 text-slate-400',
    badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  },
  {
    id: 'in_progress',
    titleKey: 'kanbanInProgress',
    defaultProgress: 50,
    colorClass: 'border-blue-500 text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    id: 'review',
    titleKey: 'kanbanReview',
    defaultProgress: 85,
    colorClass: 'border-amber-500 text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  {
    id: 'done',
    titleKey: 'kanbanDone',
    defaultProgress: 100,
    colorClass: 'border-emerald-500 text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  items,
  allItems,
  lang,
  theme = 'dark',
  isReadOnly = false,
  onEditItem,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
  projectMembers,
  onAddProjectMember,
  onOpenTeamModal,
}) => {
  const t = translations[lang];

  const availableMembers = React.useMemo(() => {
    return extractProjectMembers(allItems, projectMembers);
  }, [allItems, projectMembers]);

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<KanbanColumnId | null>(null);

  // Helper to categorize task into column
  const getColumnForTask = (item: GanttItem): KanbanColumnId => {
    if (item.progress === 100) return 'done';
    if (item.progress >= 80) return 'review';
    if (item.progress > 0) return 'in_progress';
    return 'todo';
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (isReadOnly) return;
    setDraggedItemId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: KanbanColumnId) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== colId) {
      setActiveDropColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColId: KanbanColumnId) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!id || isReadOnly) return;

    const targetItem = allItems.find((i) => i.id === id);
    if (!targetItem) return;

    const currentCol = getColumnForTask(targetItem);
    if (currentCol === targetColId) return;

    const colConfig = COLUMNS.find((c) => c.id === targetColId);
    if (colConfig) {
      onUpdateItem({
        ...targetItem,
        progress: colConfig.defaultProgress,
      });
    }
    setDraggedItemId(null);
  };

  const handleMoveColumn = (item: GanttItem, direction: 'prev' | 'next') => {
    if (isReadOnly) return;
    const currentCol = getColumnForTask(item);
    const currentIndex = COLUMNS.findIndex((c) => c.id === currentCol);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const nextCol = COLUMNS[newIndex];
      onUpdateItem({
        ...item,
        progress: nextCol.defaultProgress,
      });
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${
      theme === 'light' ? 'bg-slate-100/70 text-slate-800' : 'bg-[#050507] text-zinc-100'
    }`}>
      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6">
        <div className="flex gap-4 sm:gap-6 h-full min-w-max items-start">
          {COLUMNS.map((col) => {
            // Seules les tâches et les jalons sont affichés dans le Kanban (les groupes sont exclus)
            const colItems = items.filter((item) => (item.type === 'task' || item.type === 'milestone') && getColumnForTask(item) === col.id);
            const isDropActive = activeDropColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`w-72 sm:w-80 flex flex-col max-h-full rounded-2xl border transition-all duration-200 ${
                  isDropActive
                    ? theme === 'light'
                      ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-400/30'
                      : 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                    : theme === 'light'
                    ? 'bg-white/80 border-slate-200 shadow-xs'
                    : 'bg-[#0a0a0e] border-zinc-800/80 shadow-md'
                }`}
              >
                {/* Column Header */}
                <div 
                  className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 ${
                    theme === 'light' ? 'border-slate-200/90' : 'border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      col.id === 'todo'
                        ? 'bg-slate-400'
                        : col.id === 'in_progress'
                        ? 'bg-blue-500'
                        : col.id === 'review'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`} />
                    <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>{t[col.titleKey]}</span>
                      {col.id === 'review' && (
                        <span 
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40 cursor-help"
                          title="En révision (80% - 99%) : Tâche presque terminée, en cours de relecture par les pairs, de validation académique ou d'attente de retour avant clôture définitive à 100%."
                        >
                          ?
                        </span>
                      )}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${col.badgeBg}`}>
                      {colItems.length}
                    </span>
                  </div>

                  {!isReadOnly && col.id === 'todo' && (
                    <button
                      onClick={() => onAddItem('task')}
                      className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                        theme === 'light'
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                          : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}
                      title={t.kanbanAddTask}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Column Cards (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[140px]">
                  {colItems.map((item) => {
                    const isMilestone = item.type === 'milestone';
                    const isGroup = item.type === 'group';
                    const isBeingDragged = draggedItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        draggable={!isReadOnly}
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onClick={() => onEditItem(item)}
                        className={`group relative rounded-xl border p-3.5 transition-all cursor-pointer select-none ${
                          isBeingDragged ? 'opacity-40 scale-95' : 'hover:-translate-y-0.5 hover:shadow-md'
                        } ${
                          theme === 'light'
                            ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs'
                            : 'bg-[#101015] border-zinc-800/90 hover:border-zinc-700 text-zinc-100'
                        }`}
                      >
                        {/* Colored accent top bar */}
                        <div 
                          className="absolute top-0 left-3 right-3 h-0.5 rounded-t-full"
                          style={{ backgroundColor: item.color || '#3b82f6' }}
                        />

                        {/* Card Header: Type Badge & Mode */}
                        <div className="flex items-center justify-between gap-2 mb-2 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            {isGroup ? (
                              <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                theme === 'light'
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                  : 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
                              }`}>
                                <FolderPlus className="w-3 h-3" />
                                <span>Groupe</span>
                              </span>
                            ) : isMilestone ? (
                              <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                theme === 'light'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : 'bg-amber-950/60 border-amber-800 text-amber-300'
                              }`}>
                                <Flag className="w-3 h-3 text-amber-500" />
                                <span>Jalon</span>
                              </span>
                            ) : (
                              <span className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                theme === 'light'
                                  ? 'bg-slate-100 border-slate-200 text-slate-600'
                                  : 'bg-zinc-850 border-zinc-750 text-zinc-400'
                              }`}>
                                <span>Tâche</span>
                              </span>
                            )}

                            {item.schedulingMode === 'auto' && (
                              <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border ${
                                theme === 'light'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                              }`} title="Planification automatique">
                                Auto
                              </span>
                            )}
                          </div>

                          {/* Quick move buttons */}
                          {!isReadOnly && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {col.id !== 'todo' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveColumn(item, 'prev');
                                  }}
                                  className={`p-1 rounded border hover:scale-105 cursor-pointer ${
                                    theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-zinc-800 border-zinc-700'
                                  }`}
                                  title="Déplacer vers la gauche"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}
                              {col.id !== 'done' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveColumn(item, 'next');
                                  }}
                                  className={`p-1 rounded border hover:scale-105 cursor-pointer ${
                                    theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-zinc-800 border-zinc-700'
                                  }`}
                                  title="Déplacer vers la droite"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold leading-snug line-clamp-2 mb-2.5">
                          {item.name}
                        </h4>

                        {/* Dates & Duration */}
                        <div className={`flex items-center justify-between text-[11px] font-medium mb-3 ${
                          theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 shrink-0 opacity-70" />
                            <span>
                              {formatReadableDate(item.startDate, lang)}
                              {!isMilestone && ` → ${formatReadableDate(item.endDate, lang)}`}
                            </span>
                          </div>

                          {!isMilestone && (
                            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                              theme === 'light'
                                ? 'bg-slate-100 border-slate-200 text-slate-700'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                            }`}>
                              {item.duration || 1} {t.dayShort}
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center justify-between text-[10px] font-semibold">
                            <span className={theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}>
                              {t.progressLabel}
                            </span>
                            <span className="font-mono">
                              {item.progress}%
                            </span>
                          </div>
                          <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                            theme === 'light' ? 'bg-slate-100' : 'bg-zinc-800'
                          }`}>
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${item.progress}%`,
                                backgroundColor: item.color || '#3b82f6',
                              }}
                            />
                          </div>
                        </div>

                        {/* Card Footer: Assignee & Comments count */}
                        <div className={`flex items-center justify-between pt-2 border-t text-[11px] ${
                          theme === 'light' ? 'border-slate-100 text-slate-600' : 'border-zinc-850 text-zinc-400'
                        }`}>
                          <div onClick={(e) => e.stopPropagation()}>
                            <AssigneePickerPopover
                              value={item.assignee || ''}
                              onChange={(newAssignee) => {
                                onUpdateItem({
                                  ...item,
                                  assignee: newAssignee || undefined,
                                });
                                if (newAssignee && onAddProjectMember) {
                                  onAddProjectMember(newAssignee);
                                }
                              }}
                              availableMembers={availableMembers}
                              onAddMember={onAddProjectMember}
                              onOpenTeamModal={onOpenTeamModal}
                              isReadOnly={isReadOnly}
                              theme={theme}
                              lang={lang}
                              size="sm"
                            />
                          </div>

                          {item.comments && item.comments.length > 0 && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              theme === 'light'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                            }`}>
                              💬 {item.comments.length}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colItems.length === 0 && (
                    <div className={`py-8 text-center border-2 border-dashed rounded-xl ${
                      theme === 'light' ? 'border-slate-200 text-slate-400' : 'border-zinc-850 text-zinc-600'
                    }`}>
                      <p className="text-xs">{t.kanbanNoTasks}</p>
                      {!isReadOnly && (
                        <p className="text-[10px] mt-1 opacity-70">
                          {t.kanbanDropHere}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
