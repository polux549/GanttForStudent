import React, { useState } from 'react';
import { X, Users, AlertTriangle, CheckCircle2, Clock, Calendar, BarChart2, Check, ArrowRight } from 'lucide-react';
import { GanttItem } from '../types/gantt';
import { calculateWorkload, MemberWorkload } from '../utils/ganttEngine';

interface WorkloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GanttItem[];
  onSelectTask?: (taskId: string) => void;
  theme?: 'dark' | 'light';
}

export const WorkloadModal: React.FC<WorkloadModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectTask,
  theme = 'dark',
}) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  if (!isOpen) return null;

  const workloads = calculateWorkload(items);
  const totalTasks = items.filter((it) => it.type !== 'group').length;
  const activeMember = workloads.find((w) => w.name === selectedMember) || workloads[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#0b0b0e] border-zinc-800 text-zinc-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b transition-colors ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-zinc-950/60 border-zinc-800/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              theme === 'light'
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                <span>Gestion des Charges de Travail</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
                  theme === 'light'
                    ? 'bg-blue-100/70 border-blue-200 text-blue-700 font-bold'
                    : 'bg-indigo-900/60 border-indigo-500/30 text-indigo-300'
                }`}>
                  {workloads.length} membre{workloads.length > 1 ? 's' : ''}
                </span>
              </h2>
              <p className={`text-xs mt-0.5 ${
                theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
              }`}>
                Visualisation de la répartition des tâches et détection des surcharges dans l'équipe
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

        {/* Content Body: Left members list, Right detailed workload */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[420px]">
          {/* Members column */}
          <div className={`w-full md:w-80 border-r p-4 overflow-y-auto space-y-2.5 transition-colors ${
            theme === 'light'
              ? 'bg-slate-50/70 border-slate-200'
              : 'bg-zinc-950/40 border-zinc-800/80'
          }`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 px-1 ${
              theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
            }`}>
              Membres du projet
            </div>

            {workloads.map((w) => {
              const isSelected = activeMember?.name === w.name;
              const percent = totalTasks > 0 ? Math.round((w.totalTasks / totalTasks) * 100) : 0;

              return (
                <div
                  key={w.name}
                  onClick={() => setSelectedMember(w.name)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? theme === 'light'
                        ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-indigo-950/40 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                      : theme === 'light'
                      ? 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300 shadow-2xs'
                      : 'bg-zinc-900/50 border-zinc-800/60 hover:bg-zinc-850/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                        theme === 'light'
                          ? 'bg-blue-100 border-blue-200 text-blue-800'
                          : 'bg-zinc-800 border-zinc-700 text-indigo-300'
                      }`}>
                        {w.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className={`font-semibold text-xs truncate ${
                        theme === 'light' ? 'text-slate-900' : 'text-zinc-100'
                      }`}>
                        {w.name}
                      </span>
                    </div>

                    {w.overloaded ? (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        theme === 'light'
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        Surchargé
                      </span>
                    ) : w.status === 'balanced' ? (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                        theme === 'light'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}>
                        Équilibré
                      </span>
                    ) : (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                        theme === 'light'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        Normal
                      </span>
                    )}
                  </div>

                  <div className={`flex items-center justify-between text-[11px] mb-2 ${
                    theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
                  }`}>
                    <span>{w.totalTasks} tâche{w.totalTasks > 1 ? 's' : ''} ({w.totalDays}j)</span>
                    <span className="font-mono">{percent}% du projet</span>
                  </div>

                  {/* Progress bar */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                    theme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        w.overloaded 
                          ? 'bg-red-500' 
                          : theme === 'light' ? 'bg-blue-600' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, (w.completedTasks / Math.max(1, w.totalTasks)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details column */}
          <div className={`flex-1 p-6 overflow-y-auto transition-colors ${
            theme === 'light' ? 'bg-white' : 'bg-[#0b0b0e]'
          }`}>
            {activeMember ? (
              <div className="space-y-6">
                {/* Member header card */}
                <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border ${
                      theme === 'light'
                        ? 'bg-blue-100 border-blue-200 text-blue-800'
                        : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
                    }`}>
                      {activeMember.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        {activeMember.name}
                        {activeMember.overloaded && (
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1 border ${
                            theme === 'light'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Alerte surcharge
                          </span>
                        )}
                      </h3>
                      <p className={`text-xs mt-0.5 ${
                        theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
                      }`}>
                        Total : {activeMember.totalTasks} tâche{activeMember.totalTasks > 1 ? 's' : ''} assignée{activeMember.totalTasks > 1 ? 's' : ''} · {activeMember.completedTasks} terminée{activeMember.completedTasks > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className={`px-3 py-1.5 rounded-lg border text-center ${
                      theme === 'light'
                        ? 'bg-white border-slate-200 shadow-2xs'
                        : 'bg-zinc-950 border-zinc-800'
                    }`}>
                      <div className={`text-[10px] uppercase font-semibold ${
                        theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                      }`}>
                        Jours de travail
                      </div>
                      <div className={`font-bold text-sm ${
                        theme === 'light' ? 'text-blue-700' : 'text-indigo-400'
                      }`}>
                        {activeMember.totalDays} j
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg border text-center ${
                      theme === 'light'
                        ? 'bg-white border-slate-200 shadow-2xs'
                        : 'bg-zinc-950 border-zinc-800'
                    }`}>
                      <div className={`text-[10px] uppercase font-semibold ${
                        theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                      }`}>
                        Achèvement
                      </div>
                      <div className={`font-bold text-sm ${
                        theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        {Math.round((activeMember.completedTasks / Math.max(1, activeMember.totalTasks)) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {activeMember.overloaded && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    theme === 'light'
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'bg-red-950/20 border-red-500/30 text-red-300'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                      theme === 'light' ? 'text-red-600' : 'text-red-400'
                    }`} />
                    <div>
                      <span className="font-bold">Attention à la sur-allocation : </span>
                      Ce membre a plusieurs tâches complexes simultanées ou une charge dense sur une même période. Pensez à réassigner certaines tâches ou décaler leurs dates.
                    </div>
                  </div>
                )}

                {/* Tasks assigned to this member */}
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                    theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                  }`}>
                    <BarChart2 className={`w-3.5 h-3.5 ${
                      theme === 'light' ? 'text-blue-600' : 'text-indigo-400'
                    }`} />
                    <span>Planning des tâches assignées</span>
                  </h4>

                  <div className="space-y-2">
                    {activeMember.activeItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (onSelectTask) {
                            onSelectTask(item.id);
                            onClose();
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                          theme === 'light'
                            ? 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 shadow-2xs'
                            : 'bg-zinc-900/40 border-zinc-800/70 hover:border-indigo-500/40 hover:bg-zinc-850/60'
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div 
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-black/10" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <div className="min-w-0">
                            <div className={`text-xs font-semibold truncate transition-colors ${
                              theme === 'light'
                                ? 'text-slate-900 group-hover:text-blue-700'
                                : 'text-zinc-200 group-hover:text-indigo-300'
                            }`}>
                              {item.name}
                            </div>
                            <div className={`flex items-center gap-2 text-[11px] font-mono mt-0.5 ${
                              theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                            }`}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {item.startDate} → {item.endDate}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.duration}j
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className={`text-[11px] font-mono font-bold ${
                              theme === 'light' ? 'text-slate-700' : 'text-zinc-300'
                            }`}>
                              {item.progress}%
                            </div>
                            <div className={`w-16 h-1.5 rounded-full overflow-hidden mt-1 ${
                              theme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'
                            }`}>
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>

                          <ArrowRight className={`w-4 h-4 transition-colors ${
                            theme === 'light'
                              ? 'text-slate-400 group-hover:text-blue-600'
                              : 'text-zinc-600 group-hover:text-indigo-400'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`h-full flex items-center justify-center text-xs ${
                theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
              }`}>
                Aucun membre assigné. Ajoutez des responsables dans les détails des tâches.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between transition-colors ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-zinc-950/60 border-zinc-800/80'
        }`}>
          <div className={`text-xs ${
            theme === 'light' ? 'text-slate-600' : 'text-zinc-500'
          }`}>
            Conseil : Cliquez sur une tâche pour ouvrir ses détails et réajuster son assignation.
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
