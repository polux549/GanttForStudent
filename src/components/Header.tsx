import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ZoomIn, 
  Share2, 
  Download, 
  ChevronLeft, 
  Globe, 
  Sliders, 
  PanelLeftClose, 
  PanelLeft, 
  Check, 
  Sparkles,
  Presentation,
  Pencil,
  Keyboard
} from 'lucide-react';
import { GanttProject, Language, ZoomLevel } from '../types/gantt';
import { translations, WINDOWS_DOWNLOAD_URL } from '../utils/i18n';

interface HeaderProps {
  project: GanttProject;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  zoom: ZoomLevel;
  onZoomChange: (z: ZoomLevel) => void;
  onGoToday: () => void;
  onOpenExport: () => void;
  onOpenPresentation: () => void;
  onOpenShortcuts?: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onBackToHome: () => void;
  onUpdateProjectTitle?: (newTitle: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  lang,
  onLanguageChange,
  zoom,
  onZoomChange,
  onGoToday,
  onOpenExport,
  onOpenPresentation,
  onOpenShortcuts,
  isSidebarOpen,
  onToggleSidebar,
  onBackToHome,
  onUpdateProjectTitle,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);

  useEffect(() => {
    setTitleInput(project.title);
  }, [project.title]);

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== project.title) {
      onUpdateProjectTitle?.(trimmed);
    } else {
      setTitleInput(project.title);
    }
    setIsEditingTitle(false);
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('code', project.code);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languages: { code: Language; label: string; tooltip: string }[] = [
    { code: 'fr', label: '🥐', tooltip: 'Français (Croissant)' },
    { code: 'de', label: '🥨', tooltip: 'Deutsch (Brezel)' },
    { code: 'it', label: '🍕', tooltip: 'Italiano (Pizza)' },
    { code: 'en', label: '🫖', tooltip: 'English (Tea)' },
  ];

  return (
    <header className="no-print h-14 bg-[#0d1322] border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30">
      {/* Zone 1: Brand & Project info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-800/60"
          title={t.backToHome}
        >
          <ChevronLeft className="w-4 h-4" />
          <img 
            src="/icon.png" 
            alt="GanttForStudent" 
            className="w-5 h-5 rounded object-contain bg-slate-800/60 p-0.5 border border-slate-700/50 hidden sm:inline-block" 
          />
          <span className="hidden sm:inline">{t.backToHome}</span>
        </button>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTitle();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setTitleInput(project.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="px-2 py-0.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 border border-indigo-500 rounded-md focus:outline-none min-w-[140px] sm:min-w-[200px]"
                placeholder="Nom du projet"
              />
              <button
                type="submit"
                className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                title="Valider le nom du projet"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group/title flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-lg hover:bg-slate-800/80 transition-colors text-left truncate cursor-pointer"
              title="Cliquer pour modifier le nom du projet (le code reste inchangé)"
            >
              <span className="font-semibold text-slate-100 text-sm tracking-tight truncate max-w-[180px] sm:max-w-[280px]">
                {project.title || t.appName}
              </span>
              <Pencil className="w-3 h-3 text-slate-500 group-hover/title:text-indigo-400 opacity-60 group-hover/title:opacity-100 shrink-0 transition-opacity" />
            </button>
          )}

          {/* Code badge (Read-only, click to copy share link) */}
          <button
            onClick={handleCopyLink}
            className="group flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-indigo-950/60 border border-slate-700/60 hover:border-indigo-500/40 text-[11px] font-mono text-indigo-300 transition-all shrink-0 cursor-pointer"
            title="Code unique (non modifiable) · Cliquer pour copier le lien"
          >
            <span>{project.code}</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Share2 className="w-3 h-3 text-slate-400 group-hover:text-indigo-300" />
            )}
          </button>
        </div>
      </div>

      {/* Zone 2: Viewport & Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isSidebarOpen 
              ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700' 
              : 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title={t.sidebarToggle}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        <button
          onClick={onGoToday}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden md:inline">{t.today}</span>
        </button>

        {/* Zoom segmented control */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => onZoomChange('days')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              zoom === 'days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.zoomDays}
          </button>
          <button
            onClick={() => onZoomChange('weeks')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              zoom === 'weeks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.zoomWeeks}
          </button>
          <button
            onClick={() => onZoomChange('months')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              zoom === 'months'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.zoomMonths}
          </button>
        </div>
      </div>

      {/* Zone 3: Shortcuts, Export & Languages */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Raccourcis clavier (Touche ?)"
          >
            <Keyboard className="w-4 h-4 text-indigo-400" />
          </button>
        )}

        <button
          onClick={onOpenPresentation}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-xs font-medium text-slate-200 transition-all hover:text-white cursor-pointer"
          title="Mode Présentation (Touche P)"
        >
          <Presentation className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">{t.presentationMode}</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer"
          title="Exporter le projet en image PNG, JSON ou imprimer (Touche E)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t.exportPresentation}</span>
          <span className="md:hidden">Export</span>
        </button>

        <a
          href={WINDOWS_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-400 text-xs font-medium text-blue-300 hover:text-white transition-all cursor-pointer"
          title={t.downloadWindows}
        >
          <svg className="w-3.5 h-3.5 fill-current text-blue-400" viewBox="0 0 24 24">
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.95-1.8" />
          </svg>
          <span className="hidden xl:inline">{t.windowsApp}</span>
        </a>

        {/* Cliché Language selector with food emojis */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs font-medium text-slate-300">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => onLanguageChange(l.code)}
              title={l.tooltip}
              className={`px-1.5 py-1 rounded transition-colors text-sm cursor-pointer ${
                lang === l.code ? 'bg-indigo-600 text-white shadow-xs' : 'hover:bg-slate-800'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
