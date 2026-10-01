import React, { useState, useMemo } from 'react';
import { 
  X, 
  MessageSquare, 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Flag,
  FolderPlus,
  Check
} from 'lucide-react';
import { GanttProject, GanttItem, GanttItemType, Language } from '../types/gantt';
import { translations } from '../utils/i18n';
import { formatReadableDate } from '../utils/dates';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GanttProject;
  lang: Language;
  theme?: 'dark' | 'light';
  onSelectTask: (task: GanttItem) => void;
}

interface FlattenedComment {
  id: string;
  author: string;
  text: string;
  date: string;
  taskId: string;
  taskName: string;
  taskType: GanttItemType;
  taskColor: string;
  taskProgress: number;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  project,
  lang,
  theme = 'dark',
  onSelectTask,
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all comments from all tasks
  const allComments = useMemo<FlattenedComment[]>(() => {
    if (!project || !project.items) return [];
    const list: FlattenedComment[] = [];

    project.items.forEach((item) => {
      if (item.comments && item.comments.length > 0) {
        item.comments.forEach((c) => {
          list.push({
            id: c.id,
            author: c.author || 'Anonyme',
            text: c.text,
            date: c.date,
            taskId: item.id,
            taskName: item.name,
            taskType: item.type,
            taskColor: item.color,
            taskProgress: item.progress,
          });
        });
      }
    });

    // Sort by date descending (most recent first)
    return list.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [project]);

  // Filtered comments based on search query
  const filteredComments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allComments;
    return allComments.filter((c) => {
      return (
        c.text.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.taskName.toLowerCase().includes(q)
      );
    });
  }, [allComments, searchQuery]);

  if (!isOpen) return null;

  const handleOpenTask = (taskId: string) => {
    const item = project.items.find((i) => i.id === taskId);
    if (item) {
      onSelectTask(item);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#0b0b0e] border-zinc-800 text-zinc-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-zinc-800/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs ${
              theme === 'light'
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-indigo-950/70 border-indigo-800/60 text-indigo-400'
            }`}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  {t.commentsModalTitle}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  theme === 'light'
                    ? 'bg-blue-100/70 border-blue-200 text-blue-700'
                    : 'bg-indigo-900/40 border-indigo-700/60 text-indigo-300'
                }`}>
                  {allComments.length} {t.commentsCount}
                </span>
              </div>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
                {t.commentsModalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700/60 text-zinc-400 hover:text-white'
            }`}
            title={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        {allComments.length > 0 && (
          <div className={`px-5 py-2.5 border-b shrink-0 ${
            theme === 'light' ? 'bg-white border-slate-100' : 'bg-[#08080b] border-zinc-800/50'
          }`}>
            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.commentsSearchPlaceholder}
                className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border transition-colors focus:outline-none ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:border-indigo-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-xs ${
                    theme === 'light' ? 'text-slate-400 hover:text-slate-700' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Comments List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredComments.length > 0 ? (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3.5 rounded-xl border transition-all hover:shadow-md ${
                  theme === 'light'
                    ? 'bg-slate-50/70 border-slate-200/90 hover:bg-white hover:border-slate-300'
                    : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/90 hover:border-zinc-700'
                }`}
              >
                {/* Comment Header: Author & Task Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                      theme === 'light'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-indigo-900/80 text-indigo-200 border border-indigo-700/60'
                    }`}>
                      {comment.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className={`text-xs font-bold ${
                        theme === 'light' ? 'text-slate-900' : 'text-zinc-100'
                      }`}>
                        {comment.author}
                      </span>
                      <span className={`text-[10px] ml-2 font-mono ${
                        theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
                      }`}>
                        {new Date(comment.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Task Reference Tag */}
                  <button
                    onClick={() => handleOpenTask(comment.taskId)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-2xs'
                        : 'bg-zinc-850 border-zinc-750 text-zinc-300 hover:bg-zinc-800 hover:border-indigo-500/80 hover:text-indigo-200'
                    }`}
                    title="Cliquer pour afficher cette tâche dans l'éditeur"
                  >
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: comment.taskColor || '#3b82f6' }}
                    />
                    <span className="truncate max-w-[160px] sm:max-w-[220px]">
                      {comment.taskName}
                    </span>
                    <ArrowRight className="w-3 h-3 shrink-0 opacity-70" />
                  </button>
                </div>

                {/* Comment Text */}
                <p className={`text-xs leading-relaxed whitespace-pre-wrap pl-9 pr-2 ${
                  theme === 'light' ? 'text-slate-700' : 'text-zinc-200'
                }`}>
                  {comment.text}
                </p>
              </div>
            ))
          ) : (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border ${
                theme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-600'
              }`}>
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className={`text-sm font-bold mb-1 ${
                theme === 'light' ? 'text-slate-800' : 'text-zinc-200'
              }`}>
                {searchQuery ? 'Aucun résultat trouvé' : t.commentsEmpty}
              </h3>
              <p className={`text-xs max-w-sm ${
                theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
              }`}>
                {searchQuery 
                  ? 'Essayez de modifier vos termes de recherche.'
                  : t.commentsEmptyDesc
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
          theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
        }`}>
          <span>
            {allComments.length} {t.commentsCount} au total dans le projet
          </span>
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
