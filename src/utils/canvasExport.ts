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
 * and downloads a crystal-clear PNG image for presentation slides.
 * This guarantees 100% reliability with zero CSS/Tailwind 4 conflicts.
 */
export function exportGanttAsPng(project: GanttProject, lang: Language, zoom: ZoomLevel = 'days'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
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
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // 2. Presentation Top Banner
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, totalWidth, bannerHeight);

      // Bottom border for banner
      ctx.strokeStyle = '#1e293b';
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
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
      const statsText = `${items.length} éléments · ${formatReadableDate(bounds.start, lang)} → ${formatReadableDate(bounds.end, lang)} · ${zoomBadgeText}`;
      ctx.fillText(statsText, totalWidth - ctx.measureText(statsText).width - 24, 31);

      // 3. Left column header
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, bannerHeight, leftColWidth, headerHeight - bannerHeight);

      ctx.fillStyle = '#94a3b8';
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
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(monthStartX, monthRowY, x - monthStartX, monthRowHeight);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(monthStartX, monthRowY, x - monthStartX, monthRowHeight);

            ctx.fillStyle = '#e2e8f0';
            ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText(monthName, monthStartX + 8, monthRowY + 15);
          }
          currentMonth = day.monthIndex;
          monthStartX = x;
          monthName = `${getMonthName(day.monthIndex, lang)} ${day.year}`;
        }
      });
      // Last month
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(monthStartX, monthRowY, chartStartX + days.length * dayWidth - monthStartX, monthRowHeight);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(monthStartX, monthRowY, chartStartX + days.length * dayWidth - monthStartX, monthRowHeight);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(monthName, monthStartX + 8, monthRowY + 15);

      // Day numbers row
      const todayStr = getTodayString();
      days.forEach((day, i) => {
        const x = chartStartX + i * dayWidth;

        // Day header box
        ctx.fillStyle = day.isToday ? '#7f1d1d' : day.isWeekend ? '#161e33' : '#0f172a';
        ctx.fillRect(x, dayRowY, dayWidth, dayRowHeight);

        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(x, dayRowY, dayWidth, dayRowHeight);

        if (zoom === 'days') {
          // Number
          ctx.fillStyle = day.isToday ? '#fecaca' : day.isWeekend ? '#64748b' : '#cbd5e1';
          ctx.font = 'bold 10px monospace';
          const numText = String(day.dayNumber);
          const tw = ctx.measureText(numText).width;
          ctx.fillText(numText, x + (dayWidth - tw) / 2, dayRowY + 11);

          // Day abbreviation (LUN, MAR...)
          ctx.fillStyle = day.isToday ? '#fca5a5' : day.isWeekend ? '#475569' : '#94a3b8';
          ctx.font = '8px sans-serif';
          const shortText = day.dayShort.slice(0, 3).toUpperCase();
          const stw = ctx.measureText(shortText).width;
          ctx.fillText(shortText, x + (dayWidth - stw) / 2, dayRowY + 22);
        } else if (zoom === 'weeks') {
          // In weeks mode: day number and 1-letter initial
          ctx.fillStyle = day.isToday ? '#fecaca' : day.isWeekend ? '#64748b' : '#cbd5e1';
          ctx.font = 'bold 9px monospace';
          const numText = String(day.dayNumber);
          const tw = ctx.measureText(numText).width;
          ctx.fillText(numText, x + (dayWidth - tw) / 2, dayRowY + 11);

          ctx.fillStyle = day.isToday ? '#fca5a5' : day.isWeekend ? '#475569' : '#94a3b8';
          ctx.font = '8px sans-serif';
          const initial = day.dayShort.slice(0, 1).toUpperCase();
          const itw = ctx.measureText(initial).width;
          ctx.fillText(initial, x + (dayWidth - itw) / 2, dayRowY + 21);
        } else {
          // In months mode: show number every 5 days or 1st of month
          const showNumber = day.dayNumber === 1 || day.dayNumber % 5 === 0;
          if (showNumber) {
            ctx.fillStyle = day.isToday ? '#fecaca' : day.isWeekend ? '#64748b' : '#cbd5e1';
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
          ctx.fillStyle = '#0f172d';
          ctx.fillRect(x, headerHeight, dayWidth, rowCount * rowHeight);
        }

        ctx.strokeStyle = '#172033';
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
          ? (isSubGroup ? '#11192e' : '#0e1628')
          : (rowIndex % 2 === 0 ? '#0b0f19' : '#0d1322');
        ctx.fillRect(0, rowY, totalWidth, rowHeight);

        // Row divider
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, rowY + rowHeight);
        ctx.lineTo(totalWidth, rowY + rowHeight);
        ctx.stroke();

        // Left sidebar label
        const indent = 16 + level * 12;
        ctx.fillStyle = isGroup ? (isSubGroup ? '#c7d2fe' : '#f8fafc') : isMilestone ? '#fef08a' : '#cbd5e1';
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

          // Background of task
          ctx.fillStyle = `${barColor}44`;
          ctx.beginPath();
          ctx.roundRect(startX, barY, barWidth, barH, radius);
          ctx.fill();

          // Border
          ctx.strokeStyle = barColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Progress fill
          if (item.progress > 0) {
            const fillWidth = (barWidth * item.progress) / 100;
            ctx.fillStyle = barColor;
            ctx.beginPath();
            ctx.roundRect(startX, barY, fillWidth, barH, radius);
            ctx.fill();
          }

          // Label inside or beside task
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          if (barWidth > 60) {
            ctx.fillText(item.name, startX + 8, barY + 17);
          } else {
            ctx.fillText(`${item.name} (${durationDays}j)`, startX + barWidth + 6, barY + 17);
          }
        }
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

      // 8. Convert to PNG and Trigger Download
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
