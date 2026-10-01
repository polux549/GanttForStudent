import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Share2, 
  Download, 
  ChevronLeft, 
  ChevronDown,
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
  ListFilter,
  Sun,
  Moon,
  Kanban,
  Table2,
  CalendarDays,
  MessageSquare
} from 'lucide-react';
import { GanttProject, Language, ZoomLevel, AppViewMode } from '../types/gantt';
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
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  viewMode?: AppViewMode;
  onViewModeChange?: (view: AppViewMode) => void;
  onOpenComments?: () => void;
  totalCommentsCount?: number;
  onOpenTeamMembers?: () => void;
  teamMembersCount?: number;
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
  onOpenTeamMembers,
  teamMembersCount = 0,
  collaboratorCount = 1,
  connectionStatus = 'disconnected',
  collaborators = [],
  isSidebarOpen,
  onToggleSidebar,
  isFilterOpen = false,
  onToggleFilter,
  activeFilterCount = 0,
  onBackToHome,
  onUpdateProjectTitle,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isReadOnly = false,
  theme = 'dark',
  onToggleTheme,
  viewMode = 'gantt',
  onViewModeChange,
  onOpenComments,
  totalCommentsCount = 0,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  useEffect(() => {
    setTitleInput(project.title);
  }, [project.title]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.view-dropdown-container')) {
        setIsViewDropdownOpen(false);
      }
    };
    if (isViewDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isViewDropdownOpen]);

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
    <header className={`no-print relative z-40 h-14 px-2 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2.5 select-none shrink-0 overflow-visible w-full border-b transition-colors ${
      theme === 'light'
        ? 'bg-white border-slate-200 text-slate-800 shadow-2xs'
        : 'bg-[#08080a] border-zinc-800/80 text-zinc-100'
    }`}>
      {/* Zone 1: Brand & Project info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
        <button
          onClick={onBackToHome}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors py-1.5 px-2 rounded-lg shrink-0 cursor-pointer ${
            theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/60'
          }`}
          title={t.backToHome}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <img 
            src="./icon.png" 
            alt="GanttForStudent" 
            className={`w-5 h-5 rounded object-contain p-0.5 border hidden sm:inline-block shrink-0 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'
            }`} 
          />
          <span className="hidden md:inline">{t.backToHome}</span>
        </button>

        <div className={`h-4 w-px hidden sm:block shrink-0 ${
          theme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'
        }`} />

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
                className={`px-2 py-0.5 text-xs sm:text-sm font-semibold rounded-md focus:outline-none min-w-[130px] sm:min-w-[190px] border ${
                  theme === 'light'
                    ? 'text-slate-900 bg-white border-indigo-500 shadow-inner'
                    : 'text-white bg-zinc-950 border-indigo-500'
                }`}
                placeholder="Nom du projet"
              />
              <button
                type="submit"
                className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-xs"
                title="Valider le nom du projet"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className={`group/title flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-lg transition-colors text-left truncate cursor-pointer ${
                theme === 'light' ? 'hover:bg-slate-100 text-slate-900' : 'hover:bg-zinc-850/80 text-zinc-100'
              }`}
              title="Cliquer pour modifier le nom du projet"
            >
              <span className={`font-semibold text-xs sm:text-sm tracking-tight truncate max-w-[120px] sm:max-w-[190px] lg:max-w-[240px] ${
                theme === 'light' ? 'text-slate-900' : 'text-zinc-100'
              }`}>
                {project.title || t.appName}
              </span>
              <Pencil className="w-3 h-3 text-slate-400 group-hover/title:text-indigo-500 opacity-60 group-hover/title:opacity-100 shrink-0 transition-opacity" />
            </button>
          )}

          {/* Read-Only Badge */}
          {isReadOnly && (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium shrink-0 ${
                theme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300'
              }`}
              title={t.readOnlyTooltip}
            >
              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="hidden sm:inline">{t.readOnlyBadge}</span>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Multi-Window Switcher, Viewport & Zoom Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Multi-Window View Mode Dropdown */}
        {onViewModeChange && (
          <div className="relative view-dropdown-container">
            <button
              onClick={() => setIsViewDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-750 text-zinc-100'
              }`}
              title={t.viewSwitcherTooltip}
            >
              {viewMode === 'gantt' && <BarChart2 className="w-3.5 h-3.5 rotate-90 text-blue-500 shrink-0" />}
              {viewMode === 'kanban' && <Kanban className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              {viewMode === 'list' && <Table2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              {viewMode === 'calendar' && <CalendarDays className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              <span>
                {viewMode === 'gantt' ? t.viewGantt : viewMode === 'kanban' ? t.viewKanban : viewMode === 'list' ? t.viewList : t.viewCalendar}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isViewDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isViewDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1.5 w-44 rounded-xl border shadow-xl z-50 p-1.5 animate-in fade-in-50 zoom-in-95 duration-100 ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-[#0f0f14] border-zinc-800 text-zinc-200'
              }`}>
                <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-400' : 'text-zinc-500'
                }`}>
                  Vues du projet
                </div>

                <button
                  onClick={() => {
                    onViewModeChange('gantt');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    viewMode === 'gantt'
                      ? theme === 'light' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-indigo-950/60 text-indigo-300 font-bold'
                      : theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-zinc-850 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-3.5 h-3.5 rotate-90 text-blue-500" />
                    <span>{t.viewGantt}</span>
                  </div>
                  {viewMode === 'gantt' && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </button>

                <button
                  onClick={() => {
                    onViewModeChange('kanban');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    viewMode === 'kanban'
                      ? theme === 'light' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-indigo-950/60 text-indigo-300 font-bold'
                      : theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-zinc-850 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Kanban className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t.viewKanban}</span>
                  </div>
                  {viewMode === 'kanban' && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </button>

                <button
                  onClick={() => {
                    onViewModeChange('list');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    viewMode === 'list'
                      ? theme === 'light' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-indigo-950/60 text-indigo-300 font-bold'
                      : theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-zinc-850 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Table2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t.viewList}</span>
                  </div>
                  {viewMode === 'list' && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </button>

                <button
                  onClick={() => {
                    onViewModeChange('calendar');
                    setIsViewDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    viewMode === 'calendar'
                      ? theme === 'light' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-indigo-950/60 text-indigo-300 font-bold'
                      : theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-zinc-850 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t.viewCalendar}</span>
                  </div>
                  {viewMode === 'calendar' && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Toggle Left Sidebar (Only in Gantt view) */}
        {viewMode === 'gantt' && (
          <button
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              theme === 'light'
                ? isSidebarOpen 
                  ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                : isSidebarOpen 
                  ? 'bg-zinc-850 border-zinc-700 text-zinc-200 hover:bg-zinc-800' 
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
            title={t.sidebarToggle}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        )}

        {/* Toggle Filter Bar */}
        {onToggleFilter && (
          <button
            onClick={onToggleFilter}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 relative ${
              theme === 'light'
                ? isFilterOpen 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                : isFilterOpen 
                  ? 'bg-zinc-850 border-zinc-700 text-indigo-400 hover:bg-zinc-800' 
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
            title={isFilterOpen ? t.filterToggleHide : t.filterToggleShow}
          >
            <ListFilter className={`w-4 h-4 ${isFilterOpen ? 'text-white' : ''}`} />
            {activeFilterCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ${
                theme === 'light' ? 'bg-amber-500 ring-white' : 'bg-indigo-500 ring-zinc-900'
              }`} />
            )}
          </button>
        )}

        {/* Undo / Redo */}
        {!isReadOnly && onUndo && onRedo && (
          <div className={`hidden sm:flex items-center p-0.5 rounded-lg border shrink-0 ${
            theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
          }`}>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded transition-colors cursor-pointer disabled:cursor-not-allowed ${
                theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600'
                  : 'text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400'
              }`}
              title={t.undoTooltip}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded transition-colors cursor-pointer disabled:cursor-not-allowed ${
                theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600'
                  : 'text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400'
              }`}
              title={t.redoTooltip}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Today (Useful in Gantt and Calendar) */}
        {(viewMode === 'gantt' || viewMode === 'calendar') && (
          <button
            onClick={onGoToday}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-xs shrink-0 cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
                : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 text-zinc-200'
            }`}
            title={t.centerTodayTooltip}
          >
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline">{t.today}</span>
          </button>
        )}

        {/* Zoom segmented control: Semaines, Mois, Années (Only in Gantt view) */}
        {viewMode === 'gantt' && (
          <div className={`hidden md:flex items-center p-0.5 rounded-lg border text-xs shrink-0 ${
            theme === 'light' ? 'bg-slate-200/60 border-slate-300/60' : 'bg-zinc-950 border-zinc-800'
          }`}>
            <button
              onClick={() => onZoomChange('weeks')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                zoom === 'weeks'
                  ? theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80'
                    : 'bg-zinc-800 text-white shadow-xs font-semibold border border-zinc-700'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
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
                  ? theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80'
                    : 'bg-zinc-800 text-white shadow-xs font-semibold border border-zinc-700'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
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
                  ? theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80'
                    : 'bg-zinc-800 text-white shadow-xs font-semibold border border-zinc-700'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Échelle Année (vue pluriannuelle complète)"
            >
              {t.zoomYears}
            </button>
          </div>
        )}
      </div>

      {/* Zone 3: Cloche, Charges, Collaboration, Raccourcis, Présentation & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Notification bell - Opens project comments list */}
        <button
          onClick={onOpenComments || handleCheckNotifications}
          className={`relative p-1.5 rounded-lg border transition-colors cursor-pointer shadow-xs shrink-0 ${
            theme === 'light'
              ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-600 hover:text-slate-900'
              : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
          title={t.commentsModalTitle}
        >
          <Bell className="w-4 h-4 text-slate-400" />
          {totalCommentsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
              {totalCommentsCount > 99 ? '99+' : totalCommentsCount}
            </span>
          )}
        </button>

        {/* Bouton Équipe / Responsables */}
        {onOpenTeamMembers && (
          <button
            onClick={onOpenTeamMembers}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer shadow-xs shrink-0 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900'
                : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Gérer l'équipe et les responsables du projet (définir les membres en une seule fois)"
          >
            <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="hidden sm:inline">Équipe</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono border ${
              theme === 'light'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
            }`}>
              {teamMembersCount}
            </span>
          </button>
        )}

        {/* Boutons Charge et Collaborer l'un à côté de l'autre à droite de la cloche */}
        {onOpenWorkload && (
          <button
            onClick={onOpenWorkload}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer shadow-xs shrink-0 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900'
                : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title={t.workloadTooltip}
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="hidden sm:inline">{t.workloadButton}</span>
          </button>
        )}

        {onOpenCollaboration && (
          <button
            onClick={onOpenCollaboration}
            className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-xs shrink-0 ${
              theme === 'light'
                ? connectionStatus === 'connected'
                  ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200/80'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                : connectionStatus === 'connected'
                  ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={`Collaboration · Code: ${project.code}`}
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
            <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="hidden sm:inline font-semibold">
              {t.collabHeaderButton}
            </span>
            <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border tracking-wider shrink-0 ${
              theme === 'light'
                ? 'text-indigo-700 bg-white border-slate-200 shadow-2xs'
                : 'text-indigo-300 bg-zinc-950 border-zinc-800 group-hover:border-zinc-700'
            }`}>
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
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 hidden sm:block ${
              theme === 'light'
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
            title={t.shortcutsTooltip}
          >
            <Keyboard className="w-4 h-4 text-indigo-500" />
          </button>
        )}

        {/* Bouton Mode Présentation - Logo seul */}
        <button
          onClick={onOpenPresentation}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-xs shrink-0 ${
            theme === 'light'
              ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900'
              : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
          }`}
          title={t.presentationButtonTooltip}
        >
          <Presentation className="w-4 h-4 text-indigo-500" />
        </button>

        {/* Bouton Thème Blanc / Sombre */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-xs shrink-0 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900'
                : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title={theme === 'light' ? t.themeDark : t.themeLight}
            aria-label={theme === 'light' ? t.themeDark : t.themeLight}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        )}

        {/* Bouton Exportation - Logo seul */}
        <button
          onClick={onOpenExport}
          className={`p-1.5 rounded-lg text-white transition-all shadow-xs cursor-pointer shrink-0 ${
            theme === 'light'
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20'
          }`}
          title={t.exportButtonTooltip}
        >
          <Download className="w-4 h-4 text-white" />
        </button>
      </div>
    </header>
  );
};
