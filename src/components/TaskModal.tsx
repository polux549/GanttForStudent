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
  MessageSquare,
  Paperclip,
  ExternalLink,
  Plus,
  Send,
  Lock,
  Sparkles
} from 'lucide-react';
import { GanttItem, GanttItemType, SchedulingMode, Language, TaskComment, TaskAttachment } from '../types/gantt';
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
  isReadOnly?: boolean;
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
  isReadOnly = false,
}) => {
  const t = translations[lang];

  // Active Tab: 'general' | 'comments' | 'attachments'
  const [activeTab, setActiveTab] = useState<'general' | 'comments' | 'attachments'>('general');

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

  // Comments and Attachments
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [attachName, setAttachName] = useState('');
  const [attachUrl, setAttachUrl] = useState('');
  const [attachType, setAttachType] = useState<'link' | 'drive' | 'github' | 'document' | 'other'>('link');

  useEffect(() => {
    setConfirmDelete(false);
    setActiveTab('general');
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
      setComments(item.comments || []);
      setAttachments(item.attachments || []);
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
      setComments([]);
      setAttachments([]);
    }
  }, [item, isOpen, isReadOnly]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const author = commentAuthor.trim() || 'Membre';
    const newComment: TaskComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      author,
      text: commentText.trim(),
      date: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachName.trim() || !attachUrl.trim()) return;
    let finalUrl = attachUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    const newAttach: TaskAttachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: attachName.trim(),
      url: finalUrl,
      type: attachType,
    };
    setAttachments((prev) => [...prev, newAttach]);
    setAttachName('');
    setAttachUrl('');
  };

  const handleDeleteAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

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
    if (type === 'milestone') {
      setStartDate(val);
      setDuration(0);
    } else {
      if (val < startDate) {
        setStartDate(val);
        setDuration(1);
      } else {
        setDuration(Math.max(1, diffDays(startDate, val) + 1));
      }
    }
  };

  const handleDurationChange = (days: number) => {
    const safeDays = Math.max(1, days);
    setDuration(safeDays);
    setEndDate(addDays(startDate, safeDays - 1));
  };

  const handleTypeChange = (newType: GanttItemType) => {
    setType(newType);
    if (newType === 'milestone') {
      setEndDate(startDate);
      setDuration(0);
      setColor('#f59e0b');
    } else if (newType === 'group') {
      setSchedulingMode('auto');
      setColor('#6366f1');
    } else {
      if (duration === 0) {
        setDuration(1);
        setEndDate(startDate);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!name.trim()) return;

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
      comments,
      attachments,
    };

    onSave(savedItem);
    onClose();
  };

  if (!isOpen) return null;

  // Helper to check if choosing candId as predecessor would create an invalid loop
  const wouldCauseCycle = (candId: string): boolean => {
    if (!item || !item.id) return false;
    if (candId === item.id) return true;

    if (item.type === 'group' && isDescendantOf(allItems, candId, item.id)) return true;
    if (isDescendantOf(allItems, item.id, candId)) return true;

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

  const candidatePredecessors = allItems.filter((i) => {
    if (item && item.id && i.id === item.id) return false;
    return !wouldCauseCycle(i.id);
  });

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#09090c] border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#0d0d11]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              {type === 'milestone' ? (
                <Flag className="w-4 h-4 text-amber-400" />
              ) : type === 'group' ? (
                <FolderPlus className="w-4 h-4 text-indigo-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isExisting ? t.editItem : t.newItem}</span>
            </h2>
            {isReadOnly && (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                <Lock className="w-3 h-3 text-amber-400" />
                Lecture seule
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 border-b border-zinc-800 bg-zinc-950/70 text-xs overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Général</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Commentaires</span>
            {comments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                {comments.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attachments')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attachments'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Pièces jointes & Liens</span>
            {attachments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                {attachments.length}
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: GÉNÉRAL (INTÈGRE DATES, LIAISONS ET GROUPE) */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  {t.titleLabel} *
                </label>
                <input
                  type="text"
                  required
                  disabled={isReadOnly}
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Ex: Rédaction du chapitre 2..."
                  className="w-full px-3 py-2 bg-[#050507] border border-zinc-750 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 font-medium disabled:opacity-60"
                />
              </div>

              {/* Type Selector (Tâche, Groupe, Jalon) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => handleTypeChange('task')}
                  className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                    type === 'task'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-xs'
                      : 'bg-[#050507] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>{t.task}</span>
                </button>

                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => handleTypeChange('group')}
                  className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                    type === 'group'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-xs'
                      : 'bg-[#050507] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <FolderPlus className="w-4 h-4 text-indigo-400" />
                  <span>{t.group}</span>
                </button>

                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => handleTypeChange('milestone')}
                  className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                    type === 'milestone'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow-xs'
                      : 'bg-[#050507] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Flag className="w-4 h-4 text-amber-400" />
                  <span>{t.milestone}</span>
                </button>
              </div>

              {/* Dates & Duration */}
              {schedulingMode === 'manual' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      {t.startDateLabel}
                    </label>
                    <input
                      type="date"
                      disabled={isReadOnly}
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#050507] border border-zinc-700 rounded-lg text-zinc-200 font-mono disabled:opacity-60"
                    />
                  </div>

                  {type !== 'milestone' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          {t.endDateLabel}
                        </label>
                        <input
                          type="date"
                          disabled={isReadOnly}
                          value={endDate}
                          onChange={(e) => handleEndDateChange(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#050507] border border-zinc-700 rounded-lg text-zinc-200 font-mono disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          {t.durationLabel}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            disabled={isReadOnly}
                            value={duration}
                            onChange={(e) => handleDurationChange(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-[#050507] border border-zinc-700 rounded-lg text-zinc-200 font-mono disabled:opacity-60"
                          />
                          <span className="text-zinc-400 shrink-0">{t.dayShort}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Liaisons & Planification (Intégré dans Général) */}
              <div className="p-3 bg-[#050507] border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Liaison & Mode de planification</span>
                  </label>
                </div>

                {type !== 'group' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setSchedulingMode('manual')}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          schedulingMode === 'manual'
                            ? 'bg-zinc-850 border-indigo-500 text-white font-medium'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="font-semibold text-xs mb-0.5">{t.manual}</div>
                        <div className="text-[10px] text-zinc-500">{t.manualDesc}</div>
                      </button>

                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setSchedulingMode('auto')}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          schedulingMode === 'auto'
                            ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 font-medium'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="font-semibold text-xs mb-0.5 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-indigo-400" />
                          <span>{t.auto}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">{t.autoDesc}</div>
                      </button>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          {t.predecessorLabel} ({schedulingMode === 'auto' ? 'Liaison stricte' : 'Flèche visuelle'})
                        </label>
                        <select
                          disabled={isReadOnly}
                          value={predecessorId}
                          onChange={(e) => setPredecessorId(e.target.value)}
                          className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                        >
                          <option value="">-- {t.noPredecessor} --</option>
                          {candidatePredecessors.map((cand) => (
                            <option key={cand.id} value={cand.id}>
                              {cand.type === 'group' ? '📁 [Groupe] ' : cand.type === 'milestone' ? '★ [Jalon] ' : '▪ [Tâche] '} {cand.name} ({cand.endDate})
                            </option>
                          ))}
                        </select>
                      </div>

                      {schedulingMode === 'auto' && (
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-zinc-400">
                            {t.lagLabel} :
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            disabled={isReadOnly}
                            value={predecessorLag}
                            onChange={(e) => setPredecessorLag(Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200 font-mono text-xs"
                          />
                          <span className="text-zinc-400 text-xs">{t.dayShort}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Liaison vers un prédécesseur (flèche de jalonnement)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={predecessorId}
                      onChange={(e) => setPredecessorId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                    >
                      <option value="">-- {t.noPredecessor} --</option>
                      {candidatePredecessors.map((cand) => (
                        <option key={cand.id} value={cand.id}>
                          {cand.type === 'group' ? '📁 [Groupe] ' : cand.type === 'milestone' ? '★ [Jalon] ' : '▪ [Tâche] '} {cand.name} ({cand.endDate})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Progress Slider (0% - 100%) */}
              {type !== 'group' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-400">
                    <span>{t.progressLabel}</span>
                    <span className="text-indigo-400 font-mono font-bold">{progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    disabled={isReadOnly}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-60"
                  />
                  {!isReadOnly && (
                    <div className="flex justify-between gap-1 text-[10px] text-zinc-500 font-mono">
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
                  )}
                </div>
              )}

              {/* Assignee & Parent Group (Intégré dans Général) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    {t.assigneeLabel}
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Ex: Alice, Groupe B..."
                    className="w-full px-3 py-2 bg-[#050507] border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    {type === 'group' ? 'Groupe parent (pour sous-groupe)' : t.groupParentLabel}
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050507] border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-60"
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
              </div>

              {/* Color Palette */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                  {t.colorLabel}
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      disabled={isReadOnly}
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
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  {t.notesLabel}
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Livrable PDF à déposer sur l'intranet..."
                  className="w-full px-3 py-2 bg-[#050507] border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none disabled:opacity-60"
                />
              </div>
            </div>
          )}

          {/* TAB 3: COMMENTAIRES & SUIVI */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    Aucun commentaire pour l'instant sur cette tâche.
                  </div>
                ) : (
                  comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-indigo-300">
                            {comm.author}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(comm.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 whitespace-pre-wrap">{comm.text}</p>
                      </div>

                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comm.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer shrink-0"
                          title="Supprimer le commentaire"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {!isReadOnly && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Ajouter un commentaire
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Votre nom (ex: Lucas, Équipe A)..."
                      className="w-1/3 px-3 py-1.5 bg-[#050507] border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment(e))}
                      placeholder="Votre message ou compte-rendu..."
                      className="flex-1 px-3 py-1.5 bg-[#050507] border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PIÈCES JOINTES & LIENS */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {attachments.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    <Paperclip className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    Aucune pièce jointe ou lien externe associé à cette tâche.
                  </div>
                ) : (
                  attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-zinc-800 text-indigo-400 shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-zinc-100 truncate">
                            {att.name}
                          </div>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <span>{att.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Ouvrir</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                            title="Supprimer la pièce jointe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!isReadOnly && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Attacher un lien ou document
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={attachName}
                      onChange={(e) => setAttachName(e.target.value)}
                      placeholder="Nom (ex: Rapport Drive, Dépôt GitHub)..."
                      className="px-3 py-1.5 bg-[#050507] border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={attachUrl}
                      onChange={(e) => setAttachUrl(e.target.value)}
                      placeholder="URL (https://drive.google.com/...)..."
                      className="px-3 py-1.5 bg-[#050507] border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-indigo-500 sm:col-span-2"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      disabled={!attachName.trim() || !attachUrl.trim()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter le lien</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between bg-[#0d0d11]">
          {isReadOnly ? (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
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
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
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
                  className="px-3.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs transition-colors cursor-pointer"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
