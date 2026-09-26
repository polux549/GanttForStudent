import { jsPDF } from 'jspdf';
import { GanttProject, Language, ZoomLevel } from '../types/gantt';
import { getOrganizedItems, getTimelineBounds } from './ganttEngine';
import { 
  generateDaysRange, 
  diffDays, 
  formatReadableDate, 
  getMonthName, 
  getTodayString 
} from './dates';

/**
 * Renders the Gantt chart directly onto a high-resolution HTML5 Canvas
 * and returns the canvas element.
 */
export function renderGanttCanvas(project: GanttProject, lang: Language, zoom: ZoomLevel = 'days'): HTMLCanvasElement {
  const items = project.items;
      const bounds = getTimelineBounds(items);
      const days = generateDaysRange(bounds.start, bounds.end, lang);

      // Sizing configuration
      const dayWidth = zoom === 'days' ? 44 : zoom === 'weeks' ? 24 : 14;
      const leftColWidth = 240; // Title & assignee column on slide
      const headerHeight = 90; // Presentation banner + Months + Days
      const rowHeight = 44;
      const bannerHeight = 50;

      const organized = getOrganizedItems(items).filter((r) => r.isVisible);
      const rowCount = Math.max(organized.length, 1);

      const timelineWidth = days.length * dayWidth;
      const totalWidth = leftColWidth + timelineWidth + 40;
      const totalHeight = headerHeight + rowCount * rowHeight + 40;

      // 2x Retina resolution for sharp PowerPoint / Keynote slides
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = totalWidth * scale;
      canvas.height = totalHeight * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      ctx.scale(scale, scale);

      // 1. Canvas Background
      ctx.fillStyle = '#050507';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // 2. Presentation Top Banner
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, totalWidth, bannerHeight);

      // Bottom border for banner
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, bannerHeight);
      ctx.lineTo(totalWidth, bannerHeight);
      ctx.stroke();

      // Project Title & Code
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(project.title || 'Gantt For Student', 20, 31);

      // Code badge
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 11px monospace';
      const codeText = `[ ${project.code} ]`;
      const titleWidth = ctx.measureText(project.title || '').width;
      ctx.fillText(codeText, 35 + titleWidth + 10, 31);

      // Zoom Scale Badge
      const zoomBadgeText = zoom === 'days' 
        ? (lang === 'fr' ? 'Vue Jours' : lang === 'de' ? 'Tage-Ansicht' : lang === 'it' ? 'Vista Giorni' : 'Days View')
        : zoom === 'weeks'
        ? (lang === 'fr' ? 'Vue Semaines' : lang === 'de' ? 'Wochen-Ansicht' : lang === 'it' ? 'Vista Settimane' : 'Weeks View')
        : (lang === 'fr' ? 'Vue Mois' : lang === 'de' ? 'Monats-Ansicht' : lang === 'it' ? 'Vista Mesi' : 'Months View');

      // Date range & stats on right
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
      const statsText = `${items.length} éléments · ${formatReadableDate(bounds.start, lang)} → ${formatReadableDate(bounds.end, lang)} · ${zoomBadgeText}`;
      ctx.fillText(statsText, totalWidth - ctx.measureText(statsText).width - 24, 31);

      // 3. Left column header
      ctx.fillStyle = '#0c0c0e';
      ctx.fillRect(0, bannerHeight, leftColWidth, headerHeight - bannerHeight);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('ÉLÉMENTS / TÂCHES', 20, bannerHeight + 25);

      // 4. Timeline Header (Months & Days)
      const chartStartX = leftColWidth;
      const monthRowY = bannerHeight;
      const monthRowHeight = 22;
      const dayRowY = monthRowY + monthRowHeight;
      const dayRowHeight = headerHeight - dayRowY;

      // Group days into months
      let currentMonth = -1;
      let monthStartX = chartStartX;
      let monthName = '';

      days.forEach((day, i) => {
        const x = chartStartX + i * dayWidth;
        if (day.monthIndex !== currentMonth) {
          if (currentMonth !== -1) {
            // Draw previous month block
            ctx.fillStyle = '#09090b';
            ctx.fillRect(monthStartX, monthRowY, x - monthStartX, monthRowHeight);
            ctx.strokeStyle = '#18181b';
            ctx.strokeRect(monthStartX, monthRowY, x - monthStartX, monthRowHeight);

            ctx.fillStyle = '#f4f4f5';
            ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText(monthName, monthStartX + 8, monthRowY + 15);
          }
          currentMonth = day.monthIndex;
          monthStartX = x;
          monthName = `${getMonthName(day.monthIndex, lang)} ${day.year}`;
        }
      });
      // Last month
      ctx.fillStyle = '#09090b';
      ctx.fillRect(monthStartX, monthRowY, chartStartX + days.length * dayWidth - monthStartX, monthRowHeight);
      ctx.strokeStyle = '#18181b';
      ctx.strokeRect(monthStartX, monthRowY, chartStartX + days.length * dayWidth - monthStartX, monthRowHeight);
      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(monthName, monthStartX + 8, monthRowY + 15);

      // Day numbers row
      const todayStr = getTodayString();
      days.forEach((day, i) => {
        const x = chartStartX + i * dayWidth;

        // Day header box
        ctx.fillStyle = day.isToday ? '#7f1d1d' : day.isWeekend ? '#0a0a0d' : '#040406';
        ctx.fillRect(x, dayRowY, dayWidth, dayRowHeight);

        ctx.strokeStyle = '#18181b';
        ctx.strokeRect(x, dayRowY, dayWidth, dayRowHeight);

        if (zoom === 'days') {
          // Number
          ctx.fillStyle = day.isToday ? '#fecaca' : day.isWeekend ? '#71717a' : '#d4d4d8';
          ctx.font = 'bold 10px monospace';
          const numText = String(day.dayNumber);
          const tw = ctx.measureText(numText).width;
          ctx.fillText(numText, x + (dayWidth - tw) / 2, dayRowY + 11);

          // Day abbreviation (LUN, MAR...)
          ctx.fillStyle = day.isToday ? '#fca5a5' : day.isWeekend ? '#52525b' : '#a1a1aa';
          ctx.font = '8px sans-serif';
          const shortText = day.dayShort.slice(0, 3).toUpperCase();
          const stw = ctx.measureText(shortText).width;
          ctx.fillText(shortText, x + (dayWidth - stw) / 2, dayRowY + 22);
        } else if (zoom === 'weeks') {
          // In weeks mode: day number and 1-letter initial
          ctx.fillStyle = day.isToday ? '#fecaca' : day.isWeekend ? '#71717a' : '#d4d4d8';
          ctx.font = 'bold 9px monospace';
          const numText = String(day.dayNumber);
          const tw = ctx.measureText(numText).width;
          ctx.fillText(numText, x + (dayWidth - tw) / 2, dayRowY + 11);

          ctx.fillStyle = day.isToday ? '#fca5a5' : day.isWeekend ? '#52525b' : '#a1a1aa';
          ctx.font = '8px sans-serif';
          const initial = day.dayShort.slice(0, 1).toUpperCase();
          const itw = ctx.measureText(initial).width;
          ctx.fillText(initial, x + (dayWidth - itw) / 2, dayRowY + 21);
        } else {
          // In months mode: show number every 5 days or 1st of month
          const showNumber = day.dayNumber === 1 || day.dayNumber % 5 === 0;
          if (showNumber) {
            ctx.fillStyle = day.isToday ? '#fecaca' : day.isWeekend ? '#71717a' : '#d4d4d8';
            ctx.font = 'bold 8px monospace';
            const numText = String(day.dayNumber);
            const tw = ctx.measureText(numText).width;
            ctx.fillText(numText, x + (dayWidth - tw) / 2, dayRowY + 15);
          }
        }
      });

      // 5. Grid vertical stripes (Weekends)
      days.forEach((day, i) => {
        const x = chartStartX + i * dayWidth;
        if (day.isWeekend) {
          ctx.fillStyle = '#08080b';
          ctx.fillRect(x, headerHeight, dayWidth, rowCount * rowHeight);
        }

        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, headerHeight);
        ctx.lineTo(x, headerHeight + rowCount * rowHeight);
        ctx.stroke();
      });

      // 6. Rows & Task Items
      organized.forEach(({ item, level }, rowIndex) => {
        const rowY = headerHeight + rowIndex * rowHeight;

        // Row background
        const isGroup = item.type === 'group';
        const isSubGroup = isGroup && level > 0;
        const isMilestone = item.type === 'milestone';

        ctx.fillStyle = isGroup
          ? (isSubGroup ? '#0c0c0f' : '#08080b')
          : (rowIndex % 2 === 0 ? '#040406' : '#060608');
        ctx.fillRect(0, rowY, totalWidth, rowHeight);

        // Row divider
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, rowY + rowHeight);
        ctx.lineTo(totalWidth, rowY + rowHeight);
        ctx.stroke();

        // Left sidebar label
        const indent = 16 + level * 12;
        ctx.fillStyle = isGroup ? (isSubGroup ? '#e0e7ff' : '#f4f4f5') : isMilestone ? '#fef08a' : '#e4e4e7';
        ctx.font = isGroup ? 'bold 11px sans-serif' : '11px sans-serif';

        // Truncate name if too long for sidebar
        const maxChars = Math.max(16, 26 - level * 2);
        let displayName = item.name;
        if (level > 0) {
          displayName = `↳ ${displayName}`;
        }
        if (displayName.length > maxChars) {
          displayName = displayName.slice(0, maxChars - 1) + '…';
        }
        ctx.fillText(displayName, indent, rowY + 26);

        // Progress badge in sidebar
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(`${item.progress}%`, leftColWidth - 45, rowY + 26);

        // Coordinates on timeline
        const startDiff = diffDays(bounds.start, item.startDate);
        const startX = chartStartX + startDiff * dayWidth;
        const durationDays = isMilestone ? 0 : Math.max(1, diffDays(item.startDate, item.endDate) + 1);
        const barWidth = isMilestone ? dayWidth : Math.max(16, durationDays * dayWidth);

        // Draw item on timeline
        if (isMilestone) {
          // Draw diamond
          const centerX = startX + dayWidth / 2;
          const centerY = rowY + rowHeight / 2;
          const diamondSize = 10;

          ctx.fillStyle = item.color || '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - diamondSize);
          ctx.lineTo(centerX + diamondSize, centerY);
          ctx.lineTo(centerX, centerY + diamondSize);
          ctx.lineTo(centerX - diamondSize, centerY);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#fef3c7';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(item.name, centerX + diamondSize + 6, centerY + 3);
        } else if (isGroup) {
          // Draw group bracket bar
          const barY = rowY + 12;
          const barH = 10;
          ctx.fillStyle = item.color || '#475569';
          ctx.fillRect(startX, barY, barWidth, barH);

          // Side brackets
          ctx.beginPath();
          ctx.moveTo(startX, barY + barH);
          ctx.lineTo(startX, barY + barH + 5);
          ctx.moveTo(startX + barWidth, barY + barH);
          ctx.lineTo(startX + barWidth, barY + barH + 5);
          ctx.strokeStyle = item.color || '#475569';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(`${item.name} (${item.progress}%)`, startX + 4, barY - 2);
        } else {
          // Normal task rounded rectangle
          const barY = rowY + 9;
          const barH = 26;
          const radius = 6;
          const barColor = item.color || '#6366f1';

          // Shadow and background of task
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = `${barColor}50`;
          ctx.beginPath();
          ctx.roundRect(startX, barY, barWidth, barH, radius);
          ctx.fill();
          ctx.restore();

          // Progress fill
          if (item.progress > 0) {
            const fillWidth = (barWidth * item.progress) / 100;
            ctx.fillStyle = barColor;
            ctx.beginPath();
            ctx.roundRect(startX, barY, fillWidth, barH, radius);
            ctx.fill();

            // Progress border delimiter
            if (item.progress < 100) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(startX + fillWidth, barY);
              ctx.lineTo(startX + fillWidth, barY + barH);
              ctx.stroke();
            }
          }

          // Main colored border
          ctx.strokeStyle = barColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(startX, barY, barWidth, barH, radius);
          ctx.stroke();

          // Subtle outer 1px light border for superior contrast and separation when overlapping
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(startX - 0.5, barY - 0.5, barWidth + 1, barH + 1, radius + 0.5);
          ctx.stroke();

          // Label inside or beside task with shadow for legibility
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 3;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          if (barWidth > 60) {
            ctx.fillText(item.name, startX + 8, barY + 17);
          } else {
            ctx.fillText(`${item.name} (${durationDays}j)`, startX + barWidth + 6, barY + 17);
          }
          ctx.restore();
        }
      });

      // 6.5 Draw Dependency Lines / Arrows
      const itemRowIndexMap = new Map<string, number>();
      organized.forEach(({ item }, idx) => {
        itemRowIndexMap.set(item.id, idx);
      });

      organized.forEach(({ item }, rowIndex) => {
        if (!item.predecessorId) return;

        let predRowIndex = itemRowIndexMap.get(item.predecessorId);
        let resolvedPredItem = items.find((i) => i.id === item.predecessorId);

        if (predRowIndex === undefined) {
          let curr = resolvedPredItem;
          while (curr && curr.groupId) {
            if (itemRowIndexMap.has(curr.groupId)) {
              predRowIndex = itemRowIndexMap.get(curr.groupId);
              resolvedPredItem = items.find((i) => i.id === curr!.groupId);
              break;
            }
            curr = items.find((i) => i.id === curr!.groupId);
          }
        }

        if (predRowIndex === undefined || !resolvedPredItem) return;
        if (resolvedPredItem.id === item.id) return;

        const predRowY = headerHeight + predRowIndex * rowHeight;
        const predY = predRowY + rowHeight / 2;

        const currRowY = headerHeight + rowIndex * rowHeight;
        const currY = currRowY + rowHeight / 2;

        const predStartDiff = diffDays(bounds.start, resolvedPredItem.startDate);
        const predEndDiff = diffDays(bounds.start, resolvedPredItem.endDate);
        const predStartX = chartStartX + predStartDiff * dayWidth;
        const predEndX = resolvedPredItem.type === 'milestone'
          ? predStartX + dayWidth / 2 + 8
          : chartStartX + predEndDiff * dayWidth + dayWidth;

        const currStartDiff = diffDays(bounds.start, item.startDate);
        const currStartX = item.type === 'milestone'
          ? chartStartX + currStartDiff * dayWidth + dayWidth / 2 - 8
          : chartStartX + currStartDiff * dayWidth;

        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (currStartX - predEndX > 16) {
          const midX = predEndX + 10;
          ctx.moveTo(predEndX, predY);
          ctx.lineTo(midX, predY);
          ctx.lineTo(midX, currY);
          ctx.lineTo(currStartX - 3, currY);
        } else {
          const loopOffset = 14;
          const cornerY = predY < currY ? predY + rowHeight / 2 : predY - rowHeight / 2;
          ctx.moveTo(predEndX, predY);
          ctx.lineTo(predEndX + loopOffset, predY);
          ctx.lineTo(predEndX + loopOffset, cornerY);
          ctx.lineTo(currStartX - loopOffset, cornerY);
          ctx.lineTo(currStartX - loopOffset, currY);
          ctx.lineTo(currStartX - 3, currY);
        }
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.moveTo(currStartX, currY);
        ctx.lineTo(currStartX - 6, currY - 4);
        ctx.lineTo(currStartX - 6, currY + 4);
        ctx.closePath();
        ctx.fill();
      });

      // 7. Red "Today" vertical line across all rows
      const todayIndex = days.findIndex((d) => d.date === todayStr);
      if (todayIndex >= 0) {
        const todayX = chartStartX + todayIndex * dayWidth + dayWidth / 2;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(todayX, headerHeight);
        ctx.lineTo(todayX, headerHeight + rowCount * rowHeight);
        ctx.stroke();

        // Badge at top
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(todayX - 25, headerHeight - 16, 50, 16, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText("AUJOURD'HUI", todayX - 22, headerHeight - 4);
      }

  return canvas;
}

