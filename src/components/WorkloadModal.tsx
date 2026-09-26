import React, { useState } from 'react';
import { X, Users, AlertTriangle, CheckCircle2, Clock, Calendar, BarChart2, Check, ArrowRight } from 'lucide-react';
import { GanttItem } from '../types/gantt';
import { calculateWorkload, MemberWorkload } from '../utils/ganttEngine';

interface WorkloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GanttItem[];
  onSelectTask?: (taskId: string) => void;
}

export const WorkloadModal: React.FC<WorkloadModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectTask,
}) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  if (!isOpen) return null;

  const workloads = calculateWorkload(items);
  const totalTasks = items.filter((it) => it.type !== 'group').length;
  const activeMember = workloads.find((w) => w.name === selectedMember) || workloads[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-[#0b0b0e] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gestion des Charges de Travail</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 font-mono">
                  {workloads.length} membre{workloads.length > 1 ? 's' : ''}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Visualisation de la répartition des tâches et détection des surcharges dans l'équipe
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left members list, Right detailed workload */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[420px]">
          {/* Members column */}
          <div className="w-full md:w-80 border-r border-zinc-800/80 bg-zinc-950/40 p-4 overflow-y-auto space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-1">
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
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-zinc-900/50 border-zinc-800/60 hover:bg-zinc-850/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                        {w.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-xs text-zinc-100 truncate">
                        {w.name}
                      </span>
                    </div>

                    {w.overloaded ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        Surchargé
                      </span>
                    ) : w.status === 'balanced' ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                        Équilibré
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                        Normal
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                    <span>{w.totalTasks} tâche{w.totalTasks > 1 ? 's' : ''} ({w.totalDays}j)</span>
                    <span className="font-mono">{percent}% du projet</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        w.overloaded ? 'bg-red-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, (w.completedTasks / Math.max(1, w.totalTasks)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details column */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#0b0b0e]">
            {activeMember ? (
              <div className="space-y-6">
                {/* Member header card */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                      {activeMember.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {activeMember.name}
                        {activeMember.overloaded && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Alerte surcharge
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Total : {activeMember.totalTasks} tâche{activeMember.totalTasks > 1 ? 's' : ''} assignée{activeMember.totalTasks > 1 ? 's' : ''} · {activeMember.completedTasks} terminée{activeMember.completedTasks > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">Jours de travail</div>
                      <div className="font-bold text-indigo-400 text-sm">{activeMember.totalDays} j</div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">Achèvement</div>
                      <div className="font-bold text-emerald-400 text-sm">
                        {Math.round((activeMember.completedTasks / Math.max(1, activeMember.totalTasks)) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {activeMember.overloaded && (
                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Attention à la sur-allocation : </span>
                      Ce membre a plusieurs tâches complexes simultanées ou une charge dense sur une même période. Pensez à réassigner certaines tâches ou décaler leurs dates.
                    </div>
                  </div>
                )}

                {/* Tasks assigned to this member */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
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
                        className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/70 hover:border-indigo-500/40 hover:bg-zinc-850/60 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
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
                            <div className="text-[11px] font-mono font-bold text-zinc-300">
                              {item.progress}%
                            </div>
                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                Aucun membre assigné. Ajoutez des responsables dans les détails des tâches.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Conseil : Cliquez sur une tâche pour ouvrir ses détails et réajuster son assignation.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
