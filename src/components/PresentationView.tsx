import React, { useRef } from 'react';
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
  Download
} from 'lucide-react';
import { GanttProject, Language, ZoomLevel } from '../types/gantt';
import { translations } from '../utils/i18n';
import { GanttChart } from './GanttChart';
import { formatReadableDate } from '../utils/dates';
import { exportGanttAsPng } from '../utils/canvasExport';

interface PresentationViewProps {
  project: GanttProject;
  lang: Language;
  zoom: ZoomLevel;
  onZoomChange: (z: ZoomLevel) => void;
  onClose: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  project,
  lang,
  zoom,
  onZoomChange,
  onClose,
}) => {
  const t = translations[lang];
  const chartScrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 bg-[#080d1a] text-slate-100 flex flex-col select-none overflow-hidden">
      {/* Presentation Top Banner */}
      <div className="h-16 px-6 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-lg">
        {/* Left: Project title & Code */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {project.title || project.code}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="text-indigo-400 font-bold">{project.code}</span>
              <span>·</span>
              <span>Gantt For Student</span>
            </div>
          </div>
        </div>

        {/* Center: Key Project Stats for defense */}
        <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{t.statsTasks}:</span>
            <span className="font-bold text-white font-mono">{totalTasks}</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="text-amber-400 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5" />
              <span>{t.statsMilestones}:</span>
            </span>
            <span className="font-bold text-amber-200 font-mono">{totalMilestones}</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400">{t.statsCompletion}:</span>
            <span className="font-bold text-emerald-400 font-mono">{totalProgress}%</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Zoom controls & Exit */}
        <div className="flex items-center gap-3">
          {/* Zoom */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onZoomChange('days')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                zoom === 'days' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.zoomDays}
            </button>
            <button
              onClick={() => onZoomChange('weeks')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                zoom === 'weeks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.zoomWeeks}
            </button>
            <button
              onClick={() => onZoomChange('months')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                zoom === 'months' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.zoomMonths}
            </button>
          </div>

          <button
            onClick={() => exportGanttAsPng(project, lang, zoom)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Télécharger l'image PNG haute résolution pour vos diapositives"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger PNG</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>{t.exitPresentation}</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Gantt Chart */}
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
        />
      </div>
    </div>
  );
};
