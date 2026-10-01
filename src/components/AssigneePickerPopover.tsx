import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Check, X, Plus, Search, ChevronDown, Users } from 'lucide-react';
import { Language } from '../types/gantt';
import { translations } from '../utils/i18n';
import { getMemberColor, getInitials } from '../utils/memberUtils';

interface AssigneePickerPopoverProps {
  value?: string;
  onChange: (newAssignee: string) => void;
  availableMembers: string[];
  onAddMember?: (name: string) => void;
  onOpenTeamModal?: () => void;
  isReadOnly?: boolean;
  theme?: 'dark' | 'light';
  lang?: Language;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  className?: string;
}

export const AssigneePickerPopover: React.FC<AssigneePickerPopoverProps> = ({
  value = '',
  onChange,
  availableMembers,
  onAddMember,
  onOpenTeamModal,
  isReadOnly = false,
  theme = 'dark',
  lang = 'fr',
  size = 'sm',
  align = 'left',
  className = '',
}) => {
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanValue = (value || '').trim();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter members
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableMembers;
    return availableMembers.filter((m) => m.toLowerCase().includes(q));
  }, [availableMembers, search]);

  const canCreateNew = useMemo(() => {
    const trimmed = search.trim();
    if (!trimmed) return false;
    return !availableMembers.some((m) => m.toLowerCase() === trimmed.toLowerCase());
  }, [availableMembers, search]);

  const handleSelectMember = (memberName: string) => {
    if (isReadOnly) return;
    onChange(memberName);
    setIsOpen(false);
    setSearch('');
  };

  const handleToggleMultiMember = (memberName: string) => {
    if (isReadOnly) return;
    if (!cleanValue) {
      onChange(memberName);
      setIsOpen(false);
      setSearch('');
      return;
    }

    const currentParts = cleanValue.split(/[,&/]/).map((p) => p.trim()).filter(Boolean);
    const existingIndex = currentParts.findIndex((p) => p.toLowerCase() === memberName.toLowerCase());

    let nextParts: string[];
    if (existingIndex >= 0) {
      nextParts = currentParts.filter((_, idx) => idx !== existingIndex);
    } else {
      nextParts = [...currentParts, memberName];
    }

    const result = nextParts.join(' & ');
    onChange(result);
  };

  const handleCreateAndAssign = () => {
    const trimmed = search.trim();
    if (!trimmed || isReadOnly) return;

    if (onAddMember) {
      onAddMember(trimmed);
    }
    onChange(trimmed);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    if (isReadOnly) return;
    onChange('');
    setIsOpen(false);
    setSearch('');
  };

  const currentColor = cleanValue ? getMemberColor(cleanValue) : null;

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef} onClick={(e) => e.stopPropagation()}>
      {/* Trigger Button */}
      {cleanValue ? (
        <button
          type="button"
          disabled={isReadOnly}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer font-medium select-none ${
            size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'
          } ${
            theme === 'light'
              ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-2xs hover:border-blue-400'
              : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-700/80 text-zinc-200 hover:border-indigo-400/70'
          }`}
          title={`Responsable : ${cleanValue} (cliquer pour modifier)`}
        >
          {currentColor && (
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 border ${
                theme === 'light'
                  ? `${currentColor.bg} ${currentColor.text} ${currentColor.border}`
                  : `${currentColor.darkBg} ${currentColor.darkText} ${currentColor.darkBorder}`
              }`}
            >
              {getInitials(cleanValue).slice(0, 1)}
            </span>
          )}
          <span className="truncate max-w-[120px] font-medium">{cleanValue}</span>
          {!isReadOnly && (
            <ChevronDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </button>
      ) : (
        <button
          type="button"
          disabled={isReadOnly}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group flex items-center gap-1.5 rounded-lg border border-dashed transition-all cursor-pointer text-xs select-none ${
            size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5'
          } ${
            theme === 'light'
              ? 'bg-slate-50/80 hover:bg-blue-50/60 border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300'
              : 'bg-zinc-900/40 hover:bg-indigo-950/30 border-zinc-750 text-zinc-400 hover:text-indigo-300 hover:border-indigo-500/50'
          }`}
          title="Cliquez pour attribuer un responsable en 1 clic"
        >
          <User className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          <span className="italic">{t.unassigned}</span>
          {!isReadOnly && (
            <Plus className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
      )}

      {/* Floating Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 z-50 w-64 rounded-xl border shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 select-none ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-800 ring-1 ring-slate-900/5'
              : 'bg-[#101014] border-zinc-800 text-zinc-100 ring-1 ring-white/10'
          }`}
        >
          {/* Header & Search */}
          <div className="flex items-center justify-between pb-1.5 border-b mb-2 border-slate-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-bold flex items-center gap-1.5 opacity-80">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Attribuer un responsable</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Search / Add Input */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (canCreateNew) {
                    handleCreateAndAssign();
                  } else if (filteredMembers.length > 0) {
                    handleSelectMember(filteredMembers[0]);
                  }
                }
              }}
              placeholder="Filtrer ou nouveau nom..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border transition-colors focus:outline-none ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 focus:bg-white placeholder-slate-400'
                  : 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-indigo-500 placeholder-zinc-500'
              }`}
            />
          </div>

          {/* Create new member quick action */}
          {canCreateNew && (
            <button
              type="button"
              onClick={handleCreateAndAssign}
              className={`w-full text-left px-2.5 py-1.5 mb-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border ${
                theme === 'light'
                  ? 'bg-blue-50 hover:bg-blue-100/80 border-blue-200 text-blue-700'
                  : 'bg-indigo-950/60 hover:bg-indigo-900/60 border-indigo-800/80 text-indigo-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Créer <strong>&quot;{search.trim()}&quot;</strong> et attribuer
              </span>
              <kbd className="ml-auto text-[9px] px-1 py-0.5 rounded border border-current opacity-70">
                Entrée
              </kbd>
            </button>
          )}

          {/* Members list */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredMembers.map((m) => {
              const isDirectMatch = cleanValue.toLowerCase() === m.toLowerCase();
              const isIncludedInMulti = cleanValue.toLowerCase().includes(m.toLowerCase());
              const mColor = getMemberColor(m);

              return (
                <div
                  key={m}
                  className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isDirectMatch
                      ? theme === 'light'
                        ? 'bg-blue-50 text-blue-800 font-semibold'
                        : 'bg-indigo-950/70 text-indigo-200 font-semibold'
                      : theme === 'light'
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-zinc-850 text-zinc-200'
                  }`}
                  onClick={() => handleSelectMember(m)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 border ${
                        theme === 'light'
                          ? `${mColor.bg} ${mColor.text} ${mColor.border}`
                          : `${mColor.darkBg} ${mColor.darkText} ${mColor.darkBorder}`
                      }`}
                    >
                      {getInitials(m)}
                    </span>
                    <span className="truncate">{m}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Multi-add / toggle button if already has someone */}
                    {cleanValue && !isDirectMatch && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMultiMember(m);
                        }}
                        className={`text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                          isIncludedInMulti
                            ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950'
                            : 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                        }`}
                        title={isIncludedInMulti ? 'Retirer du binôme' : 'Ajouter en binôme (&)'}
                      >
                        {isIncludedInMulti ? '- Retirer' : '+ Binôme'}
                      </button>
                    )}
                    {isDirectMatch && <Check className="w-4 h-4 text-blue-600 dark:text-indigo-400 shrink-0" />}
                  </div>
                </div>
              );
            })}

            {filteredMembers.length === 0 && !canCreateNew && (
              <div className="py-3 text-center text-xs opacity-60">
                Aucun membre trouvé
              </div>
            )}
          </div>

          {/* Footer: Clear & Open Team modal */}
          <div className="pt-2 mt-1.5 border-t flex items-center justify-between border-slate-200/60 dark:border-zinc-800 text-[11px]">
            {cleanValue ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer hover:underline"
              >
                <X className="w-3 h-3" />
                <span>Désassigner</span>
              </button>
            ) : (
              <span className="opacity-50 text-[10px]">1 clic pour attribuer</span>
            )}

            {onOpenTeamModal && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenTeamModal();
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer ml-auto"
                title="Définir toute l'équipe du projet"
              >
                <Users className="w-3 h-3" />
                <span>Gérer l&apos;équipe</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
