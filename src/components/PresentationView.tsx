import React, { useRef, useState } from 'react';
import { 
  X, 
  Flag, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Presentation, 
  Maximize2, 
  Minimize2,
  Share2,
  Download,
  PanelLeft,
  PanelLeftClose,
  FolderPlus
} from 'lucide-react';
import { GanttProject, Language, ZoomLevel } from '../types/gantt';
import { translations } from '../utils/i18n';
import { GanttChart } from './GanttChart';
import { formatReadableDate } from '../utils/dates';
import { exportGanttAsPng } from '../utils/canvasExport';
import { getOrganizedItems } from '../utils/ganttEngine';

interface PresentationViewProps {
  project: GanttProject;
  lang: Language;
  zoom: ZoomLevel;
  onZoomChange: (z: ZoomLevel) => void;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  project,
  lang,
  zoom,
  onZoomChange,
  onClose,
  theme = 'dark',
}) => {
  const t = translations[lang];
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const taskListScrollRef = useRef<HTMLDivElement>(null);
  const [showTaskList, setShowTaskList] = useState(true);

  // Compute presentation statistics
  const totalTasks = project.items.filter((i) => i.type === 'task').length;
  const totalGroups = project.items.filter((i) => i.type === 'group').length;
  const totalMilestones = project.items.filter((i) => i.type === 'milestone').length;

  const totalProgress = project.items.length > 0
    ? Math.round(
        project.items.reduce((acc, curr) => acc + (curr.progress || 0), 0) /
        project.items.length
      )
    : 0;

  const organized = getOrganizedItems(project.items);

  // Synchronized scrolling between left list and Gantt chart
  const handleTaskListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (chartScrollRef.current) {
      chartScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleChartScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (taskListScrollRef.current) {
      taskListScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col select-none overflow-hidden transition-colors ${
      theme === 'light'
        ? 'bg-[#f8fafc] text-slate-800 theme-light'
        : 'bg-[#040406] text-zinc-100'
    }`}>
      {/* Presentation Top Banner */}
      <div className={`h-16 px-6 border-b flex items-center justify-between gap-4 shrink-0 shadow-xs transition-colors ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#08080a] border-zinc-800 text-zinc-100 shadow-xl'
      }`}>
        {/* Left: Project title & Code & Toggle Sidebar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTaskList(!showTaskList)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              theme === 'light'
                ? showTaskList 
                  ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' 
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                : showTaskList 
                  ? 'bg-zinc-850 border-zinc-700 text-zinc-200 hover:bg-zinc-800' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={showTaskList ? "Masquer la liste des tâches" : "Afficher la liste des tâches"}
          >
            {showTaskList ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          <div className={`p-2 rounded-xl border ${
            theme === 'light'
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-base font-bold tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              {project.title || project.code}
            </h1>
            <div className={`flex items-center gap-2 text-[11px] font-mono ${
              theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
            }`}>
              <span className={`font-bold ${
                theme === 'light' ? 'text-blue-700' : 'text-indigo-400'
              }`}>{project.code}</span>
              <span>·</span>
              <span>Mode Présentation</span>
            </div>
          </div>
        </div>

        {/* Center: Key Project Stats for defense */}
        <div className={`hidden md:flex items-center gap-6 px-4 py-1.5 rounded-xl border text-xs ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-zinc-950 border-zinc-800 text-zinc-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className={theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}>{t.statsTasks}:</span>
            <span className={`font-bold font-mono ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>{totalTasks}</span>
          </div>

          <div className={`h-3 w-px ${theme === 'light' ? 'bg-slate-300' : 'bg-zinc-800'}`} />

          <div className="flex items-center gap-2">
            <span className="text-amber-600 flex items-center gap-1 font-semibold">
              <Flag className="w-3.5 h-3.5" />
              <span>{t.statsMilestones}:</span>
            </span>
            <span className={`font-bold font-mono ${
              theme === 'light' ? 'text-amber-700' : 'text-amber-200'
            }`}>{totalMilestones}</span>
          </div>

          <div className={`h-3 w-px ${theme === 'light' ? 'bg-slate-300' : 'bg-zinc-800'}`} />

          <div className="flex items-center gap-2">
            <span className={theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}>{t.statsCompletion}:</span>
            <span className="font-bold text-emerald-600 font-mono">{totalProgress}%</span>
            <div className={`w-16 h-1.5 rounded-full overflow-hidden ${
              theme === 'light' ? 'bg-slate-200' : 'bg-zinc-800'
            }`}>
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Zoom controls, PNG Download & Exit */}
        <div className="flex items-center gap-3">
          {/* Zoom switcher */}
          <div className={`flex items-center p-0.5 rounded-lg border text-xs ${
            theme === 'light'
              ? 'bg-slate-200/70 border-slate-300'
              : 'bg-zinc-950 border-zinc-800'
          }`}>
            <button
              onClick={() => onZoomChange('weeks')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                zoom === 'weeks'
                  ? theme === 'light'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-indigo-600 text-white font-semibold'
                  : theme === 'light'
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.zoomWeeks}
            </button>
            <button
              onClick={() => onZoomChange('months')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                zoom === 'months'
                  ? theme === 'light'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-indigo-600 text-white font-semibold'
                  : theme === 'light'
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.zoomMonths}
            </button>
            <button
              onClick={() => onZoomChange('years')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                zoom === 'years'
                  ? theme === 'light'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-indigo-600 text-white font-semibold'
                  : theme === 'light'
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.zoomYears}
            </button>
          </div>

          <button
            onClick={() => exportGanttAsPng(project, lang, zoom)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
            title="Télécharger l'image PNG haute résolution pour vos diapositives"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Télécharger PNG</span>
          </button>

          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
            }`}
          >
            <X className="w-4 h-4" />
            <span>{t.exitPresentation}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Optional Left Task Names Column + Right Gantt Chart */}
      <div className="flex-1 flex overflow-hidden">
        {showTaskList && (
          <div 
            ref={taskListScrollRef}
            onScroll={handleTaskListScroll}
            className={`w-64 sm:w-72 border-r flex flex-col shrink-0 overflow-y-auto overflow-x-hidden transition-colors ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-[#08080a] border-zinc-800/80 text-zinc-200'
            }`}
          >
            {/* Header of the Task List matching Gantt header height */}
            <div className={`sticky top-0 z-20 h-16 border-b flex items-center px-4 font-bold text-xs shrink-0 transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                : 'bg-[#0a0a0d] border-zinc-800 text-zinc-200'
            }`}>
              <span>Éléments du projet ({organized.length})</span>
            </div>

            {/* Rows matching rowHeight={48} */}
            <div className="divide-y divide-slate-100 dark:divide-zinc-900/60">
              {organized.map(({ item, level }) => {
                const isGroup = item.type === 'group';
                const isMilestone = item.type === 'milestone';

                return (
                  <div
                    key={item.id}
                    style={{ height: '48px', paddingLeft: `${Math.max(12, level * 16 + 12)}px` }}
                    className={`flex items-center gap-2 pr-3 text-xs transition-colors shrink-0 ${
                      isGroup
                        ? theme === 'light'
                          ? 'bg-slate-100/60 font-bold text-slate-900'
                          : 'bg-[#0a0a0d]/80 font-bold text-zinc-100'
                        : theme === 'light'
                        ? 'hover:bg-slate-50 text-slate-800'
                        : 'hover:bg-white/[0.02] text-zinc-200'
                    }`}
                  >
                    {isGroup ? (
                      <FolderPlus className={`w-3.5 h-3.5 shrink-0 ${theme === 'light' ? 'text-blue-600' : 'text-indigo-400'}`} />
                    ) : isMilestone ? (
                      <Flag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                        style={{ backgroundColor: item.color || '#3b82f6' }}
                      />
                    )}

                    <span className="truncate flex-1 font-medium">{item.name}</span>

                    <span className={`text-[10px] font-mono shrink-0 ${
                      theme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                    }`}>
                      {item.progress}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Full-Width Gantt Chart */}
        <div className="flex-1 flex overflow-hidden">
          <GanttChart
            items={project.items}
            lang={lang}
            zoom={zoom}
            selectedItemId={null}
            onSelectItem={() => {}}
            onEditItem={() => {}}
            onQuickCreateAtDate={() => {}}
            onUpdateItemDates={() => {}}
            rowHeight={48}
            scrollRef={chartScrollRef}
            onScroll={handleChartScroll}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
};
