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
  Download
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
}

export const HomePage: React.FC<HomePageProps> = ({
  lang,
  onLanguageChange,
  onCreateProject,
  onOpenProjectByCode,
  onExploreDemo,
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
    <div className="min-h-screen bg-[#050507] text-zinc-200 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <nav className="h-16 px-6 lg:px-12 flex items-center justify-between border-b border-zinc-800/80 bg-[#08080a]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img 
            src="./icon.png" 
            alt="GanttForStudent Logo" 
            className="w-8 h-8 rounded-lg shadow-md object-contain bg-zinc-900 p-0.5 border border-zinc-800" 
          />
          <span className="font-bold text-white text-base tracking-tight">{t.appName}</span>
        </div>

        {/* Right: Windows App & Language selector */}
        <div className="flex items-center gap-3">
          <a
            href={WINDOWS_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-400 text-xs font-semibold text-blue-300 hover:text-white transition-all shadow-xs group"
            title={t.downloadWindows}
          >
            <svg className="w-3.5 h-3.5 fill-current text-blue-400 group-hover:text-blue-200 transition-colors" viewBox="0 0 24 24">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.95-1.8" />
            </svg>
            <span className="hidden sm:inline">{t.downloadWindows}</span>
            <span className="sm:hidden">{t.windowsApp}</span>
          </a>

          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  lang === l.code
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.appName}
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed font-normal">
            {t.appTagline}
          </p>
        </div>

        {/* Main Card: Code Entry & Creation Flow */}
        <div className="bg-[#0b0b0e] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {!isNewProjectPrompt ? (
            /* STEP 1: Enter or generate code */
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>Accéder ou créer avec un code unique</span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                  Code du projet
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Ex: PROJET-INFO, MEMOIRE-2026..."
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-750 rounded-xl text-zinc-100 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  />
                </div>
                <div className="text-[11px] text-zinc-500 mt-1.5">
                  💡 Si le code existe déjà, vous accédez directement à votre Gantt. Sinon, vous pourrez le créer immédiatement ! (Ne pas débuter un code par $)
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Accéder au Gantt</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleQuickRandom}
                  className="py-3 px-4 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                  title="Générer un code aléatoire automatiquement"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Code aléatoire</span>
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Code does not exist yet -> Ask for project name */
            <form onSubmit={handleConfirmCreateNew} className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-start gap-2.5">
                <FilePlus2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Nouveau projet détecté</div>
                  <div className="text-[11px] text-indigo-200 mt-0.5">
                    Le code <span className="font-mono font-bold text-white bg-indigo-900/60 px-1 py-0.5 rounded">{targetCode}</span> n'existe pas encore. Nommez votre projet pour le créer :
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="Ex: Projet Semestre 2 - Groupe A"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-750 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectPrompt(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Retour
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Créer et ouvrir le Gantt</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Explorer */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Besoin d'un exemple ?</span>
            <button
              type="button"
              onClick={onExploreDemo}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.exploreDemo}</span>
            </button>
          </div>
        </div>

        {/* Windows App Download Card */}
        <div className="mt-6 bg-[#0b0b0e] border border-zinc-800/90 hover:border-blue-500/40 rounded-2xl p-4 sm:p-5 shadow-xl transition-all group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0 text-blue-400 group-hover:scale-105 transition-transform shadow-xs">
                <svg className="w-5 h-5 fill-current text-blue-400" viewBox="0 0 24 24">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.95-1.8" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>{t.windowsApp}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono font-medium">Windows</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
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
          <div className="mt-8 bg-[#0b0b0e] border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.recentProjects}</span>
            </h3>

            <div className="divide-y divide-zinc-800/60">
              {recentProjects.map((p) => (
                <div
                  key={p.code}
                  onClick={() => onOpenProjectByCode(p.code)}
                  className="py-2.5 px-3 rounded-xl hover:bg-zinc-850/60 transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
                      {p.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                      <span className="text-indigo-400 font-bold">{p.code}</span>
                      <span>·</span>
                      <span>{p.itemCount} éléments</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteRecent(p.code, e)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Retirer de l'historique"
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
      <footer className="py-6 border-t border-zinc-800/80 text-center text-xs text-zinc-500">
        <p>Gantt For Student · Conçu pour les projet solo et en groupe</p>
      </footer>
    </div>
  );
};
