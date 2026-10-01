import React, { useState } from 'react';
import { 
  Key, 
  ArrowRight, 
  Layers, 
  Clock, 
  Trash2, 
  Sparkles, 
  FilePlus2,
  CheckCircle2,
  Download,
  Sun,
  Moon
} from 'lucide-react';
import { Language } from '../types/gantt';
import { translations, WINDOWS_DOWNLOAD_URL } from '../utils/i18n';
import { getRecentProjects, deleteProject, normalizeCode, getProject, generateRandomCode } from '../utils/storage';

interface HomePageProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onCreateProject: (title: string, customCode?: string) => void;
  onOpenProjectByCode: (code: string) => void;
  onExploreDemo: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  lang,
  onLanguageChange,
  onCreateProject,
  onOpenProjectByCode,
  onExploreDemo,
  theme = 'dark',
  onToggleTheme,
}) => {
  const t = translations[lang];

  const [inputCode, setInputCode] = useState('');
  const [recentProjects, setRecentProjects] = useState(() => getRecentProjects());
  
  // State when code does not exist yet: asks for the project title
  const [isNewProjectPrompt, setIsNewProjectPrompt] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [targetCode, setTargetCode] = useState('');

  // Main submission: checks if code exists or creates new
  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputCode.trim();
    if (!raw) return;

    // Secret trigger: If code starts with '$', directly open the hidden Accounting module!
    if (raw.startsWith('$')) {
      onOpenProjectByCode(raw.toUpperCase());
      return;
    }

    const clean = normalizeCode(inputCode);
    if (!clean) return;

    const existing = getProject(clean);
    if (existing) {
      // Code exists! Open it immediately
      onOpenProjectByCode(clean);
    } else {
      // Code doesn't exist yet -> ask for project name
      setTargetCode(clean);
      setNewProjectTitle(`Projet ${clean}`);
      setIsNewProjectPrompt(true);
    }
  };

  const handleConfirmCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !targetCode) return;
    onCreateProject(newProjectTitle.trim(), targetCode);
  };

  const handleQuickRandom = () => {
    const randomCode = generateRandomCode();
    setInputCode(randomCode);
    setTargetCode(randomCode);
    setNewProjectTitle(`Projet ${randomCode}`);
    setIsNewProjectPrompt(true);
  };

  const handleDeleteRecent = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(code);
    setRecentProjects(getRecentProjects());
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'fr', label: '🥐 Croissant' },
    { code: 'de', label: '🥨 Brezel' },
    { code: 'it', label: '🍕 Pizza' },
    { code: 'en', label: '🫖 Tea' },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors ${
      theme === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-[#050507] text-zinc-200'
    }`}>
      {/* Top Navbar */}
      <nav className={`h-16 px-6 lg:px-12 flex items-center justify-between border-b sticky top-0 z-30 transition-colors ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 shadow-xs backdrop-blur-md'
          : 'bg-[#08080a]/90 border-zinc-800/80 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-3">
          <img 
            src="./icon.png" 
            alt="GanttForStudent Logo" 
            className={`w-8 h-8 rounded-lg shadow-md object-contain p-0.5 border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
            }`} 
          />
          <span className={`font-bold text-base tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {t.appName}
          </span>
        </div>

        {/* Right: Windows App & Language selector */}
        <div className="flex items-center gap-3">
          <a
            href={WINDOWS_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs group ${
              theme === 'light'
                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                : 'bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white'
            }`}
            title={t.downloadWindows}
          >
            <svg className={`w-3.5 h-3.5 fill-current transition-colors ${
              theme === 'light' ? 'text-blue-600' : 'text-blue-400 group-hover:text-blue-200'
            }`} viewBox="0 0 24 24">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.95-1.8" />
            </svg>
            <span className="hidden sm:inline">{t.downloadWindows}</span>
            <span className="sm:hidden">{t.windowsApp}</span>
          </a>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-zinc-950 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
              title={theme === 'light' ? t.themeDark : t.themeLight}
              aria-label={theme === 'light' ? t.themeDark : t.themeLight}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">{t.themeDark}</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{t.themeLight}</span>
                </>
              )}
            </button>
          )}

          <div className={`flex items-center p-0.5 rounded-xl border text-xs ${
            theme === 'light' ? 'bg-slate-200/60 border-slate-300/60' : 'bg-zinc-950 border-zinc-800'
          }`}>
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  lang === l.code
                    ? theme === 'light'
                      ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                      : 'bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700'
                    : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
        {/* Title & Tagline */}
        <div className="text-center mb-8 space-y-3">
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {t.appName}
          </h1>
          <p className={`text-sm leading-relaxed font-normal ${
            theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
          }`}>
            {t.appTagline}
          </p>
        </div>

        {/* Main Card: Code Entry & Creation Flow */}
        <div className={`rounded-2xl p-6 sm:p-8 shadow-xl transition-all border ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-slate-200/60'
            : 'bg-[#0b0b0e] border-zinc-800/90 shadow-2xl'
        }`}>
          {!isNewProjectPrompt ? (
            /* STEP 1: Enter or generate code */
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div className={`flex items-center gap-2 font-semibold text-sm mb-1 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                <Key className="w-4 h-4 text-indigo-500" />
                <span>{t.homeAccessOrCreateTitle}</span>
              </div>

              <div>
                <label className={`block text-[11px] uppercase tracking-wider mb-1.5 font-semibold ${
                  theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
                }`}>
                  {t.homeProjectCodeLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder={t.homeProjectCodePlaceholder}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500 transition-colors shadow-inner border ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-zinc-950 border-zinc-750 text-zinc-100'
                    }`}
                  />
                </div>
                <div className={`text-[11px] mt-1.5 ${
                  theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                }`}>
                  {t.homeCodeHint}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className={`flex-1 py-3 px-4 rounded-xl disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25'
                  }`}
                >
                  <span className="text-white">{t.homeAccessButton}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <button
                  type="button"
                  onClick={handleQuickRandom}
                  className={`py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs border ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                  }`}
                  title={t.homeRandomCodeTooltip}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-slate-600' : 'text-indigo-400'}`} />
                  <span>{t.homeRandomCodeButton}</span>
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Code does not exist yet -> Ask for project name */
            <form onSubmit={handleConfirmCreateNew} className="space-y-4 animate-in fade-in duration-200">
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                theme === 'light'
                  ? 'bg-slate-100/90 border-slate-300 text-slate-800'
                  : 'bg-indigo-950/40 border-indigo-500/40'
              }`}>
                <FilePlus2 className={`w-5 h-5 shrink-0 mt-0.5 ${theme === 'light' ? 'text-slate-700' : 'text-indigo-400'}`} />
                <div>
                  <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {t.homeNewProjectDetected}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-indigo-200'}`}>
                    {`Code `}
                    <span className={`font-mono font-bold px-1 py-0.5 rounded ${
                      theme === 'light' ? 'bg-slate-200 text-slate-900' : 'text-white bg-indigo-900/60'
                    }`}>{targetCode}</span>
                    {` ${t.homeNewProjectCodeNotice}`}
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-[11px] uppercase tracking-wider mb-1.5 font-semibold ${
                  theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
                }`}>
                  {t.homeProjectNameLabel}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder={t.homeProjectNamePlaceholder}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-inner border ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-zinc-950 border-zinc-750 text-zinc-100'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectPrompt(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {t.homeBackButton}
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.homeCreateAndOpenButton}</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Explorer */}
          <div className={`mt-6 pt-5 border-t flex items-center justify-between text-xs ${
            theme === 'light' ? 'border-slate-200' : 'border-zinc-800/80'
          }`}>
            <span className={theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}>{t.homeNeedExample}</span>
            <button
              type="button"
              onClick={onExploreDemo}
              className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.exploreDemo}</span>
            </button>
          </div>
        </div>

        {/* Windows App Download Card */}
        <div className={`mt-6 rounded-2xl p-4 sm:p-5 shadow-xl transition-all group border ${
          theme === 'light'
            ? 'bg-white border-slate-200 hover:border-blue-400 shadow-slate-200/50'
            : 'bg-[#0b0b0e] border-zinc-800/90 hover:border-blue-500/40'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs border ${
                theme === 'light'
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/10 border-blue-500/25 text-blue-400'
              }`}>
                <svg className={`w-5 h-5 fill-current ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} viewBox="0 0 24 24">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.95-1.8" />
                </svg>
              </div>
              <div>
                <div className={`text-sm font-semibold flex items-center gap-2 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  <span>{t.windowsApp}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                    theme === 'light'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  }`}>Windows</span>
                </div>
                <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {t.downloadWindowsSubtitle}
                </p>
              </div>
            </div>

            <a
              href={WINDOWS_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/25 hover:shadow-blue-500/35 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadWindows}</span>
            </a>
          </div>
        </div>

        {/* Recent Projects List */}
        {recentProjects.length > 0 && (
          <div className={`mt-8 rounded-2xl p-5 shadow-xl border ${
            theme === 'light'
              ? 'bg-white border-slate-200 shadow-slate-200/50'
              : 'bg-[#0b0b0e] border-zinc-800/80'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3 ${
              theme === 'light' ? 'text-slate-600' : 'text-zinc-400'
            }`}>
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.recentProjects}</span>
            </h3>

            <div className={`divide-y ${theme === 'light' ? 'divide-slate-100' : 'divide-zinc-800/60'}`}>
              {recentProjects.map((p) => (
                <div
                  key={p.code}
                  onClick={() => onOpenProjectByCode(p.code)}
                  className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer group flex items-center justify-between gap-3 ${
                    theme === 'light'
                      ? 'hover:bg-slate-50 text-slate-800'
                      : 'hover:bg-zinc-850/60 text-zinc-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs truncate group-hover:text-indigo-600 transition-colors">
                      {p.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span className="text-indigo-600 font-bold">{p.code}</span>
                      <span>·</span>
                      <span>{p.itemCount} {t.homeItemsCount}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteRecent(p.code, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                    title={t.homeRemoveFromHistoryTooltip}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-6 border-t text-center text-xs ${
        theme === 'light' ? 'border-slate-200 text-slate-500 bg-white/60' : 'border-zinc-800/80 text-zinc-500'
      }`}>
        <p>{t.homeFooterText}</p>
      </footer>
    </div>
  );
};
