import type { Purchase } from './types';

const DAY = 24 * 60 * 60 * 1000;

/** Local midnight at the start of the day `ts` falls in. */
function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * When the "did you log today?" nudge should fire: the next few evenings at `hour`, skipping any day that already has
 * something logged and any evening that has passed. Only a few days ahead, so someone who stops opening the app gets
 * quiet instead of nagged for weeks. The app re-runs this whenever the data changes, which is what drops today's
 * nudge the moment they log something.
 */
export function eveningSlots(args: { now: number; purchases: Pick<Purchase, 'ts'>[]; hour?: number; days?: number }): number[] {
  const hour = args.hour ?? 20;
  const days = args.days ?? 3;
  const logged = new Set(args.purchases.map((p) => startOfDay(p.ts)));
  const out: number[] = [];
  const today = startOfDay(args.now);
  for (let i = 0; i <= days; i++) {
    const d = new Date(today + i * DAY + DAY / 2); // noon, so a daylight-saving jump cannot shift the date
    d.setHours(hour, 0, 0, 0);
    const slot = d.getTime();
    if (slot <= args.now + 60_000) continue;
    if (logged.has(startOfDay(slot))) continue;
    out.push(slot);
    if (out.length >= days) break;
  }
  return out;
}
