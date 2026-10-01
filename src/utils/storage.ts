import { GanttProject, GanttItem, Language } from '../types/gantt';
import { addDays, getTodayString } from './dates';
import { recalculateSchedule } from './ganttEngine';

const STORAGE_KEY_PREFIX = 'gantt_for_student_proj_';
const RECENT_PROJECTS_KEY = 'gantt_for_student_recent_codes';
const OWNER_KEY_PREFIX = 'gantt_for_student_owner_key_';

export function normalizeCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-_]/g, '-');
}

export function generateRandomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let prefix = '';
  do {
    prefix = letters[Math.floor(Math.random() * letters.length)] + 
             letters[Math.floor(Math.random() * letters.length)] + 
             letters[Math.floor(Math.random() * letters.length)];
  } while (prefix.toUpperCase() === 'STU');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

export function generateEditKey(code: string): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `KEY-${normalizeCode(code).slice(-4)}-${rand}`;
}

export function getProjectOwnerKey(code: string): string | null {
  try {
    return localStorage.getItem(OWNER_KEY_PREFIX + normalizeCode(code));
  } catch {
    return null;
  }
}

export function setProjectOwnerKey(code: string, key: string): void {
  try {
    localStorage.setItem(OWNER_KEY_PREFIX + normalizeCode(code), key);
  } catch (err) {
    console.error('Failed to set owner key', err);
  }
}

export function isProjectOwner(code: string, projectEditKey?: string): boolean {
  try {
    const norm = normalizeCode(code);
    const localKey = localStorage.getItem(OWNER_KEY_PREFIX + norm);
    // If user has local owner key stored, or if key matches project editKey
    if (localKey && (!projectEditKey || localKey === projectEditKey)) return true;
    if (projectEditKey && localKey === projectEditKey) return true;
    return false;
  } catch {
    return false;
  }
}

