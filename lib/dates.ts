import { addDays, endOfWeek, format, parseISO, startOfWeek, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function tomorrowISO(): string {
  return format(addDays(new Date(), 1), "yyyy-MM-dd");
}

export function yesterdayISO(): string {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
}

export function formatDayLabel(dateISO: string): string {
  if (dateISO === todayISO()) return "Hoje";
  if (dateISO === yesterdayISO()) return "Ontem";
  const label = format(parseISO(dateISO), "EEEE, d 'de' MMM", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function currentWeekBoundsISO(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    end: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
  };
}
