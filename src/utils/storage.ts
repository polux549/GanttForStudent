import { GanttProject, GanttItem, Language } from '../types/gantt';
import { addDays, getTodayString } from './dates';
import { recalculateSchedule } from './ganttEngine';

const STORAGE_KEY_PREFIX = 'gantt_for_student_proj_';
const RECENT_PROJECTS_KEY = 'gantt_for_student_recent_codes';

export function normalizeCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-_]/g, '-');
}

export function generateRandomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = letters[Math.floor(Math.random() * letters.length)] + 
                 letters[Math.floor(Math.random() * letters.length)] + 
                 letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `STU-${prefix}-${num}`;
}

export function saveProject(project: GanttProject): void {
  try {
    const code = normalizeCode(project.code);
    project.code = code;
    project.updatedAt = new Date().toISOString();
    
    // Recalculate schedule before saving
    project.items = recalculateSchedule(project.items);

    localStorage.setItem(STORAGE_KEY_PREFIX + code, JSON.stringify(project));

    // Update recent codes list
    const recent = getRecentCodes();
    const updatedRecent = [code, ...recent.filter((c) => c !== code)].slice(0, 10);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updatedRecent));
  } catch (err) {
    console.error('Failed to save project to localStorage', err);
  }
}

export function getProject(code: string): GanttProject | null {
  try {
    const norm = normalizeCode(code);
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + norm);
    if (!data) return null;
    const parsed = JSON.parse(data) as GanttProject;
    parsed.items = recalculateSchedule(parsed.items || []);
    return parsed;
  } catch (err) {
    console.error('Failed to load project', err);
    return null;
  }
}

export function deleteProject(code: string): void {
  try {
    const norm = normalizeCode(code);
    localStorage.removeItem(STORAGE_KEY_PREFIX + norm);
    const recent = getRecentCodes().filter((c) => c !== norm);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(recent));
  } catch (err) {
    console.error('Failed to delete project', err);
  }
}

