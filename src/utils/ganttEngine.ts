import { GanttItem } from '../types/gantt';
import { addDays, diffDays, parseDate } from './dates';

/**
 * Checks whether potentialDescendantId is a descendant of ancestorId in the group hierarchy.
 */
export function isDescendantOf(items: GanttItem[], potentialDescendantId: string, ancestorId: string): boolean {
  if (!potentialDescendantId || !ancestorId) return false;
  if (potentialDescendantId === ancestorId) return true;

  const itemMap = new Map<string, GanttItem>();
  for (const item of items) {
    itemMap.set(item.id, item);
  }

  let curr = itemMap.get(potentialDescendantId);
  const visited = new Set<string>();

  while (curr && curr.groupId) {
    if (curr.groupId === ancestorId) return true;
    if (visited.has(curr.groupId)) break; // cycle safety
    visited.add(curr.groupId);
    curr = itemMap.get(curr.groupId);
  }

  return false;
}

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

  // 2. Recompute group spans and progress bottom-up through multiple passes
  // Supports arbitrarily nested sub-groups
  const groups = Array.from(map.values()).filter((it) => it.type === 'group');
  let groupChanged = true;
  let groupPass = 0;
  const maxGroupPasses = Math.max(10, groups.length * 3);

  while (groupChanged && groupPass < maxGroupPasses) {
    groupChanged = false;
    groupPass++;

    for (const group of groups) {
      const currentGroup = map.get(group.id);
      if (!currentGroup) continue;

      const children = Array.from(map.values()).filter((it) => it.groupId === currentGroup.id);
      
      // Calculate progress for groups with children
      if (children.length > 0) {
        let totalProgress = 0;
        let totalDuration = 0;
        for (const child of children) {
          const weight = Math.max(1, child.duration || 1);
          totalProgress += (child.progress || 0) * weight;
          totalDuration += weight;
        }
        const newProgress = totalDuration > 0 ? Math.round(totalProgress / totalDuration) : 0;
        if (currentGroup.progress !== newProgress) {
          currentGroup.progress = newProgress;
          groupChanged = true;
        }

        // If group is automatic, length/dates strictly depend on children inside it
        if (currentGroup.schedulingMode !== 'manual') {
          let minStart = children[0].startDate;
          let maxEnd = children[0].endDate;

          for (const child of children) {
            if (child.startDate && parseDate(child.startDate) < parseDate(minStart)) {
              minStart = child.startDate;
            }
            if (child.endDate && parseDate(child.endDate) > parseDate(maxEnd)) {
              maxEnd = child.endDate;
            }
          }

          const newDuration = Math.max(1, diffDays(minStart, maxEnd) + 1);
          if (
            currentGroup.startDate !== minStart ||
            currentGroup.endDate !== maxEnd ||
            currentGroup.duration !== newDuration
          ) {
            currentGroup.startDate = minStart;
            currentGroup.endDate = maxEnd;
            currentGroup.duration = newDuration;
            groupChanged = true;
          }
        }
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Organizes items hierarchically supporting nested sub-groups of any depth.
 * Returns items in depth-first order with their nesting level and visibility.
 */
export function getOrganizedItems(items: GanttItem[]): { item: GanttItem; level: number; isVisible: boolean }[] {
  const result: { item: GanttItem; level: number; isVisible: boolean }[] = [];
  const handledIds = new Set<string>();

  // Map parentId -> children preserving order
  const childrenMap = new Map<string | undefined, GanttItem[]>();
  for (const item of items) {
    const parentId = item.groupId;
    const list = childrenMap.get(parentId) || [];
    list.push(item);
    childrenMap.set(parentId, list);
  }

  function traverse(parentId: string | undefined, level: number, parentVisible: boolean) {
    const children = childrenMap.get(parentId) || [];
    for (const child of children) {
      if (handledIds.has(child.id)) continue; // Avoid any cyclic loops
      handledIds.add(child.id);

      result.push({ item: child, level, isVisible: parentVisible });

      if (child.type === 'group') {
        const isCollapsed = Boolean(child.collapsed);
        // Children are visible only if this group is visible AND not collapsed
        traverse(child.id, level + 1, parentVisible && !isCollapsed);
      }
    }
  }

  // Find root items (items without a groupId or whose groupId doesn't exist in items)
  const allIds = new Set(items.map((i) => i.id));
  const roots = items.filter((i) => !i.groupId || !allIds.has(i.groupId));

  for (const root of roots) {
    if (handledIds.has(root.id)) continue;
    handledIds.add(root.id);
    result.push({ item: root, level: 0, isVisible: true });
    if (root.type === 'group') {
      const isCollapsed = Boolean(root.collapsed);
      traverse(root.id, 1, !isCollapsed);
    }
  }

  // Fallback for any unhandled items
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

  // Case 2: Moving up and target is the parent group -> exit group
  if (direction === 'up' && current.groupId && targetItem.id === current.groupId) {
    const parentGroup = items.find((i) => i.id === current.groupId);
    const newParentId = parentGroup?.groupId; // inherit grandparent groupId
    const copy = items.map((it) => (it.id === current.id ? { ...it, groupId: newParentId } : it));
    const currentIdx = copy.findIndex((i) => i.id === current.id);
    const [removed] = copy.splice(currentIdx, 1);
    const groupIdx = copy.findIndex((i) => i.id === targetItem.id);
    copy.splice(groupIdx, 0, removed);
    return recalculateSchedule(copy);
  }

  // Case 3: Moving down and target is outside its group -> adopt target's group
  if (direction === 'down' && current.groupId && targetItem.groupId !== current.groupId) {
    const copy = items.map((it) => (it.id === current.id ? { ...it, groupId: targetItem.groupId } : it));
    const currentIdx = copy.findIndex((i) => i.id === current.id);
    const [removed] = copy.splice(currentIdx, 1);
    const targetIdx = copy.findIndex((i) => i.id === targetItem.id);
    copy.splice(targetIdx, 0, removed);
    return recalculateSchedule(copy);
  }

  // Case 4: Moving down into a group (targetItem is a group)
  if (direction === 'down' && targetItem.type === 'group' && targetItem.id !== current.id) {
    if (!(current.type === 'group' && isDescendantOf(items, targetItem.id, current.id))) {
      const copy = items.map((it) => (it.id === current.id ? { ...it, groupId: targetItem.id } : it));
      const currentIdx = copy.findIndex((i) => i.id === current.id);
      const [removed] = copy.splice(currentIdx, 1);
      const groupIdx = copy.findIndex((i) => i.id === targetItem.id);
      copy.splice(groupIdx + 1, 0, removed);
      return recalculateSchedule(copy);
    }
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
 * Returns all descendant IDs (children, grandchildren, etc.) of a given group ID.
 */
export function getAllDescendantIds(items: GanttItem[], parentId: string): Set<string> {
  const descendants = new Set<string>();
  const toCheck = [parentId];
  const visitedGroups = new Set<string>();

  while (toCheck.length > 0) {
    const currId = toCheck.pop()!;
    if (visitedGroups.has(currId)) continue;
    visitedGroups.add(currId);

    for (const item of items) {
      if (item.groupId === currId && !descendants.has(item.id)) {
        descendants.add(item.id);
        if (item.type === 'group') {
          toCheck.push(item.id);
        }
      }
    }
  }

  return descendants;
}

/**
 * Moves an item to a new position relative to another item (before, after, or inside).
 * Supports nesting groups inside groups while strictly preventing circular references.
 * When a group is moved, all of its descendant tasks and sub-groups move bundled with it.
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

  // Cycle prevention: a group cannot be moved inside itself or into any of its descendants
  if (source.type === 'group') {
    if (target.id === source.id) return items;
    if (isDescendantOf(items, target.id, source.id)) return items;
  }

  let newGroupId: string | undefined = undefined;

  if (position === 'inside' && target.type === 'group') {
    newGroupId = target.id;
  } else {
    // Adopt same parent group as target
    newGroupId = target.groupId;
  }

  // Extra safety check for cycles
  if (source.type === 'group' && newGroupId && isDescendantOf(items, newGroupId, source.id)) {
    return items;
  }

  // Descendants of source group must move bundled with the source
  const descendantIds = source.type === 'group' ? getAllDescendantIds(items, source.id) : new Set<string>();

  const updatedSource: GanttItem = {
    ...source,
    groupId: newGroupId,
  };

  // Build the moving bundle: [updatedSource, ...descendants] in original relative order
  const movingBundle: GanttItem[] = [updatedSource];
  for (const it of items) {
    if (descendantIds.has(it.id)) {
      movingBundle.push({ ...it });
    }
  }

  // Remove the moving bundle from remaining items
  const movingIds = new Set([source.id, ...descendantIds]);
  const remaining = items
    .filter((i) => !movingIds.has(i.id))
    .map((i) => {
      // If target is a group and we are dropping inside, auto-expand target group
      if (position === 'inside' && i.id === target.id && i.type === 'group') {
        return { ...i, collapsed: false };
      }
      return { ...i };
    });

  const targetIndex = remaining.findIndex((i) => i.id === targetId);
  if (targetIndex === -1) {
    remaining.push(...movingBundle);
  } else {
    if (position === 'before') {
      remaining.splice(targetIndex, 0, ...movingBundle);
    } else if (position === 'after') {
      // If target is a group, insert after target AND its own descendants
      const targetDescendants = target.type === 'group' ? getAllDescendantIds(remaining, target.id) : new Set<string>();
      let insertAfterIndex = targetIndex;
      for (let idx = targetIndex + 1; idx < remaining.length; idx++) {
        if (targetDescendants.has(remaining[idx].id)) {
          insertAfterIndex = idx;
        } else {
          break;
        }
      }
      remaining.splice(insertAfterIndex + 1, 0, ...movingBundle);
    } else {
      // position === 'inside': insert immediately under the target group header
      remaining.splice(targetIndex + 1, 0, ...movingBundle);
    }
  }

  return recalculateSchedule(remaining);
}

/**
 * Assigns an item into a target group or null to remove it from group, preventing cycles.
 * When moving into a group, bundles all child tasks and sub-groups.
 */
export function setItemGroup(items: GanttItem[], itemId: string, targetGroupId: string | null): GanttItem[] {
  const item = items.find((i) => i.id === itemId);
  if (!item) return items;

  // Cycle prevention: cannot set targetGroupId to self or any descendant
  if (item.type === 'group' && targetGroupId) {
    if (targetGroupId === itemId || isDescendantOf(items, targetGroupId, itemId)) {
      return items;
    }
  }

  if (targetGroupId) {
    return moveItemToPosition(items, itemId, targetGroupId, 'inside');
  }

  // If removing from group (targetGroupId is null):
  // Preserve descendant items pointing to this item
  const updatedItems = items.map((it) => {
    if (it.id === itemId) {
      return {
        ...it,
        groupId: undefined,
      };
    }
    return it;
  });

  return recalculateSchedule(updatedItems);
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
