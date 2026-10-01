import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Language } from '../types/gantt';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme?: 'dark' | 'light';
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const isFr = lang === 'fr';
  const isDe = lang === 'de';
  const isIt = lang === 'it';

  const title = isFr
    ? 'Raccourcis clavier'
    : isDe
    ? 'Tastaturkürzel'
    : isIt
    ? 'Scorciatoie da tastiera'
    : 'Keyboard Shortcuts';

  const shortcuts = [
    {
      key: 'T',
      desc: isFr
        ? 'Créer une nouvelle tâche'
        : isDe
        ? 'Neue Aufgabe erstellen'
        : isIt
        ? 'Crea nuova attività'
        : 'Create new task',
    },
    {
      key: 'G',
      desc: isFr
        ? 'Créer un nouveau groupe'
        : isDe
        ? 'Neue Gruppe erstellen'
        : isIt
        ? 'Crea nuovo gruppo'
        : 'Create new group',
    },
    {
      key: 'J / M',
      desc: isFr
        ? 'Créer un nouveau jalon'
        : isDe
        ? 'Neuen Meilenstein erstellen'
        : isIt
        ? 'Crea nuova tappa'
        : 'Create new milestone',
    },
    {
      key: '1 / 2 / 3',
      desc: isFr
        ? 'Zoom Semaines / Mois / Années'
        : isDe
        ? 'Zoom Wochen / Monate / Jahre'
        : isIt
        ? 'Zoom Settimane / Mesi / Anni'
        : 'Zoom Weeks / Months / Years',
    },
    {
      key: 'H / Aujourd\'hui',
      desc: isFr
        ? "Centrer sur la date d'aujourd'hui"
        : isDe
        ? 'Auf heute zentrieren'
        : isIt
        ? 'Centra su oggi'
        : 'Center on today',
    },
    {
      key: 'F',
      desc: isFr
        ? 'Ouvrir / masquer la barre des filtres'
        : isDe
        ? 'Filterleiste ein-/ausblenden'
        : isIt
        ? 'Mostra/nascondi barra filtri'
        : 'Toggle filter bar',
    },
    {
      key: 'P',
      desc: isFr
        ? 'Activer le mode Présentation plein écran'
        : isDe
        ? 'Vollbild-Präsentationsmodus starten'
        : isIt
        ? 'Avvia modalità presentazione'
        : 'Start presentation mode',
    },
    {
      key: 'E',
      desc: isFr
        ? "Ouvrir le menu d'exportation (PDF, PNG, JSON)"
        : isDe
        ? 'Exportmenü öffnen'
        : isIt
        ? 'Apri menu esportazione'
        : 'Open export menu',
    },
    {
      key: 'Ctrl + Z',
      desc: isFr
        ? 'Annuler la dernière action'
        : isDe
        ? 'Rückgängig'
        : isIt
        ? 'Annulla'
        : 'Undo',
    },
    {
      key: 'Ctrl + Y',
      desc: isFr
        ? 'Rétablir la dernière action'
        : isDe
        ? 'Wiederherstellen'
        : isIt
        ? 'Ripeti'
        : 'Redo',
    },
    {
      key: 'Suppr / Backspace',
      desc: isFr
        ? "Supprimer l'élément sélectionné"
        : isDe
        ? 'Ausgewähltes Element löschen'
        : isIt
        ? 'Elimina elemento selezionato'
        : 'Delete selected item',
    },
    {
      key: 'Double-clic',
      desc: isFr
        ? "Modifier les détails de l'élément"
        : isDe
        ? 'Elementdetails bearbeiten'
        : isIt
        ? 'Modifica dettagli'
        : 'Edit item details',
    },
    {
      key: '?',
      desc: isFr
        ? "Afficher ce panneau d'aide"
        : isDe
        ? 'Diese Hilfe anzeigen'
        : isIt
        ? 'Mostra questo aiuto'
        : 'Show keyboard shortcuts',
    },
    {
      key: 'Échap',
      desc: isFr
        ? 'Fermer la fenêtre active'
        : isDe
        ? 'Aktives Fenster schließen'
        : isIt
        ? 'Chiudi finestra'
        : 'Close active modal',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div 
        className={`w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#09090c] border-zinc-800 text-zinc-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#0d0d11] border-zinc-800'
        }`}>
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <div className={`p-1.5 rounded-lg ${
              theme === 'light'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              <Keyboard className="w-4 h-4" />
            </div>
            <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto text-xs">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg border transition-colors ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-[#050507] border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className={`font-medium ${
                theme === 'light' ? 'text-slate-700' : 'text-zinc-300'
              }`}>{sc.desc}</span>
              <kbd className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded shadow-xs border ${
                theme === 'light'
                  ? 'text-blue-800 bg-blue-50 border-blue-200'
                  : 'text-indigo-300 bg-indigo-950/70 border-indigo-500/40'
              }`}>
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className={`px-5 py-3 border-t text-[11px] text-center transition-colors ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200 text-slate-500'
            : 'bg-[#0d0d11] border-zinc-800 text-zinc-400'
        }`}>
          {isFr
            ? '💡 Astuce : Les raccourcis sont aussi rappelés au survol de chaque bouton.'
            : '💡 Tip: Hovering over buttons also reveals their shortcut.'}
        </div>
      </div>
    </div>
  );
};
