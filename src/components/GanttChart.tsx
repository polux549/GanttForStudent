import React, { useMemo, useRef, useState, useEffect } from 'react';
import { GanttItem, GanttItemType, Language, ZoomLevel } from '../types/gantt';
import { getOrganizedItems, getTimelineBounds, calculateCriticalPath } from '../utils/ganttEngine';
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
  X,
  Flame
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
  showCriticalPath?: boolean;
  isReadOnly?: boolean;
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
  showCriticalPath = false,
  isReadOnly = false,
}) => {
  const t = translations[lang];

  // Critical path computation
  const criticalItemIds = useMemo(() => {
    if (!showCriticalPath) return new Set<string>();
    return calculateCriticalPath(items);
  }, [items, showCriticalPath]);

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
      isCritical?: boolean;
    }[] = [];

    // Helper to find visible row or nearest visible ancestor group
    const resolveVisibleRow = (id: string): { rowIndex: number; item: GanttItem } | undefined => {
      if (itemRowMap.has(id)) return itemRowMap.get(id);
      let curr = items.find((i) => i.id === id);
      const visited = new Set<string>();
      while (curr && curr.groupId) {
        if (visited.has(curr.groupId)) break;
        visited.add(curr.groupId);
        if (itemRowMap.has(curr.groupId)) {
          return itemRowMap.get(curr.groupId);
        }
        curr = items.find((i) => i.id === curr!.groupId);
      }
      return undefined;
    };

    organized.forEach(({ item }) => {
      if (!item.predecessorId) return;

      const currentInfo = itemRowMap.get(item.id);
      if (!currentInfo) return;

      const predInfo = resolveVisibleRow(item.predecessorId);
      if (!predInfo) return;

      // Skip self loops if both collapsed into same parent group
      if (predInfo.item.id === currentInfo.item.id) return;

      // Active dragged dates or item dates
      const predStart = dragState && dragState.itemId === predInfo.item.id ? dragState.currentStartDate : predInfo.item.startDate;
      const predEnd = dragState && dragState.itemId === predInfo.item.id ? dragState.currentEndDate : predInfo.item.endDate;
      const currStart = dragState && dragState.itemId === item.id ? dragState.currentStartDate : item.startDate;

      // Calculate predEndX based on item type (milestone diamond vs task/group bar)
      let predEndX: number;
      if (predInfo.item.type === 'milestone') {
        predEndX = dateToX(predStart) + dayWidth / 2 + 8;
      } else {
        predEndX = dateToX(predEnd) + dayWidth;
      }
      const predY = predInfo.rowIndex * rowHeight + rowHeight / 2;

      // Calculate currStartX based on item type
      let currStartX: number;
      if (item.type === 'milestone') {
        currStartX = dateToX(currStart) + dayWidth / 2 - 8;
      } else {
        currStartX = dateToX(currStart);
      }
      const currY = currentInfo.rowIndex * rowHeight + rowHeight / 2;

      const isSelected = selectedItemId === item.id || selectedItemId === item.predecessorId;
      const isCritical = criticalItemIds.has(predInfo.item.id) && criticalItemIds.has(currentInfo.item.id);
      const deltaX = currStartX - predEndX;
      let d = '';

      if (deltaX > 16) {
        const midX = predEndX + 10;
        d = `M ${predEndX} ${predY} L ${midX} ${predY} L ${midX} ${currY} L ${currStartX - 3} ${currY}`;
      } else {
        const loopOffset = 14;
        const cornerY = predY < currY ? predY + rowHeight / 2 : predY - rowHeight / 2;
        d = `M ${predEndX} ${predY} L ${predEndX + loopOffset} ${predY} L ${predEndX + loopOffset} ${cornerY} L ${currStartX - loopOffset} ${cornerY} L ${currStartX - loopOffset} ${currY} L ${currStartX - 3} ${currY}`;
      }

      lines.push({
        id: `${item.id}_pred_${item.predecessorId}`,
        fromId: predInfo.item.id,
        toId: currentInfo.item.id,
        path: d,
        isSelected,
        isCritical,
      });
    });

    return lines;
  }, [organized, itemRowMap, items, dayWidth, bounds.start, rowHeight, selectedItemId, dragState, criticalItemIds]);

  // Double click on date handler
  const handleGridDoubleClick = (e: React.MouseEvent, explicitDate?: string) => {
    e.stopPropagation();
    if (isReadOnly) return;
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
    const popoverHeight = 180;
    const totalContentHeight = 64 + organized.length * rowHeight + 288;
    const boundedX = Math.max(10, Math.min(clickX - 40, totalWidth - popoverWidth - 20));

    let boundedY = clickY - 20;
    if (boundedY + popoverHeight > totalContentHeight - 10) {
      boundedY = Math.max(70, clickY - popoverHeight - 10);
    }
    boundedY = Math.max(70, boundedY);

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
    if (isReadOnly) return;
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
      className="flex-1 overflow-x-auto overflow-y-auto bg-[#040406] relative select-none"
      onClick={() => setQuickCreatePopover(null)}
    >
      <div
        className="relative"
        style={{ width: `${Math.max(totalWidth, 800)}px`, minHeight: '100%' }}
        onDoubleClick={(e) => handleGridDoubleClick(e)}
      >
        {/* Timeline Header (Sticky Top) */}
        <div className="sticky top-0 z-20 bg-[#08080a] border-b border-zinc-800/80 shadow-md">
          {/* Tier 1: Months */}
          <div className="h-6 flex border-b border-zinc-800 text-[11px] font-bold text-zinc-200">
            {monthSpans.map((span, idx) => (
              <div
                key={idx}
                style={{ width: `${span.count * dayWidth}px` }}
                className="px-2.5 flex items-center border-r border-zinc-800/80 truncate tracking-wide"
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
                className={`flex flex-col items-center justify-center border-r border-zinc-850/60 text-[10px] shrink-0 cursor-pointer transition-colors ${
                  day.isToday
                    ? 'bg-red-500/20 text-red-200 font-bold border-b-2 border-red-500/60'
                    : day.isWeekend
                    ? 'bg-[#0c0c0f] text-zinc-500 font-semibold'
                    : 'bg-transparent text-zinc-400 hover:bg-zinc-800/40'
                }`}
                title={`Double-cliquez pour créer à la date : ${day.date}`}
              >
                <span className="font-mono text-[11px] font-semibold leading-tight">{day.dayNumber}</span>
                {zoom !== 'months' && (
                  <span className="text-[9px] uppercase tracking-tighter opacity-80 font-medium">
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
              className={`h-full border-r border-zinc-900/50 shrink-0 ${
                day.isWeekend ? 'bg-[#0a0a0d]/80' : 'bg-transparent hover:bg-white/[0.02]'
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
            <div className="sticky top-16 -mt-3.5 z-30 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold tracking-tight shadow-xl ring-1 ring-white/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{t.today}</span>
            </div>
            <div className="w-[2px] h-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
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
            className="absolute z-40 bg-[#0d0d10] border border-zinc-700/80 rounded-xl p-2.5 shadow-2xl flex flex-col gap-2 min-w-[210px] animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span className="text-[11px] font-semibold text-zinc-200">
                Créer au {formatReadableDate(quickCreatePopover.date, lang)}
              </span>
              <button
                onClick={() => setQuickCreatePopover(null)}
                className="p-0.5 text-zinc-400 hover:text-white"
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
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-left font-medium transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ {t.group}</span>
              </button>

              <button
                onClick={() => {
                  onQuickCreateAtDate(quickCreatePopover.date, 'milestone');
                  setQuickCreatePopover(null);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-left font-medium transition-colors cursor-pointer"
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
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
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
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#a5b4fc" />
            </marker>
            <marker
              id="arrow-critical"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
            </marker>
          </defs>

          {dependencyLines.map((line) => {
            const isCritLine = Boolean(showCriticalPath && (line as any).isCritical);
            return (
              <path
                key={line.id}
                d={line.path}
                fill="none"
                stroke={isCritLine ? '#ef4444' : line.isSelected ? '#a5b4fc' : '#94a3b8'}
                strokeWidth={isCritLine ? '2.5' : line.isSelected ? '2.5' : '1.75'}
                strokeDasharray={isCritLine || line.isSelected ? undefined : '3,2'}
                markerEnd={isCritLine ? 'url(#arrow-critical)' : line.isSelected ? 'url(#arrow-selected)' : 'url(#arrow-default)'}
                className="transition-all filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              />
            );
          })}
        </svg>

        {/* Task Rows & Bars Container */}
        <div className="relative pt-0">
          {organized.map(({ item, level }, rowIndex) => {
            const isSelected = selectedItemId === item.id;
            const isBeingDragged = dragState?.itemId === item.id;
            const isCritical = criticalItemIds.has(item.id);

            // Compute active dates (or dragged preview dates)
            const activeStart = isBeingDragged ? dragState.currentStartDate : item.startDate;
            const activeEnd = isBeingDragged ? dragState.currentEndDate : item.endDate;

            const startX = dateToX(activeStart);
            const durationDays = Math.max(1, diffDays(activeStart, activeEnd) + 1);
            const barWidth = item.type === 'milestone' ? dayWidth : Math.max(12, durationDays * dayWidth);

            const isGroup = item.type === 'group';
            const isSubGroup = isGroup && level > 0;
            const isMilestone = item.type === 'milestone';

            return (
              <div
                key={item.id}
                style={{ height: `${rowHeight}px` }}
                onClick={() => onSelectItem(item.id)}
                onDoubleClick={(e) => handleGridDoubleClick(e)}
                className={`relative flex items-center border-b border-zinc-850/60 hover:bg-zinc-850/20 transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-950/30 ring-1 ring-inset ring-indigo-500/40' 
                    : isGroup 
                    ? isSubGroup 
                      ? 'bg-[#09090b]/80' 
                      : 'bg-[#0b0b0e]/90' 
                    : ''
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
                    {/* Rotated Diamond with high-contrast subtle border */}
                    <div
                      className="w-6 h-6 rotate-45 flex items-center justify-center rounded-xs shadow-xl transition-transform group-hover/bar:scale-110 border-2 border-white/70 ring-1 ring-black"
                      style={{
                        backgroundColor: item.color || '#f59e0b',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      <span className="-rotate-45 text-[10px] text-zinc-950 font-black">★</span>
                    </div>

                    <div className={`whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] font-semibold shadow-xl flex items-center gap-1.5 backdrop-blur-xs ${
                      isCritical && showCriticalPath
                        ? 'bg-red-950/90 border border-red-500 text-red-200 ring-1 ring-red-500'
                        : 'bg-[#09090c]/95 border border-zinc-700/80 text-amber-200'
                    }`}>
                      {isCritical && showCriticalPath && (
                        <span className="text-[8px] font-black text-white bg-red-600 px-1 rounded shadow-xs">
                          🔥 CRITIQUE
                        </span>
                      )}
                      <span>{item.name}</span>
                      <span className="font-mono text-[10px] text-amber-300 font-bold">
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
                    {/* Top bar with side brackets - enhanced contrast and subtle borders */}
                    <div
                      className="w-full h-3 rounded-t-sm relative shadow-lg border-t border-x border-white/35"
                      style={{
                        backgroundColor: item.color ? `${item.color}e6` : '#475569',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <div
                        className="absolute -bottom-1.5 left-0 w-2 h-2 rotate-45 border-b border-l border-white/40 shadow-xs"
                        style={{ backgroundColor: item.color || '#475569' }}
                      />
                      <div
                        className="absolute -bottom-1.5 right-0 w-2 h-2 rotate-45 border-b border-r border-white/40 shadow-xs"
                        style={{ backgroundColor: item.color || '#475569' }}
                      />
                    </div>

                    <div className="absolute left-1 -top-4.5 whitespace-nowrap text-[11px] font-bold text-zinc-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] flex items-center gap-1.5 bg-[#09090c]/95 px-1.5 py-0.5 rounded border border-zinc-700/80 shadow-md">
                      {isSubGroup && (
                        <span className="text-[8px] font-mono text-indigo-300 bg-indigo-950/90 px-1 py-0.2 rounded border border-indigo-500/60 shadow-xs">
                          ↳ sous-gr.
                        </span>
                      )}
                      <span>{item.name}</span>
                      <span className="text-[10px] font-mono text-zinc-300">
                        ({item.progress}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. NORMAL TASK BAR (WITH SUBTLE BORDERS & HIGH CONTRAST) */}
                {!isMilestone && !isGroup && (
                  <div
                    style={{
                      left: `${startX}px`,
                      width: `${barWidth}px`,
                      height: '28px',
                      backgroundColor: isCritical && showCriticalPath ? '#ef444430' : `${item.color || '#6366f1'}38`,
                      borderColor: isCritical && showCriticalPath ? '#ef4444' : item.color ? `${item.color}cc` : '#818cf8',
                      borderWidth: isCritical && showCriticalPath ? '2px' : '1px',
                      borderStyle: 'solid',
                      // Multi-layered shadow & crisp subtle 1px border for clean separation when superimposed
                      boxShadow: isCritical && showCriticalPath
                        ? '0 0 14px rgba(239, 68, 68, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
                    }}
                    onMouseDown={(e) => handleStartDrag(e, item, 'move')}
                    onClick={(e) => handleItemClick(e, item.id)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, item)}
                    className={`absolute z-10 rounded-lg group/taskbar overflow-hidden flex items-center transition-all hover:ring-2 hover:ring-indigo-300/70 cursor-grab active:cursor-grabbing backdrop-blur-xs ${
                      isBeingDragged 
                        ? 'ring-2 ring-indigo-300 scale-[1.01] z-30 shadow-2xl' 
                        : isCritical && showCriticalPath
                        ? 'ring-1 ring-red-400'
                        : ''
                    }`}
                    title={`${item.name}${isCritical && showCriticalPath ? ' [CHEMIN CRITIQUE 🔥]' : ''}\n${formatReadableDate(activeStart, lang)} → ${formatReadableDate(activeEnd, lang)} (${durationDays} ${t.days})\nDouble-clic pour modifier ou renommer.\nGlissez pour déplacer, les bords pour allonger/réduire.`}
                  >
                    {/* LEFT RESIZE HANDLE (Shorten or advance start date) */}
                    <div
                      onMouseDown={(e) => handleStartDrag(e, item, 'resize-start')}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="absolute left-0 top-0 bottom-0 w-2.5 hover:w-3.5 bg-white/25 hover:bg-white/60 cursor-ew-resize transition-all z-20 border-r border-white/20"
                      title="Glisser pour modifier le début"
                    />

                    {/* Inner Progress Fill with subtle border */}
                    <div
                      className="h-full transition-all rounded-l-md pointer-events-none relative border-r border-white/35"
                      style={{
                        width: `${item.progress}%`,
                        backgroundColor: isCritical && showCriticalPath ? '#ef4444' : item.color || '#6366f1',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      }}
                    />

                    {/* Task Title & Info inside bar with high contrast */}
                    <div className="absolute inset-0 px-2.5 flex items-center justify-between pointer-events-none overflow-hidden">
                      <div className="flex items-center gap-1.5 truncate pr-1">
                        {isCritical && showCriticalPath && (
                          <span className="shrink-0 text-[8px] font-black text-white bg-red-600 px-1 rounded shadow-xs">
                            🔥 CRITIQUE
                          </span>
                        )}
                        <span className="truncate text-[11px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] tracking-tight">
                          {item.name}
                        </span>
                      </div>
                      {barWidth > 70 && (
                        <span className="shrink-0 text-[10px] font-mono font-bold text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] ml-1 bg-black/60 px-1.5 py-0.5 rounded border border-white/20 shadow-xs">
                          {durationDays}{t.dayShort} · {item.progress}%
                        </span>
                      )}
                    </div>

                    {/* Label floating outside if bar is very narrow */}
                    {barWidth < 60 && (
                      <span
                        className="absolute left-full ml-2 whitespace-nowrap text-[11px] font-semibold text-zinc-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] pointer-events-none bg-[#09090c]/95 px-1.5 py-0.5 rounded border border-zinc-700/80 shadow-xl"
                      >
                        {item.name} ({durationDays}{t.dayShort})
                      </span>
                    )}

                    {/* RIGHT RESIZE HANDLE (Allonger / réduire durée) */}
                    <div
                      onMouseDown={(e) => handleStartDrag(e, item, 'resize-end')}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 bottom-0 w-2.5 hover:w-3.5 bg-white/25 hover:bg-white/60 cursor-ew-resize transition-all z-20 border-l border-white/20"
                      title="Glisser pour allonger ou réduire la durée"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom spacing matching TaskList perfectly (288px = 6 rows) */}
          <div className="h-72 shrink-0 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
