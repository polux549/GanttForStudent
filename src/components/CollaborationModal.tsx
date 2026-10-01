import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  X, 
  WifiOff, 
  Radio, 
  UserCheck, 
  ShieldCheck, 
  Sparkles,
  Clock
} from 'lucide-react';
import { GanttProject, Language } from '../types/gantt';
import { Collaborator, SyncLog } from '../utils/realtimeSync';
import { translations } from '../utils/i18n';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GanttProject;
  collaborators: Collaborator[];
  currentUser: Collaborator;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  recentLogs: SyncLog[];
  onUpdateCurrentUser: (name: string, color: string) => void;
  lang: Language;
  theme?: 'dark' | 'light';
}

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#14b8a6', // Teal
];

export const CollaborationModal: React.FC<CollaborationModalProps> = ({
  isOpen,
  onClose,
  project,
  collaborators,
  currentUser,
  connectionStatus,
  recentLogs,
  onUpdateCurrentUser,
  lang,
  theme = 'dark',
}) => {
  const t = translations[lang];
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [selectedColor, setSelectedColor] = useState(currentUser.color);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  if (!isOpen) return null;

  const getShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('code', project.code);
    return url.toString();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) {
      onUpdateCurrentUser(trimmed, selectedColor);
      setHasSavedProfile(true);
      setTimeout(() => setHasSavedProfile(false), 2000);
    }
  };

  const handleColorChange = (c: string) => {
    setSelectedColor(c);
    if (nameInput.trim()) {
      onUpdateCurrentUser(nameInput.trim(), c);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div 
        className={`w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#09090c] border-zinc-800 text-zinc-100'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#0d0d11] border-zinc-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              theme === 'light'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-base font-bold ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {t.collabModalTitle}
                </h2>
                <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border ${
                  theme === 'light'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {t.collabBadge}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${
                theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
              }`}>
                {t.collabModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Status banner */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
            connectionStatus === 'connected'
              ? theme === 'light'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : connectionStatus === 'connecting'
              ? theme === 'light'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
              : theme === 'light'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>{t.collabStatusConnected}</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <Radio className="w-4 h-4 animate-spin text-amber-500" />
                  <span>{t.collabStatusConnecting}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-rose-500" />
                  <span>{t.collabStatusOffline}</span>
                </>
              )}
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] ${
              theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
            }`}>
              <ShieldCheck className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
              <span>{t.collabPrivateBadge}</span>
            </div>
          </div>

          {/* Invitation Section */}
          <div className={`space-y-3 p-4 rounded-xl border transition-colors ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200'
              : 'bg-[#050507] border-zinc-800'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${
                theme === 'light' ? 'text-slate-800' : 'text-zinc-300'
              }`}>
                <Radio className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
                {t.collabShareSectionTitle}
              </label>
              <span className={`text-[11px] font-mono ${
                theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                {t.collabCodeLabel} <strong className={theme === 'light' ? 'text-blue-700' : 'text-indigo-300'}>{project.code}</strong>
              </span>
            </div>

            <p className={`text-[11px] leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
            }`}>
              {t.collabShareSectionDesc}
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className={`w-full pl-3 pr-20 py-2 text-xs font-mono rounded-lg truncate focus:outline-none border transition-colors ${
                    theme === 'light'
                      ? 'bg-white border-slate-300 text-slate-800'
                      : 'bg-zinc-900 border-zinc-750 text-zinc-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`absolute right-1 top-1 bottom-1 px-3 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? t.collabCopied : t.collabCopyLink}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 border ${
                  theme === 'light'
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                    : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                }`}
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{t.collabCopyCode}</span>
              </button>
            </div>
          </div>

          {/* User Profile in Collaboration */}
          <form onSubmit={handleSaveProfile} className={`space-y-3 p-4 rounded-xl border transition-colors ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200'
              : 'bg-[#050507] border-zinc-800'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${
                theme === 'light' ? 'text-slate-800' : 'text-zinc-300'
              }`}>
                <UserCheck className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
                {t.collabProfileTitle}
              </label>
              {hasSavedProfile && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> {t.collabProfileSaved}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0"
                style={{ backgroundColor: selectedColor }}
              >
                {nameInput.trim().slice(0, 2).toUpperCase() || 'MOI'}
              </div>

              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => handleSaveProfile()}
                placeholder={t.collabNamePlaceholder}
                maxLength={24}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg focus:outline-none border transition-colors ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                    : 'bg-zinc-900 border-zinc-750 text-white focus:border-indigo-500'
                }`}
              />

              <button
                type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  theme === 'light'
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                    : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                }`}
              >
                {t.collabValidate}
              </button>
            </div>

            {/* Color swatches */}
            <div className="flex items-center gap-2 pt-1">
              <span className={`text-[11px] ${
                theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                {t.collabAvatarColor}
              </span>
              <div className="flex items-center gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorChange(c)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                      selectedColor === c 
                        ? theme === 'light'
                          ? 'scale-125 ring-2 ring-slate-900 ring-offset-1 ring-offset-white'
                          : 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-zinc-950'
                        : 'hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {selectedColor === c && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Active Collaborators list */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                theme === 'light' ? 'text-slate-800' : 'text-zinc-300'
              }`}>
                <Users className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
                {t.collabActiveUsersTitle} ({collaborators.length || 1})
              </span>
              <span className={`text-[11px] ${
                theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
              }`}>
                {t.collabLive}
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {collaborators.length > 0 ? (
                collaborators.map((c) => {
                  const isMe = c.id === currentUser.id;
                  return (
                    <div 
                      key={c.id} 
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-[#050507] border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: c.color }}
                        >
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className={`font-medium ${
                          theme === 'light' ? 'text-slate-800' : 'text-zinc-200'
                        }`}>
                          {c.name}
                        </span>
                        {isMe && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            theme === 'light'
                              ? 'bg-blue-100 text-blue-800 font-semibold'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {t.collabYouBadge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t.collabOnline}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`text-center py-4 text-xs ${
                  theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                }`}>
                  {t.collabFirstUser}
                </div>
              )}
            </div>
          </div>

          {/* Recent sync history / activity feed */}
          {recentLogs.length > 0 && (
            <div className={`space-y-2 pt-2 border-t ${
              theme === 'light' ? 'border-slate-200' : 'border-zinc-800'
            }`}>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                <Clock className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
                {t.collabRecentSync}
              </span>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {recentLogs.slice(-5).reverse().map((log) => (
                  <div 
                    key={log.id} 
                    className={`flex items-center gap-2 text-[11px] px-2.5 py-1 rounded border ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-[#050507] border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: log.userColor }} 
                    />
                    <strong className={theme === 'light' ? 'text-slate-800 font-semibold' : 'text-zinc-300'}>
                      {log.userName}
                    </strong>
                    <span className="truncate flex-1">{log.action}</span>
                    <span className={`text-[10px] shrink-0 ${
                      theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
                    }`}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between transition-colors ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#0d0d11] border-zinc-800'
        }`}>
          <div className={`text-[11px] flex items-center gap-1.5 ${
            theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
            <span>{t.collabFooterTip}</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
