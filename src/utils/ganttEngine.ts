import { GanttItem } from '../types/gantt';
import { addDays, diffDays, parseDate } from './dates';

/**
 * Recomputes dates for automatic items and group items in the project.
 */
export function recalculateSchedule(items: GanttItem[]): GanttItem[] {
  // Clone array to mutate safely
  const map = new Map<string, GanttItem>();
  items.forEach((item) => {
    map.set(item.id, { ...item });
  });

  // 1. Resolve automatic items by traversing dependencies
  let changed = true;
  let iterations = 0;
  const maxIterations = Math.max(10, items.length * 2);

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const item of map.values()) {
      if (item.type === 'group') continue; // Handled below

      if (item.schedulingMode === 'auto' && item.predecessorId) {
        const pred = map.get(item.predecessorId);
        if (pred) {
          const lag = item.predecessorLag ?? 1;
          const expectedStart = addDays(pred.endDate, lag);
          const duration = item.type === 'milestone' ? 0 : Math.max(1, item.duration || 1);
          const expectedEnd = item.type === 'milestone' 
            ? expectedStart 
            : addDays(expectedStart, Math.max(0, duration - 1));

          if (item.startDate !== expectedStart || item.endDate !== expectedEnd) {
            item.startDate = expectedStart;
            item.endDate = expectedEnd;
            item.duration = duration;
            changed = true;
          }
        }
      } else {
        // Ensure duration and dates are consistent for manual tasks
        if (item.type === 'milestone') {
          if (item.endDate !== item.startDate || item.duration !== 0) {
            item.endDate = item.startDate;
            item.duration = 0;
            changed = true;
          }
        } else {
          const calculatedDuration = Math.max(1, diffDays(item.startDate, item.endDate) + 1);
          if (item.duration !== calculatedDuration) {
            item.duration = calculatedDuration;
          }
        }
      }
    }
  }

  // 2. Recompute group spans and progress
  // If group is 'auto' (or not explicitly 'manual'), bounds adapt to children
  const groups = Array.from(map.values()).filter((it) => it.type === 'group');
  for (const group of groups) {
    const children = Array.from(map.values()).filter((it) => it.groupId === group.id);
    
    // Calculate progress for all groups with children
    if (children.length > 0) {
      let totalProgress = 0;
      let totalDuration = 0;
      for (const child of children) {
        const weight = Math.max(1, child.duration || 1);
        totalProgress += (child.progress || 0) * weight;
        totalDuration += weight;
      }
      group.progress = totalDuration > 0 ? Math.round(totalProgress / totalDuration) : 0;

      // If group is automatic, length/dates strictly depend on tasks inside it
      if (group.schedulingMode !== 'manual') {
        let minStart = children[0].startDate;
        let maxEnd = children[0].endDate;

        for (const child of children) {
          if (parseDate(child.startDate) < parseDate(minStart)) {
            minStart = child.startDate;
          }
          if (parseDate(child.endDate) > parseDate(maxEnd)) {
            maxEnd = child.endDate;
          }
        }

        group.startDate = minStart;
        group.endDate = maxEnd;
        group.duration = Math.max(1, diffDays(minStart, maxEnd) + 1);
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Organizes items hierarchically:
 * Top-level items (roots) and groups with their direct children right under them.
 */
export function getOrganizedItems(items: GanttItem[]): { item: GanttItem; level: number; isVisible: boolean }[] {
  const result: { item: GanttItem; level: number; isVisible: boolean }[] = [];

  // Groups and items without a parent group
  const rootItems = items.filter((it) => !it.groupId);

  for (const root of rootItems) {
    result.push({ item: root, level: 0, isVisible: true });
    if (root.type === 'group') {
      const isCollapsed = Boolean(root.collapsed);
      const children = items.filter((it) => it.groupId === root.id);
      for (const child of children) {
        result.push({ item: child, level: 1, isVisible: !isCollapsed });
      }
    }
  }

  // Fallback for orphaned children whose groupId doesn't exist
  const handledIds = new Set(result.map((r) => r.item.id));
  for (const item of items) {
    if (!handledIds.has(item.id)) {
      result.push({ item, level: 0, isVisible: true });
    }
  }

  return result;
}

/**
 * Move item up or down in the visual order of items.
 */
export function reorderItems(items: GanttItem[], activeId: string, direction: 'up' | 'down'): GanttItem[] {
  const current = items.find((i) => i.id === activeId);
  if (!current) return items;

  // Visual organized order of items
  const organized = getOrganizedItems(items).map((o) => o.item);
  const currentIndex = organized.findIndex((i) => i.id === activeId);
  if (currentIndex === -1) return items;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= organized.length) {
    return items; // Already at boundary
  }

  const targetItem = organized[targetIndex];

  // Case 1: Both are in the same group or both are root
  if (current.groupId === targetItem.groupId) {
    const copy = [...items];
    const idxA = copy.findIndex((i) => i.id === current.id);
    const idxB = copy.findIndex((i) => i.id === targetItem.id);
    if (idxA >= 0 && idxB >= 0) {
      const temp = copy[idxA];
      copy[idxA] = copy[idxB];
      copy[idxB] = temp;
      return recalculateSchedule(copy);
    }
  }

  // Case 2: Moving up and target is the parent group
  if (direction === 'up' && current.groupId && targetItem.id === current.groupId) {
    const copy = items.map((it) => (it.id === current.id ? { ...it, groupId: undefined } : it));
    const currentIdx = copy.findIndex((i) => i.id === current.id);
    const [removed] = copy.splice(currentIdx, 1);
    const groupIdx = copy.findIndex((i) => i.id === targetItem.id);
    copy.splice(groupIdx, 0, removed);
    return recalculateSchedule(copy);
  }

  // Case 3: Moving down and target is outside its group
  if (direction === 'down' && current.groupId && targetItem.groupId !== current.groupId) {
    const copy = items.map((it) => (it.id === current.id ? { ...it, groupId: undefined } : it));
    const currentIdx = copy.findIndex((i) => i.id === current.id);
    const [removed] = copy.splice(currentIdx, 1);
    const targetIdx = copy.findIndex((i) => i.id === targetItem.id);
    copy.splice(targetIdx, 0, removed);
    return recalculateSchedule(copy);
  }

  // Case 4: Moving down into a group (targetItem is a group)
  if (direction === 'down' && !current.groupId && targetItem.type === 'group' && current.type !== 'group') {
    const copy = items.map((it) => (it.id === current.id ? { ...it, groupId: targetItem.id } : it));
    const currentIdx = copy.findIndex((i) => i.id === current.id);
    const [removed] = copy.splice(currentIdx, 1);
    const groupIdx = copy.findIndex((i) => i.id === targetItem.id);
    copy.splice(groupIdx + 1, 0, removed);
    return recalculateSchedule(copy);
  }

  // Fallback: move before/after in array
  const copy = [...items];
  const idxA = copy.findIndex((i) => i.id === current.id);
  const [removed] = copy.splice(idxA, 1);
  const idxB = copy.findIndex((i) => i.id === targetItem.id);
  const insertIdx = direction === 'up' ? idxB : idxB + 1;
  copy.splice(insertIdx, 0, removed);
  return recalculateSchedule(copy);
}

/**
 * Moves an item to a new position relative to another item (before, after, or inside).
 */
export function moveItemToPosition(
  items: GanttItem[],
  sourceId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): GanttItem[] {
  if (sourceId === targetId) return items;
  const source = items.find((i) => i.id === sourceId);
  const target = items.find((i) => i.id === targetId);
  if (!source || !target) return items;

  let newGroupId: string | undefined = undefined;

  if (position === 'inside' && target.type === 'group' && source.type !== 'group') {
    newGroupId = target.id;
  } else if (source.type === 'group') {
    // Groups cannot be nested inside other groups
    newGroupId = undefined;
  } else {
    // Adopt same parent as target
    newGroupId = target.groupId;
  }

  const copy = items.filter((i) => i.id !== sourceId).map((i) => ({ ...i }));
  const updatedSource: GanttItem = {
    ...source,
    groupId: newGroupId,
  };

  const targetIndex = copy.findIndex((i) => i.id === targetId);
  if (targetIndex === -1) {
    copy.push(updatedSource);
  } else {
    if (position === 'before') {
      copy.splice(targetIndex, 0, updatedSource);
    } else {
      // 'after' or 'inside'
      copy.splice(targetIndex + 1, 0, updatedSource);
    }
  }

  return recalculateSchedule(copy);
}

/**
 * Assigns an item into a target group or null to remove it from group
 */
export function setItemGroup(items: GanttItem[], itemId: string, targetGroupId: string | null): GanttItem[] {
  return items.map((it) => {
    if (it.id === itemId) {
      return {
        ...it,
        groupId: targetGroupId ? targetGroupId : undefined,
      };
    }
    return it;
  });
}

/**
 * Computes the overall timeline bounds with a padding of 5-7 days before and after
 */
export function getTimelineBounds(items: GanttItem[]): { start: string; end: string } {
  const today = new Date().toISOString().split('T')[0];
  if (items.length === 0) {
    return {
      start: addDays(today, -7),
      end: addDays(today, 30),
    };
  }

  let minDate = items[0].startDate || today;
  let maxDate = items[0].endDate || today;

  for (const item of items) {
    if (item.startDate && parseDate(item.startDate) < parseDate(minDate)) {
      minDate = item.startDate;
    }
    if (item.endDate && parseDate(item.endDate) > parseDate(maxDate)) {
      maxDate = item.endDate;
    }
  }

  // Include today in view bounds if outside
  if (parseDate(today) < parseDate(minDate)) {
    minDate = today;
  }
  if (parseDate(today) > parseDate(maxDate)) {
    maxDate = today;
  }

  // Add margin around dates
  return {
    start: addDays(minDate, -6),
    end: addDays(maxDate, 14),
  };
}
