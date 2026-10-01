import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Flag, 
  FolderPlus, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { GanttItem, GanttItemType, Language } from '../types/gantt';
import { translations } from '../utils/i18n';
import { 
  parseDate, 
  formatDate, 
  getTodayString, 
  getMonthName 
} from '../utils/dates';

interface CalendarViewProps {
  items: GanttItem[];
  allItems: GanttItem[];
  lang: Language;
  theme?: 'dark' | 'light';
  isReadOnly?: boolean;
  onEditItem: (item: GanttItem) => void;
  onAddItem: (type: GanttItemType, parentGroupId?: string, initialDate?: string) => void;
  onQuickCreateAtDate?: (dateStr: string, type?: GanttItemType) => void;
}

interface CalendarDay {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  items,
  lang,
  theme = 'dark',
  isReadOnly = false,
  onEditItem,
  onAddItem,
  onQuickCreateAtDate,
}) => {
  const t = translations[lang];
  const todayStr = getTodayString();

  // Current viewed month and year
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return parseDate(todayStr);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(parseDate(todayStr));
  };

  // Day names: Monday to Sunday (European convention)
  const weekDayLabels = useMemo(() => {
    if (lang === 'fr') return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    if (lang === 'de') return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    if (lang === 'it') return ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }, [lang]);

  // Generate 35 or 42 cells for the calendar grid
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday-based index: 0 = Mon, ..., 6 = Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: CalendarDay[] = [];

    // Days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = formatDate(prevDate);
      const dayOfWeek = prevDate.getDay();
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Days of current month
    const totalDaysInMonth = lastDayOfMonth.getDate();
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const dateStr = formatDate(curDate);
      const dayOfWeek = curDate.getDay();
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Days from next month to complete standard 35 or 42 grid
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(year, month + 1, d);
        const dateStr = formatDate(nextDate);
        const dayOfWeek = nextDate.getDay();
        days.push({
          dateStr,
          dayNumber: d,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        });
      }
    }

    return days;
  }, [year, month, todayStr]);

  // Only milestones are shown in CalendarView as requested by user
  const tasksByDate = useMemo(() => {
    const map = new Map<string, GanttItem[]>();
    const milestones = items.filter((item) => item.type === 'milestone');

    milestones.forEach((item) => {
      calendarDays.forEach((day) => {
        if (item.startDate <= day.dateStr && day.dateStr <= item.endDate) {
          const list = map.get(day.dateStr) || [];
          list.push(item);
          map.set(day.dateStr, list);
        }
      });
    });

    return map;
  }, [items, calendarDays]);

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${
      theme === 'light' ? 'bg-slate-100/70 text-slate-800' : 'bg-[#050507] text-zinc-100'
    }`}>
      {/* Calendar Header Controls */}
      <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0a0a0e] border-zinc-800/80'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-750 text-zinc-300'
              }`}
              title={t.calendarPrevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-750 text-zinc-300'
              }`}
              title={t.calendarNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold tracking-tight capitalize min-w-[150px]">
            {getMonthName(month, lang)} {year}
          </h2>

          <button
            onClick={handleGoToday}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
              theme === 'light'
                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                : 'bg-indigo-950/70 hover:bg-indigo-900 border-indigo-700/60 text-indigo-300'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
            <span>{t.calendarToday}</span>
          </button>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddItem('milestone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                theme === 'light'
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                  : 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-700 text-amber-300'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.addMilestone}</span>
            </button>
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
          </div>
        )}
      </div>

      {/* Weekday Columns Header */}
      <div className={`grid grid-cols-7 border-b text-center text-xs font-bold py-2 select-none shrink-0 ${
        theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-[#0e0e13] text-zinc-300 border-zinc-800'
      }`}>
        {weekDayLabels.map((lbl, idx) => (
          <div 
            key={lbl} 
            className={`py-1 ${idx >= 5 ? (theme === 'light' ? 'text-amber-700' : 'text-amber-400') : ''}`}
          >
            {lbl}
          </div>
        ))}
      </div>

      {/* Monthly Grid Container */}
      <div className={`flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto divide-x divide-y select-none ${
        theme === 'light' ? 'divide-slate-200/80 bg-slate-200/40' : 'divide-zinc-850 bg-black/40'
      }`}>
        {calendarDays.map((day) => {
          const dayTasks = tasksByDate.get(day.dateStr) || [];

          return (
            <div
              key={day.dateStr}
              onClick={() => {
                if (!isReadOnly) {
                  onAddItem('milestone', undefined, day.dateStr);
                }
              }}
              className={`min-h-[110px] p-1.5 flex flex-col group/day relative transition-colors cursor-pointer ${
                !day.isCurrentMonth
                  ? theme === 'light' ? 'bg-slate-100/40 opacity-50' : 'bg-[#07070a]/60 opacity-40'
                  : day.isWeekend
                  ? theme === 'light' ? 'bg-slate-50/70' : 'bg-[#08080c]'
                  : theme === 'light' ? 'bg-white' : 'bg-[#0a0a0f]'
              } ${
                day.isToday 
                  ? theme === 'light' ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : 'ring-2 ring-indigo-500/50 bg-indigo-950/20'
                  : ''
              }`}
            >
              {/* Day Header (Number & Quick Add) */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center font-mono ${
                  day.isToday
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : !day.isCurrentMonth
                    ? theme === 'light' ? 'text-slate-400' : 'text-zinc-600'
                    : theme === 'light' ? 'text-slate-700' : 'text-zinc-300'
                }`}>
                  {day.dayNumber}
                </span>

                {!isReadOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddItem('milestone', undefined, day.dateStr);
                    }}
                    className={`opacity-0 group-hover/day:opacity-100 p-0.5 rounded text-[10px] transition-opacity cursor-pointer ${
                      theme === 'light'
                        ? 'bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700'
                        : 'bg-zinc-800 hover:bg-indigo-900 text-zinc-300 hover:text-indigo-200'
                    }`}
                    title="Ajouter un jalon ou une tâche à cette date (ouvre le menu)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Tasks Chips for this Day */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
                {dayTasks.slice(0, 4).map((task) => {
                  const isMilestone = task.type === 'milestone';
                  const isGroup = task.type === 'group';
                  const isDone = task.progress === 100;
                  const isStart = task.startDate === day.dateStr;
                  const isEnd = task.endDate === day.dateStr;

                  return (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditItem(task);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 truncate cursor-pointer transition-all hover:scale-[1.02] shadow-2xs border ${
                        theme === 'light'
                          ? 'border-slate-200/80 bg-white/90 text-slate-900 hover:border-slate-400'
                          : 'border-zinc-800/80 bg-zinc-900/90 text-zinc-100 hover:border-zinc-700'
                      }`}
                      title={`${task.name} (${task.progress}%)\n${task.startDate} → ${task.endDate}`}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ backgroundColor: task.color || '#3b82f6' }}
                      />

                      {isMilestone && <Flag className="w-2.5 h-2.5 text-amber-500 shrink-0" />}

                      <span className="truncate flex-1">
                        {task.name}
                      </span>

                      {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
                    </div>
                  );
                })}

                {dayTasks.length > 4 && (
                  <div className={`text-[9px] font-bold px-1 text-center ${
                    theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                  }`}>
                    +{dayTasks.length - 4} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
