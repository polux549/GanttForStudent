import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Language } from '../types/gantt';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  lang,
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
      key: 'Suppr / Del',
      desc: isFr
        ? "Supprimer l'élément sélectionné"
        : isDe
        ? 'Ausgewähltes Element löschen'
        : isIt
        ? "Elimina l'elemento selezionato"
        : 'Delete selected item',
    },
    {
      key: 'Entrée / Espace',
      desc: isFr
        ? "Renommer ou modifier l'élément sélectionné"
        : isDe
        ? 'Ausgewähltes Element bearbeiten'
        : isIt
        ? "Modifica l'elemento selezionato"
        : 'Edit / Rename selected item',
    },
    {
      key: '↑ / ↓',
      desc: isFr
        ? 'Naviguer entre les tâches'
        : isDe
        ? 'Zwischen Aufgaben navigieren'
        : isIt
        ? 'Naviga tra le attività'
        : 'Navigate between tasks',
    },
    {
      key: 'Alt + ↑ / ↓',
      desc: isFr
        ? "Changer l'ordre de la tâche (monter / descendre)"
        : isDe
        ? 'Reihenfolge der Aufgabe ändern (auf / ab)'
        : isIt
        ? "Cambia l'ordine dell'attività (su / giù)"
        : 'Reorder task (move up / down)',
    },
    {
      key: 'P',
      desc: isFr
        ? 'Activer le mode Présentation plein écran'
        : isDe
        ? 'Präsentationsmodus umschalten'
        : isIt
        ? 'Modalità presentazione'
        : 'Toggle presentation mode',
    },
    {
      key: 'E',
      desc: isFr
        ? "Ouvrir l'export (PNG, JSON, Impression)"
        : isDe
        ? 'Exportmenü öffnen'
        : isIt
        ? "Apri l'esportazione"
        : 'Open export menu',
    },
    {
      key: '+ / -',
      desc: isFr
        ? 'Zoomer / Dézoomer la chronologie'
        : isDe
        ? 'Zeitleiste vergrößern / verkleinern'
        : isIt
        ? 'Zoom cronologia'
        : 'Zoom in / Zoom out',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#121c33]/70">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto text-xs">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <span className="text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-0.5 text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/70 border border-indigo-500/40 rounded shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1322] text-[11px] text-slate-400 text-center">
          {isFr
            ? '💡 Astuce : Les raccourcis sont aussi rappelés au survol de chaque bouton.'
            : '💡 Tip: Hovering over buttons also reveals their shortcut.'}
        </div>
      </div>
    </div>
  );
};
