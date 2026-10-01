export interface MemberColor {
  bg: string;
  text: string;
  border: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
  ring: string;
}

const PALETTE: MemberColor[] = [
  {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    darkBg: 'bg-blue-950/70',
    darkText: 'text-blue-300',
    darkBorder: 'border-blue-800/80',
    ring: 'ring-blue-500',
  },
  {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    darkBg: 'bg-indigo-950/70',
    darkText: 'text-indigo-300',
    darkBorder: 'border-indigo-800/80',
    ring: 'ring-indigo-500',
  },
  {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    darkBg: 'bg-emerald-950/70',
    darkText: 'text-emerald-300',
    darkBorder: 'border-emerald-800/80',
    ring: 'ring-emerald-500',
  },
  {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    darkBg: 'bg-amber-950/70',
    darkText: 'text-amber-300',
    darkBorder: 'border-amber-800/80',
    ring: 'ring-amber-500',
  },
  {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    darkBg: 'bg-rose-950/70',
    darkText: 'text-rose-300',
    darkBorder: 'border-rose-800/80',
    ring: 'ring-rose-500',
  },
  {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    darkBg: 'bg-purple-950/70',
    darkText: 'text-purple-300',
    darkBorder: 'border-purple-800/80',
    ring: 'ring-purple-500',
  },
  {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    darkBg: 'bg-cyan-950/70',
    darkText: 'text-cyan-300',
    darkBorder: 'border-cyan-800/80',
    ring: 'ring-cyan-500',
  },
  {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-200',
    darkBg: 'bg-teal-950/70',
    darkText: 'text-teal-300',
    darkBorder: 'border-teal-800/80',
    ring: 'ring-teal-500',
  },
  {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    darkBg: 'bg-orange-950/70',
    darkText: 'text-orange-300',
    darkBorder: 'border-orange-800/80',
    ring: 'ring-orange-500',
  },
  {
    bg: 'bg-fuchsia-100',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
    darkBg: 'bg-fuchsia-950/70',
    darkText: 'text-fuchsia-300',
    darkBorder: 'border-fuchsia-800/80',
    ring: 'ring-fuchsia-500',
  },
];

/**
 * Deterministically generates an avatar color scheme for a given member name.
 */
export function getMemberColor(name: string): MemberColor {
  if (!name || !name.trim()) {
    return {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      darkBg: 'bg-zinc-800',
      darkText: 'text-zinc-400',
      darkBorder: 'border-zinc-700',
      ring: 'ring-zinc-500',
    };
  }

  let hash = 0;
  const clean = name.trim().toLowerCase();
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

/**
 * Extracts 1-2 initials from a person's name (e.g. "Alice Martin" -> "AM", "Thomas" -> "T").
 */
export function getInitials(name: string): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
