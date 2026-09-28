import { jsPDF } from 'jspdf';
import { GanttProject, Language } from '../types/gantt';
import { formatReadableDate, getTodayString } from './dates';

interface OnePagerDict {
  headerSubtitle: string;
  defaultTitle: string;
  metricProgress: string;
  metricMilestones: string;
  metricLate: string;
  metricTotal: string;
  subCompleted: (done: number, total: number) => string;
  subObjectives: (pct: number) => string;
  subLateControlled: string;
  subLatePrioritize: string;
  subPhases: (count: number) => string;
  sec1Title: string;
  colMilestone: string;
  colDeadline: string;
  colAssignee: string;
  colStatus: string;
  noMilestones: string;
  statusValidated: string;
  statusLate: string;
  statusPlanned: (pct: number) => string;
  teamDefault: string;
  sec2Title: string;
  colPhase: string;
  colPeriod: string;
  colVisualProgress: string;
  noGroups: string;
  sec3Title: string;
  unassigned: string;
  tasksCount: (c: number) => string;
  officialFooter: string;
  filePrefix: string;
}

const onePagerDict: Record<Language, OnePagerDict> = {
  fr: {
    headerSubtitle: "FICHE DE SYNTHÈSE EXÉCUTIVE · RAPPORT D’AVANCEMENT JURY & SOUTENANCE",
    defaultTitle: "Synthèse de Projet",
    metricProgress: "AVANCEMENT GLOBAL",
    metricMilestones: "JALONS VALIDÉS",
    metricLate: "TÂCHES EN RETARD",
    metricTotal: "TOTAL ÉLÉMENTS",
    subCompleted: (done, total) => `${done}/${total} terminées`,
    subObjectives: (pct) => `${pct}% d’objectifs`,
    subLateControlled: "Planning maîtrisé",
    subLatePrioritize: "À prioriser",
    subPhases: (count) => `${count} grandes phases`,
    sec1Title: "1. LIVRABLES MAJEURS & JALONS STRATÉGIQUES",
    colMilestone: "JALON / LIVRABLE",
    colDeadline: "ÉCHÉANCE",
    colAssignee: "RESPONSABLE",
    colStatus: "STATUT",
    noMilestones: "Aucun jalon défini dans ce planning.",
    statusValidated: "✓ Validé (100%)",
    statusLate: "⚠ En retard",
    statusPlanned: (pct) => `Planifié (${pct}%)`,
    teamDefault: "Équipe",
    sec2Title: "2. STRUCTURATION DU PROJET & AVANCEMENT PAR PHASES",
    colPhase: "PHASE / GROUPE",
    colPeriod: "PÉRIODE",
    colVisualProgress: "AVANCEMENT VISUEL",
    noGroups: "Tâches organisées sans sous-groupes.",
    sec3Title: "3. RÉPARTITION DES CHARGES & ÉQUIPE DU PROJET",
    unassigned: "Non assigné",
    tasksCount: (c) => `${c} tâche(s)`,
    officialFooter: "Document officiel d’ingénierie et de suivi de projet généré automatiquement via Gantt For Student.",
    filePrefix: "Synthese_Jury",
  },
  de: {
    headerSubtitle: "MANAGEMENT-ZUSAMMENFASSUNG · PROJEKTFORTSCHRITTSBERICHT",
    defaultTitle: "Projektübersicht",
    metricProgress: "GESAMTFORTSCHRITT",
    metricMilestones: "ERREICHTE MEILENSTEINE",
    metricLate: "ÜBERFÄLLIGE AUFGABEN",
    metricTotal: "GESAMTELEMENTE",
    subCompleted: (done, total) => `${done}/${total} abgeschlossen`,
    subObjectives: (pct) => `${pct}% der Ziele`,
    subLateControlled: "Zeitplan im Soll",
    subLatePrioritize: "Zu priorisieren",
    subPhases: (count) => `${count} Hauptphasen`,
    sec1Title: "1. WICHTIGE ERGEBNISSE & MEILENSTEINE",
    colMilestone: "MEILENSTEIN / ERGEBNIS",
    colDeadline: "FÄLLIGKEIT",
    colAssignee: "VERANTWORTLICH",
    colStatus: "STATUS",
    noMilestones: "Keine Meilensteine in diesem Projekt definiert.",
    statusValidated: "✓ Erreicht (100%)",
    statusLate: "⚠ Überfällig",
    statusPlanned: (pct) => `Geplant (${pct}%)`,
    teamDefault: "Team",
    sec2Title: "2. PROJEKTSTRUKTUR & FORTSCHRITT NACH PHASEN",
    colPhase: "PHASE / GRUPPE",
    colPeriod: "ZEITRAUM",
    colVisualProgress: "FORTSCHRITTSANZEIGE",
    noGroups: "Aufgaben ohne Untergruppen organisiert.",
    sec3Title: "3. ARBEITSLASTVERTEILUNG & PROJEKTTEAM",
    unassigned: "Nicht zugewiesen",
    tasksCount: (c) => `${c} Aufgabe(n)`,
    officialFooter: "Offizielles Projektdokument, automatisch generiert mit Gantt For Student.",
    filePrefix: "Management_Zusammenfassung",
  },
  it: {
    headerSubtitle: "SCHEDA SINTETICA ESECUTIVA · RELAZIONE DI AVANZAMENTO",
    defaultTitle: "Sintesi del Progetto",
    metricProgress: "AVANZAMENTO TOTALE",
    metricMilestones: "PIETRE MILIARI VALIDE",
    metricLate: "ATTIVITÀ IN RITARDO",
    metricTotal: "TOTALE ELEMENTI",
    subCompleted: (done, total) => `${done}/${total} completate`,
    subObjectives: (pct) => `${pct}% degli obiettivi`,
    subLateControlled: "Pianificazione ok",
    subLatePrioritize: "Da dare priorità",
    subPhases: (count) => `${count} fasi principali`,
    sec1Title: "1. PRINCIPALI ENTREGABILI & PIETRE MILIARI",
    colMilestone: "PIETRA MILIARE / ENTREGABILE",
    colDeadline: "SCADENZA",
    colAssignee: "RESPONSABILE",
    colStatus: "STATO",
    noMilestones: "Nessuna pietra miliare definita in questo progetto.",
    statusValidated: "✓ Completato (100%)",
    statusLate: "⚠ In ritardo",
    statusPlanned: (pct) => `Pianificato (${pct}%)`,
    teamDefault: "Team",
    sec2Title: "2. STRUTTURA DEL PROGETTO E AVANZAMENTO PER FASI",
    colPhase: "FASE / GRUPPO",
    colPeriod: "PERIODO",
    colVisualProgress: "AVANZAMENTO VISIVO",
    noGroups: "Attività organizzate senza sottogruppi.",
    sec3Title: "3. DISTRIBUZIONE DEI CARICHI E TEAM DI PROGETTO",
    unassigned: "Non assegnato",
    tasksCount: (c) => `${c} attività`,
    officialFooter: "Documento ufficiale di gestione generato automaticamente da Gantt For Student.",
    filePrefix: "Sintesi_Commissione",
  },
  en: {
    headerSubtitle: "EXECUTIVE ONE-PAGER · DEFENSE & MILESTONE PROGRESS REPORT",
    defaultTitle: "Project Summary",
    metricProgress: "OVERALL PROGRESS",
    metricMilestones: "MILESTONES COMPLETED",
    metricLate: "OVERDUE TASKS",
    metricTotal: "TOTAL ITEMS",
    subCompleted: (done, total) => `${done}/${total} completed`,
    subObjectives: (pct) => `${pct}% of objectives`,
    subLateControlled: "On schedule",
    subLatePrioritize: "Action required",
    subPhases: (count) => `${count} main phases`,
    sec1Title: "1. MAJOR DELIVERABLES & KEY MILESTONES",
    colMilestone: "MILESTONE / DELIVERABLE",
    colDeadline: "DUE DATE",
    colAssignee: "ASSIGNEE",
    colStatus: "STATUS",
    noMilestones: "No milestones defined in this project.",
    statusValidated: "✓ Completed (100%)",
    statusLate: "⚠ Overdue",
    statusPlanned: (pct) => `Planned (${pct}%)`,
    teamDefault: "Team",
    sec2Title: "2. PROJECT BREAKDOWN & PROGRESS BY PHASE",
    colPhase: "PHASE / GROUP",
    colPeriod: "TIMEFRAME",
    colVisualProgress: "PROGRESS",
    noGroups: "Tasks organized without sub-groups.",
    sec3Title: "3. WORKLOAD DISTRIBUTION & PROJECT TEAM",
    unassigned: "Unassigned",
    tasksCount: (c) => `${c} task(s)`,
    officialFooter: "Official project engineering and tracking document generated by Gantt For Student.",
    filePrefix: "Executive_Summary",
  },
};

