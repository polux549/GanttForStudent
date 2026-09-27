import { GanttProject } from '../types/gantt';

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function formatDateToIcs(dateStr: string): string {
  // Convert YYYY-MM-DD to YYYYMMDD
  return dateStr.replace(/-/g, '');
}

function formatDateTimeIcs(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates and triggers download of an RFC 5545 compliant .ics calendar file.
 * Compatible with Google Calendar, Apple Calendar, Microsoft Outlook, etc.
 */
export function exportProjectAsIcs(project: GanttProject) {
  const nowStr = formatDateTimeIcs(new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gantt For Student//Project Scheduler//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(project.title || 'Gantt For Student')}`,
    'X-WR-TIMEZONE:Europe/Paris',
  ];

  for (const item of project.items) {
    // Skip groups, only export tasks and milestones
    if (item.type === 'group') continue;

    const startDate = formatDateToIcs(item.startDate);
    
    // For all-day events in RFC 5545, DTEND is exclusive (day after endDate)
    const endDateObj = new Date(item.endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const endDate = formatDateToIcs(endDateObj.toISOString().split('T')[0]);

    const isMilestone = item.type === 'milestone';
    const summaryPrefix = isMilestone ? '★ [JALON] ' : '';
    const summary = summaryPrefix + item.name;

    const descParts: string[] = [];
    if (item.notes) descParts.push(`Notes: ${item.notes}`);
    if (item.assignee) descParts.push(`Responsable: ${item.assignee}`);
    descParts.push(`Avancement: ${item.progress}%`);
    descParts.push(`Projet: ${project.title || 'Gantt'} (${project.code})`);
    const description = descParts.join('\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${item.id}-${project.code}@ganttforstudent.app`,
      `DTSTAMP:${nowStr}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `STATUS:${item.progress === 100 ? 'COMPLETED' : 'CONFIRMED'}`,
      isMilestone ? 'PRIORITY:1' : 'PRIORITY:5',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = downloadUrl;
  const safeTitle = (project.title || project.code).replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `Planning_${safeTitle}_${project.code}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
