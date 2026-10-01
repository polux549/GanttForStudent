import React from 'react';
import { 
  Search, 
  X, 
  Clock, 
  Flag, 
  User, 
  RotateCcw,
  CheckCircle2,
  ListFilter
} from 'lucide-react';
import { GanttItem, Language } from '../types/gantt';
import { getTodayString } from '../utils/dates';
import { translations } from '../utils/i18n';
import { extractProjectMembers } from '../utils/ganttEngine';

export interface FilterState {
  searchQuery: string;
  selectedAssignee: string;
  showLateOnly: boolean;
  showMilestonesOnly: boolean;
  statusFilter: 'all' | 'todo' | 'in_progress' | 'done';
}

export const initialFilterState: FilterState = {
  searchQuery: '',
  selectedAssignee: 'all',
  showLateOnly: false,
  showMilestonesOnly: false,
  statusFilter: 'all',
};

interface FilterBarProps {
  items: GanttItem[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  filteredCount: number;
  totalCount: number;
  lang: Language;
  theme?: 'dark' | 'light';
  projectMembers?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  items,
  filters,
  onFilterChange,
  filteredCount,
  totalCount,
  lang,
  theme = 'dark',
  projectMembers,
}) => {
  const t = translations[lang];
  const todayStr = getTodayString();

  // Extract unique assignees from project items and explicit members
  const uniqueAssignees = React.useMemo(() => {
    return extractProjectMembers(items, projectMembers);
  }, [items, projectMembers]);

  // Count late items for badge
  const lateCount = React.useMemo(() => {
    return items.filter(
      (it) => it.type !== 'group' && it.endDate < todayStr && it.progress < 100
    ).length;
  }, [items, todayStr]);

  // Count milestones
  const milestoneCount = React.useMemo(() => {
    return items.filter((it) => it.type === 'milestone').length;
  }, [items]);

  const hasActiveFilters = 
    Boolean(filters.searchQuery.trim()) ||
    filters.selectedAssignee !== 'all' ||
    filters.showLateOnly ||
    filters.showMilestonesOnly ||
    filters.statusFilter !== 'all';

  const handleReset = () => {
    onFilterChange(initialFilterState);
  };

  return (
    <div className={`no-print px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none shrink-0 z-20 text-xs transition-colors ${
      theme === 'light'
        ? 'bg-white border-b border-slate-200 text-slate-700 shadow-2xs'
        : 'bg-[#09090c] border-b border-zinc-800/80 text-zinc-300'
    }`}>
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
        <div className={`flex items-center gap-1 shrink-0 font-medium ${
          theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
        }`}>
          <ListFilter className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-slate-700' : 'text-indigo-400'}`} />
          <span className="hidden sm:inline text-[11px] font-semibold">{t.filterLabel}</span>
        </div>

        {/* 1. Search text input */}
        <div className="relative flex items-center shrink-0">
          <Search className={`w-3 h-3 absolute left-2 pointer-events-none ${
            theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
          }`} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder={t.searchTasksPlaceholder}
            className={`pl-6 pr-6 py-1 rounded-md text-[11px] focus:outline-none w-36 sm:w-44 transition-all border ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200 placeholder-zinc-500 focus:border-indigo-500'
            }`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className={`absolute right-1.5 p-0.5 ${
                theme === 'light' ? 'text-slate-400 hover:text-slate-700' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* 2. Assignee Filter */}
        <div className="relative flex items-center shrink-0">
          <User className={`w-3 h-3 absolute left-2 pointer-events-none ${
            theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
          }`} />
          <select
            value={filters.selectedAssignee}
            onChange={(e) => onFilterChange({ ...filters, selectedAssignee: e.target.value })}
            className={`pl-6 pr-4 py-1 rounded-md text-[11px] focus:outline-none cursor-pointer transition-all border ${
              theme === 'light'
                ? filters.selectedAssignee !== 'all'
                  ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                : filters.selectedAssignee !== 'all'
                  ? 'bg-zinc-900 border-indigo-500 text-indigo-300 font-semibold'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <option value="all">{t.allMembers}</option>
            <option value="__unassigned__">{t.unassigned}</option>
            {uniqueAssignees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Late tasks toggle */}
        <button
          onClick={() => onFilterChange({ ...filters, showLateOnly: !filters.showLateOnly })}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer shrink-0 border ${
            filters.showLateOnly
              ? theme === 'light'
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-xs'
                : 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-xs'
              : theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
          title={t.lateFilterTooltip}
        >
          <Clock className={`w-3 h-3 ${filters.showLateOnly ? 'text-rose-500' : theme === 'light' ? 'text-slate-400' : 'text-zinc-400'}`} />
          <span>{t.lateFilter}</span>
          {lateCount > 0 && (
            <span className={`px-1 py-0.2 rounded-full text-[9px] font-bold ${
              filters.showLateOnly
                ? 'bg-rose-500 text-white'
                : theme === 'light'
                ? 'bg-slate-200 text-slate-700'
                : 'bg-zinc-800 text-zinc-300'
            }`}>
              {lateCount}
            </span>
          )}
        </button>

        {/* 4. Milestones only toggle */}
        <button
          onClick={() => onFilterChange({ ...filters, showMilestonesOnly: !filters.showMilestonesOnly })}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer shrink-0 border ${
            filters.showMilestonesOnly
              ? theme === 'light'
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-xs'
                : 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-xs'
              : theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
          title={t.milestonesFilterTooltip}
        >
          <Flag className={`w-3 h-3 ${filters.showMilestonesOnly ? 'text-amber-500' : theme === 'light' ? 'text-slate-400' : 'text-zinc-400'}`} />
          <span>{t.milestonesFilter}</span>
          {milestoneCount > 0 && (
            <span className={`px-1 py-0.2 rounded-full text-[9px] font-bold ${
              filters.showMilestonesOnly
                ? 'bg-amber-500 text-white'
                : theme === 'light'
                ? 'bg-slate-200 text-slate-700'
                : 'bg-zinc-800 text-zinc-300'
            }`}>
              {milestoneCount}
            </span>
          )}
        </button>

        {/* 5. Status Filter Pills */}
        <div className={`hidden md:flex items-center p-0.5 rounded-md border shrink-0 ${
          theme === 'light' ? 'bg-slate-200/60 border-slate-300/60' : 'bg-zinc-900 border-zinc-800'
        }`}>
          <button
            onClick={() => onFilterChange({ ...filters, statusFilter: 'all' })}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
              filters.statusFilter === 'all'
                ? theme === 'light'
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                  : 'bg-zinc-800 text-white font-semibold shadow-xs'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.filterAll}
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, statusFilter: 'todo' })}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
              filters.statusFilter === 'todo'
                ? theme === 'light'
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                  : 'bg-zinc-800 text-white font-semibold shadow-xs'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title={t.filterTodoTooltip}
          >
            {t.filterTodo}
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, statusFilter: 'in_progress' })}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
              filters.statusFilter === 'in_progress'
                ? theme === 'light'
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                  : 'bg-zinc-800 text-white font-semibold shadow-xs'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title={t.filterInProgressTooltip}
          >
            {t.filterInProgress}
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, statusFilter: 'done' })}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
              filters.statusFilter === 'done'
                ? theme === 'light'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-emerald-600 text-white font-semibold shadow-xs'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title={t.filterDoneTooltip}
          >
            {t.filterDone}
          </button>
        </div>
      </div>

      {/* Right side: Counter & Reset Button */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[11px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
          <span className={hasActiveFilters ? 'text-indigo-600 font-bold' : (theme === 'light' ? 'text-slate-700' : 'text-zinc-300')}>
            {filteredCount}
          </span>
          <span className={theme === 'light' ? 'text-slate-400' : 'text-zinc-500'}> / {totalCount}</span>
        </span>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer shrink-0 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700'
            }`}
            title={t.resetFiltersTooltip}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{t.resetFilters}</span>
          </button>
        )}
      </div>
    </div>
  );
};