/**
 * Generates an executive One-Pager (A4 Portrait PDF) designed specifically
 * for academic juries, project defenses, and thesis appendices.
 */
export async function exportOnePagerPdf(project: GanttProject, lang: Language) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const d = onePagerDict[lang] || onePagerDict.en;
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const todayStr = getTodayString();

  // Color palette
  const darkBg: [number, number, number] = [15, 17, 23];
  const cardBg: [number, number, number] = [248, 250, 252];
  const primaryIndigo: [number, number, number] = [79, 70, 229];
  const textDark: [number, number, number] = [30, 41, 59];
  const textMuted: [number, number, number] = [100, 116, 139];
  const borderLight: [number, number, number] = [226, 232, 240];
  const successGreen: [number, number, number] = [16, 185, 129];
  const alertRed: [number, number, number] = [225, 29, 72];

  // 1. TOP HEADER BANNER (Indigo gradient effect with solid dark)
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent bar
  doc.setFillColor(...primaryIndigo);
  doc.rect(0, 37, pageWidth, 1.5, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const titleText = doc.splitTextToSize(project.title || d.defaultTitle, contentWidth - 45);
  doc.text(titleText[0] || d.defaultTitle, margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254);
  doc.text(d.headerSubtitle, margin, 22);

  // Project Code & Date Pills
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 35, 10, 35, 18, 2, 2, 'F');
  doc.setTextColor(129, 140, 248);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(project.code, pageWidth - margin - 17.5, 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(formatReadableDate(todayStr, lang), pageWidth - margin - 17.5, 24, { align: 'center' });

  // Description / Objective if available
  let curY = 44;
  if (project.description) {
    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    const descLines = doc.splitTextToSize(project.description, contentWidth);
    doc.text(descLines.slice(0, 2), margin, curY);
    curY += Math.min(descLines.length, 2) * 4.5 + 3;
  }

  // 2. KEY METRICS CARDS
  const items = project.items;
  const nonGroupItems = items.filter((i) => i.type !== 'group');
  const milestones = items.filter((i) => i.type === 'milestone');
  const completedMilestones = milestones.filter((m) => m.progress === 100);
  const completedTasks = nonGroupItems.filter((i) => i.progress === 100);
  const lateTasks = nonGroupItems.filter(
    (i) => i.endDate < todayStr && i.progress < 100 && i.type === 'task'
  );

  const avgProgress =
    nonGroupItems.length > 0
      ? Math.round(
          nonGroupItems.reduce((acc, i) => acc + (i.progress || 0), 0) / nonGroupItems.length
        )
      : 0;

  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 18;
  const metrics = [
    { label: d.metricProgress, value: `${avgProgress}%`, sub: d.subCompleted(completedTasks.length, nonGroupItems.length) },
    { label: d.metricMilestones, value: `${completedMilestones.length}/${milestones.length}`, sub: d.subObjectives(Math.round((completedMilestones.length / Math.max(1, milestones.length)) * 100)) },
    { label: d.metricLate, value: `${lateTasks.length}`, sub: lateTasks.length === 0 ? d.subLateControlled : d.subLatePrioritize },
    { label: d.metricTotal, value: `${items.length}`, sub: d.subPhases(items.filter(i => i.type === 'group').length) },
  ];

  metrics.forEach((m, idx) => {
    const x = margin + idx * (cardWidth + 3);
    doc.setFillColor(...cardBg);
    doc.setDrawColor(...borderLight);
    doc.roundedRect(x, curY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text(m.label, x + 3.5, curY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...(idx === 2 && lateTasks.length > 0 ? alertRed : primaryIndigo));
    doc.text(m.value, x + 3.5, curY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text(m.sub, x + 3.5, curY + 15.5);
  });

  curY += cardHeight + 7;

  // 3. TABLE 1: JALONS STRATÉGIQUES ET LIVRABLES (KEY DELIVERABLES)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text(d.sec1Title, margin, curY);

  doc.setDrawColor(...primaryIndigo);
  doc.setLineWidth(0.4);
  doc.line(margin, curY + 1.5, margin + 40, curY + 1.5);
  curY += 5;

  // Table header
  doc.setFillColor(...darkBg);
  doc.rect(margin, curY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(d.colMilestone, margin + 3, curY + 4);
  doc.text(d.colDeadline, margin + 85, curY + 4);
  doc.text(d.colAssignee, margin + 120, curY + 4);
  doc.text(d.colStatus, margin + 158, curY + 4);
  curY += 6;

  const keyMilestones = milestones.slice(0, 7);
  if (keyMilestones.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(d.noMilestones, margin + 3, curY + 5);
    curY += 8;
  } else {
    keyMilestones.forEach((m, idx) => {
      const rowBg: [number, number, number] = idx % 2 === 0 ? [255, 255, 255] : cardBg;
      doc.setFillColor(...rowBg);
      doc.rect(margin, curY, contentWidth, 6.5, 'F');
      doc.setDrawColor(...borderLight);
      doc.line(margin, curY + 6.5, margin + contentWidth, curY + 6.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...textDark);
      const name = m.name.length > 45 ? m.name.slice(0, 42) + '...' : m.name;
      doc.text(`★ ${name}`, margin + 3, curY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      doc.text(formatReadableDate(m.startDate, lang), margin + 85, curY + 4.5);
      doc.text(m.assignee || d.teamDefault, margin + 120, curY + 4.5);

      // Status pill
      const isDone = m.progress === 100;
      const isLate = m.endDate < todayStr && !isDone;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      if (isDone) {
        doc.setTextColor(...successGreen);
        doc.text(d.statusValidated, margin + 158, curY + 4.5);
      } else if (isLate) {
        doc.setTextColor(...alertRed);
        doc.text(d.statusLate, margin + 158, curY + 4.5);
      } else {
        doc.setTextColor(...primaryIndigo);
        doc.text(d.statusPlanned(m.progress), margin + 158, curY + 4.5);
      }

      curY += 6.5;
    });
  }

  curY += 6;

  // 4. TABLE 2: GRANDES PHASES DU PROJET (GROUPS)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text(d.sec2Title, margin, curY);

  doc.setDrawColor(...primaryIndigo);
  doc.setLineWidth(0.4);
  doc.line(margin, curY + 1.5, margin + 45, curY + 1.5);
  curY += 5;

  // Table header
  doc.setFillColor(...darkBg);
  doc.rect(margin, curY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(d.colPhase, margin + 3, curY + 4);
  doc.text(d.colPeriod, margin + 85, curY + 4);
  doc.text(d.colVisualProgress, margin + 130, curY + 4);
  curY += 6;

  const rootGroups = items.filter((i) => i.type === 'group' && !i.groupId).slice(0, 6);
  if (rootGroups.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(d.noGroups, margin + 3, curY + 5);
    curY += 8;
  } else {
    rootGroups.forEach((g, idx) => {
      const rowBg: [number, number, number] = idx % 2 === 0 ? [255, 255, 255] : cardBg;
      doc.setFillColor(...rowBg);
      doc.rect(margin, curY, contentWidth, 7.5, 'F');
      doc.setDrawColor(...borderLight);
      doc.line(margin, curY + 7.5, margin + contentWidth, curY + 7.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...textDark);
      const gName = g.name.length > 40 ? g.name.slice(0, 37) + '...' : g.name;
      doc.text(gName, margin + 3, curY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      doc.text(`${formatReadableDate(g.startDate, lang)} → ${formatReadableDate(g.endDate, lang)}`, margin + 85, curY + 5);

      // Progress bar in PDF
      const barX = margin + 130;
      const barWidthTotal = 40;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(barX, curY + 2.5, barWidthTotal, 3, 1, 1, 'F');

      const fillW = Math.max(1, (g.progress / 100) * barWidthTotal);
      doc.setFillColor(...(g.progress === 100 ? successGreen : primaryIndigo));
      doc.roundedRect(barX, curY + 2.5, fillW, 3, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...(g.progress === 100 ? successGreen : primaryIndigo));
      doc.text(`${g.progress}%`, barX + barWidthTotal + 3, curY + 5);

      curY += 7.5;
    });
  }

  curY += 6;

  // 5. SECTION 3: RÉPARTITION DE L'ÉQUIPE ET COLLABORATEURS
  const assigneesMap = new Map<string, number>();
  nonGroupItems.forEach((it) => {
    const raw = it.assignee?.trim() || d.unassigned;
    const splitNames = raw.split(/[,&/]/).map((n) => n.trim()).filter(Boolean);
    splitNames.forEach((n) => {
      assigneesMap.set(n, (assigneesMap.get(n) || 0) + 1);
    });
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text(d.sec3Title, margin, curY);

  doc.setDrawColor(...primaryIndigo);
  doc.setLineWidth(0.4);
  doc.line(margin, curY + 1.5, margin + 45, curY + 1.5);
  curY += 5;

  const teamList = Array.from(assigneesMap.entries()).slice(0, 8);
  const teamCardWidth = (contentWidth - 6) / 3;
  let teamRow = 0;
  teamList.forEach(([name, count], idx) => {
    const col = idx % 3;
    if (idx > 0 && col === 0) teamRow++;
    const x = margin + col * (teamCardWidth + 3);
    const y = curY + teamRow * 9;

    doc.setFillColor(...cardBg);
    doc.setDrawColor(...borderLight);
    doc.roundedRect(x, y, teamCardWidth, 7.5, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);
    doc.text(name, x + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...primaryIndigo);
    doc.text(d.tasksCount(count), x + teamCardWidth - 3, y + 5, { align: 'right' });
  });

  // 6. OFFICIAL FOOTER
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text(d.officialFooter, margin, pageHeight - 8);
  doc.text(`Page 1 / 1 · Code: ${project.code}`, pageWidth - margin, pageHeight - 8, { align: 'right' });

  // Save / Download PDF
  const safeTitle = (project.title || project.code).replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${d.filePrefix}_${safeTitle}_${project.code}.pdf`);
}
