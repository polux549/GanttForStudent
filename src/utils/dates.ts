import { Language } from '../types/gantt';

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function diffDays(startStr: string, endStr: string): number {
  const d1 = parseDate(startStr);
  const d2 = parseDate(endStr);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getTodayString(): string {
  // Fix: The environment clock is 1 day in advance. Shift by -1 day so "Aujourd'hui" aligns with the current calendar day
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

export function isWeekend(dateStr: string): boolean {
  const d = parseDate(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function isSunday(dateStr: string): boolean {
  const d = parseDate(dateStr);
  return d.getDay() === 0;
}

export function isSaturday(dateStr: string): boolean {
  const d = parseDate(dateStr);
  return d.getDay() === 6;
}

export function getDayOfWeekIndex(dateStr: string): number {
  return parseDate(dateStr).getDay();
}

const dayNames: Record<Language, string[]> = {
  fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  it: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const monthNames: Record<Language, string[]> = {
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export function getDayNameShort(dateStr: string, lang: Language): string {
  const d = parseDate(dateStr);
  return dayNames[lang][d.getDay()];
}

export function getMonthName(monthIndex: number, lang: Language): string {
  return monthNames[lang][monthIndex];
}

export function formatReadableDate(dateStr: string, lang: Language): string {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  const day = d.getDate();
  const m = monthNames[lang][d.getMonth()].slice(0, 3);
  const y = d.getFullYear();
  return `${day} ${m} ${y}`;
}

export interface DayColumn {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayShort: string;
  isWeekend: boolean;
  isToday: boolean;
  monthIndex: number;
  year: number;
}

export function generateDaysRange(startDateStr: string, endDateStr: string, lang: Language): DayColumn[] {
  const result: DayColumn[] = [];
  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);
  const todayStr = getTodayString();

  const current = new Date(start);
  while (current <= end) {
    const dStr = formatDate(current);
    result.push({
      date: dStr,
      dayNumber: current.getDate(),
      dayShort: dayNames[lang][current.getDay()],
      isWeekend: current.getDay() === 0 || current.getDay() === 6,
      isToday: dStr === todayStr,
      monthIndex: current.getMonth(),
      year: current.getFullYear(),
    });
    current.setDate(current.getDate() + 1);
  }
  return result;
}