/**
 * Downloads a high-resolution PNG image (2x retina) for PowerPoint or Keynote slides.
 */
export function exportGanttAsPng(project: GanttProject, lang: Language, zoom: ZoomLevel = 'days'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = renderGanttCanvas(project, lang, zoom);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const zoomSuffix = zoom === 'days' ? 'jours' : zoom === 'weeks' ? 'semaines' : 'mois';
        a.download = `Gantt_${project.code}_${zoomSuffix}_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates and downloads a direct high-definition PDF document (A4 or A3 Landscape)
 * ready for printing or academic report submission.
 */
export function exportGanttAsPdf(
  project: GanttProject,
  lang: Language,
  format: 'a4' | 'a3' = 'a4',
  zoom: ZoomLevel = 'days'
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = renderGanttCanvas(project, lang, zoom);
      const imgData = canvas.toDataURL('image/jpeg', 0.94);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availWidth = pageWidth - margin * 2;
      const availHeight = pageHeight - margin * 2;

      const imgRatio = canvas.width / canvas.height;
      let finalWidth = availWidth;
      let finalHeight = finalWidth / imgRatio;

      if (finalHeight > availHeight) {
        finalHeight = availHeight;
        finalWidth = finalHeight * imgRatio;
      }

      const x = margin + (availWidth - finalWidth) / 2;
      const y = margin + (availHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
      pdf.save(`Gantt_${project.code}_${format.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
