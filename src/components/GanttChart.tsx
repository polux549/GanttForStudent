import React, { useMemo, useRef, useState, useEffect } from 'react';
import { GanttItem, GanttItemType, Language, ZoomLevel } from '../types/gantt';
import { getOrganizedItems, getTimelineBounds } from '../utils/ganttEngine';
import { 
  generateDaysRange, 
  diffDays, 
  parseDate, 
  formatReadableDate, 
  getMonthName, 
  getTodayString,
  addDays,
  formatDate
} from '../utils/dates';
import { translations } from '../utils/i18n';
import { 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  FolderPlus, 
  Flag,
  X
} from 'lucide-react';

interface GanttChartProps {
  items: GanttItem[];
  lang: Language;
  zoom: ZoomLevel;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onEditItem: (item: GanttItem) => void;
  onQuickCreateAtDate: (date: string, type: GanttItemType) => void;
  onUpdateItemDates: (id: string, newStartDate: string, newEndDate: string) => void;
  rowHeight: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

interface DragState {
  type: 'move' | 'resize-start' | 'resize-end';
  itemId: string;
  initialX: number;
  initialStartDate: string;
  initialEndDate: string;
  currentStartDate: string;
  currentEndDate: string;
  deltaDays: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  items,
  lang,
  zoom,
  selectedItemId,
  onSelectItem,
  onEditItem,
  onQuickCreateAtDate,
  onUpdateItemDates,
  rowHeight,
  scrollRef,
  onScroll,
}) => {
  const t = translations[lang];

  // Quick create popover state
  const [quickCreatePopover, setQuickCreatePopover] = useState<{
    date: string;
    x: number;
    y: number;
  } | null>(null);

  // Drag state for moving or resizing task bars
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Tracking drag movement to strictly avoid opening the edit modal on resize/move
  const hasMovedRef = useRef(false);
  const lastDragEndTimeRef = useRef(0);

  // Column width based on zoom level
  const dayWidth = useMemo(() => {
    switch (zoom) {
      case 'days':
        return 38;
      case 'weeks':
        return 22;
      case 'months':
        return 12;
      default:
        return 38;
    }
  }, [zoom]);

  // Overall bounds
  const bounds = useMemo(() => getTimelineBounds(items), [items]);
  const daysList = useMemo(
    () => generateDaysRange(bounds.start, bounds.end, lang),
    [bounds, lang]
  );

  const totalWidth = daysList.length * dayWidth;

  // Filter visible items according to collapsed groups
  const organized = useMemo(() => {
    return getOrganizedItems(items).filter((r) => r.isVisible);
  }, [items]);

  // Month spans for the upper timeline header
  const monthSpans = useMemo(() => {
    const spans: { name: string; year: number; startIndex: number; count: number }[] = [];
    let currentSpan: { name: string; year: number; startIndex: number; count: number } | null = null;

    daysList.forEach((day, index) => {
      const monthName = getMonthName(day.monthIndex, lang);
      if (!currentSpan || currentSpan.name !== monthName || currentSpan.year !== day.year) {
        if (currentSpan) {
          spans.push(currentSpan);
        }
        currentSpan = {
          name: monthName,
          year: day.year,
          startIndex: index,
          count: 1,
        };
      } else {
        currentSpan.count++;
      }
    });

    if (currentSpan) {
      spans.push(currentSpan);
    }
    return spans;
  }, [daysList, lang]);

  // Date to X coordinate converter
  const dateToX = (dateStr: string): number => {
    const daysOffset = diffDays(bounds.start, dateStr);
    return daysOffset * dayWidth;
  };

  // Find index of Today for the red vertical line
  const todayStr = getTodayString();
  const todayIndex = daysList.findIndex((d) => d.date === todayStr);
  const todayX = todayIndex >= 0 ? todayIndex * dayWidth + dayWidth / 2 : null;

  // Map for item rows
  const itemRowMap = useMemo(() => {
    const map = new Map<string, { rowIndex: number; item: GanttItem }>();
    organized.forEach(({ item }, index) => {
      map.set(item.id, { rowIndex: index, item });
    });
    return map;
  }, [organized]);

  // SVG Dependency lines
  const dependencyLines = useMemo(() => {
    const lines: {
      id: string;
      fromId: string;
      toId: string;
      path: string;
      isSelected: boolean;
    }[] = [];

    organized.forEach(({ item }) => {
      if (item.predecessorId && itemRowMap.has(item.predecessorId)) {
        const predInfo = itemRowMap.get(item.predecessorId)!;
        const currentInfo = itemRowMap.get(item.id)!;

        const predEndX = dateToX(predInfo.item.endDate) + dayWidth;
        const predY = predInfo.rowIndex * rowHeight + rowHeight / 2;

        const currStartX = dateToX(item.startDate);
        const currY = currentInfo.rowIndex * rowHeight + rowHeight / 2;

        const isSelected = selectedItemId === item.id || selectedItemId === item.predecessorId;
        const deltaX = currStartX - predEndX;
        let d = '';

        if (deltaX > 16) {
          const midX = predEndX + 12;
          d = `M ${predEndX} ${predY} L ${midX} ${predY} L ${midX} ${currY} L ${currStartX - 3} ${currY}`;
        } else {
          const loopOffset = 14;
          const cornerY = predY < currY ? predY + rowHeight / 2 : predY - rowHeight / 2;
          d = `M ${predEndX} ${predY} L ${predEndX + loopOffset} ${predY} L ${predEndX + loopOffset} ${cornerY} L ${currStartX - loopOffset} ${cornerY} L ${currStartX - loopOffset} ${currY} L ${currStartX - 3} ${currY}`;
        }

        lines.push({
          id: `${item.predecessorId}->${item.id}`,
          fromId: item.predecessorId,
          toId: item.id,
          path: d,
          isSelected,
        });
      }
    });

    return lines;
  }, [organized, itemRowMap, dayWidth, bounds.start, rowHeight, selectedItemId]);

  // Double click on date handler
  const handleGridDoubleClick = (e: React.MouseEvent, explicitDate?: string) => {
    e.stopPropagation();
    const container = scrollRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left + container.scrollLeft;
    const clickY = e.clientY - rect.top + container.scrollTop;

    let targetDate = explicitDate;
    if (!targetDate) {
      const dayIndex = Math.max(0, Math.min(daysList.length - 1, Math.floor(clickX / dayWidth)));
      targetDate = daysList[dayIndex]?.date || addDays(bounds.start, dayIndex);
    }

    // Keep popover within reasonable boundaries
    const popoverWidth = 230;
    const boundedX = Math.max(10, Math.min(clickX - 40, totalWidth - popoverWidth - 20));
    const boundedY = Math.max(70, clickY - 20);

    setQuickCreatePopover({
      date: targetDate,
      x: boundedX,
      y: boundedY,
    });
  };

  // Mouse drag & resize handlers for task bars
  const handleStartDrag = (
    e: React.MouseEvent,
    item: GanttItem,
    type: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    hasMovedRef.current = false;

    setDragState({
      type,
      itemId: item.id,
      initialX: e.clientX,
      initialStartDate: item.startDate,
      initialEndDate: item.endDate,
      currentStartDate: item.startDate,
      currentEndDate: item.endDate,
      deltaDays: 0,
    });
  };

  // Global mousemove and mouseup listeners for dragging
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.initialX;
      if (Math.abs(deltaX) > 2) {
        hasMovedRef.current = true;
      }
      const deltaDays = Math.round(deltaX / dayWidth);

      let newStart = dragState.initialStartDate;
      let newEnd = dragState.initialEndDate;

      if (dragState.type === 'move') {
        newStart = addDays(dragState.initialStartDate, deltaDays);
        newEnd = addDays(dragState.initialEndDate, deltaDays);
      } else if (dragState.type === 'resize-end') {
        const potentialEnd = addDays(dragState.initialEndDate, deltaDays);
        if (potentialEnd >= dragState.initialStartDate) {
          newEnd = potentialEnd;
        } else {
          newEnd = dragState.initialStartDate;
        }
      } else if (dragState.type === 'resize-start') {
        const potentialStart = addDays(dragState.initialStartDate, deltaDays);
        if (potentialStart <= dragState.initialEndDate) {
          newStart = potentialStart;
        } else {
          newStart = dragState.initialEndDate;
        }
      }

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentStartDate: newStart,
              currentEndDate: newEnd,
              deltaDays,
            }
          : null
      );
    };

    const handleMouseUp = () => {
      if (hasMovedRef.current) {
        lastDragEndTimeRef.current = Date.now();
      }
      if (dragState && dragState.deltaDays !== 0) {
        onUpdateItemDates(
          dragState.itemId,
          dragState.currentStartDate,
          dragState.currentEndDate
        );
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, dayWidth, onUpdateItemDates]);

  // Click selects the item (highlighting it), but strictly suppresses if user was resizing/dragging
  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (hasMovedRef.current || Date.now() - lastDragEndTimeRef.current < 250) {
      return;
    }
    onSelectItem(itemId);
  };

  // Double click opens the modal to rename or edit the task/group/milestone
  const handleItemDoubleClick = (e: React.MouseEvent, item: GanttItem) => {
    e.stopPropagation();
    if (hasMovedRef.current || Date.now() - lastDragEndTimeRef.current < 250) {
      return;
    }
    onEditItem(item);
  };

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="flex-1 overflow-x-auto overflow-y-auto bg-[#080d1a] relative select-none"
      onClick={() => setQuickCreatePopover(null)}
    >
      <div
        className="relative"
        style={{ width: `${Math.max(totalWidth, 800)}px`, minHeight: '100%' }}
      >
        {/* Timeline Header (Sticky Top) */}
        <div className="sticky top-0 z-20 bg-[#0d1322] border-b border-slate-800/90 shadow-sm">
          {/* Tier 1: Months */}
          <div className="h-6 flex border-b border-slate-800/80 text-[11px] font-semibold text-slate-300">
            {monthSpans.map((span, idx) => (
              <div
                key={idx}
                style={{ width: `${span.count * dayWidth}px` }}
                className="px-2.5 flex items-center border-r border-slate-800/60 truncate"
              >
                <span>
                  {span.name} {span.year}
                </span>
              </div>
            ))}
          </div>

          {/* Tier 2: Days */}
          <div className="h-10 flex">
            {daysList.map((day, idx) => (
              <div
                key={idx}
                style={{ width: `${dayWidth}px` }}
                onDoubleClick={(e) => handleGridDoubleClick(e, day.date)}
                className={`flex flex-col items-center justify-center border-r border-slate-800/40 text-[10px] shrink-0 cursor-pointer transition-colors ${
                  day.isToday
                    ? 'bg-red-500/15 text-red-300 font-bold'
                    : day.isWeekend
                    ? 'bg-[#12192e] text-slate-500'
                    : 'bg-transparent text-slate-400 hover:bg-slate-800/40'
                }`}
                title={`Double-cliquez pour créer à la date : ${day.date}`}
              >
                <span className="font-mono text-[11px] leading-tight">{day.dayNumber}</span>
                {zoom !== 'months' && (
                  <span className="text-[9px] uppercase tracking-tighter opacity-75">
                    {day.dayShort.slice(0, zoom === 'weeks' ? 1 : 3)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Grid Columns (Background shading & weekend tint) */}
        <div
          className="absolute top-16 bottom-0 left-0 flex"
          style={{ width: `${totalWidth}px` }}
        >
          {daysList.map((day, idx) => (
            <div
              key={idx}
              style={{ width: `${dayWidth}px` }}
              onDoubleClick={(e) => handleGridDoubleClick(e, day.date)}
              className={`h-full border-r border-slate-800/25 shrink-0 ${
                day.isWeekend ? 'bg-[#10172c]/40' : 'bg-transparent hover:bg-indigo-500/5'
              }`}
              title={`Double-cliquez sur le ${day.date} pour créer une tâche`}
            />
          ))}
        </div>

        {/* TODAY Indicator Line */}
        {todayX !== null && (
          <div
            className="absolute top-0 bottom-0 z-10 pointer-events-none flex flex-col items-center"
            style={{ left: `${todayX}px` }}
          >
            <div className="sticky top-16 -mt-3.5 z-30 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold tracking-tight shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{t.today}</span>
            </div>
            <div className="w-[2px] h-full bg-red-500/90 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
          </div>
        )}

        {/* Quick Create Popover when double clicked */}
        {quickCreatePopover && (
          <div
            style={{
              left: `${Math.min(quickCreatePopover.x, totalWidth - 240)}px`,
              top: `${quickCreatePopover.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute z-40 bg-[#0f172a] border border-indigo-500/60 rounded-xl p-2.5 shadow-2xl flex flex-col gap-2 min-w-[210px] animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-[11px] font-semibold text-slate-200">
                Créer au {formatReadableDate(quickCreatePopover.date, lang)}
              </span>
              <button
                onClick={() => setQuickCreatePopover(null)}
                className="p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <button
                onClick={() => {
                  onQuickCreateAtDate(quickCreatePopover.date, 'task');
                  setQuickCreatePopover(null);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-left font-medium transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+ {t.task}</span>
              </button>

              <button
                onClick={() => {
                  onQuickCreateAtDate(quickCreatePopover.date, 'group');
                  setQuickCreatePopover(null);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-left font-medium transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ {t.group}</span>
              </button>

              <button
                onClick={() => {
                  onQuickCreateAtDate(quickCreatePopover.date, 'milestone');
                  setQuickCreatePopover(null);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-left font-medium transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>+ {t.milestone}</span>
              </button>
            </div>
          </div>
        )}

        {/* SVG Dependencies Overlay */}
        <svg
          className="absolute top-16 left-0 pointer-events-none z-10"
          style={{
            width: `${totalWidth}px`,
            height: `${organized.length * rowHeight}px`,
          }}
        >
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker
              id="arrow-selected"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
            </marker>
          </defs>

          {dependencyLines.map((line) => (
            <path
              key={line.id}
              d={line.path}
              fill="none"
              stroke={line.isSelected ? '#818cf8' : '#475569'}
              strokeWidth={line.isSelected ? '2.5' : '1.5'}
              strokeDasharray={line.isSelected ? undefined : '3,2'}
              markerEnd={line.isSelected ? 'url(#arrow-selected)' : 'url(#arrow-default)'}
              className="transition-all"
            />
          ))}
        </svg>

        {/* Task Rows & Bars Container */}
        <div className="relative pt-0">
          {organized.map(({ item }, rowIndex) => {
            const isSelected = selectedItemId === item.id;
            const isBeingDragged = dragState?.itemId === item.id;

            // Compute active dates (or dragged preview dates)
            const activeStart = isBeingDragged ? dragState.currentStartDate : item.startDate;
            const activeEnd = isBeingDragged ? dragState.currentEndDate : item.endDate;

            const startX = dateToX(activeStart);
            const durationDays = Math.max(1, diffDays(activeStart, activeEnd) + 1);
            const barWidth = item.type === 'milestone' ? dayWidth : Math.max(12, durationDays * dayWidth);

            const isGroup = item.type === 'group';
            const isMilestone = item.type === 'milestone';

            return (
              <div
                key={item.id}
                style={{ height: `${rowHeight}px` }}
                onClick={() => onSelectItem(item.id)}
                onDoubleClick={(e) => handleGridDoubleClick(e)}
                className={`relative flex items-center border-b border-slate-800/40 hover:bg-slate-800/15 transition-colors cursor-pointer ${
                  isSelected ? 'bg-indigo-950/20' : ''
                }`}
                title="Double-cliquez pour créer une tâche à cette date"
              >
                {/* 1. MILESTONE (JALON) RENDERING */}
                {isMilestone && (
                  <div
                    style={{
                      left: `${startX + dayWidth / 2 - 12}px`,
                    }}
                    onMouseDown={(e) => handleStartDrag(e, item, 'move')}
                    onClick={(e) => handleItemClick(e, item.id)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, item)}
                    className="absolute z-10 flex items-center gap-2 group/bar cursor-grab active:cursor-grabbing"
                    title={`${item.name} (${formatReadableDate(activeStart, lang)})\nDouble-clic pour modifier ou renommer.\nGlissez pour déplacer la date.`}
                  >
                    {/* Rotated Diamond */}
                    <div
                      className="w-6 h-6 rotate-45 flex items-center justify-center rounded-xs shadow-md transition-transform group-hover/bar:scale-110 border border-amber-300/40"
                      style={{
                        backgroundColor: item.color || '#f59e0b',
                      }}
                    >
                      <span className="-rotate-45 text-[10px] text-slate-950 font-bold">★</span>
                    </div>

                    <div className="whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] font-semibold text-amber-200 shadow-xs flex items-center gap-1.5">
                      <span>{item.name}</span>
                      <span className="font-mono text-[10px] text-amber-400/80">
                        {formatReadableDate(activeStart, lang)}
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. GROUP RENDERING (BRACKET SUMMARY BAR) */}
                {isGroup && (
                  <div
                    style={{
                      left: `${startX}px`,
                      width: `${barWidth}px`,
                      height: '24px',
                    }}
                    onMouseDown={
                      item.schedulingMode === 'manual'
                        ? (e) => handleStartDrag(e, item, 'move')
                        : undefined
                    }
                    onClick={(e) => handleItemClick(e, item.id)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, item)}
                    className={`absolute z-10 group/groupbar ${
                      item.schedulingMode === 'manual'
                        ? 'cursor-grab active:cursor-grabbing'
                        : 'cursor-pointer'
                    }`}
                    title={`Groupe: ${item.name} (${item.progress}%)\nDouble-clic pour renommer ou éditer.\n${
                      item.schedulingMode === 'manual'
                        ? 'Dates manuelles (Glissez pour déplacer)'
                        : 'Dates automatiques (S’adapte aux tâches internes)'
                    }`}
                  >
                    {/* Top bar with side brackets */}
                    <div
                      className="w-full h-3 rounded-t-sm relative shadow-xs border-t border-x border-slate-600/50"
                      style={{
                        backgroundColor: item.color ? `${item.color}cc` : '#475569',
                      }}
                    >
                      <div
                        className="absolute -bottom-1.5 left-0 w-2 h-2 rotate-45 border-b border-l border-slate-600/60"
                        style={{ backgroundColor: item.color || '#475569' }}
                      />
                      <div
                        className="absolute -bottom-1.5 right-0 w-2 h-2 rotate-45 border-b border-r border-slate-600/60"
                        style={{ backgroundColor: item.color || '#475569' }}
                      />
                    </div>

                    <div className="absolute left-1 -top-4 whitespace-nowrap text-[11px] font-bold text-slate-200 drop-shadow flex items-center gap-2">
                      <span>{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({item.progress}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. NORMAL TASK BAR (WITH DRAG & RESIZE HANDLES) */}
                {!isMilestone && !isGroup && (
                  <div
                    style={{
                      left: `${startX}px`,
                      width: `${barWidth}px`,
                      height: '28px',
                      backgroundColor: `${item.color || '#6366f1'}33`,
                      borderColor: `${item.color || '#6366f1'}99`,
                      borderWidth: '1px',
                    }}
                    onMouseDown={(e) => handleStartDrag(e, item, 'move')}
                    onClick={(e) => handleItemClick(e, item.id)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, item)}
                    className={`absolute z-10 rounded-lg group/taskbar shadow-md overflow-hidden flex items-center transition-all hover:ring-2 hover:ring-indigo-400/50 cursor-grab active:cursor-grabbing ${
                      isBeingDragged ? 'ring-2 ring-indigo-400 scale-[1.01] z-30' : ''
                    }`}
                    title={`${item.name}\n${formatReadableDate(activeStart, lang)} → ${formatReadableDate(activeEnd, lang)} (${durationDays} ${t.days})\nDouble-clic pour modifier ou renommer.\nGlissez pour déplacer, les bords pour allonger/réduire.`}
                  >
                    {/* LEFT RESIZE HANDLE (Shorten or advance start date) */}
                    <div
                      onMouseDown={(e) => handleStartDrag(e, item, 'resize-start')}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="absolute left-0 top-0 bottom-0 w-2.5 hover:w-3.5 bg-white/20 hover:bg-white/50 cursor-ew-resize transition-all z-20"
                      title="Glisser pour modifier le début"
                    />

                    {/* Inner Progress Fill */}
                    <div
                      className="h-full transition-all rounded-l-md pointer-events-none"
                      style={{
                        width: `${item.progress}%`,
                        backgroundColor: item.color || '#6366f1',
                      }}
                    />

                    {/* Task Title & Info inside bar */}
                    <div className="absolute inset-0 px-2.5 flex items-center justify-between pointer-events-none overflow-hidden">
                      <span className="truncate text-[11px] font-medium text-white drop-shadow-sm pr-1">
                        {item.name}
                      </span>
                      {barWidth > 70 && (
                        <span className="shrink-0 text-[10px] font-mono font-semibold text-white/90 drop-shadow-sm ml-1">
                          {durationDays}{t.dayShort} · {item.progress}%
                        </span>
                      )}
                    </div>

                    {/* Label floating outside if bar is very narrow */}
                    {barWidth < 60 && (
                      <span
                        className="absolute left-full ml-2 whitespace-nowrap text-[11px] font-medium text-slate-300 drop-shadow pointer-events-none"
                      >
                        {item.name} ({durationDays}{t.dayShort})
                      </span>
                    )}

                    {/* RIGHT RESIZE HANDLE (Allonger / réduire durée) */}
                    <div
                      onMouseDown={(e) => handleStartDrag(e, item, 'resize-end')}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 bottom-0 w-2.5 hover:w-3.5 bg-white/20 hover:bg-white/50 cursor-ew-resize transition-all z-20"
                      title="Glisser pour allonger ou réduire la durée"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty area below tasks to allow double-clicking anywhere */}
          <div
            className="min-h-[400px] cursor-pointer"
            onDoubleClick={(e) => handleGridDoubleClick(e)}
            title="Double-cliquez pour créer une tâche à cette date"
          />
        </div>
      </div>
    </div>
  );
};
