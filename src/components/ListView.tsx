import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Flag, 
  FolderPlus, 
  Link as LinkIcon, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { GanttItem, GanttItemType, Language } from '../types/gantt';
import { translations } from '../utils/i18n';
import { formatReadableDate, getTodayString, addDays, diffDays } from '../utils/dates';
import { extractProjectMembers } from '../utils/ganttEngine';
import { AssigneePickerPopover } from './AssigneePickerPopover';

interface ListViewProps {
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

type SortField = 'name' | 'startDate' | 'endDate' | 'duration' | 'progress' | 'assignee' | 'type';

export const ListView: React.FC<ListViewProps> = ({
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
  const todayStr = getTodayString();

  const availableMembers = useMemo(() => {
    return extractProjectMembers(allItems, projectMembers);
  }, [allItems, projectMembers]);

  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState<string>('');

  const handleStartEditName = (item: GanttItem) => {
    if (isReadOnly) return;
    setEditingNameId(item.id);
    setNameInput(item.name);
  };

  const handleSaveName = (item: GanttItem) => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== item.name) {
      onUpdateItem({
        ...item,
        name: trimmed,
      });
    }
    setEditingNameId(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Predecessor name lookup
  const itemMap = useMemo(() => {
    return new Map<string, GanttItem>(allItems.map((i) => [i.id, i]));
  }, [allItems]);

  // Sorted items
  const sortedItems = useMemo(() => {
    const sorted = [...items];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'startDate') {
        comparison = a.startDate.localeCompare(b.startDate);
      } else if (sortField === 'endDate') {
        comparison = a.endDate.localeCompare(b.endDate);
      } else if (sortField === 'duration') {
        comparison = (a.duration || 0) - (b.duration || 0);
      } else if (sortField === 'progress') {
        comparison = (a.progress || 0) - (b.progress || 0);
      } else if (sortField === 'assignee') {
        comparison = (a.assignee || '').localeCompare(b.assignee || '');
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [items, sortField, sortDirection]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-70 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
    );
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${
      theme === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-[#050507] text-zinc-100'
    }`}>
      {/* Table Toolbar */}
      <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0a0a0e] border-zinc-800/80'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${
            theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}>
            {items.length} {t.listTotalTasks}
          </span>
          <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
            · Cliquez sur les en-têtes pour trier les colonnes
          </span>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddItem('task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                theme === 'light'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addTask}</span>
            </button>
            <button
              onClick={() => onAddItem('milestone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                theme === 'light'
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                  : 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-700 text-amber-300'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">{t.addMilestone}</span>
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className={`sticky top-0 z-20 border-b select-none ${
            theme === 'light' 
              ? 'bg-slate-100 text-slate-700 border-slate-200' 
              : 'bg-[#0d0d12] text-zinc-300 border-zinc-800'
          }`}>
            <tr>
              {/* Name */}
              <th 
                onClick={() => handleSort('name')}
                className="py-3 px-4 font-bold cursor-pointer group hover:text-blue-500 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.listColName}</span>
                  {renderSortIndicator('name')}
                </div>
              </th>

              {/* Type */}
              <th 
                onClick={() => handleSort('type')}
                className="py-3 px-3 font-bold cursor-pointer group hover:text-blue-500 transition-colors w-24 hidden md:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.listColType}</span>
                  {renderSortIndicator('type')}
                </div>
              </th>

              {/* Mode */}
              <th className="py-3 px-2.5 font-bold w-20 hidden lg:table-cell">
                {t.listColMode}
              </th>

              {/* Start Date */}
              <th 
                onClick={() => handleSort('startDate')}
                className="py-3 px-3 font-bold cursor-pointer group hover:text-blue-500 transition-colors w-32"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.startDateLabel}</span>
                  {renderSortIndicator('startDate')}
                </div>
              </th>

              {/* End Date */}
              <th 
                onClick={() => handleSort('endDate')}
                className="py-3 px-3 font-bold cursor-pointer group hover:text-blue-500 transition-colors w-32 hidden sm:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.endDateLabel}</span>
                  {renderSortIndicator('endDate')}
                </div>
              </th>

              {/* Duration (jours) */}
              <th 
                onClick={() => handleSort('duration')}
                className="py-3 px-3 font-bold cursor-pointer group hover:text-blue-500 transition-colors w-24 text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>{t.listColDuration}</span>
                  {renderSortIndicator('duration')}
                </div>
              </th>

              {/* Progress */}
              <th 
                onClick={() => handleSort('progress')}
                className="py-3 px-3 font-bold cursor-pointer group hover:text-blue-500 transition-colors w-36"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.listColProgress}</span>
                  {renderSortIndicator('progress')}
                </div>
              </th>

              {/* Assignee */}
              <th 
                onClick={() => handleSort('assignee')}
                className="py-3 px-3 font-bold cursor-pointer group hover:text-blue-500 transition-colors w-36 hidden lg:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.listColAssignee}</span>
                  {renderSortIndicator('assignee')}
                </div>
              </th>

              {/* Status */}
              <th className="py-3 px-3 font-bold w-28 hidden xl:table-cell">
                {t.listColStatus}
              </th>

              {/* Actions */}
              <th className="py-3 px-4 font-bold text-right w-24">
                {t.listColActions}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className={`divide-y ${
            theme === 'light' ? 'divide-slate-200/80' : 'divide-zinc-850'
          }`}>
            {sortedItems.map((item, idx) => {
              const isGroup = item.type === 'group';
              const isMilestone = item.type === 'milestone';
              const isLate = !isGroup && item.endDate < todayStr && (item.progress || 0) < 100;
              const isDone = (item.progress || 0) === 100;
              const hasParent = Boolean(item.groupId);

              return (
                <tr
                  key={item.id}
                  className={`group transition-colors ${
                    theme === 'light'
                      ? idx % 2 === 0
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/50 hover:bg-slate-100/60'
                      : idx % 2 === 0
                      ? 'bg-[#08080c] hover:bg-zinc-900/60'
                      : 'bg-[#0c0c10] hover:bg-zinc-900/60'
                  }`}
                >
                  {/* Name & Color Indicator */}
                  <td className="py-2.5 px-4 font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {hasParent && (
                        <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-zinc-600'}`}>
                          ↳
                        </span>
                      )}
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                        style={{ backgroundColor: item.color || '#3b82f6' }}
                      />
                      {editingNameId === item.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onBlur={() => handleSaveName(item)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName(item);
                            if (e.key === 'Escape') setEditingNameId(null);
                          }}
                          className={`px-2 py-0.5 text-xs font-semibold rounded border outline-hidden ${
                            theme === 'light'
                              ? 'bg-white border-blue-500 text-slate-900'
                              : 'bg-zinc-900 border-indigo-500 text-zinc-100'
                          }`}
                        />
                      ) : (
                        <div 
                          className="flex items-center gap-1.5 group/name cursor-pointer"
                          onClick={() => handleStartEditName(item)}
                          title="Cliquer pour renommer directement"
                        >
                          <span className={`font-semibold truncate max-w-[200px] sm:max-w-xs ${
                            isGroup ? 'font-bold' : ''
                          } ${theme === 'light' ? 'text-slate-900' : 'text-zinc-100'}`}>
                            {item.name}
                          </span>
                          {!isReadOnly && (
                            <Edit3 className="w-3 h-3 opacity-0 group-hover/name:opacity-60 text-slate-400 shrink-0" />
                          )}
                        </div>
                      )}
                      {item.comments && item.comments.length > 0 && (
                        <span className={`text-[10px] px-1 py-0.2 rounded border font-mono ${
                          theme === 'light' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
                        }`}>
                          💬 {item.comments.length}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-2.5 px-3 hidden md:table-cell">
                    {isGroup ? (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        theme === 'light'
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
                      }`}>
                        <FolderPlus className="w-3 h-3" />
                        <span>Groupe</span>
                      </span>
                    ) : isMilestone ? (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        theme === 'light'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-amber-950/60 border-amber-800 text-amber-300'
                      }`}>
                        <Flag className="w-3 h-3 text-amber-500" />
                        <span>Jalon</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
                        theme === 'light'
                          ? 'bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-zinc-850 border-zinc-750 text-zinc-300'
                      }`}>
                        <span>Tâche</span>
                      </span>
                    )}
                  </td>

                  {/* Mode */}
                  <td className="py-2 px-2.5 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                    {!isGroup ? (
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => {
                          onUpdateItem({
                            ...item,
                            schedulingMode: item.schedulingMode === 'auto' ? 'manual' : 'auto',
                          });
                        }}
                        className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer shadow-2xs ${
                          item.schedulingMode === 'auto'
                            ? theme === 'light'
                              ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold hover:bg-blue-100'
                              : 'bg-blue-950/60 text-blue-300 border-blue-700/60 font-bold hover:bg-blue-900/60'
                            : theme === 'light'
                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                        }`}
                        title="Cliquer pour basculer directement entre mode Manuel et Automatique"
                      >
                        {item.schedulingMode === 'auto' ? '⚡ Auto' : '🖐 Manuel'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono">Groupe</span>
                    )}
                  </td>

                  {/* Start Date */}
                  <td className="py-2 px-2 font-mono text-[11px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {isGroup ? (
                      <span className="text-slate-500 font-mono px-1">{formatReadableDate(item.startDate, lang)}</span>
                    ) : (
                      <input
                        type="date"
                        disabled={isReadOnly}
                        value={item.startDate}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          if (!newStart) return;
                          const dur = item.type === 'milestone' ? 0 : Math.max(1, item.duration || 1);
                          const newEnd = item.type === 'milestone' ? newStart : addDays(newStart, dur - 1);
                          onUpdateItem({
                            ...item,
                            startDate: newStart,
                            endDate: newEnd,
                          });
                        }}
                        className={`px-2 py-1 rounded-md text-xs font-mono border transition-colors cursor-pointer ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-800 hover:border-blue-500 focus:border-blue-600'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-zinc-500 focus:border-indigo-500'
                        }`}
                        title="Cliquer pour changer la date de début directement"
                      />
                    )}
                  </td>

                  {/* End Date */}
                  <td className="py-2 px-2 font-mono text-[11px] whitespace-nowrap hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                    {isGroup || isMilestone ? (
                      <span className="text-slate-500 font-mono px-1">{formatReadableDate(item.endDate, lang)}</span>
                    ) : (
                      <input
                        type="date"
                        disabled={isReadOnly}
                        min={item.startDate}
                        value={item.endDate}
                        onChange={(e) => {
                          const newEnd = e.target.value;
                          if (!newEnd) return;
                          const dur = Math.max(1, diffDays(item.startDate, newEnd) + 1);
                          onUpdateItem({
                            ...item,
                            endDate: newEnd,
                            duration: dur,
                          });
                        }}
                        className={`px-2 py-1 rounded-md text-xs font-mono border transition-colors cursor-pointer ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-800 hover:border-blue-500 focus:border-blue-600'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-zinc-500 focus:border-indigo-500'
                        }`}
                        title="Cliquer pour changer la date de fin directement"
                      />
                    )}
                  </td>

                  {/* Duration */}
                  <td className="py-2 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                    {isMilestone ? (
                      <span className="font-mono text-xs opacity-60">0 j</span>
                    ) : isGroup ? (
                      <span className="font-mono text-xs font-semibold">{item.duration || 1} j</span>
                    ) : (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          disabled={isReadOnly}
                          value={item.duration || 1}
                          onChange={(e) => {
                            const newDur = Math.max(1, Number(e.target.value) || 1);
                            const newEnd = addDays(item.startDate, newDur - 1);
                            onUpdateItem({
                              ...item,
                              duration: newDur,
                              endDate: newEnd,
                            });
                          }}
                          className={`w-14 px-1.5 py-1 text-center font-mono text-xs font-bold rounded-md border transition-colors cursor-pointer ${
                            theme === 'light'
                              ? 'bg-white border-slate-300 text-slate-900 hover:border-blue-500 focus:border-blue-600'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-100 hover:border-zinc-500 focus:border-indigo-500'
                          }`}
                          title="Modifier la durée en jours directement"
                        />
                        <span className="text-[10px] text-slate-500">j</span>
                      </div>
                    )}
                  </td>

                  {/* Progress */}
                  <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        disabled={isReadOnly || isGroup}
                        value={item.progress}
                        onChange={(e) => {
                          onUpdateItem({
                            ...item,
                            progress: Number(e.target.value),
                          });
                        }}
                        className="w-16 sm:w-20 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
                        title="Glisser pour modifier le pourcentage"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={isReadOnly || isGroup}
                        value={item.progress}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                          onUpdateItem({
                            ...item,
                            progress: val,
                          });
                        }}
                        className={`w-12 px-1 py-0.5 text-right font-mono text-xs font-bold rounded border ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-100'
                        }`}
                      />
                      <span className="font-mono text-xs">%</span>
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-2 px-3 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
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
                  </td>

                  {/* Status */}
                  <td className="py-2 px-3 hidden xl:table-cell" onClick={(e) => e.stopPropagation()}>
                    <select
                      disabled={isReadOnly || isGroup}
                      value={isDone ? 'done' : isLate ? 'late' : (item.progress || 0) >= 80 ? 'review' : (item.progress || 0) > 0 ? 'in_progress' : 'todo'}
                      onChange={(e) => {
                        const val = e.target.value;
                        let nextProgress = item.progress;
                        if (val === 'todo') nextProgress = 0;
                        else if (val === 'in_progress') nextProgress = 50;
                        else if (val === 'review') nextProgress = 85;
                        else if (val === 'done') nextProgress = 100;
                        onUpdateItem({
                          ...item,
                          progress: nextProgress,
                        });
                      }}
                      className={`px-2 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : isLate
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                          : (item.progress || 0) >= 80
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : (item.progress || 0) > 0
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                          : 'bg-slate-500/10 text-slate-600 border-slate-500/30'
                      }`}
                      title="Changer le statut en un clic"
                    >
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="review">En révision</option>
                      <option value="done">Terminé</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditItem(item)}
                        className={`p-1 rounded-md border transition-colors cursor-pointer ${
                          theme === 'light'
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                            : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750 text-zinc-300'
                        }`}
                        title={t.editItem}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!isReadOnly && onDeleteItem && (
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className={`p-1 rounded-md border transition-colors cursor-pointer ${
                            theme === 'light'
                              ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600'
                              : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800 text-rose-400'
                          }`}
                          title={t.deleteItem}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedItems.length === 0 && (
          <div className="py-16 text-center">
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
              {t.noItemsYet}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
