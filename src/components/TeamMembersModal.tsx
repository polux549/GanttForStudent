import React, { useState, useMemo } from 'react';
import { X, Users, UserPlus, Trash2, Edit2, Check, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { GanttItem, Language } from '../types/gantt';
import { translations } from '../utils/i18n';
import { getMemberColor, getInitials } from '../utils/memberUtils';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: string[];
  items: GanttItem[];
  onAddMembers: (names: string[]) => void;
  onRemoveMember: (name: string) => void;
  onRenameMember: (oldName: string, newName: string) => void;
  onFilterByMember?: (name: string) => void;
  theme?: 'dark' | 'light';
  lang?: Language;
  isReadOnly?: boolean;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  items,
  onAddMembers,
  onRemoveMember,
  onRenameMember,
  onFilterByMember,
  theme = 'dark',
  lang = 'fr',
  isReadOnly = false,
}) => {
  const t = translations[lang];
  const [newInput, setNewInput] = useState('');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Extract assignees currently present in tasks that might not be in explicit members
  const implicitMembersFromTasks = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.assignee?.trim()) {
        const parts = it.assignee.split(/[,&/]/).map((p) => p.trim()).filter(Boolean);
        parts.forEach((p) => {
          if (p.toLowerCase() !== 'non assigné') {
            set.add(p);
          }
        });
      }
    });
    return Array.from(set).filter(
      (m) => !members.some((em) => em.toLowerCase() === m.toLowerCase())
    );
  }, [items, members]);

  // Member stats (assigned tasks count, completed count)
  const memberStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; inProgress: number }> = {};
    members.forEach((m) => {
      stats[m] = { total: 0, completed: 0, inProgress: 0 };
    });

    items.forEach((it) => {
      if (it.type === 'group') return;
      if (!it.assignee) return;

      members.forEach((m) => {
        if (it.assignee?.toLowerCase().includes(m.toLowerCase())) {
          if (!stats[m]) stats[m] = { total: 0, completed: 0, inProgress: 0 };
          stats[m].total += 1;
          if (it.progress === 100) {
            stats[m].completed += 1;
          } else if (it.progress > 0) {
            stats[m].inProgress += 1;
          }
        }
      });
    });

    return stats;
  }, [members, items]);

  const handleAdd = () => {
    if (isReadOnly) return;
    const raw = newInput.trim();
    if (!raw) return;

    const names = raw
      .split(/[,;\n]/)
      .map((n) => n.trim())
      .filter((n) => Boolean(n) && n.toLowerCase() !== 'non assigné');

    if (names.length > 0) {
      onAddMembers(names);
      setNewInput('');
    }
  };

  const handleStartRename = (name: string) => {
    if (isReadOnly) return;
    setEditingMember(name);
    setRenameInput(name);
  };

  const handleSaveRename = (oldName: string) => {
    const trimmed = renameInput.trim();
    if (trimmed && trimmed !== oldName && !isReadOnly) {
      onRenameMember(oldName, trimmed);
    }
    setEditingMember(null);
    setRenameInput('');
  };

  const handleImportImplicit = (implicitNames: string[]) => {
    if (isReadOnly) return;
    onAddMembers(implicitNames);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#0f0f13] border-zinc-800 text-zinc-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b transition-colors ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                theme === 'light'
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-base font-bold flex items-center gap-2 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                <span>Équipe & Responsables du Projet</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono border font-semibold ${
                    theme === 'light'
                      ? 'bg-blue-100/70 border-blue-200 text-blue-700'
                      : 'bg-indigo-900/60 border-indigo-500/30 text-indigo-300'
                  }`}
                >
                  {members.length} {members.length <= 1 ? 'membre' : 'membres'}
                </span>
              </h2>
              <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
                Écrivez vos coéquipiers une seule fois ici pour les attribuer en 1 clic dans tout le planning !
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Add Member Bar */}
          {!isReadOnly && (
            <div
              className={`p-3 rounded-xl border transition-colors ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}
            >
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${
                  theme === 'light' ? 'text-slate-700' : 'text-zinc-300'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                <span>Ajouter un ou plusieurs membres à l&apos;équipe</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newInput}
                  onChange={(e) => setNewInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                  placeholder="Ex: Alice, Marc, Thomas, Sophie..."
                  className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border transition-colors focus:outline-none ${
                    theme === 'light'
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder-slate-400'
                      : 'bg-zinc-950 border-zinc-700 text-zinc-100 focus:border-indigo-500 placeholder-zinc-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newInput.trim()}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
                    theme === 'light'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              <p className={`text-[11px] mt-1.5 opacity-70 ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
                Astuce : Séparez les prénoms par des virgules pour ajouter toute votre équipe d&apos;un coup !
              </p>
            </div>
          )}

          {/* Quick import from existing tasks if any */}
          {implicitMembersFromTasks.length > 0 && !isReadOnly && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                theme === 'light'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>{implicitMembersFromTasks.length}</strong> membre(s) détecté(s) dans vos tâches existantes :{' '}
                  <span className="italic">{implicitMembersFromTasks.join(', ')}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleImportImplicit(implicitMembersFromTasks)}
                className="px-2.5 py-1 rounded-md font-semibold text-xs bg-amber-500 text-white hover:bg-amber-600 transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                + Ajouter à l&apos;équipe
              </button>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            <div
              className={`text-xs font-bold uppercase tracking-wider px-1 flex items-center justify-between ${
                theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
              }`}
            >
              <span>Membres enregistrés ({members.length})</span>
              <span className="text-[10px] normal-case opacity-75">
                Disponibles en 1 clic dans toutes les listes
              </span>
            </div>

            {members.length === 0 ? (
              <div
                className={`py-10 text-center rounded-xl border-2 border-dashed ${
                  theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-zinc-800 text-zinc-500'
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">Aucun membre dans l&apos;équipe pour le moment</p>
                <p className="text-xs mt-1 max-w-sm mx-auto opacity-75">
                  Écrivez le nom de vos camarades de groupe ci-dessus. Une fois ajoutés, vous pourrez leur attribuer
                  des tâches en un seul clic !
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {members.map((m) => {
                  const mColor = getMemberColor(m);
                  const st = memberStats[m] || { total: 0, completed: 0, inProgress: 0 };
                  const isEditing = editingMember === m;

                  return (
                    <div
                      key={m}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                        theme === 'light'
                          ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Left: Avatar + Name / Input */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            theme === 'light'
                              ? `${mColor.bg} ${mColor.text} ${mColor.border}`
                              : `${mColor.darkBg} ${mColor.darkText} ${mColor.darkBorder}`
                          }`}
                        >
                          {getInitials(m)}
                        </div>

                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={renameInput}
                                onChange={(e) => setRenameInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(m);
                                  if (e.key === 'Escape') setEditingMember(null);
                                }}
                                autoFocus
                                className={`w-full px-2 py-1 text-xs rounded border ${
                                  theme === 'light'
                                    ? 'bg-white border-blue-500 text-slate-900'
                                    : 'bg-zinc-950 border-indigo-500 text-zinc-100'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(m)}
                                className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                                title="Valider"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm truncate">{m}</span>
                                {!isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartRename(m)}
                                    className="opacity-40 hover:opacity-100 p-0.5 rounded text-xs transition-opacity cursor-pointer"
                                    title="Renommer ce membre (met à jour aussi ses tâches)"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] opacity-70 mt-0.5">
                                <span>
                                  <strong>{st.total}</strong> tâche{st.total > 1 ? 's' : ''}
                                </span>
                                {st.completed > 0 && (
                                  <span className="text-emerald-500 font-medium">
                                    • {st.completed} terminée{st.completed > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {onFilterByMember && st.total > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              onFilterByMember(m);
                              onClose();
                            }}
                            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                              theme === 'light'
                                ? 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-600 hover:text-blue-600'
                                : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white'
                            }`}
                            title={`Voir uniquement les tâches de ${m}`}
                          >
                            <Filter className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => onRemoveMember(m)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title={`Retirer ${m} de l'équipe`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Helper card */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              theme === 'light'
                ? 'bg-blue-50/60 border-blue-200/80 text-blue-900'
                : 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Gain de temps garanti</p>
              <p className="opacity-80 mt-0.5">
                Plus besoin d&apos;écrire les noms en toutes lettres : dans la vue Liste, le Kanban et la boîte de
                dialogue de tâche, un simple clic sur un coéquipier suffit pour lui attribuer la tâche.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between transition-colors ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800/80'
          }`}
        >
          <span className="text-xs opacity-60">
            {members.length} équipier{members.length > 1 ? 's' : ''} enregistré{members.length > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
            }`}
          >
            {t.cancel || 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};
