import { jsPDF } from 'jspdf';
import { GanttProject, Language } from '../types/gantt';
import { formatReadableDate, getTodayString } from './dates';

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
  const titleText = doc.splitTextToSize(project.title || 'Synthèse de Projet', contentWidth - 45);
  doc.text(titleText[0] || 'Synthèse de Projet', margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254);
  doc.text('FICHE DE SYNTHÈSE EXÉCUTIVE · RAPPORT D’AVANCEMENT JURY & SOUTENANCE', margin, 22);

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
    { label: 'AVANCEMENT GLOBAL', value: `${avgProgress}%`, sub: `${completedTasks.length}/${nonGroupItems.length} terminées` },
    { label: 'JALONS VALIDÉS', value: `${completedMilestones.length}/${milestones.length}`, sub: `${Math.round((completedMilestones.length / Math.max(1, milestones.length)) * 100)}% d’objectifs` },
    { label: 'TÂCHES EN RETARD', value: `${lateTasks.length}`, sub: lateTasks.length === 0 ? 'Planning maîtrisé' : 'À prioriser' },
    { label: 'TOTAL ÉLÉMENTS', value: `${items.length}`, sub: `${items.filter(i => i.type === 'group').length} grandes phases` },
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
    doc.setTextColor(...(idx === 2 && lateTasks.length > 0 ? [225, 29, 72] : primaryIndigo));
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
  doc.text('1. LIVRABLES MAJEURS & JALONS STRATÉGIQUES', margin, curY);

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
  doc.text('JALON / LIVRABLE', margin + 3, curY + 4);
  doc.text('ÉCHÉANCE', margin + 85, curY + 4);
  doc.text('RESPONSABLE', margin + 120, curY + 4);
  doc.text('STATUT', margin + 158, curY + 4);
  curY += 6;

  const keyMilestones = milestones.slice(0, 7);
  if (keyMilestones.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('Aucun jalon défini dans ce planning.', margin + 3, curY + 5);
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
      doc.text(m.assignee || 'Équipe', margin + 120, curY + 4.5);

      // Status pill
      const isDone = m.progress === 100;
      const isLate = m.endDate < todayStr && !isDone;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      if (isDone) {
        doc.setTextColor(16, 185, 129);
        doc.text('✓ Validé (100%)', margin + 158, curY + 4.5);
      } else if (isLate) {
        doc.setTextColor(225, 29, 72);
        doc.text('⚠ En retard', margin + 158, curY + 4.5);
      } else {
        doc.setTextColor(79, 70, 229);
        doc.text(`Planifié (${m.progress}%)`, margin + 158, curY + 4.5);
      }

      curY += 6.5;
    });
  }

  curY += 6;

  // 4. TABLE 2: GRANDES PHASES DU PROJET (GROUPS)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text('2. STRUCTURATION DU PROJET & AVANCEMENT PAR PHASES', margin, curY);

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
  doc.text('PHASE / GROUPE', margin + 3, curY + 4);
  doc.text('PÉRIODE', margin + 85, curY + 4);
  doc.text('AVANCEMENT VISUEL', margin + 130, curY + 4);
  curY += 6;

  const rootGroups = items.filter((i) => i.type === 'group' && !i.groupId).slice(0, 6);
  if (rootGroups.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('Tâches organisées sans sous-groupes.', margin + 3, curY + 5);
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
      doc.setFillColor(...(g.progress === 100 ? [16, 185, 129] : primaryIndigo));
      doc.roundedRect(barX, curY + 2.5, fillW, 3, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...(g.progress === 100 ? [16, 185, 129] : primaryIndigo));
      doc.text(`${g.progress}%`, barX + barWidthTotal + 3, curY + 5);

      curY += 7.5;
    });
  }

  curY += 6;

  // 5. SECTION 3: RÉPARTITION DE L'ÉQUIPE ET COLLABORATEURS
  const assigneesMap = new Map<string, number>();
  nonGroupItems.forEach((it) => {
    const raw = it.assignee?.trim() || 'Non assigné';
    const splitNames = raw.split(/[,&/]/).map((n) => n.trim()).filter(Boolean);
    splitNames.forEach((n) => {
      assigneesMap.set(n, (assigneesMap.get(n) || 0) + 1);
    });
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text('3. RÉPARTITION DES CHARGES & ÉQUIPE DU PROJET', margin, curY);

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
    doc.text(`${count} tâche(s)`, x + teamCardWidth - 3, y + 5, { align: 'right' });
  });

  // 6. OFFICIAL FOOTER
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text('Document officiel d’ingénierie et de suivi de projet généré automatiquement via Gantt For Student.', margin, pageHeight - 8);
  doc.text(`Page 1 / 1 · Code: ${project.code}`, pageWidth - margin, pageHeight - 8, { align: 'right' });

  // Save / Download PDF
  const safeTitle = (project.title || project.code).replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Synthese_Jury_${safeTitle}_${project.code}.pdf`);
}
