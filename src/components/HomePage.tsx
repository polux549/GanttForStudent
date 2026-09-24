import React, { useState } from 'react';
import { 
  Key, 
  ArrowRight, 
  Layers, 
  Clock, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  FilePlus2,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../types/gantt';
import { translations } from '../utils/i18n';
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
    <div className="min-h-screen bg-[#080d1a] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <nav className="h-16 px-6 lg:px-12 flex items-center justify-between border-b border-slate-800/80 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-base tracking-tight">{t.appName}</span>
          <span className="hidden sm:inline-block ml-1 text-[11px] text-indigo-400 font-mono">
            v1.0
          </span>
        </div>

        {/* Right: Language selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  lang === l.code
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
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
          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            {t.appTagline}
          </p>

          {/* User requested disclaimer banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs mt-2 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium italic">{t.aiDisclaimer}</span>
          </div>
        </div>

        {/* Main Card: Code Entry & Creation Flow */}
        <div className="bg-[#0f172a] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {!isNewProjectPrompt ? (
            /* STEP 1: Enter or generate code */
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>Accéder ou créer avec un code unique</span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
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
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5">
                  💡 Si le code existe déjà, vous accédez directement à votre Gantt. Sinon, vous pourrez le créer immédiatement !
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
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
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
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="Ex: Projet Semestre 2 - Groupe A"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectPrompt(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
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
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Besoin d'un exemple ?</span>
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

        {/* Recent Projects List */}
        {recentProjects.length > 0 && (
          <div className="mt-8 bg-[#0f172a] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.recentProjects}</span>
            </h3>

            <div className="divide-y divide-slate-800/60">
              {recentProjects.map((p) => (
                <div
                  key={p.code}
                  onClick={() => onOpenProjectByCode(p.code)}
                  className="py-2.5 px-3 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                      {p.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span className="text-indigo-400 font-bold">{p.code}</span>
                      <span>·</span>
                      <span>{p.itemCount} éléments</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteRecent(p.code, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
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
      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>Gantt For Student · Conçu pour les travaux d'études, semestres et mémoires.</p>
      </footer>
    </div>
  );
};
