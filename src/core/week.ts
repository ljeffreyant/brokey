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


/** The moment `n` calendar days ago at the current time of day (calendar maths, so clock changes do not shift the day). */
export function dayTs(n: number, now = Date.now()): number {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.getTime();
}

/** Whole calendar days between `ts` and today (0 = today, never negative). */
export function daysAgoOf(ts: number, now = Date.now()): number {
  const a = new Date(now);
  a.setHours(0, 0, 0, 0);
  const b = new Date(ts);
  b.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((a.getTime() - b.getTime()) / 86400000));
}
