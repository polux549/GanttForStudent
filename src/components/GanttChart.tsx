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
  onMoveItem?: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  rowHeight: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isReadOnly?: boolean;
}

interface DragState {
  type: 'move' | 'resize-start' | 'resize-end';
  itemId: string;
  initialX: number;
  initialY: number;
  initialRowIndex: number;
  initialStartDate: string;
  initialEndDate: string;
  currentStartDate: string;
  currentEndDate: string;
  deltaDays: number;
  deltaY: number;
  targetRowIndex: number;
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
  onMoveItem,
  rowHeight,
  scrollRef,
  onScroll,
  isReadOnly = false,
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
  const [html5DropTarget, setHtml5DropTarget] = useState<{ id: string; position: 'before' | 'after' } | null>(null);

  // Tracking drag movement to strictly avoid opening the edit modal on resize/move
  const hasMovedRef = useRef(false);
  const lastDragEndTimeRef = useRef(0);

  // Column width based on zoom level: Semaines (24px), Mois (12px), Années (3.8px)
  const dayWidth = useMemo(() => {
    switch (zoom) {
      case 'weeks':
        return 24;
      case 'months':
        return 12;
      case 'years':
        return 3.8;
      default:
        return 24;
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

  // Year spans for upper timeline header (especially for 'years' zoom)
  const yearSpans = useMemo(() => {
    const spans: { year: number; startIndex: number; count: number }[] = [];
    let currentSpan: { year: number; startIndex: number; count: number } | null = null;

    daysList.forEach((day, index) => {
      if (!currentSpan || currentSpan.year !== day.year) {
        if (currentSpan) {
          spans.push(currentSpan);
        }
        currentSpan = {
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
  }, [daysList]);

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
      });
    });

    return lines;
  }, [organized, itemRowMap, items, dayWidth, bounds.start, rowHeight, selectedItemId, dragState]);

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

  // Mouse drag & resize handlers for task bars (horizontal date & vertical row move)
  const handleStartDrag = (
    e: React.MouseEvent,
    item: GanttItem,
    type: 'move' | 'resize-start' | 'resize-end',
    rowIndex: number = 0
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (isReadOnly) return;
    hasMovedRef.current = false;

    setDragState({
      type,
      itemId: item.id,
      initialX: e.clientX,
      initialY: e.clientY,
      initialRowIndex: rowIndex,
      initialStartDate: item.startDate,
      initialEndDate: item.endDate,
      currentStartDate: item.startDate,
      currentEndDate: item.endDate,
      deltaDays: 0,
      deltaY: 0,
      targetRowIndex: rowIndex,
    });
  };

  // Global mousemove and mouseup listeners for dragging
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.initialX;
      const deltaY = e.clientY - dragState.initialY;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
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

      // Vertical row calculation when moving up and down
      let targetRowIndex = dragState.initialRowIndex;
      if (dragState.type === 'move') {
        const rowDelta = Math.round(deltaY / rowHeight);
        targetRowIndex = Math.max(0, Math.min(organized.length - 1, dragState.initialRowIndex + rowDelta));
      }

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentStartDate: newStart,
              currentEndDate: newEnd,
              deltaDays,
              deltaY: dragState.type === 'move' ? deltaY : 0,
              targetRowIndex,
            }
          : null
      );
    };

    const handleMouseUp = () => {
      if (hasMovedRef.current) {
        lastDragEndTimeRef.current = Date.now();
      }
      if (dragState) {
        const hasRowChange = dragState.type === 'move' && dragState.targetRowIndex !== dragState.initialRowIndex;
        const hasDateChange = dragState.deltaDays !== 0;

        if (hasRowChange && onMoveItem) {
          const targetItem = organized[dragState.targetRowIndex]?.item;
          if (targetItem && targetItem.id !== dragState.itemId) {
            const position = dragState.targetRowIndex > dragState.initialRowIndex ? 'after' : 'before';
            onMoveItem(dragState.itemId, targetItem.id, position);
          }
        }

        if (hasDateChange) {
          onUpdateItemDates(
            dragState.itemId,
            dragState.currentStartDate,
            dragState.currentEndDate
          );
        }
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, dayWidth, rowHeight, organized, onMoveItem, onUpdateItemDates]);

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
          {/* Tier 1: Years (when zoom === 'years') or Months (when zoom === 'weeks' | 'months') */}
          <div className="h-6 flex border-b border-zinc-800 text-[11px] font-bold text-zinc-200">
            {zoom === 'years' ? (
              yearSpans.map((span, idx) => (
                <div
                  key={idx}
                  style={{ width: `${span.count * dayWidth}px` }}
                  className="px-2.5 flex items-center border-r border-zinc-800/80 truncate tracking-wide text-indigo-300 font-extrabold"
                >
                  <span>{span.year}</span>
                </div>
              ))
            ) : (
              monthSpans.map((span, idx) => (
                <div
                  key={idx}
                  style={{ width: `${span.count * dayWidth}px` }}
                  className="px-2.5 flex items-center border-r border-zinc-800/80 truncate tracking-wide"
                >
                  <span>
                    {span.name} {span.year}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Tier 2: Months (when zoom === 'years') or Days (when zoom === 'weeks' | 'months') */}
          <div className="h-10 flex">
            {zoom === 'years' ? (
              monthSpans.map((span, idx) => (
                <div
                  key={idx}
                  style={{ width: `${span.count * dayWidth}px` }}
                  className="flex items-center justify-center border-r border-zinc-850/70 text-[11px] font-semibold text-zinc-300 shrink-0 truncate px-1"
                  title={`${span.name} ${span.year}`}
                >
                  <span>{span.name.slice(0, 4)}</span>
                </div>
              ))
            ) : (
              daysList.map((day, idx) => (
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
                  {zoom === 'weeks' && (
                    <span className="text-[9px] uppercase tracking-tighter opacity-80 font-medium">
                      {day.dayShort.slice(0, 1)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timeline Grid Columns (Background shading & weekend tint) */}
        <div
          className="absolute top-16 bottom-0 left-0 flex"
          style={{ width: `${totalWidth}px` }}
        >
          {zoom === 'years' ? (
            monthSpans.map((span, idx) => (
              <div
                key={idx}
                style={{ width: `${span.count * dayWidth}px` }}
                className="h-full border-r border-zinc-900/60 shrink-0 hover:bg-white/[0.02]"
              />
            ))
          ) : (
            daysList.map((day, idx) => (
              <div
                key={idx}
                style={{ width: `${dayWidth}px` }}
                onDoubleClick={(e) => handleGridDoubleClick(e, day.date)}
                className={`h-full border-r border-zinc-900/50 shrink-0 ${
                  day.isWeekend ? 'bg-[#0a0a0d]/80' : 'bg-transparent hover:bg-white/[0.02]'
                }`}
                title={`Double-cliquez sur le ${day.date} pour créer une tâche`}
              />
            ))
          )}
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
          </defs>

          {dependencyLines.map((line) => {
            return (
              <path
                key={line.id}
                d={line.path}
                fill="none"
                stroke={line.isSelected ? '#a5b4fc' : '#94a3b8'}
                strokeWidth={line.isSelected ? '2.5' : '1.75'}
                strokeDasharray={line.isSelected ? undefined : '3,2'}
                markerEnd={line.isSelected ? 'url(#arrow-selected)' : 'url(#arrow-default)'}
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
            const isTargetRow = dragState?.type === 'move' && dragState.targetRowIndex === rowIndex && dragState.targetRowIndex !== dragState.initialRowIndex;
            const isHtml5TargetRow = html5DropTarget?.id === item.id;

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
                onDragOver={isReadOnly ? undefined : (e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  const rect = e.currentTarget.getBoundingClientRect();
                  const position = (e.clientY - rect.top) < rowHeight / 2 ? 'before' : 'after';
                  setHtml5DropTarget({ id: item.id, position });
                }}
                onDragLeave={isReadOnly ? undefined : (e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setHtml5DropTarget(null);
                  }
                }}
                onDrop={isReadOnly ? undefined : (e) => {
                  e.preventDefault();
                  const sourceId = e.dataTransfer.getData('text/plain');
                  if (sourceId && sourceId !== item.id && onMoveItem) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const position = (e.clientY - rect.top) < rowHeight / 2 ? 'before' : 'after';
                    onMoveItem(sourceId, item.id, position);
                  }
                  setHtml5DropTarget(null);
                }}
                className={`relative flex items-center border-b border-zinc-850/60 hover:bg-zinc-850/20 transition-colors cursor-pointer ${
                  isTargetRow
                    ? 'bg-indigo-950/40'
                    : isSelected 
                    ? 'bg-indigo-950/30 ring-1 ring-inset ring-indigo-500/40' 
                    : isGroup 
                    ? isSubGroup 
                      ? 'bg-[#09090b]/80' 
                      : 'bg-[#0b0b0e]/90' 
                    : ''
                }`}
                title="Double-cliquez pour créer une tâche à cette date"
              >
                {/* Drop indicator for vertical drag in Gantt */}
                {isTargetRow && dragState && (
                  <div 
                    className={`absolute ${dragState.targetRowIndex < dragState.initialRowIndex ? 'top-0' : 'bottom-0'} left-0 right-0 h-[3px] bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,1)] z-40 pointer-events-none flex items-center`}
                  >
                    <div className={`px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-lg ml-6 ${dragState.targetRowIndex < dragState.initialRowIndex ? '-mt-6' : 'mt-6'} flex items-center gap-1.5 ring-1 ring-white/30 animate-pulse`}>
                      <span>{dragState.targetRowIndex < dragState.initialRowIndex ? '↑ Placer avant' : '↓ Placer après'}</span>
                      <span className="text-indigo-200">« {item.name} »</span>
                    </div>
                  </div>
                )}

                {/* Drop indicator for HTML5 row drag */}
                {isHtml5TargetRow && html5DropTarget && (
                  <div 
                    className={`absolute ${html5DropTarget.position === 'before' ? 'top-0' : 'bottom-0'} left-0 right-0 h-[3px] bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,1)] z-40 pointer-events-none`}
                  />
                )}

                {/* 1. MILESTONE (JALON) RENDERING */}
                {isMilestone && (
                  <div
                    style={{
                      left: `${startX + dayWidth / 2 - 12}px`,
                      transform: isBeingDragged && dragState?.type === 'move' ? `translateY(${dragState.deltaY}px)` : undefined,
                      zIndex: isBeingDragged ? 50 : 10,
                    }}
                    onMouseDown={isReadOnly ? undefined : (e) => handleStartDrag(e, item, 'move', rowIndex)}
                    onClick={(e) => handleItemClick(e, item.id)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, item)}
                    className={`absolute flex items-center gap-2 group/bar ${isReadOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} ${
                      isBeingDragged ? 'opacity-90 ring-2 ring-indigo-400 rounded-lg p-0.5' : ''
                    }`}
                    title={isReadOnly 
                      ? `${item.name} (${formatReadableDate(activeStart, lang)})\nMode consultation seule (verrouillé)\nDouble-clic pour consulter.` 
                      : `${item.name} (${formatReadableDate(activeStart, lang)})\nGlissez horizontalement pour changer la date, ou verticalement (haut/bas) pour réorganiser les rangs.\nDouble-clic pour modifier.`
                    }
                  >
                    {/* Floating drag tooltip */}
                    {isBeingDragged && dragState?.type === 'move' && (dragState.targetRowIndex !== dragState.initialRowIndex || dragState.deltaDays !== 0) && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-950/95 border border-indigo-400 text-white text-[10px] font-bold shadow-2xl whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5">
                        {dragState.targetRowIndex !== dragState.initialRowIndex && (
                          <span className="text-amber-300">
                            {dragState.targetRowIndex < dragState.initialRowIndex ? '↑ Monter' : '↓ Descendre'}
                          </span>
                        )}
                        {dragState.deltaDays !== 0 && (
                          <span className="text-indigo-200 font-mono">
                            {dragState.deltaDays > 0 ? `+${dragState.deltaDays}` : dragState.deltaDays}j
                          </span>
                        )}
                      </div>
                    )}

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

                    <div className="whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] font-semibold shadow-xl flex items-center gap-1.5 backdrop-blur-xs bg-[#09090c]/95 border border-zinc-700/80 text-amber-200">
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
                      transform: isBeingDragged && dragState?.type === 'move' ? `translateY(${dragState.deltaY}px)` : undefined,
                      zIndex: isBeingDragged ? 50 : 10,
                    }}
                    onMouseDown={
                      item.schedulingMode === 'manual'
                        ? (e) => handleStartDrag(e, item, 'move', rowIndex)
                        : undefined
                    }
                    onClick={(e) => handleItemClick(e, item.id)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, item)}
                    className={`absolute group/groupbar ${
                      item.schedulingMode === 'manual'
                        ? 'cursor-grab active:cursor-grabbing'
                        : 'cursor-pointer'
                    } ${isBeingDragged ? 'opacity-90 ring-2 ring-indigo-400' : ''}`}
                    title={`Groupe: ${item.name} (${item.progress}%)\nGlissez haut/bas pour réorganiser.\nDouble-clic pour renommer.`}
                  >
                    {/* Floating drag tooltip */}
                    {isBeingDragged && dragState?.type === 'move' && (dragState.targetRowIndex !== dragState.initialRowIndex || dragState.deltaDays !== 0) && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-950/95 border border-indigo-400 text-white text-[10px] font-bold shadow-2xl whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5">
                        {dragState.targetRowIndex !== dragState.initialRowIndex && (
                          <span className="text-amber-300">
                            {dragState.targetRowIndex < dragState.initialRowIndex ? '↑ Monter' : '↓ Descendre'}
                          </span>
                        )}
                        {dragState.deltaDays !== 0 && (
                          <span className="text-indigo-200 font-mono">
                            {dragState.deltaDays > 0 ? `+${dragState.deltaDays}` : dragState.deltaDays}j
                          </span>
                        )}
                      </div>
                    )}

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
                      backgroundColor: `${item.color || '#6366f1'}38`,
                      borderColor: item.color ? `${item.color}cc` : '#818cf8',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
                      transform: isBeingDragged && dragState?.type === 'move' ? `translateY(${dragState.deltaY}px)` : undefined,
                      zIndex: isBeingDragged ? 50 : 10,
                    }}
                    onMouseDown={isReadOnly ? undefined : (e) => handleStartDrag(e, item, 'move', rowIndex)}
                    onClick={(e) => handleItemClick(e, item.id)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, item)}
                    className={`absolute rounded-lg group/taskbar overflow-hidden flex items-center transition-all hover:ring-2 hover:ring-indigo-300/70 backdrop-blur-xs ${
                      isReadOnly 
                        ? 'cursor-pointer' 
                        : 'cursor-grab active:cursor-grabbing'
                    } ${
                      isBeingDragged 
                        ? 'ring-2 ring-indigo-300 scale-[1.01] shadow-2xl opacity-95' 
                        : ''
                    }`}
                    title={isReadOnly
                      ? `${item.name}\n${formatReadableDate(activeStart, lang)} → ${formatReadableDate(activeEnd, lang)} (${durationDays} ${t.days})\nMode lecture seule\nDouble-clic pour consulter les détails.`
                      : `${item.name}\n${formatReadableDate(activeStart, lang)} → ${formatReadableDate(activeEnd, lang)} (${durationDays} ${t.days})\nGlissez horizontalement pour changer les dates, ou verticalement (haut/bas) pour réordonner les rangs.`
                    }
                  >
                    {/* Floating drag tooltip */}
                    {isBeingDragged && dragState?.type === 'move' && (dragState.targetRowIndex !== dragState.initialRowIndex || dragState.deltaDays !== 0) && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-950/95 border border-indigo-400 text-white text-[10px] font-bold shadow-2xl whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5">
                        {dragState.targetRowIndex !== dragState.initialRowIndex && (
                          <span className="text-amber-300">
                            {dragState.targetRowIndex < dragState.initialRowIndex ? '↑ Monter' : '↓ Descendre'}
                          </span>
                        )}
                        {dragState.deltaDays !== 0 && (
                          <span className="text-indigo-200 font-mono">
                            {dragState.deltaDays > 0 ? `+${dragState.deltaDays}` : dragState.deltaDays}j
                          </span>
                        )}
                      </div>
                    )}

                    {/* LEFT RESIZE HANDLE (Shorten or advance start date) */}
                    {!isReadOnly && (
                      <div
                        onMouseDown={(e) => handleStartDrag(e, item, 'resize-start', rowIndex)}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-0 bottom-0 w-2.5 hover:w-3.5 bg-white/25 hover:bg-white/60 cursor-ew-resize transition-all z-20 border-r border-white/20"
                        title="Glisser pour modifier le début"
                      />
                    )}

                    {/* Inner Progress Fill with subtle border */}
                    <div
                      className="h-full transition-all rounded-l-md pointer-events-none relative border-r border-white/35"
                      style={{
                        width: `${item.progress}%`,
                        backgroundColor: item.color || '#6366f1',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      }}
                    />

                    {/* Task Title & Info inside bar with high contrast */}
                    <div className="absolute inset-0 px-2.5 flex items-center justify-between pointer-events-none overflow-hidden">
                      <div className="flex items-center gap-1.5 truncate pr-1">
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
                    {!isReadOnly && (
                      <div
                        onMouseDown={(e) => handleStartDrag(e, item, 'resize-end', rowIndex)}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-0 bottom-0 w-2.5 hover:w-3.5 bg-white/25 hover:bg-white/60 cursor-ew-resize transition-all z-20 border-l border-white/20"
                        title="Glisser pour allonger ou réduire la durée"
                      />
                    )}
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
