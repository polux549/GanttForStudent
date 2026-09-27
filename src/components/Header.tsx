import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Share2, 
  Download, 
  ChevronLeft, 
  PanelLeftClose, 
  PanelLeft, 
  Check, 
  Presentation, 
  Pencil, 
  Keyboard, 
  Users, 
  Undo2, 
  Redo2, 
  Bell, 
  Lock,
  BarChart2,
  ListFilter
} from 'lucide-react';
import { GanttProject, Language, ZoomLevel } from '../types/gantt';
import { translations } from '../utils/i18n';
import { Collaborator } from '../utils/realtimeSync';

interface HeaderProps {
  project: GanttProject;
  lang: Language;
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
  isFilterOpen?: boolean;
  onToggleFilter?: () => void;
  activeFilterCount?: number;
  onBackToHome: () => void;
  onUpdateProjectTitle?: (newTitle: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isReadOnly?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  lang,
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
  isFilterOpen = true,
  onToggleFilter,
  activeFilterCount = 0,
  onBackToHome,
  onUpdateProjectTitle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isReadOnly = false,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
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

  return (
    <header className="no-print h-14 bg-[#08080a] border-b border-zinc-800/80 px-2 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2.5 select-none shrink-0 z-30 overflow-hidden w-full">
      {/* Zone 1: Brand & Project info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors py-1.5 px-2 rounded-lg hover:bg-zinc-850/60 shrink-0 cursor-pointer"
          title={t.backToHome}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <img 
            src="./icon.png" 
            alt="GanttForStudent" 
            className="w-5 h-5 rounded object-contain bg-zinc-900 p-0.5 border border-zinc-800 hidden sm:inline-block shrink-0" 
          />
          <span className="hidden md:inline">{t.backToHome}</span>
        </button>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block shrink-0" />

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
                className="px-2 py-0.5 text-xs sm:text-sm font-semibold text-white bg-zinc-950 border border-indigo-500 rounded-md focus:outline-none min-w-[130px] sm:min-w-[190px]"
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
              title="Cliquer pour modifier le nom du projet"
            >
              <span className="font-semibold text-zinc-100 text-xs sm:text-sm tracking-tight truncate max-w-[120px] sm:max-w-[190px] lg:max-w-[240px]">
                {project.title || t.appName}
              </span>
              <Pencil className="w-3 h-3 text-zinc-500 group-hover/title:text-indigo-400 opacity-60 group-hover/title:opacity-100 shrink-0 transition-opacity" />
            </button>
          )}

          {/* Read-Only Badge */}
          {isReadOnly && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[11px] font-medium shrink-0"
              title="Mode Consultation (Lecture seule)"
            >
              <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="hidden sm:inline">Lecture seule</span>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Viewport, Undo/Redo & Zoom Controls (Semaines, Mois, Années) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            isSidebarOpen 
              ? 'bg-zinc-850 border-zinc-700 text-zinc-200 hover:bg-zinc-800' 
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
          title={t.sidebarToggle}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Toggle Filter Bar */}
        {onToggleFilter && (
          <button
            onClick={onToggleFilter}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 relative ${
              isFilterOpen 
                ? 'bg-zinc-850 border-zinc-700 text-indigo-400 hover:bg-zinc-800' 
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
            title={isFilterOpen ? "Masquer la barre de filtres" : "Afficher la barre de filtres"}
          >
            <ListFilter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-zinc-950" />
            )}
          </button>
        )}

        {/* Undo / Redo */}
        {!isReadOnly && onUndo && onRedo && (
          <div className="hidden sm:flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 shrink-0">
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

        {/* Today */}
        <button
          onClick={onGoToday}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors shadow-xs shrink-0 cursor-pointer"
          title="Centrer la vue sur aujourd'hui"
        >
          <Calendar className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden md:inline">{t.today}</span>
        </button>

        {/* Zoom segmented control: Semaines, Mois, Années */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs shrink-0">
          <button
            onClick={() => onZoomChange('weeks')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              zoom === 'weeks'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Échelle Semaines (7 jours par colonne)"
          >
            {t.zoomWeeks}
          </button>
          <button
            onClick={() => onZoomChange('months')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              zoom === 'months'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Échelle Mois (vue mensuelle globale)"
          >
            {t.zoomMonths}
          </button>
          <button
            onClick={() => onZoomChange('years')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              zoom === 'years'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Échelle Année (vue pluriannuelle complète)"
          >
            {t.zoomYears}
          </button>
        </div>
      </div>

      {/* Zone 3: Cloche, Charges, Collaboration, Raccourcis, Présentation & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Desktop notification bell */}
        <button
          onClick={handleCheckNotifications}
          className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shadow-xs shrink-0"
          title="Rappels de jalons & notifications d'échéances"
        >
          <Bell className="w-4 h-4 text-zinc-400" />
        </button>

        {/* Boutons Charge et Collaborer l'un à côté de l'autre à droite de la cloche */}
        {onOpenWorkload && (
          <button
            onClick={onOpenWorkload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-xs shrink-0"
            title="Gestion des charges de travail de l'équipe"
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Charge</span>
          </button>
        )}

        {onOpenCollaboration && (
          <button
            onClick={onOpenCollaboration}
            className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-xs shrink-0 ${
              connectionStatus === 'connected'
                ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={`Collaboration en direct · Code unique: ${project.code} (Cliquer pour ouvrir)`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
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
            <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline font-semibold">
              {t.collabHeaderButton}
            </span>
            <span className="font-mono text-[11px] font-bold text-indigo-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 group-hover:border-zinc-700 tracking-wider shrink-0">
              {project.code}
            </span>
            {collaboratorCount > 1 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {collaboratorCount}
              </span>
            )}
          </button>
        )}

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors cursor-pointer shrink-0 hidden sm:block"
            title="Raccourcis clavier (Touche ?)"
          >
            <Keyboard className="w-4 h-4 text-indigo-400" />
          </button>
        )}

        {/* Bouton Mode Présentation - Logo seul */}
        <button
          onClick={onOpenPresentation}
          className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-xs shrink-0"
          title="Mode Présentation plein écran (Touche P)"
        >
          <Presentation className="w-4 h-4 text-indigo-400" />
        </button>

        {/* Bouton Exportation - Logo seul */}
        <button
          onClick={onOpenExport}
          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs hover:shadow-indigo-500/20 cursor-pointer shrink-0"
          title="Exporter le projet (PDF, PNG, JSON - Touche E)"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
