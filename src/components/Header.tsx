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
  Keyboard,
  Users,
  Radio,
  Undo2,
  Redo2,
  Flame,
  Bell,
  Lock
} from 'lucide-react';
import { GanttProject, Language, ZoomLevel } from '../types/gantt';
import { translations } from '../utils/i18n';
import { Collaborator } from '../utils/realtimeSync';

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
  onOpenCollaboration?: () => void;
  onOpenWorkload?: () => void;
  collaboratorCount?: number;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
  collaborators?: Collaborator[];
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onBackToHome: () => void;
  onUpdateProjectTitle?: (newTitle: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  showCriticalPath?: boolean;
  onToggleCriticalPath?: () => void;
  isReadOnly?: boolean;
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
  onOpenCollaboration,
  onOpenWorkload,
  collaboratorCount = 1,
  connectionStatus = 'disconnected',
  collaborators = [],
  isSidebarOpen,
  onToggleSidebar,
  onBackToHome,
  onUpdateProjectTitle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  showCriticalPath = false,
  onToggleCriticalPath,
  isReadOnly = false,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [copiedReadOnly, setCopiedReadOnly] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);

  useEffect(() => {
    setTitleInput(project.title);
  }, [project.title]);

  const handleSaveTitle = () => {
    if (isReadOnly) return;
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
    url.searchParams.delete('readonly');
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyReadOnlyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('code', project.code);
    url.searchParams.set('readonly', 'true');
    navigator.clipboard.writeText(url.toString());
    setCopiedReadOnly(true);
    setTimeout(() => setCopiedReadOnly(false), 2000);
  };

  const handleCheckNotifications = async () => {
    if (!('Notification' in window)) {
      alert("Votre navigateur ne supporte pas les notifications de bureau.");
      return;
    }
    if (Notification.permission !== 'granted') {
      const res = await Notification.requestPermission();
      if (res !== 'granted') {
        alert("Permission refusée pour les notifications.");
        return;
      }
    }

    // Find upcoming milestones or tasks due in <= 3 days
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = project.items.filter((it) => {
      if (it.progress === 100) return false;
      const diff = (new Date(it.endDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 3;
    });

    if (upcoming.length > 0) {
      new Notification("Gantt For Student - Échéance imminente ⏰", {
        body: `${upcoming.length} élément(s) arrive(nt) à échéance d'ici 3 jours (ex: ${upcoming[0].name}).`,
        icon: './icon.png',
      });
    } else {
      new Notification("Gantt For Student - Planning à jour ✅", {
        body: "Aucune échéance critique ou jalon dans les 3 prochains jours. Tout est sous contrôle !",
        icon: './icon.png',
      });
    }
  };

  const languages: { code: Language; label: string; tooltip: string }[] = [
    { code: 'fr', label: '🥐', tooltip: 'Français (Croissant)' },
    { code: 'de', label: '🥨', tooltip: 'Deutsch (Brezel)' },
    { code: 'it', label: '🍕', tooltip: 'Italiano (Pizza)' },
    { code: 'en', label: '🫖', tooltip: 'English (Tea)' },
  ];

  return (
    <header className="no-print h-14 bg-[#08080a] border-b border-zinc-800/80 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30">
      {/* Zone 1: Brand & Project info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors py-1.5 px-2 rounded-lg hover:bg-zinc-850/60"
          title={t.backToHome}
        >
          <ChevronLeft className="w-4 h-4" />
          <img 
            src="./icon.png" 
            alt="GanttForStudent" 
            className="w-5 h-5 rounded object-contain bg-zinc-900 p-0.5 border border-zinc-800 hidden sm:inline-block" 
          />
          <span className="hidden sm:inline">{t.backToHome}</span>
        </button>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

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
                className="px-2 py-0.5 text-xs sm:text-sm font-semibold text-white bg-zinc-950 border border-indigo-500 rounded-md focus:outline-none min-w-[140px] sm:min-w-[200px]"
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
              className="group/title flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-lg hover:bg-zinc-850/80 transition-colors text-left truncate cursor-pointer"
              title="Cliquer pour modifier le nom du projet (le code reste inchangé)"
            >
              <span className="font-semibold text-zinc-100 text-sm tracking-tight truncate max-w-[180px] sm:max-w-[280px]">
                {project.title || t.appName}
              </span>
              <Pencil className="w-3 h-3 text-zinc-500 group-hover/title:text-indigo-400 opacity-60 group-hover/title:opacity-100 shrink-0 transition-opacity" />
            </button>
          )}

          {/* Code badge (Read-only, click to copy share link) */}
          <button
            onClick={handleCopyLink}
            className="group flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-[11px] font-mono text-indigo-300 transition-all shrink-0 cursor-pointer shadow-xs"
            title="Code unique (non modifiable) · Cliquer pour copier le lien"
          >
            <span>{project.code}</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Share2 className="w-3 h-3 text-zinc-400 group-hover:text-indigo-300" />
            )}
          </button>

          {isReadOnly && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium shrink-0">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Lecture seule</span>
            </span>
          )}
        </div>
      </div>

      {/* Zone 2: Viewport, Undo/Redo, Critical Path & Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isSidebarOpen 
              ? 'bg-zinc-850 border-zinc-700 text-zinc-200 hover:bg-zinc-800' 
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
          title={t.sidebarToggle}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Undo / Redo */}
        {!isReadOnly && onUndo && onRedo && (
          <div className="hidden sm:flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Rétablir (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Critical Path Toggle */}
        {onToggleCriticalPath && (
          <button
            onClick={onToggleCriticalPath}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              showCriticalPath
                ? 'bg-red-500/20 border-red-500/60 text-red-300 ring-1 ring-red-500/40'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
            title="Calculer et surligner le chemin critique (tâches qui déterminent la fin du projet)"
          >
            <Flame className={`w-3.5 h-3.5 ${showCriticalPath ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`} />
            <span className="hidden xl:inline">Chemin critique</span>
          </button>
        )}

        {/* Workload */}
        {onOpenWorkload && (
          <button
            onClick={onOpenWorkload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-xs"
            title="Gestion des charges de travail de l'équipe"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">Charges</span>
          </button>
        )}

        <button
          onClick={onGoToday}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden md:inline">{t.today}</span>
        </button>

        {/* Zoom segmented control */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => onZoomChange('days')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              zoom === 'days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.zoomDays}
          </button>
          <button
            onClick={() => onZoomChange('weeks')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              zoom === 'weeks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.zoomWeeks}
          </button>
          <button
            onClick={() => onZoomChange('months')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              zoom === 'months'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.zoomMonths}
          </button>
        </div>
      </div>

      {/* Zone 3: Collaboration, Shortcuts, Export & Languages */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Tutor / Teacher read-only share button */}
        <button
          onClick={handleCopyReadOnlyLink}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors cursor-pointer shadow-xs"
          title="Copier le lien de consultation en lecture seule (pour tuteur ou professeur)"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">{copiedReadOnly ? 'Lien copié !' : 'Partage tuteur'}</span>
        </button>

        {/* Desktop notification bell */}
        <button
          onClick={handleCheckNotifications}
          className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shadow-xs"
          title="Rappels de jalons & notifications d'échéances"
        >
          <Bell className="w-4 h-4 text-zinc-400" />
        </button>
        {onOpenCollaboration && (
          <button
            onClick={onOpenCollaboration}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-xs ${
              connectionStatus === 'connected'
                ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={t.collabHeaderTooltip}
          >
            <span className="relative flex h-2 w-2">
              {connectionStatus === 'connected' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              )}
            </span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-semibold">
              {collaboratorCount > 1 ? `${collaboratorCount} ${t.collabHeaderLive}` : t.collabHeaderButton}
            </span>
            {collaboratorCount > 1 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {collaboratorCount}
              </span>
            )}
          </button>
        )}

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors cursor-pointer"
            title="Raccourcis clavier (Touche ?)"
          >
            <Keyboard className="w-4 h-4 text-indigo-400" />
          </button>
        )}

        <button
          onClick={onOpenPresentation}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-zinc-200 transition-all hover:text-white cursor-pointer shadow-xs"
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

        {/* Language selector */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-300">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => onLanguageChange(l.code)}
              title={l.tooltip}
              className={`px-1.5 py-1 rounded transition-colors text-sm cursor-pointer ${
                lang === l.code ? 'bg-indigo-600 text-white shadow-xs' : 'hover:bg-zinc-850'
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
