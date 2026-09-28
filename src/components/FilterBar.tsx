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
}

export const FilterBar: React.FC<FilterBarProps> = ({
  items,
  filters,
  onFilterChange,
  filteredCount,
  totalCount,
  lang,
}) => {
  const t = translations[lang];
  const todayStr = getTodayString();

  // Extract unique assignees from project items
  const uniqueAssignees = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.assignee?.trim()) {
        const parts = it.assignee.split(/[,&/]/).map((p) => p.trim()).filter(Boolean);
        parts.forEach((p) => set.add(p));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

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
    <div className="no-print bg-[#09090c] border-b border-zinc-800/80 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none shrink-0 z-20 text-xs">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
        <div className="flex items-center gap-1 text-zinc-400 shrink-0 font-medium">
          <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline text-[11px]">{t.filterLabel}</span>
        </div>

        {/* 1. Search text input */}
        <div className="relative flex items-center shrink-0">
          <Search className="w-3 h-3 text-zinc-500 absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder={t.searchTasksPlaceholder}
            className="pl-6 pr-6 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-md text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-1.5 p-0.5 text-zinc-400 hover:text-white"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* 2. Assignee Filter */}
        <div className="relative flex items-center shrink-0">
          <User className="w-3 h-3 text-zinc-500 absolute left-2 pointer-events-none" />
          <select
            value={filters.selectedAssignee}
            onChange={(e) => onFilterChange({ ...filters, selectedAssignee: e.target.value })}
            className={`pl-6 pr-4 py-1 bg-zinc-900 border rounded-md text-[11px] focus:outline-none cursor-pointer transition-all ${
              filters.selectedAssignee !== 'all'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-zinc-800 hover:border-zinc-700 text-zinc-300'
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
              ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-xs'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
          title={t.lateFilterTooltip}
        >
          <Clock className={`w-3 h-3 ${filters.showLateOnly ? 'text-rose-400' : 'text-zinc-400'}`} />
          <span>{t.lateFilter}</span>
          {lateCount > 0 && (
            <span className={`px-1 py-0.2 rounded-full text-[9px] font-bold ${
              filters.showLateOnly ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-300'
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
              ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-xs'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
          title={t.milestonesFilterTooltip}
        >
          <Flag className={`w-3 h-3 ${filters.showMilestonesOnly ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span>{t.milestonesFilter}</span>
          {milestoneCount > 0 && (
            <span className={`px-1 py-0.2 rounded-full text-[9px] font-bold ${
              filters.showMilestonesOnly ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {milestoneCount}
            </span>
          )}
        </button>

        {/* 5. Status Filter Pills */}
        <div className="hidden md:flex items-center bg-zinc-900 p-0.5 rounded-md border border-zinc-800 shrink-0">
          <button
            onClick={() => onFilterChange({ ...filters, statusFilter: 'all' })}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
              filters.statusFilter === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.filterAll}
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, statusFilter: 'todo' })}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
              filters.statusFilter === 'todo'
                ? 'bg-indigo-600 text-white font-semibold'
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
                ? 'bg-indigo-600 text-white font-semibold'
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
                ? 'bg-emerald-600 text-white font-semibold'
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
        <span className="text-[11px] text-zinc-400 font-mono">
          <span className={hasActiveFilters ? 'text-indigo-400 font-bold' : 'text-zinc-300'}>
            {filteredCount}
          </span>
          <span className="text-zinc-500"> / {totalCount}</span>
        </span>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-medium border border-zinc-700 transition-colors cursor-pointer shrink-0"
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
