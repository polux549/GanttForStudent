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
    <div className="fixed inset-0 z-50 bg-[#040406] text-zinc-100 flex flex-col select-none overflow-hidden">
      {/* Presentation Top Banner */}
      <div className="h-16 px-6 bg-[#08080a] border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0 shadow-xl">
        {/* Left: Project title & Code */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {project.title || project.code}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span className="text-indigo-400 font-bold">{project.code}</span>
              <span>·</span>
              <span>Gantt For Student</span>
            </div>
          </div>
        </div>

        {/* Center: Key Project Stats for defense */}
        <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">{t.statsTasks}:</span>
            <span className="font-bold text-white font-mono">{totalTasks}</span>
          </div>

          <div className="h-3 w-px bg-zinc-800" />

          <div className="flex items-center gap-2">
            <span className="text-amber-400 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5" />
              <span>{t.statsMilestones}:</span>
            </span>
            <span className="font-bold text-amber-200 font-mono">{totalMilestones}</span>
          </div>

          <div className="h-3 w-px bg-zinc-800" />

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">{t.statsCompletion}:</span>
            <span className="font-bold text-emerald-400 font-mono">{totalProgress}%</span>
            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
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
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => onZoomChange('weeks')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                zoom === 'weeks' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.zoomWeeks}
            </button>
            <button
              onClick={() => onZoomChange('months')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                zoom === 'months' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.zoomMonths}
            </button>
            <button
              onClick={() => onZoomChange('years')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                zoom === 'years' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.zoomYears}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-zinc-400" />
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
