// Modern Color System adapted for Light and Dark themes

export interface TaskThemeStyle {
  barBg: string;
  fillBg: string;
  borderColor: string;
  boxShadow: string;
  titleColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

/**
 * Maps task colors into a refined, eye-friendly palette for light theme,
 * while keeping vibrant contrast for dark theme.
 */
export function getTaskStyle(
  color: string = '#6366f1',
  theme: 'light' | 'dark' = 'dark',
  progress: number = 0
): TaskThemeStyle {
  if (theme === 'dark') {
    return {
      barBg: `${color}38`,
      fillBg: color,
      borderColor: `${color}cc`,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
      titleColor: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]',
      badgeBg: 'bg-black/60',
      badgeBorder: 'border-white/20',
      badgeText: 'text-white/95',
    };
  }

  // LIGHT THEME: Softer, modern, gentle on the eyes, refined borders
  const normalized = color.toLowerCase();

  let fill = '#3b82f6';
  let bg = '#eff6ff';
  let border = '#93c5fd';

  if (normalized.includes('6366f1') || normalized.includes('4f46e5') || normalized.includes('indigo')) {
    // Elegant deep cobalt / modern marine (not harsh neon violet)
    fill = '#3b82f6';
    bg = '#eff6ff';
    border = '#93c5fd';
  } else if (normalized.includes('10b981') || normalized.includes('059669') || normalized.includes('emerald')) {
    // Sage / fresh mint
    fill = '#059669';
    bg = '#ecfdf5';
    border = '#6ee7b7';
  } else if (normalized.includes('f59e0b') || normalized.includes('d97706') || normalized.includes('amber')) {
    // Warm honey amber
    fill = '#d97706';
    bg = '#fffbeb';
    border = '#fcd34d';
  } else if (normalized.includes('ec4899') || normalized.includes('db2777') || normalized.includes('pink')) {
    // Soft blush rose
    fill = '#db2777';
    bg = '#fdf2f8';
    border = '#f9a8d4';
  } else if (normalized.includes('3b82f6') || normalized.includes('2563eb') || normalized.includes('blue')) {
    // Sky blue
    fill = '#2563eb';
    bg = '#eff6ff';
    border = '#93c5fd';
  } else if (normalized.includes('8b5cf6') || normalized.includes('7c3aed') || normalized.includes('purple') || normalized.includes('violet')) {
    // Refined slate lavender
    fill = '#6366f1';
    bg = '#f5f3ff';
    border = '#c4b5fd';
  } else if (normalized.includes('14b8a6') || normalized.includes('0d9488') || normalized.includes('teal')) {
    // Crisp seafoam
    fill = '#0d9488';
    bg = '#f0fdfa';
    border = '#5eead4';
  } else if (normalized.includes('ef4444') || normalized.includes('dc2626') || normalized.includes('red')) {
    // Coral red
    fill = '#dc2626';
    bg = '#fef2f2';
    border = '#fca5a5';
  } else if (normalized.includes('475569') || normalized.includes('64748b') || normalized.includes('slate')) {
    // Slate
    fill = '#475569';
    bg = '#f8fafc';
    border = '#cbd5e1';
  } else {
    // Custom hex fallback
    fill = color;
    bg = `${color}1a`;
    border = `${color}66`;
  }

  // Smooth text readability based on progress
  const titleColor = progress >= 45 
    ? 'text-white font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]' 
    : 'text-slate-800 font-bold';

  return {
    barBg: bg,
    fillBg: fill,
    borderColor: border,
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
    titleColor,
    badgeBg: 'bg-white/90',
    badgeBorder: 'border-slate-200/90',
    badgeText: 'text-slate-700',
  };
}

/**
 * Returns adapted styles for group summary bars, strictly respecting custom color.
 */
export function getGroupStyle(
  color: string = '#475569',
  theme: 'light' | 'dark' = 'dark'
) {
  const effectiveColor = color || '#475569';

  if (theme === 'dark') {
    return {
      barBg: effectiveColor ? `${effectiveColor}e6` : '#475569',
      footBg: effectiveColor || '#475569',
      borderClass: 'border-white/35',
      footBorderClass: 'border-white/40',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.15)',
      badgeBg: 'bg-[#09090c]/95 border-zinc-700/80 text-zinc-100 shadow-md',
      subgroupBadge: 'text-indigo-300 bg-indigo-950/90 border-indigo-500/60',
    };
  }

  // Light theme: Use the group's custom color!
  return {
    barBg: effectiveColor,
    footBg: effectiveColor,
    borderClass: 'border-black/20',
    footBorderClass: 'border-black/20',
    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.16)',
    badgeBg: 'bg-white/95 border-slate-300/90 text-slate-800 shadow-xs backdrop-blur-xs',
    subgroupBadge: 'text-slate-700 bg-slate-100 border-slate-300',
  };
}

/**
 * Returns adapted styles for milestones (jalons), strictly respecting custom color.
 */
export function getMilestoneStyle(
  color: string = '#f59e0b',
  theme: 'light' | 'dark' = 'dark'
) {
  const effectiveColor = color || '#f59e0b';

  if (theme === 'dark') {
    return {
      diamondBg: effectiveColor,
      diamondClass: 'border-2 border-white/70 ring-1 ring-black',
      diamondShadow: '0 2px 10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.25)',
      starColor: 'text-zinc-950',
      badgeClass: 'bg-[#09090c]/95 border-zinc-700/80 text-amber-200',
      dateColor: 'text-amber-300',
    };
  }

  // Light theme: warm, clean diamond with white border and soft shadow, respecting custom color
  return {
    diamondBg: effectiveColor,
    diamondClass: 'border-2 border-white ring-1 ring-black/15',
    diamondShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
    starColor: 'text-white',
    badgeClass: 'bg-white/95 border-slate-300/90 text-slate-900 shadow-xs backdrop-blur-xs',
    dateColor: 'text-slate-700',
  };
}
