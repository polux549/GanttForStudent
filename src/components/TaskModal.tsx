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
  Sparkles,
  User,
  Check,
  Users
} from 'lucide-react';
import { GanttItem, GanttItemType, SchedulingMode, Language, TaskComment, TaskAttachment } from '../types/gantt';
import { translations } from '../utils/i18n';
import { addDays, diffDays, getTodayString } from '../utils/dates';
import { isDescendantOf, extractProjectMembers } from '../utils/ganttEngine';
import { getMemberColor, getInitials } from '../utils/memberUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: GanttItem) => void;
  onDelete?: (id: string) => void;
  item: GanttItem | null;
  allItems: GanttItem[];
  projectMembers?: string[];
  onAddProjectMember?: (member: string) => void;
  onOpenTeamModal?: () => void;
  lang: Language;
  isReadOnly?: boolean;
  theme?: 'dark' | 'light';
}

const PRESET_COLORS = [
  { name: 'Ardoise (Défaut groupe)', hex: '#475569' },
  { name: 'Graphite', hex: '#334155' },
  { name: 'Bleu cobalt', hex: '#2563eb' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Émeraude', hex: '#10b981' },
  { name: 'Ambre / Or', hex: '#f59e0b' },
  { name: 'Rose', hex: '#ec4899' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Sarcelle / Teal', hex: '#14b8a6' },
  { name: 'Rouge corail', hex: '#ef4444' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  item,
  allItems,
  projectMembers,
  onAddProjectMember,
  onOpenTeamModal,
  lang,
  isReadOnly = false,
  theme = 'dark',
}) => {
  const t = translations[lang];

  // List of unified unique project members
  const availableMembers = React.useMemo(() => {
    return extractProjectMembers(allItems, projectMembers);
  }, [allItems, projectMembers]);

  const [quickNewMember, setQuickNewMember] = useState('');

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isReadOnly) return;
    const finalName = name.trim() || (type === 'milestone' ? 'Nouveau jalon' : type === 'group' ? 'Nouveau groupe' : 'Nouvelle tâche');

    const effectiveId = item && item.id && item.id.trim().length > 0
      ? item.id
      : `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const savedItem: GanttItem = {
      id: effectiveId,
      name: finalName,
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
    if (savedItem.assignee && onAddProjectMember) {
      onAddProjectMember(savedItem.assignee);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      // In textarea (e.g. notes or comments), regular enter adds a newline unless user pressed Ctrl+Enter or Cmd+Enter
      if (target.tagName === 'TEXTAREA') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleSubmit(e);
        }
        return;
      }
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
      <div className={`border rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#09090c] border-zinc-800 text-zinc-100'
      }`}>
        {/* Header */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#0d0d11] border-zinc-800'
        }`}>
          <div className="flex items-center gap-2">
            <h2 className={`text-base font-semibold flex items-center gap-2 ${
              theme === 'light' ? 'text-slate-900' : 'text-zinc-100'
            }`}>
              {type === 'milestone' ? (
                <Flag className="w-4 h-4 text-amber-500" />
              ) : type === 'group' ? (
                <FolderPlus className={`w-4 h-4 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
              <span>{isExisting ? t.editItem : t.newItem}</span>
            </h2>
            {isReadOnly && (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-medium">
                <Lock className="w-3 h-3 text-amber-500" />
                Lecture seule
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center px-4 border-b text-xs overflow-x-auto gap-1 ${
          theme === 'light'
            ? 'bg-slate-100/70 border-slate-200 text-slate-600'
            : 'bg-zinc-950/70 border-zinc-800 text-zinc-400'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? theme === 'light'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white/80 shadow-2xs'
                  : 'border-indigo-500 text-indigo-300 font-semibold'
                : theme === 'light'
                ? 'border-transparent text-slate-600 hover:text-slate-900'
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
                ? theme === 'light'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white/80 shadow-2xs'
                  : 'border-indigo-500 text-indigo-300 font-semibold'
                : theme === 'light'
                ? 'border-transparent text-slate-600 hover:text-slate-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Commentaires</span>
            {comments.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                theme === 'light'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-indigo-500/20 text-indigo-300'
              }`}>
                {comments.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attachments')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attachments'
                ? theme === 'light'
                  ? 'border-blue-600 text-blue-600 font-bold bg-white/80 shadow-2xs'
                  : 'border-indigo-500 text-indigo-300 font-semibold'
                : theme === 'light'
                ? 'border-transparent text-slate-600 hover:text-slate-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Pièces jointes & Liens</span>
            {attachments.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                theme === 'light'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {attachments.length}
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form id="task-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: GÉNÉRAL (INTÈGRE DATES, LIAISONS ET GROUPE) */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase mb-1.5 ${
                  theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                }`}>
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
                  className={`w-full px-3 py-2 rounded-lg font-medium disabled:opacity-60 focus:outline-none transition-colors border ${
                    theme === 'light'
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                      : 'bg-[#050507] border-zinc-750 text-zinc-100 focus:border-indigo-500'
                  }`}
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
                      ? theme === 'light'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                        : 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-xs'
                      : theme === 'light'
                      ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      : 'bg-[#050507] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
                  <span>{t.task}</span>
                </button>

                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => handleTypeChange('group')}
                  className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                    type === 'group'
                      ? theme === 'light'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs'
                        : 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-xs'
                      : theme === 'light'
                      ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      : 'bg-[#050507] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <FolderPlus className={`w-4 h-4 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  <span>{t.group}</span>
                </button>

                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => handleTypeChange('milestone')}
                  className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                    type === 'milestone'
                      ? theme === 'light'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs'
                        : 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow-xs'
                      : theme === 'light'
                      ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      : 'bg-[#050507] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Flag className="w-4 h-4 text-amber-500" />
                  <span>{t.milestone}</span>
                </button>
              </div>

              {/* Dates & Duration (Accessible pour tâches manuelles et automatiques) */}
              {type !== 'group' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${
                      theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                    }`}>
                      {t.startDateLabel}
                      {schedulingMode === 'auto' && predecessorId && (
                        <span className="ml-1 text-[10px] font-normal text-indigo-500">
                          (auto)
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      disabled={isReadOnly || (schedulingMode === 'auto' && Boolean(predecessorId))}
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg font-mono disabled:opacity-60 border transition-colors ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                          : 'bg-[#050507] border-zinc-700 text-zinc-200'
                      }`}
                    />
                  </div>

                  {type !== 'milestone' && (
                    <>
                      <div>
                        <label className={`block text-[11px] font-semibold mb-1 ${
                          theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                        }`}>
                          {t.endDateLabel}
                          {schedulingMode === 'auto' && (
                            <span className="ml-1 text-[10px] font-normal text-indigo-500">
                              (calculée)
                            </span>
                          )}
                        </label>
                        <input
                          type="date"
                          disabled={isReadOnly || schedulingMode === 'auto'}
                          value={endDate}
                          onChange={(e) => handleEndDateChange(e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-lg font-mono disabled:opacity-60 border transition-colors ${
                            theme === 'light'
                              ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                              : 'bg-[#050507] border-zinc-700 text-zinc-200'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[11px] font-semibold mb-1 ${
                          theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                        }`}>
                          {t.durationLabel}
                          {schedulingMode === 'auto' && (
                            <span className="ml-1 text-[10px] font-normal text-emerald-500 font-semibold">
                              (éditable)
                            </span>
                          )}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            disabled={isReadOnly}
                            value={duration}
                            onChange={(e) => handleDurationChange(Number(e.target.value))}
                            className={`w-full px-3 py-1.5 rounded-lg font-mono disabled:opacity-60 border transition-colors ${
                              theme === 'light'
                                ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                                : 'bg-[#050507] border-zinc-700 text-zinc-200'
                            }`}
                          />
                          <span className={`shrink-0 ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                            {t.dayShort}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className={`p-2.5 rounded-lg border text-xs text-center ${
                  theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400'
                }`}>
                  📁 Les dates et la durée du groupe sont calculées automatiquement à partir des sous-tâches.
                </div>
              )}

              {/* Liaisons & Planification (Intégré dans Général) */}
              <div className={`p-3.5 rounded-xl border space-y-3 ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-[#050507] border-zinc-800'
              }`}>
                <div className="flex items-center justify-between">
                  <label className={`block text-[11px] font-semibold uppercase flex items-center gap-1.5 ${
                    theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                  }`}>
                    <LinkIcon className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
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
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          schedulingMode === 'manual'
                            ? theme === 'light'
                              ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-xs ring-1 ring-blue-500/20'
                              : 'bg-zinc-800 border-indigo-500 text-white font-medium shadow-xs'
                            : theme === 'light'
                            ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className={`font-semibold text-xs mb-0.5 ${
                          schedulingMode === 'manual'
                            ? theme === 'light' ? 'text-blue-900' : 'text-white'
                            : theme === 'light' ? 'text-slate-800' : 'text-zinc-300'
                        }`}>
                          {t.manual}
                        </div>
                        <div className={`text-[10px] ${
                          theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                        }`}>
                          {t.manualDesc}
                        </div>
                      </button>

                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setSchedulingMode('auto')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          schedulingMode === 'auto'
                            ? theme === 'light'
                              ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-xs ring-1 ring-blue-500/20'
                              : 'bg-indigo-950/60 border-indigo-500 text-indigo-200 font-medium shadow-xs'
                            : theme === 'light'
                            ? 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className={`font-semibold text-xs mb-0.5 flex items-center gap-1 ${
                          schedulingMode === 'auto'
                            ? theme === 'light' ? 'text-blue-900' : 'text-indigo-200'
                            : theme === 'light' ? 'text-slate-800' : 'text-zinc-300'
                        }`}>
                          <LinkIcon className={`w-3 h-3 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
                          <span>{t.auto}</span>
                        </div>
                        <div className={`text-[10px] ${
                          theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                        }`}>
                          {t.autoDesc}
                        </div>
                      </button>
                    </div>

                    <div className={`space-y-2 pt-1 border-t ${
                      theme === 'light' ? 'border-slate-200' : 'border-zinc-800/80'
                    }`}>
                      <div>
                        <label className={`block text-[11px] mb-1 ${
                          theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                        }`}>
                          {t.predecessorLabel} ({schedulingMode === 'auto' ? 'Liaison stricte' : 'Flèche visuelle'})
                        </label>
                        <select
                          disabled={isReadOnly}
                          value={predecessorId}
                          onChange={(e) => setPredecessorId(e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-lg cursor-pointer text-xs border transition-colors focus:outline-none ${
                            theme === 'light'
                              ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                              : 'bg-zinc-950 border-zinc-700 text-zinc-200 focus:border-indigo-500'
                          }`}
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
                          <label className={`text-[11px] ${
                            theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                          }`}>
                            {t.lagLabel} :
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            disabled={isReadOnly}
                            value={predecessorLag}
                            onChange={(e) => setPredecessorLag(Number(e.target.value))}
                            className={`w-20 px-2 py-1 rounded-lg font-mono text-xs border transition-colors ${
                              theme === 'light'
                                ? 'bg-white border-slate-300 text-slate-900'
                                : 'bg-zinc-950 border-zinc-700 text-zinc-200'
                            }`}
                          />
                          <span className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                            {t.dayShort}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <label className={`block text-[11px] mb-1 ${
                      theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                    }`}>
                      Liaison vers un prédécesseur (flèche de jalonnement)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={predecessorId}
                      onChange={(e) => setPredecessorId(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg cursor-pointer text-xs border transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                          : 'bg-zinc-950 border-zinc-700 text-zinc-200 focus:border-indigo-500'
                      }`}
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
                  <div className={`flex justify-between items-center text-[11px] font-semibold ${
                    theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                  }`}>
                    <span>{t.progressLabel}</span>
                    <span className={`font-mono font-bold ${
                      theme === 'light' ? 'text-blue-600' : 'text-indigo-400'
                    }`}>
                      {progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    disabled={isReadOnly}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className={`w-full h-1.5 rounded-lg cursor-pointer disabled:opacity-60 ${
                      theme === 'light'
                        ? 'accent-blue-600 bg-slate-200'
                        : 'accent-indigo-500 bg-zinc-800'
                    }`}
                  />
                  {!isReadOnly && (
                    <div className={`flex justify-between gap-1 text-[10px] font-mono ${
                      theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                    }`}>
                      {[0, 25, 50, 75, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setProgress(val)}
                          className={`px-1 py-0.5 cursor-pointer ${
                            theme === 'light' ? 'hover:text-blue-600' : 'hover:text-indigo-400'
                          }`}
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={`block text-[11px] font-semibold flex items-center gap-1.5 ${
                      theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                    }`}>
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t.assigneeLabel}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {onOpenTeamModal && (
                        <button
                          type="button"
                          onClick={onOpenTeamModal}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          title="Définir toute l'équipe du projet"
                        >
                          <Users className="w-3 h-3" />
                          <span>Gérer l&apos;équipe</span>
                        </button>
                      )}
                      {assignee && (
                        <button
                          type="button"
                          onClick={() => setAssignee('')}
                          className="text-[10px] text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
                          title={t.unassigned}
                        >
                          <X className="w-3 h-3" />
                          <span>{t.unassigned}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input with autocomplete datalist and dropdown select */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        list="task-modal-assignee-datalist"
                        disabled={isReadOnly}
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        placeholder="Ex: Alice, Thomas, Lucas..."
                        className={`w-full px-3 py-1.5 text-xs rounded-lg disabled:opacity-60 border transition-colors focus:outline-none ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                            : 'bg-[#050507] border-zinc-700 text-zinc-200 focus:border-indigo-500'
                        }`}
                      />
                      <datalist id="task-modal-assignee-datalist">
                        {availableMembers.map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>

                    {availableMembers.length > 0 && (
                      <select
                        disabled={isReadOnly}
                        value={availableMembers.includes(assignee) ? assignee : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) setAssignee(val);
                        }}
                        className={`px-2 py-1.5 text-xs rounded-lg border cursor-pointer font-medium transition-colors shrink-0 ${
                          theme === 'light'
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                            : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                        }`}
                        title="Choisir un membre existant"
                      >
                        <option value="">{t.selectAssigneePlaceholder}</option>
                        {availableMembers.map((m) => (
                          <option key={m} value={m}>
                            👤 {m}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Quick Add new member field inline */}
                  {!isReadOnly && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <input
                        type="text"
                        value={quickNewMember}
                        onChange={(e) => setQuickNewMember(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = quickNewMember.trim();
                            if (trimmed) {
                              onAddProjectMember?.(trimmed);
                              setAssignee(trimmed);
                              setQuickNewMember('');
                            }
                          }
                        }}
                        placeholder="+ Écrire un nouveau responsable et appuyer sur Entrée..."
                        className={`flex-1 px-2.5 py-1 text-[11px] rounded-md border transition-colors focus:outline-none ${
                          theme === 'light'
                            ? 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:border-indigo-500'
                        }`}
                      />
                      <button
                        type="button"
                        disabled={!quickNewMember.trim()}
                        onClick={() => {
                          const trimmed = quickNewMember.trim();
                          if (trimmed) {
                            onAddProjectMember?.(trimmed);
                            setAssignee(trimmed);
                            setQuickNewMember('');
                          }
                        }}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
                          theme === 'light'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        + Ajouter &amp; Attribuer
                      </button>
                    </div>
                  )}

                  {/* 1-Click Member Chips */}
                  {availableMembers.length > 0 && (
                    <div className="pt-1">
                      <div className={`text-[10px] font-semibold mb-1 flex items-center justify-between ${
                        theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                      }`}>
                        <span>{t.quickTeamMembers}</span>
                        <span className="text-[9px] lowercase opacity-80">1 clic pour attribuer</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {availableMembers.map((m) => {
                          const isDirectSelected = assignee.trim().toLowerCase() === m.trim().toLowerCase();
                          const isMultiSelected = assignee.toLowerCase().includes(m.toLowerCase());
                          const mColor = getMemberColor(m);

                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={(e) => {
                                if (e.shiftKey && assignee && !isDirectSelected) {
                                  // Append to multi-assign
                                  const parts = assignee.split(/[,&/]/).map((p) => p.trim()).filter(Boolean);
                                  if (isMultiSelected) {
                                    setAssignee(parts.filter((p) => p.toLowerCase() !== m.toLowerCase()).join(' & '));
                                  } else {
                                    setAssignee([...parts, m].join(' & '));
                                  }
                                } else {
                                  setAssignee(isDirectSelected ? '' : m);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                                isDirectSelected
                                  ? theme === 'light'
                                    ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-400'
                                    : 'bg-indigo-600 text-white shadow-indigo-500/25 ring-2 ring-indigo-400'
                                  : isMultiSelected
                                  ? theme === 'light'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                                  : theme === 'light'
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750'
                              }`}
                              title={
                                isDirectSelected
                                  ? 'Cliquez pour désassigner'
                                  : `Attribuer à ${m} (Maj+Clic pour ajouter en binôme)`
                              }
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${
                                  isDirectSelected
                                    ? 'bg-white text-blue-600'
                                    : theme === 'light'
                                    ? `${mColor.bg} ${mColor.text}`
                                    : `${mColor.darkBg} ${mColor.darkText}`
                                }`}
                              >
                                {getInitials(m).slice(0, 1)}
                              </span>
                              <span>{m}</span>
                              {isDirectSelected && <Check className="w-3 h-3 ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${
                    theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                  }`}>
                    {type === 'group' ? 'Groupe parent (pour sous-groupe)' : t.groupParentLabel}
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg cursor-pointer disabled:opacity-60 border transition-colors focus:outline-none ${
                      theme === 'light'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                        : 'bg-[#050507] border-zinc-700 text-zinc-200 focus:border-indigo-500'
                    }`}
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
                <label className={`block text-[11px] font-semibold mb-1.5 ${
                  theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                }`}>
                  {t.colorLabel}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => setColor(c.hex)}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer border ${
                        color.toLowerCase() === c.hex.toLowerCase()
                          ? theme === 'light'
                            ? 'scale-125 ring-2 ring-slate-900 ring-offset-2 ring-offset-white border-transparent shadow-md'
                            : 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900 border-transparent shadow-md'
                          : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                  {/* Custom color picker */}
                  <label 
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                    }`}
                    title="Choisir une couleur sur mesure"
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                      style={{ backgroundColor: color }}
                    />
                    <span>Perso</span>
                    <input
                      type="color"
                      disabled={isReadOnly}
                      value={color.startsWith('#') ? color : '#475569'}
                      onChange={(e) => setColor(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${
                  theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                }`}>
                  {t.notesLabel}
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Livrable PDF à déposer sur l'intranet..."
                  className={`w-full px-3 py-2 rounded-lg resize-none disabled:opacity-60 border transition-colors focus:outline-none ${
                    theme === 'light'
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                      : 'bg-[#050507] border-zinc-700 text-zinc-200 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 3: COMMENTAIRES & SUIVI */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <div className={`text-center py-8 text-xs ${
                    theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
                  }`}>
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    Aucun commentaire pour l'instant sur cette tâche.
                  </div>
                ) : (
                  comments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-200 shadow-2xs'
                          : 'border-zinc-800 bg-zinc-900/60'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold text-xs ${
                            theme === 'light' ? 'text-blue-700' : 'text-indigo-300'
                          }`}>
                            {comm.author}
                          </span>
                          <span className={`text-[10px] ${
                            theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
                          }`}>
                            {new Date(comm.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className={`text-xs whitespace-pre-wrap leading-relaxed ${
                          theme === 'light' ? 'text-slate-800' : 'text-zinc-200'
                        }`}>{comm.text}</p>
                      </div>

                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comm.id)}
                          className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                            theme === 'light'
                              ? 'text-slate-400 hover:text-red-600 hover:bg-slate-200'
                              : 'text-zinc-500 hover:text-red-400'
                          }`}
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
                <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 shadow-2xs'
                    : 'bg-zinc-950 border-zinc-800'
                }`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                  }`}>
                    Ajouter un commentaire
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Votre nom (ex: Lucas, Équipe A)..."
                      className={`w-1/3 px-3 py-1.5 rounded-lg text-xs focus:outline-none border transition-colors ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                          : 'bg-[#050507] border-zinc-800 text-zinc-200 focus:border-indigo-500'
                      }`}
                    />
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment(e))}
                      placeholder="Votre message ou compte-rendu..."
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs focus:outline-none border transition-colors ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                          : 'bg-[#050507] border-zinc-800 text-zinc-200 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                      className={`px-3.5 py-1.5 disabled:opacity-40 text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs font-semibold ${
                        theme === 'light'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
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
                  <div className={`text-center py-8 text-xs ${
                    theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
                  }`}>
                    <Paperclip className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    Aucune pièce jointe ou lien externe associé à cette tâche.
                  </div>
                ) : (
                  attachments.map((att) => (
                    <div
                      key={att.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-200 shadow-2xs'
                          : 'bg-zinc-900/60 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          theme === 'light'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-zinc-800 text-indigo-400'
                        }`}>
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`font-semibold text-xs truncate ${
                            theme === 'light' ? 'text-slate-900' : 'text-zinc-100'
                          }`}>
                            {att.name}
                          </div>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[11px] hover:underline flex items-center gap-1 truncate ${
                              theme === 'light' ? 'text-blue-600' : 'text-indigo-400'
                            }`}
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
                          className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                            theme === 'light'
                              ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                          }`}
                        >
                          <span>Ouvrir</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att.id)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              theme === 'light'
                                ? 'text-slate-400 hover:text-red-600 hover:bg-slate-200'
                                : 'text-zinc-500 hover:text-red-400'
                            }`}
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
                <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 shadow-2xs'
                    : 'bg-zinc-950 border-zinc-800'
                }`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-700' : 'text-zinc-400'
                  }`}>
                    Attacher un lien ou document
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={attachName}
                      onChange={(e) => setAttachName(e.target.value)}
                      placeholder="Nom (ex: Rapport Drive, Dépôt GitHub)..."
                      className={`px-3 py-1.5 rounded-lg text-xs focus:outline-none border transition-colors ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                          : 'bg-[#050507] border-zinc-800 text-zinc-200 focus:border-indigo-500'
                      }`}
                    />
                    <input
                      type="text"
                      value={attachUrl}
                      onChange={(e) => setAttachUrl(e.target.value)}
                      placeholder="URL (https://drive.google.com/...)..."
                      className={`px-3 py-1.5 rounded-lg text-xs focus:outline-none border transition-colors sm:col-span-2 ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                          : 'bg-[#050507] border-zinc-800 text-zinc-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      disabled={!attachName.trim() || !attachUrl.trim()}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
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
        <div className={`px-5 py-3 border-t flex items-center justify-between ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#0d0d11] border-zinc-800'
        }`}>
          {isReadOnly ? (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              {isExisting && onDelete ? (
                confirmDelete ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                    <span className="text-xs text-red-500 font-semibold">
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
                      className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                        theme === 'light' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs transition-colors cursor-pointer"
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  form="task-modal-form"
                  onClick={handleSubmit}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                  title="Enregistrer (ou appuyez sur Entrée)"
                >
                  <Save className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">{t.saveItem}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