export function getRecentCodes(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function getRecentProjects(): { code: string; title: string; updatedAt: string; itemCount: number }[] {
  const codes = getRecentCodes();
  const list: { code: string; title: string; updatedAt: string; itemCount: number }[] = [];
  for (const c of codes) {
    const p = getProject(c);
    if (p) {
      list.push({
        code: p.code,
        title: p.title || p.code,
        updatedAt: p.updatedAt,
        itemCount: p.items.length,
      });
    }
  }
  return list;
}

export function createSampleProject(code: string = 'DEMO-ETUDIANT', lang: Language = 'fr'): GanttProject {
  const today = getTodayString();
  const startDay = addDays(today, -5);

  const isEn = lang === 'en';
  const isDe = lang === 'de';
  const isIt = lang === 'it';

  const group1Id = 'grp_1';
  const group2Id = 'grp_2';
  const group3Id = 'grp_3';

  const t1Id = 'task_1_1';
  const t2Id = 'task_1_2';
  const m1Id = 'mile_1_3';

  const t3Id = 'task_2_1';
  const t4Id = 'task_2_2';
  const m2Id = 'mile_2_3';

  const t5Id = 'task_3_1';
  const t6Id = 'task_3_2';
  const m3Id = 'mile_3_3';

  const sampleItems: GanttItem[] = [
    // GROUP 1: Cadrage
    {
      id: group1Id,
      name: isEn ? '1. Framing & Research' : isDe ? '1. Rahmen & Recherche' : isIt ? '1. Inquadramento & Ricerca' : '1. Cadrage & Recherche',
      type: 'group',
      schedulingMode: 'manual',
      startDate: startDay,
      endDate: addDays(startDay, 12),
      duration: 13,
      progress: 85,
      color: '#6366f1', // Indigo
      collapsed: false,
    },
    {
      id: t1Id,
      name: isEn ? 'Topic definition & scope' : isDe ? 'Themendefinition & Umfang' : isIt ? 'Definizione tema e ambito' : 'Définition du sujet et périmètre',
      type: 'task',
      schedulingMode: 'manual',
      startDate: startDay,
      endDate: addDays(startDay, 4),
      duration: 5,
      progress: 100,
      color: '#6366f1',
      groupId: group1Id,
      assignee: 'Alice & Marc',
      notes: isEn ? 'Approved by professor' : 'Validé avec le tuteur de projet',
    },
    {
      id: t2Id,
      name: isEn ? 'Literature review & State of the art' : isDe ? 'Literaturrecherche & Stand der Technik' : isIt ? 'Revisione bibliografica & Stato dell’arte' : 'Revue bibliographique & État de l’art',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: t1Id,
      predecessorLag: 1,
      startDate: addDays(startDay, 5),
      endDate: addDays(startDay, 11),
      duration: 7,
      progress: 90,
      color: '#818cf8',
      groupId: group1Id,
      assignee: 'Marc',
    },
    {
      id: m1Id,
      name: isEn ? '★ Research Proposal Approved' : isDe ? '★ Forschungsvorschlag genehmigt' : isIt ? '★ Proposta approvata' : '★ Validation officielle du sujet',
      type: 'milestone',
      schedulingMode: 'auto',
      predecessorId: t2Id,
      predecessorLag: 1,
      startDate: addDays(startDay, 12),
      endDate: addDays(startDay, 12),
      duration: 0,
      progress: 100,
      color: '#f59e0b', // Amber milestone
      groupId: group1Id,
      notes: 'Livrable 1 remis au jury',
    },

    // GROUP 2: Réalisation
    {
      id: group2Id,
      name: isEn ? '2. Prototyping & Development' : isDe ? '2. Prototyp & Entwicklung' : isIt ? '2. Prototipazione & Sviluppo' : '2. Réalisation & Expérimentation',
      type: 'group',
      schedulingMode: 'manual',
      startDate: addDays(startDay, 13),
      endDate: addDays(startDay, 28),
      duration: 16,
      progress: 45,
      color: '#10b981', // Emerald
      collapsed: false,
    },
    {
      id: t3Id,
      name: isEn ? 'Architecture & Technical Design' : isDe ? 'Architektur & technisches Design' : isIt ? 'Architettura e design tecnico' : 'Modélisation et architecture',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: m1Id,
      predecessorLag: 1,
      startDate: addDays(startDay, 13),
      endDate: addDays(startDay, 18),
      duration: 6,
      progress: 80,
      color: '#10b981',
      groupId: group2Id,
      assignee: 'Alice',
    },
    {
      id: t4Id,
      name: isEn ? 'Implementation & Lab Experiments' : isDe ? 'Implementierung & Labortests' : isIt ? 'Sviluppo & Test in laboratorio' : 'Développement & Tests expérimentaux',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: t3Id,
      predecessorLag: 1,
      startDate: addDays(startDay, 19),
      endDate: addDays(startDay, 27),
      duration: 9,
      progress: 30,
      color: '#34d399',
      groupId: group2Id,
      assignee: 'Alice & Marc',
    },
    {
      id: m2Id,
      name: isEn ? '★ Prototype Functional Demo' : isDe ? '★ Funktionsfähiger Prototyp bereit' : isIt ? '★ Prototipo funzionante completato' : '★ Démonstrateur fonctionnel validé',
      type: 'milestone',
      schedulingMode: 'auto',
      predecessorId: t4Id,
      predecessorLag: 1,
      startDate: addDays(startDay, 28),
      endDate: addDays(startDay, 28),
      duration: 0,
      progress: 0,
      color: '#f59e0b',
      groupId: group2Id,
    },

    // GROUP 3: Restitution
    {
      id: group3Id,
      name: isEn ? '3. Reporting & Final Defense' : isDe ? '3. Bericht & Abschlusspräsentation' : isIt ? '3. Relazione & Discussione finale' : '3. Rédaction & Soutenance finale',
      type: 'group',
      schedulingMode: 'manual',
      startDate: addDays(startDay, 29),
      endDate: addDays(startDay, 42),
      duration: 14,
      progress: 10,
      color: '#ec4899', // Pink / Rose
      collapsed: false,
    },
    {
      id: t5Id,
      name: isEn ? 'Writing final thesis report' : isDe ? 'Abschlussbericht verfassen' : isIt ? 'Stesura tesi finale' : 'Rédaction du rapport de mémoire',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: m2Id,
      predecessorLag: 1,
      startDate: addDays(startDay, 29),
      endDate: addDays(startDay, 37),
      duration: 9,
      progress: 20,
      color: '#ec4899',
      groupId: group3Id,
      assignee: 'Alice & Marc',
    },
    {
      id: t6Id,
      name: isEn ? 'Slides preparation & oral rehearsal' : isDe ? 'Folien erstellen & Probevortrag' : isIt ? 'Preparazione diapositive & prove' : 'Diaporama & Répétition orale',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: t5Id,
      predecessorLag: 1,
      startDate: addDays(startDay, 38),
      endDate: addDays(startDay, 41),
      duration: 4,
      progress: 0,
      color: '#f472b6',
      groupId: group3Id,
      assignee: 'Alice & Marc',
    },
    {
      id: m3Id,
      name: isEn ? '★ Final Oral Defense' : isDe ? '★ Mündliche Abschlussprüfung' : isIt ? '★ Discussione finale della tesi' : '★ Soutenance finale devant jury',
      type: 'milestone',
      schedulingMode: 'auto',
      predecessorId: t6Id,
      predecessorLag: 1,
      startDate: addDays(startDay, 42),
      endDate: addDays(startDay, 42),
      duration: 0,
      progress: 0,
      color: '#ef4444', // Red milestone
      groupId: group3Id,
      notes: 'Salle B204 - 14h00',
    },
  ];

  const project: GanttProject = {
    code: normalizeCode(code),
    title: isEn ? 'Master Thesis & Semester Project' : isDe ? 'Masterarbeit & Semesterprojekt' : isIt ? 'Tesi Magistrale & Progetto' : 'Projet de Semestre & Mémoire',
    description: isEn ? 'Academic project schedule with milestones' : 'Planning complet avec jalons et dépendances automatiques',
    items: recalculateSchedule(sampleItems),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveProject(project);
  return project;
}

export function getCodeFromUrl(): string | null {
  // Check URL query param ?code= or ?project=
  const params = new URLSearchParams(window.location.search);
  const qCode = params.get('code') || params.get('project');
  if (qCode) return normalizeCode(qCode);

  // Check URL hash #CODE
  if (window.location.hash) {
    const hashVal = window.location.hash.replace('#', '').replace('/', '');
    if (hashVal) return normalizeCode(hashVal);
  }

  // Check pathname /CODE if simple path
  const path = window.location.pathname.replace(/^\//, '').trim();
  if (path && !path.includes('.') && path.length >= 3 && !['index.html', 'app'].includes(path)) {
    return normalizeCode(path);
  }

  return null;
}

export function updateUrlCode(code: string | null): void {
  const url = new URL(window.location.href);
  if (code) {
    url.searchParams.set('code', code);
    window.history.replaceState({}, '', url.toString());
  } else {
    url.searchParams.delete('code');
    url.searchParams.delete('project');
    window.history.replaceState({}, '', url.pathname);
  }
}
