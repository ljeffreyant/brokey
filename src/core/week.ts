const DAY = 24 * 60 * 60 * 1000;

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function addDays(ts: number, n: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + n);
  return d.getTime();
}

/** Start of the week containing ts. weekStartsOn: 0 = Sunday ... 6 = Saturday. */
export function startOfWeek(ts: number, weekStartsOn: number): number {
  const d = new Date(startOfDay(ts));
  const diff = (d.getDay() - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d.getTime();
}

/** Whole days elapsed since the start of the week (0 on the first day). */
export function dayIndexInWeek(ts: number, weekStartsOn: number): number {
  const start = startOfWeek(ts, weekStartsOn);
  return Math.round((startOfDay(ts) - start) / DAY);
}

/** Days left in the week including today (7 on the first day, 1 on the last). */
export function daysLeftInWeek(ts: number, weekStartsOn: number): number {
  return 7 - dayIndexInWeek(ts, weekStartsOn);
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function dayLabel(ts: number): string {
  return DAY_LABELS[new Date(ts).getDay()];
}

export function sameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}
