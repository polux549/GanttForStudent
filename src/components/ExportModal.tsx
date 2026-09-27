import React, { useState } from 'react';
import { 
  X, 
  Image, 
  Printer, 
  FileJson, 
  Upload, 
  Presentation, 
  Check, 
  Sparkles, 
  Download,
  AlertCircle,
  FileText,
  Calendar,
  Award
} from 'lucide-react';
import { GanttProject, Language, ZoomLevel } from '../types/gantt';
import { translations, WINDOWS_DOWNLOAD_URL } from '../utils/i18n';
import { exportGanttAsPng, exportGanttAsPdf } from '../utils/canvasExport';
import { exportOnePagerPdf } from '../utils/onePagerExport';
import { exportProjectAsIcs } from '../utils/calendarExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GanttProject;
  lang: Language;
  zoom?: ZoomLevel;
  onEnterPresentationMode: () => void;
  onImportProject: (imported: GanttProject) => void;
  chartContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  lang,
  zoom = 'weeks',
  onEnterPresentationMode,
  onImportProject,
}) => {
  const t = translations[lang];
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState<'a4' | 'a3' | null>(null);
  const [isExportingOnePager, setIsExportingOnePager] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [exportZoom, setExportZoom] = useState<ZoomLevel>(zoom);

  // Sync exportZoom with workspace zoom when opened
  React.useEffect(() => {
    setExportZoom(zoom);
  }, [zoom, isOpen]);

  if (!isOpen) return null;

  // Export Executive One-Pager (A4 Portrait PDF for defense / jury)
  const handleExportOnePager = async () => {
    try {
      setIsExportingOnePager(true);
      await exportOnePagerPdf(project, lang);
      setExportSuccess('ONE-PAGER');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('One-Pager export failed', err);
      alert("Une erreur s'est produite lors de la génération de la fiche de synthèse.");
    } finally {
      setIsExportingOnePager(false);
    }
  };

  // Export Calendar (.ics file for Google Calendar, Apple Calendar, Outlook)
  const handleExportIcs = () => {
    try {
      exportProjectAsIcs(project);
      setExportSuccess('ICS');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('ICS export failed', err);
      alert("Une erreur s'est produite lors de la génération du fichier calendrier.");
    }
  };

  // Direct export PDF A4 or A3 Landscape
  const handleExportPdf = async (format: 'a4' | 'a3') => {
    try {
      setIsExportingPdf(format);
      await exportGanttAsPdf(project, lang, format, exportZoom);
      setExportSuccess(`PDF-${format.toUpperCase()}`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('PDF export failed', err);
      alert("Une erreur s'est produite lors de la génération du document PDF.");
    } finally {
      setIsExportingPdf(null);
    }
  };

  // Export high resolution PNG for PowerPoint / Keynote / Slides
  const handleExportPng = async () => {
    try {
      setIsExportingPng(true);
      await exportGanttAsPng(project, lang, exportZoom);
      setExportSuccess('PNG');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('PNG export failed', err);
      // Fallback message
      alert("Une erreur s'est produite lors de la génération de l'image.");
    } finally {
      setIsExportingPng(false);
    }
  };

  // Export PDF via clean browser print dialog
  const handlePrintPdf = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Gantt_${project.code}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess('JSON');
    setTimeout(() => setExportSuccess(null), 3000);
  };

  // Import JSON file
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as GanttProject;
        if (!parsed.code || !Array.isArray(parsed.items)) {
          alert('Fichier JSON invalide pour Gantt For Student.');
          return;
        }
        onImportProject(parsed);
        onClose();
      } catch (err) {
        alert('Impossible de lire le fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#09090c] border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header (fixed at top) */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#0d0d11] shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>{t.exportModalTitle}</span>
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">{t.exportModalDesc}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Options Grid (Scrollable with min-h-0 and custom track) */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 min-h-0 overscroll-contain pr-2 sm:pr-3">
          {/* Option A: Fiche de synthèse Jury / One-Pager (PDF A4 Portrait) */}
          <div className="p-3.5 rounded-xl bg-[#050507] border border-indigo-500/30 hover:border-indigo-500/60 transition-colors space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-600/30 text-indigo-300 text-[10px] font-bold rounded-bl-lg border-l border-b border-indigo-500/30">
              Spécial Soutenance
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/25">
                  <Award className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                    <span>Fiche de synthèse pour jury · One-Pager (PDF)</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                    Synthèse exécutive au format A4 portrait : métriques clés, tableau des jalons, découpage par phases et répartition de l'équipe. Idéal à joindre au mémoire ou à remettre au jury.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportOnePager}
                disabled={isExportingOnePager}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs whitespace-nowrap transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {isExportingOnePager ? (
                  <span>Génération...</span>
                ) : exportSuccess === 'ONE-PAGER' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Téléchargé !</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Générer One-Pager</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option B: Export Calendrier (.ics) */}
          <div className="p-3.5 rounded-xl bg-[#050507] border border-zinc-800 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/25">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-200">Export Calendrier (.ics)</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                  Synchronisez vos tâches et jalons dans Google Calendar, Apple Agenda ou Outlook avec rappels automatiques.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportIcs}
              className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold text-xs whitespace-nowrap transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {exportSuccess === 'ICS' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Calendrier prêt !</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger .ics</span>
                </>
              )}
            </button>
          </div>

          {/* Option 0: Direct PDF Export (A4 / A3 Landscape) */}
          <div className="p-3.5 rounded-xl bg-[#050507] border border-zinc-800 hover:border-emerald-500/40 transition-colors space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Planning Gantt PDF (A4 / A3 Paysage)</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                    Génère le diagramme complet vectoriel prêt pour l'impression grand format ou intégration de planche.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportPdf('a4')}
                  disabled={Boolean(isExportingPdf)}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs whitespace-nowrap transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  title="Télécharger en format A4 Paysage"
                >
                  {isExportingPdf === 'a4' ? (
                    <span>Génération...</span>
                  ) : exportSuccess === 'PDF-A4' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>PDF A4 prêt !</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF A4</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleExportPdf('a3')}
                  disabled={Boolean(isExportingPdf)}
                  className="px-3 py-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 disabled:opacity-50 text-zinc-200 font-semibold text-xs whitespace-nowrap transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  title="Télécharger en grand format A3 Paysage"
                >
                  {isExportingPdf === 'a3' ? (
                    <span>Génération...</span>
                  ) : exportSuccess === 'PDF-A3' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PDF A3 prêt !</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF A3</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Option 1: High Res PNG */}
          <div className="p-3.5 rounded-xl bg-[#050507] border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/20">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">{t.exportPngTitle}</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">{t.exportPngDesc}</p>
                </div>
              </div>
              <button
                onClick={handleExportPng}
                disabled={isExportingPng}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs whitespace-nowrap transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {exportSuccess === 'PNG' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Téléchargé !</span>
                  </>
                ) : isExportingPng ? (
                  <span>{t.exporting}</span>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadPngButton}</span>
                  </>
                )}
              </button>
            </div>

            {/* Time scale choice (synchronized with workspace zoom) */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px]">
              <span className="text-zinc-400 font-medium">Échelle de temps du PNG :</span>
              <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setExportZoom('weeks')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    exportZoom === 'weeks'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  {t.zoomWeeks}
                </button>
                <button
                  type="button"
                  onClick={() => setExportZoom('months')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    exportZoom === 'months'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  {t.zoomMonths}
                </button>
                <button
                  type="button"
                  onClick={() => setExportZoom('years')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    exportZoom === 'years'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  {t.zoomYears}
                </button>
              </div>
            </div>
          </div>

          {/* Option 2: Live Fullscreen Presentation Mode */}
          <div className="p-3.5 rounded-xl bg-[#050507] border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-200">{t.presentationMode}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                  Vue grand écran épurée conçue pour projeter le Gantt devant votre jury ou classe.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onEnterPresentationMode();
              }}
              className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold text-xs whitespace-nowrap transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Lancer le mode</span>
            </button>
          </div>

          {/* Option 3: PDF Print */}
          <div className="p-3.5 rounded-xl bg-[#050507] border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-200">{t.exportPdfTitle}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">{t.exportPdfDesc}</p>
              </div>
            </div>
            <button
              onClick={handlePrintPdf}
              className="px-3 py-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printPdfButton}</span>
            </button>
          </div>

          {/* Option 4: JSON Backup & Share */}
          <div className="p-3.5 rounded-xl bg-[#050507] border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 shrink-0 border border-sky-500/20">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-200">{t.exportJsonTitle}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">{t.exportJsonDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportJson}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium text-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>JSON</span>
              </button>

              <label className="px-2.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium text-xs transition-all cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Importer</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Option 5: Windows Desktop App */}
          <div className="p-3.5 rounded-xl bg-[#050507] border border-zinc-800 hover:border-blue-500/40 transition-colors flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 border border-blue-500/25">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.95-1.8" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-200">{t.windowsApp}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">{t.downloadWindowsSubtitle}</p>
              </div>
            </div>
            <a
              href={WINDOWS_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs whitespace-nowrap transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadWindows}</span>
            </a>
          </div>
        </div>

        {/* Tip footer (fixed at bottom) */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#0d0d11] flex items-center gap-2 text-[11px] text-zinc-400 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{t.presentationSlideTip}</span>
        </div>
      </div>
    </div>
  );
};

