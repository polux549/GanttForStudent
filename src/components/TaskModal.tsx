import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Save, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  Flag, 
  FolderPlus, 
  CheckCircle2, 
  User, 
  FileText,
  Sparkles
} from 'lucide-react';
import { GanttItem, GanttItemType, SchedulingMode, Language } from '../types/gantt';
import { translations } from '../utils/i18n';
import { addDays, diffDays, getTodayString } from '../utils/dates';
import { isDescendantOf } from '../utils/ganttEngine';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: GanttItem) => void;
  onDelete?: (id: string) => void;
  item: GanttItem | null;
  allItems: GanttItem[];
  lang: Language;
}

const PRESET_COLORS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Sky', hex: '#0284c7' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Red', hex: '#ef4444' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  item,
  allItems,
  lang,
}) => {
  const t = translations[lang];

  const [name, setName] = useState('');
  const [type, setType] = useState<GanttItemType>('task');
  const [schedulingMode, setSchedulingMode] = useState<SchedulingMode>('manual');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(addDays(getTodayString(), 5));
  const [duration, setDuration] = useState(6);
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState('#6366f1');
  const [groupId, setGroupId] = useState<string>('');
  const [predecessorId, setPredecessorId] = useState<string>('');
  const [predecessorLag, setPredecessorLag] = useState<number>(1);
  const [assignee, setAssignee] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    if (item && item.id) {
      setName(item.name || '');
      setType(item.type || 'task');
      setSchedulingMode(item.schedulingMode || (item.type === 'group' ? 'auto' : 'manual'));
      setStartDate(item.startDate || getTodayString());
      setEndDate(item.endDate || getTodayString());
      setDuration(item.duration ?? 1);
      setProgress(item.progress ?? 0);
      setColor(item.color || (item.type === 'milestone' ? '#f59e0b' : '#6366f1'));
      setGroupId(item.groupId || '');
      setPredecessorId(item.predecessorId || '');
      setPredecessorLag(item.predecessorLag ?? 1);
      setAssignee(item.assignee || '');
      setNotes(item.notes || '');
    } else {
      // Defaults for brand new item
      setName(item?.name || '');
      setType(item?.type || 'task');
      setSchedulingMode(item?.type === 'group' ? 'auto' : 'manual');
      const start = item?.startDate || getTodayString();
      setStartDate(start);
      setEndDate(item?.type === 'milestone' ? start : addDays(start, 5));
      setDuration(item?.type === 'milestone' ? 0 : 6);
      setProgress(0);
      setColor(item?.type === 'milestone' ? '#f59e0b' : '#6366f1');
      setGroupId(item?.groupId || '');
      setPredecessorId('');
      setPredecessorLag(1);
      setAssignee('');
      setNotes('');
    }
  }, [item, isOpen]);

  // Recalculate duration when dates change in manual mode
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (type === 'milestone') {
      setEndDate(val);
      setDuration(0);
    } else {
      if (val > endDate) {
        setEndDate(val);
        setDuration(1);
      } else {
        setDuration(Math.max(1, diffDays(val, endDate) + 1));
      }
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (val < startDate) {
      setStartDate(val);
      setDuration(1);
    } else {
      setDuration(Math.max(1, diffDays(startDate, val) + 1));
    }
  };

  const handleDurationChange = (daysVal: number) => {
    const d = Math.max(1, daysVal);
    setDuration(d);
    setEndDate(addDays(startDate, d - 1));
  };

  const handleTypeChange = (newType: GanttItemType) => {
    setType(newType);
    if (newType === 'milestone') {
      setEndDate(startDate);
      setDuration(0);
      if (color === '#6366f1') setColor('#f59e0b');
    } else if (newType === 'group') {
      setSchedulingMode('auto'); // Default group to auto bounds
    } else {
      if (duration === 0) {
        setDuration(5);
        setEndDate(addDays(startDate, 4));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // CRITICAL: Ensure a unique non-empty ID is always used for newly created items!
    const effectiveId = item && item.id && item.id.trim().length > 0
      ? item.id
      : `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const savedItem: GanttItem = {
      id: effectiveId,
      name: name.trim(),
      type,
      schedulingMode,
      startDate: type === 'milestone' ? startDate : startDate,
      endDate: type === 'milestone' ? startDate : endDate,
      duration: type === 'milestone' ? 0 : duration,
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
      color,
      groupId: groupId || undefined,
      predecessorId: predecessorId && predecessorId.trim() ? predecessorId.trim() : undefined,
      predecessorLag: schedulingMode === 'auto' && type !== 'group' ? Number(predecessorLag) || 1 : undefined,
      assignee: assignee.trim() || undefined,
      notes: notes.trim() || undefined,
      collapsed: item?.collapsed ?? false,
    };

    onSave(savedItem);
    onClose();
  };

  if (!isOpen) return null;

  // Helper to check if choosing candId as predecessor would create an invalid loop
  const wouldCauseCycle = (candId: string): boolean => {
    if (!item || !item.id) return false;
    if (candId === item.id) return true;

    // A group cannot have its own descendant as predecessor
    if (item.type === 'group' && isDescendantOf(allItems, candId, item.id)) return true;

    // An item cannot have its parent group as predecessor
    if (isDescendantOf(allItems, item.id, candId)) return true;

    // Follow predecessor chain from candId to see if it ever leads back to item.id
    const visited = new Set<string>();
    let currId: string | undefined = candId;
    while (currId) {
      if (currId === item.id) return true;
      if (visited.has(currId)) break;
      visited.add(currId);
      const currItem = allItems.find((x) => x.id === currId);
      currId = currItem?.predecessorId;
    }

    return false;
  };

  // Potential predecessors (cannot be itself, descendants, parent group, or circular chain)
  const candidatePredecessors = allItems.filter((i) => {
    if (item && item.id && i.id === item.id) return false;
    return !wouldCauseCycle(i.id);
  });

  // Available parent groups (excluding self and any descendants to prevent cycles)
  const availableGroups = allItems.filter((i) => {
    if (i.type !== 'group') return false;
    if (item && item.id) {
      if (i.id === item.id) return false;
      if (item.type === 'group' && isDescendantOf(allItems, i.id, item.id)) return false;
    }
    return true;
  });

  const isExisting = Boolean(item && item.id && item.id.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#121c33]/60">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            {type === 'milestone' ? (
              <Flag className="w-4 h-4 text-amber-400" />
            ) : type === 'group' ? (
              <FolderPlus className="w-4 h-4 text-indigo-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{isExisting ? t.editItem : t.newItem}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
              {t.titleLabel} *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="Ex: Rédaction du chapitre 2..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Type Selector (Tâche, Groupe, Jalon) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('task')}
              className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                type === 'task'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-xs'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>{t.task}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('group')}
              className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                type === 'group'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-xs'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              <span>{t.group}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('milestone')}
              className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                type === 'milestone'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow-xs'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Flag className="w-4 h-4 text-amber-400" />
              <span>{t.milestone}</span>
            </button>
          </div>

          {/* Scheduling Mode for TASK / MILESTONE */}
          {type !== 'group' && (
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
              <label className="block text-[11px] font-semibold uppercase text-slate-400">
                {t.schedulingLabel}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingMode('manual')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    schedulingMode === 'manual'
                      ? 'bg-slate-800 border-indigo-500 text-white font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs mb-0.5">{t.manual}</div>
                  <div className="text-[10px] text-slate-500">{t.manualDesc}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSchedulingMode('auto')}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    schedulingMode === 'auto'
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs mb-0.5 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-indigo-400" />
                    <span>{t.auto}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{t.autoDesc}</div>
                </button>
              </div>

              {/* Automatic predecessor selector */}
              {schedulingMode === 'auto' && (
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {t.predecessorLabel}
                    </label>
                    <select
                      value={predecessorId}
                      onChange={(e) => setPredecessorId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- {t.noPredecessor} --</option>
                      {candidatePredecessors.map((cand) => (
                        <option key={cand.id} value={cand.id}>
                          {cand.type === 'group' ? '📁 [Groupe] ' : cand.type === 'milestone' ? '★ [Jalon] ' : '▪ [Tâche] '} {cand.name} ({cand.endDate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] text-slate-400 mb-1">
                        {t.lagLabel}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={predecessorLag}
                          onChange={(e) => setPredecessorLag(Number(e.target.value))}
                          className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono"
                        />
                        <span className="text-slate-400">{t.lagDays}</span>
                      </div>
                    </div>

                    {type !== 'milestone' && (
                      <div className="flex-1">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {t.durationLabel}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={duration}
                            onChange={(e) => handleDurationChange(Number(e.target.value))}
                            className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono"
                          />
                          <span className="text-slate-400">{t.days}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scheduling Mode & Predecessor for GROUP */}
          {type === 'group' && (
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
              <label className="block text-[11px] font-semibold uppercase text-slate-400">
                Mode de calcul du groupe
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingMode('auto')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    schedulingMode === 'auto'
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs mb-0.5">Automatique</div>
                  <div className="text-[10px] text-slate-500">
                    La longueur et les dates s'adaptent automatiquement aux tâches qu'il contient.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSchedulingMode('manual')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    schedulingMode === 'manual'
                      ? 'bg-slate-800 border-indigo-500 text-white font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs mb-0.5">Dates manuelles</div>
                  <div className="text-[10px] text-slate-500">
                    Vous imposez des dates de début et de fin fixes pour le groupe.
                  </div>
                </button>
              </div>

              {/* Predecessor selector for Group (Arrow display) */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <LinkIcon className="w-3 h-3 text-indigo-400" />
                  <span>{t.predecessorLabel} ({lang === 'fr' ? 'flèche de liaison' : 'link arrow'})</span>
                </label>
                <select
                  value={predecessorId}
                  onChange={(e) => setPredecessorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                >
                  <option value="">-- {t.noPredecessor} --</option>
                  {candidatePredecessors.map((cand) => (
                    <option key={cand.id} value={cand.id}>
                      {cand.type === 'group' ? '📁 [Groupe] ' : cand.type === 'milestone' ? '★ [Jalon] ' : '▪ [Tâche] '} {cand.name} ({cand.endDate})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">
                  {t.predecessorGroupDesc}
                </p>
              </div>
            </div>
          )}

          {/* Dates & Duration (When manual) */}
          {schedulingMode === 'manual' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t.startDateLabel}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              {type !== 'milestone' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {t.endDateLabel}
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {t.durationLabel}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={duration}
                        onChange={(e) => handleDurationChange(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                      />
                      <span className="text-slate-400 shrink-0">{t.dayShort}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Predecessor for Manual Task / Milestone (Arrow only) */}
          {schedulingMode === 'manual' && type !== 'group' && (
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <LinkIcon className="w-3 h-3 text-indigo-400" />
                <span>{t.predecessorLabel} ({lang === 'fr' ? 'flèche de liaison' : 'link arrow'})</span>
              </label>
              <select
                value={predecessorId}
                onChange={(e) => setPredecessorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
              >
                <option value="">-- {t.noPredecessor} --</option>
                {candidatePredecessors.map((cand) => (
                  <option key={cand.id} value={cand.id}>
                    {cand.type === 'group' ? '📁 [Groupe] ' : cand.type === 'milestone' ? '★ [Jalon] ' : '▪ [Tâche] '} {cand.name} ({cand.endDate})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500">
                {t.predecessorManualDesc}
              </p>
            </div>
          )}

          {/* Progress Slider (0% - 100%) */}
          {type !== 'group' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                <span>{t.progressLabel}</span>
                <span className="text-indigo-400 font-mono font-bold">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between gap-1 text-[10px] text-slate-500 font-mono">
                {[0, 25, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setProgress(val)}
                    className="hover:text-indigo-400 px-1 py-0.5 cursor-pointer"
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parent Group & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {type === 'group' ? 'Groupe parent (pour sous-groupe)' : t.groupParentLabel}
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">
                  {type === 'group' ? 'Aucun (groupe principal)' : t.noParentGroup}
                </option>
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    📁 {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {t.assigneeLabel}
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Ex: Alice, Groupe B..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              {t.colorLabel}
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                    color === c.hex ? 'scale-125 ring-2 ring-white border-transparent' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Livrable PDF à déposer sur l'intranet..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-[#121c33]/40">
          {isExisting && onDelete ? (
            confirmDelete ? (
              <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                <span className="text-xs text-red-400 font-semibold">
                  {lang === 'fr' ? 'Supprimer ?' : lang === 'de' ? 'Löschen?' : lang === 'it' ? 'Elimina?' : 'Delete?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(item!.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {lang === 'fr' ? 'Oui' : lang === 'de' ? 'Ja' : lang === 'it' ? 'Sì' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs transition-colors cursor-pointer"
                title={t.deleteItem}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.deleteItem}</span>
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.saveItem}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
