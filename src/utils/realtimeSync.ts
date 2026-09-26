import { GanttProject } from '../types/gantt';

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  isSelf?: boolean;
}

export interface SyncLog {
  id: string;
  userName: string;
  userColor: string;
  action: string;
  timestamp: string;
}

const COLLAB_PROFILE_KEY = 'gantt_student_user_profile';

const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#14b8a6', // Teal
];

export function getLocalUserProfile(): Collaborator {
  try {
    const raw = localStorage.getItem(COLLAB_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.id && parsed.name && parsed.color) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load user profile', err);
  }

  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const randomNum = Math.floor(10 + Math.random() * 90);
  const newProfile: Collaborator = {
    id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: `Étudiant #${randomNum}`,
    color: randomColor,
  };

  try {
    localStorage.setItem(COLLAB_PROFILE_KEY, JSON.stringify(newProfile));
  } catch {
    // ignore
  }

  return newProfile;
}

export function saveLocalUserProfile(profile: Partial<Collaborator>): Collaborator {
  const current = getLocalUserProfile();
  const updated: Collaborator = {
    ...current,
    ...profile,
  };
  try {
    localStorage.setItem(COLLAB_PROFILE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}