export function saveProject(project: GanttProject): void {
  try {
    const code = normalizeCode(project.code);
    project.code = code;
    project.updatedAt = new Date().toISOString();

    // Ensure project has an editKey to prevent unauthorized takeovers
    if (!project.editKey) {
      project.editKey = generateEditKey(code);
    }
    
    // Recalculate schedule before saving
    project.items = recalculateSchedule(project.items);

    localStorage.setItem(STORAGE_KEY_PREFIX + code, JSON.stringify(project));

    // Also register ownership on the creator's machine
    if (!getProjectOwnerKey(code)) {
      setProjectOwnerKey(code, project.editKey);
    }

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
  const startDay = addDays(today, -16);

  const isEn = lang === 'en';
  const isDe = lang === 'de';
  const isIt = lang === 'it';

  // Group IDs
  const g1 = 'grp_1';
  const g2 = 'grp_2';
  const g2_1 = 'grp_2_1';
  const g2_2 = 'grp_2_2';
  const g3 = 'grp_3';
  const g4 = 'grp_4';

  const sampleItems: GanttItem[] = [
    // ==========================================
    // 1. CADRAGE & ÉTAT DE L'ART
    // ==========================================
    {
      id: g1,
      name: isEn ? '1. Framing, Specifications & State of the Art' : isDe ? '1. Rahmen, Spezifikationen & Stand der Technik' : isIt ? '1. Inquadramento, Specifiche & Stato dell’arte' : '1. Cadrage, Spécifications & État de l’art',
      type: 'group',
      schedulingMode: 'manual',
      startDate: startDay,
      endDate: addDays(startDay, 12),
      duration: 13,
      progress: 100,
      color: '#6366f1', // Indigo
      collapsed: false,
    },
    {
      id: 't_1_1',
      name: isEn ? 'System requirements & scope definition' : isDe ? 'Systemanforderungen & Umfang' : isIt ? 'Requisiti di sistema e perimetro' : 'Cahier des charges & Exigences système',
      type: 'task',
      schedulingMode: 'manual',
      startDate: startDay,
      endDate: addDays(startDay, 4),
      duration: 5,
      progress: 100,
      color: '#6366f1',
      groupId: g1,
      assignee: 'Alice & Marc',
      notes: isEn ? 'Validated with team lead' : 'Validé avec le responsable de projet',
      comments: [
        {
          id: 'comm_sample_0',
          author: 'Laurent (Responsable PFE)',
          text: 'Périmètre et spécifications validés. Le découpage en sous-systèmes est cohérent avec le cahier des charges de fin d’études.',
          date: addDays(today, -14) + 'T10:00:00Z',
        },
      ],
    },
    {
      id: 't_1_2',
      name: isEn ? 'Literature review & technology benchmark' : isDe ? 'Literaturrecherche & Technologievergleich' : isIt ? 'Revisione bibliografica & benchmark tecnologico' : 'Revue bibliographique & Benchmark technique',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 't_1_1',
      predecessorLag: 1,
      startDate: addDays(startDay, 5),
      endDate: addDays(startDay, 9),
      duration: 5,
      progress: 100,
      color: '#818cf8',
      groupId: g1,
      assignee: 'Marc',
      comments: [
        {
          id: 'comm_biblio',
          author: 'Dr. Valérie M.',
          text: 'Excellente sélection d’articles scientifiques IEEE. Veillez à bien référencer les travaux dans le chapitre 1 du mémoire.',
          date: addDays(today, -10) + 'T16:20:00Z',
        },
      ],
    },
    {
      id: 't_1_3',
      name: isEn ? 'Risk assessment & feasibility study' : isDe ? 'Risikoanalyse & Machbarkeitsstudie' : isIt ? 'Valutazione dei rischi & studio di fattibilità' : 'Analyse des risques & Étude de faisabilité',
      type: 'task',
      schedulingMode: 'manual',
      predecessorId: 't_1_2',
      startDate: addDays(startDay, 7),
      endDate: addDays(startDay, 11),
      duration: 5,
      progress: 100,
      color: '#a5b4fc',
      groupId: g1,
      assignee: 'Thomas',
    },
    {
      id: 'm_1_4',
      name: isEn ? '★ Specifications Approved (Deliverable 1)' : isDe ? '★ Spezifikation genehmigt (Lieferbestandteil 1)' : isIt ? '★ Specifiche approvate (Livrabile 1)' : '★ Validation Cahier des Charges (Livrable 1)',
      type: 'milestone',
      schedulingMode: 'auto',
      predecessorId: 't_1_3',
      predecessorLag: 1,
      startDate: addDays(startDay, 12),
      endDate: addDays(startDay, 12),
      duration: 0,
      progress: 100,
      color: '#f59e0b',
      groupId: g1,
      notes: isEn ? 'Submitted to board' : 'Dossier officiel remis au jury de projet',
      comments: [
        {
          id: 'comm_cahier',
          author: 'Martin (Superviseur de projet)',
          text: 'Cahier des charges approuvé avec les félicitations du jury. Vous pouvez lancer la phase de conception matérielle et logicielle.',
          date: addDays(today, -10) + 'T16:00:00Z',
        },
      ],
    },

    // ==========================================
    // 2. CONCEPTION & ARCHITECTURE SYSTÈME
    // ==========================================
    {
      id: g2,
      name: isEn ? '2. System Design & Architecture' : isDe ? '2. Systemdesign & Architektur' : isIt ? '2. Progettazione & Architettura di sistema' : '2. Conception & Architecture Système',
      type: 'group',
      schedulingMode: 'manual',
      predecessorId: 'm_1_4',
      startDate: addDays(startDay, 13),
      endDate: addDays(startDay, 27),
      duration: 15,
      progress: 75,
      color: '#0284c7', // Sky
      collapsed: false,
    },
    // Sub-group 2.1: Hardware & Electronics
    {
      id: g2_1,
      name: isEn ? '2.1 Electronics & Sensors (PCB)' : isDe ? '2.1 Elektronik & Sensoren (Leiterplatte)' : isIt ? '2.1 Elettronica & Sensori (PCB)' : '2.1 Électronique & Capteurs (PCB)',
      type: 'group',
      schedulingMode: 'manual',
      startDate: addDays(startDay, 13),
      endDate: addDays(startDay, 24),
      duration: 12,
      progress: 90,
      color: '#0ea5e9',
      groupId: g2,
      collapsed: false,
    },
    {
      id: 't_2_1_1',
      name: isEn ? 'Sensors & microcontroller selection' : isDe ? 'Sensorauswahl & Mikrocontroller' : isIt ? 'Selezione sensori e microcontrollore' : 'Sélection capteurs LiDAR & microcontrôleur',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 'm_1_4',
      predecessorLag: 1,
      startDate: addDays(startDay, 13),
      endDate: addDays(startDay, 17),
      duration: 5,
      progress: 100,
      color: '#0ea5e9',
      groupId: g2_1,
      assignee: 'Sophie',
    },
    {
      id: 't_2_1_2',
      name: isEn ? 'Schematics design & PCB routing' : isDe ? 'Schaltplanerstellung & PCB-Layout' : isIt ? 'Sbroglio PCB & simulazione circuitale' : 'Routage CAO & Simulation du circuit PCB',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 't_2_1_1',
      predecessorLag: 1,
      startDate: addDays(startDay, 18),
      endDate: addDays(startDay, 24),
      duration: 7,
      progress: 85,
      color: '#38bdf8',
      groupId: g2_1,
      assignee: 'Sophie',
      comments: [
        {
          id: 'comm_pcb',
          author: 'M. Dubois (Expert Hardware)',
          text: 'Routage validé pour commande d’échantillons. Vérifiez la largeur des pistes de puissance avant de lancer la fabrication.',
          date: addDays(today, -6) + 'T11:45:00Z',
        },
      ],
    },
    {
      id: 'm_2_1_3',
      name: isEn ? '★ PCB Fabrication Ordered' : isDe ? '★ Leiterplattenfertigung beauftragt' : isIt ? '★ Ordine PCB inviato' : '★ Commande fabrication PCB envoyée',
      type: 'milestone',
      schedulingMode: 'auto',
      predecessorId: 't_2_1_2',
      startDate: addDays(startDay, 24),
      endDate: addDays(startDay, 24),
      duration: 0,
      progress: 100,
      color: '#f59e0b',
      groupId: g2_1,
    },
    // Sub-group 2.2: Embedded Software & Cloud
    {
      id: g2_2,
      name: isEn ? '2.2 Embedded Software & Cloud' : isDe ? '2.2 Embedded Software & Cloud' : isIt ? '2.2 Software Embedded & Cloud' : '2.2 Logiciel Embarqué & Cloud',
      type: 'group',
      schedulingMode: 'manual',
      startDate: addDays(startDay, 13),
      endDate: addDays(startDay, 27),
      duration: 15,
      progress: 65,
      color: '#2563eb',
      groupId: g2,
      collapsed: false,
    },
    {
      id: 't_2_2_1',
      name: isEn ? 'Real-time firmware & ROS 2 stack' : isDe ? 'Echtzeit-Firmware & ROS 2' : isIt ? 'Firmware real-time & stack ROS 2' : 'Firmware temps réel & Architecture ROS 2',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 'm_1_4',
      predecessorLag: 1,
      startDate: addDays(startDay, 13),
      endDate: addDays(startDay, 18),
      duration: 6,
      progress: 100,
      color: '#3b82f6',
      groupId: g2_2,
      assignee: 'Marc',
    },
    {
      id: 't_2_2_2',
      name: isEn ? 'SLAM mapping & path planning algorithms' : isDe ? 'SLAM-Kartierung & Bahnplanung' : isIt ? 'Algoritmi di navigazione e SLAM' : 'Algorithmes de navigation & SLAM',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 't_2_2_1',
      predecessorLag: 1,
      startDate: addDays(startDay, 19),
      endDate: addDays(startDay, 26),
      duration: 8,
      progress: 70,
      color: '#60a5fa',
      groupId: g2_2,
      assignee: 'Alice',
      comments: [
        {
          id: 'comm_slam',
          author: 'Laurent (Responsable PFE)',
          text: 'Très bonne progression sur les algorithmes SLAM. Assurez-vous de documenter la consommation CPU sous Linux embarqué pour la soutenance.',
          date: addDays(today, -3) + 'T14:30:00Z',
        },
      ],
    },
    {
      id: 't_2_2_3',
      name: isEn ? 'Monitoring web dashboard & telemetry' : isDe ? 'Web-Dashboard & Telemetrie' : isIt ? 'Dashboard web & telemetria' : 'Tableau de bord web & Télémétrie temps réel',
      type: 'task',
      schedulingMode: 'manual',
      predecessorId: 't_2_2_1',
      startDate: addDays(startDay, 17),
      endDate: addDays(startDay, 25),
      duration: 9,
      progress: 45,
      color: '#93c5fd',
      groupId: g2_2,
      assignee: 'Thomas',
    },
    {
      id: 'm_2_3',
      name: isEn ? '★ Mid-term Defense & Review (Deliverable 2)' : isDe ? '★ Zwischenprüfung (Lieferbestandteil 2)' : isIt ? '★ Revisione intermedia (Livrabile 2)' : '★ Soutenance mi-parcours (Livrable 2)',
      type: 'milestone',
      schedulingMode: 'auto',
      predecessorId: 't_2_2_2',
      predecessorLag: 1,
      startDate: addDays(startDay, 27),
      endDate: addDays(startDay, 27),
      duration: 0,
      progress: 80,
      color: '#10b981',
      groupId: g2,
      notes: isEn ? 'Demonstration of sub-modules to faculty' : 'Présentation des sous-systèmes aux évaluateurs',
      comments: [
        {
          id: 'comm_midterm',
          author: 'Dr. Valérie M.',
          text: 'Dossier intermédiaire validé avec mention. Le calendrier prévisionnel et les jalons respectent le cahier des charges de la commission.',
          date: addDays(today, -1) + 'T09:15:00Z',
        },
      ],
    },

    // ==========================================
    // 3. INTÉGRATION & VALIDATION EXPÉRIMENTALE
    // ==========================================
    {
      id: g3,
      name: isEn ? '3. Integration & Experimental Testing' : isDe ? '3. Integration & Experimentelle Tests' : isIt ? '3. Integrazione & Test sperimentali' : '3. Intégration & Validation Expérimentale',
      type: 'group',
      schedulingMode: 'manual',
      predecessorId: 'm_2_3',
      startDate: addDays(startDay, 28),
      endDate: addDays(startDay, 38),
      duration: 11,
      progress: 20,
      color: '#10b981', // Emerald
      collapsed: false,
    },
    {
      id: 't_3_1',
      name: isEn ? 'Hardware integration & chassis assembly' : isDe ? 'Hardware-Integration & Montage' : isIt ? 'Assemblaggio meccanico e cablaggio' : 'Assemblage mécanique & Câblage du banc d’essai',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 'm_2_3',
      predecessorLag: 1,
      startDate: addDays(startDay, 28),
      endDate: addDays(startDay, 32),
      duration: 5,
      progress: 40,
      color: '#10b981',
      groupId: g3,
      assignee: 'Sophie & Thomas',
    },
    {
      id: 't_3_2',
      name: isEn ? 'Hardware/Software co-simulation & tests' : isDe ? 'Hard-/Software-Co-Simulation & Tests' : isIt ? 'Integrazione software/hardware & test' : 'Intégration logicielle & Premiers tests unitaires',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 't_3_1',
      predecessorLag: 1,
      startDate: addDays(startDay, 33),
      endDate: addDays(startDay, 37),
      duration: 5,
      progress: 10,
      color: '#34d399',
      groupId: g3,
      assignee: 'Alice & Marc',
    },
    {
      id: 't_3_3',
      name: isEn ? 'Field experiments & endurance benchmark' : isDe ? 'Feldversuche & Leistungsmessung' : isIt ? 'Campagna di test sul campo & misure' : 'Campagne d’essais sur piste & Mesures réelles',
      type: 'task',
      schedulingMode: 'manual',
      predecessorId: 't_3_2',
      startDate: addDays(startDay, 34),
      endDate: addDays(startDay, 38),
      duration: 5,
      progress: 0,
      color: '#6ee7b7',
      groupId: g3,
      assignee: 'Toute l’équipe',
    },
    {
      id: 'm_3_4',
      name: isEn ? '★ Operational Prototype Validated' : isDe ? '★ Funktionsfähiger Prototyp validiert' : isIt ? '★ Prototipo operativo validato' : '★ Prototype autonome opérationnel validé',
      type: 'milestone',
      schedulingMode: 'auto',
      predecessorId: 't_3_3',
      startDate: addDays(startDay, 38),
      endDate: addDays(startDay, 38),
      duration: 0,
      progress: 0,
      color: '#f59e0b',
      groupId: g3,
      comments: [
        {
          id: 'comm_proto',
          author: 'Mme Girard (Partenaire industriel)',
          text: 'Les essais en conditions réelles sont très prometteurs. Nous confirmons la mise à disposition de la piste d’essai pour le jury.',
          date: addDays(today, -1) + 'T15:00:00Z',
        },
      ],
    },

    // ==========================================
    // 4. RÉDACTION, RAPPORT & SOUTENANCE
    // ==========================================
    {
      id: g4,
      name: isEn ? '4. Thesis Writing & Final Defense' : isDe ? '4. Berichtserstellung & Abschlussprüfung' : isIt ? '4. Stesura tesi & Discussione finale' : '4. Rédaction du Mémoire & Soutenance Finale',
      type: 'group',
      schedulingMode: 'manual',
      predecessorId: 'm_3_4',
      startDate: addDays(startDay, 24),
      endDate: addDays(startDay, 45),
      duration: 22,
      progress: 25,
      color: '#ec4899', // Pink
      collapsed: false,
    },
    {
      id: 't_4_1',
      name: isEn ? 'Writing comprehensive master thesis report' : isDe ? 'Verfassen der Abschlussarbeit' : isIt ? 'Stesura dettagliata della tesi di laurea' : 'Rédaction du mémoire de fin d’études (60 p.)',
      type: 'task',
      schedulingMode: 'manual',
      predecessorId: 'm_2_3',
      startDate: addDays(startDay, 24),
      endDate: addDays(startDay, 39),
      duration: 16,
      progress: 35,
      color: '#ec4899',
      groupId: g4,
      assignee: 'Alice & Marc',
      notes: isEn ? 'Introduction, state-of-the-art and results chapters' : 'Introduction, état de l’art, méthodologie et résultats',
      comments: [
        {
          id: 'comm_memoire',
          author: 'Laurent (Responsable PFE)',
          text: 'Le plan détaillé du mémoire est approuvé. La structure en 4 parties répond exactement aux critères académiques.',
          date: addDays(today, -2) + 'T17:10:00Z',
        },
      ],
    },
    {
      id: 't_4_2',
      name: isEn ? 'Final review & corrections' : isDe ? 'Abschlussprüfung & Korrekturen' : isIt ? 'Revisione finale e correzioni' : 'Relecture & Corrections finales',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 't_4_1',
      predecessorLag: 1,
      startDate: addDays(startDay, 40),
      endDate: addDays(startDay, 42),
      duration: 3,
      progress: 0,
      color: '#f472b6',
      groupId: g4,
      assignee: 'Sophie & Thomas',
      comments: [
        {
          id: 'comm_corrections',
          author: 'Dr. Valérie M.',
          text: 'Séance de relecture programmée. Pensez à apporter deux exemplaires reliés pour annotation.',
          date: addDays(today, -1) + 'T11:00:00Z',
        },
      ],
    },
    {
      id: 't_4_3',
      name: isEn ? 'Slides preparation & video demo' : isDe ? 'Präsentationsfolien & Videodemo' : isIt ? 'Preparazione diapositive & video demo' : 'Préparation du diaporama & Vidéo démonstration',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 't_4_2',
      predecessorLag: 1,
      startDate: addDays(startDay, 43),
      endDate: addDays(startDay, 44),
      duration: 2,
      progress: 0,
      color: '#f472b6',
      groupId: g4,
      assignee: 'Thomas',
    },
    {
      id: 't_4_4',
      name: isEn ? 'Oral defense rehearsal & timing' : isDe ? 'Generalprobe für die Verteidigung' : isIt ? 'Prove orali e gestione tempi' : 'Répétition générale de la présentation orale',
      type: 'task',
      schedulingMode: 'auto',
      predecessorId: 't_4_3',
      startDate: addDays(startDay, 44),
      endDate: addDays(startDay, 44),
      duration: 1,
      progress: 0,
      color: '#fb7185',
      groupId: g4,
      assignee: 'Toute l’équipe',
    },
    {
      id: 'm_4_5',
      name: isEn ? '★ Final Master Thesis Defense (Jury)' : isDe ? '★ Mündliche Masterprüfung (Jury)' : isIt ? '★ Discussione finale di laurea magistrale' : '★ Soutenance officielle devant le Jury de Diplôme',
      type: 'milestone',
      schedulingMode: 'auto',
      predecessorId: 't_4_4',
      predecessorLag: 1,
      startDate: addDays(startDay, 45),
      endDate: addDays(startDay, 45),
      duration: 0,
      progress: 0,
      color: '#ef4444', // Red milestone
      groupId: g4,
      notes: isEn ? 'Grand Amphitheater - 14:00' : 'Grand Amphithéâtre - 14h00 (Remise des diplômes)',
      comments: [
        {
          id: 'comm_final',
          author: 'Jury de Soutenance PFE',
          text: 'Planning de soutenance confirmé. Félicitations à toute l’équipe pour la rigueur du suivi de projet et le respect des échéances.',
          date: addDays(today, 0) + 'T08:30:00Z',
        },
      ],
    },
  ];

  const project: GanttProject = {
    code: normalizeCode(code),
    title: isEn ? 'Master Thesis (PFE) - Autonomous Vehicle' : isDe ? 'Masterarbeit - Autonomes Fahrzeug' : isIt ? 'Tesi di Laurea - Veicolo Autonomo' : 'Projet de Fin d’Études (PFE) - Véhicule Autonome Connecté',
    description: isEn ? 'Complete academic capstone schedule with nested sub-groups, auto-scheduling and visual dependencies' : 'Planning complet de projet d’ingénierie avec sous-groupes, jalons, liaisons manuelles et auto-planification',
    items: recalculateSchedule(sampleItems),
    members: ['Alice', 'Marc', 'Thomas', 'Sophie'],
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
  if (qCode) {
    const trimmed = qCode.trim();
    if (trimmed.startsWith('$')) return trimmed.toUpperCase();
    return normalizeCode(qCode);
  }

  // Check URL hash #CODE
  if (window.location.hash) {
    const hashVal = window.location.hash.replace('#', '').replace('/', '');
    if (hashVal) {
      const trimmed = hashVal.trim();
      if (trimmed.startsWith('$')) return trimmed.toUpperCase();
      return normalizeCode(hashVal);
    }
  }

  // Check pathname /CODE if simple path
  const path = window.location.pathname.replace(/^\//, '').trim();
  if (path && !path.includes('.') && path.length >= 3 && !['index.html', 'app'].includes(path)) {
    if (path.startsWith('$')) return path.toUpperCase();
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
