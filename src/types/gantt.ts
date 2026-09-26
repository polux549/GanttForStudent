export type GanttItemType = 'task' | 'group' | 'milestone';

export type SchedulingMode = 'manual' | 'auto';

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type?: 'link' | 'drive' | 'github' | 'document' | 'other';
  size?: string;
}

export interface GanttItem {
  id: string;
  name: string;
  type: GanttItemType;
  schedulingMode: SchedulingMode;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  duration: number; // in days
  progress: number; // 0 to 100
  color: string; // hex code
  groupId?: string; // parent group id
  predecessorId?: string; // ID of task this depends on (when auto or manual linked)
  predecessorLag?: number; // lag in days (default 0)
  collapsed?: boolean; // for groups
  assignee?: string;
  notes?: string;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  isCritical?: boolean;
}

export interface GanttProject {
  code: string;
  title: string;
  description?: string;
  items: GanttItem[];
  createdAt: string;
  updatedAt: string;
  isReadOnly?: boolean;
}

export type ZoomLevel = 'days' | 'weeks' | 'months';

export type Language = 'fr' | 'de' | 'it' | 'en';
