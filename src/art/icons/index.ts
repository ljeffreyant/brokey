import { Scene } from '../scene';
import { Ico, IconDef } from './kit';
import { FOOD } from './food';
import { GO } from './go';
import { SHOP } from './shop';
import { BILLS } from './bills';
import { LIFE } from './life';
import { EXTRA } from './extra';

/** The few icons that keep a face, each with a hand-set expression. Everything else is a plain object. */
export const HERO_ICONS: ReadonlySet<string> = new Set(['hsp', 'coffee', 'boba', 'burger', 'chips', 'beer', 'pizza', 'kebab', 'taco', 'noodles']);

export const ICON_DEFS: IconDef[] = [...FOOD, ...GO, ...SHOP, ...BILLS, ...LIFE, ...EXTRA];

const byId = new Map(ICON_DEFS.map((d) => [d.id, d]));
const cache = new Map<string, Scene>();

export function hasIcon(id: string): boolean {
  return byId.has(id);
}

export function iconDef(id: string): IconDef | undefined {
  return byId.get(id);
}

/** The scene for an icon id. Falls back to a question mark box so a bad id never crashes a screen. */
export function iconScene(id: string): Scene {
  const hit = cache.get(id);
  if (hit) return hit;
  const d = byId.get(id) ?? byId.get('questionbox') ?? ICON_DEFS[0];
  let seed = 1;
  for (const ch of d.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const b = new Ico(seed);
  b.faces = HERO_ICONS.has(d.id);
  d.draw(b);
  const sc = b.build();
  cache.set(id, sc);
  return sc;
}

export function searchIcons(q: string): IconDef[] {
  const t = q.trim().toLowerCase();
  if (!t) return ICON_DEFS;
  return ICON_DEFS.filter((d) => d.id.includes(t) || d.label.toLowerCase().includes(t) || d.tags.some((x) => x.includes(t)));
}
