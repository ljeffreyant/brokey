import { describe, expect, it } from 'vitest';
import { BUILTIN_CATEGORIES } from '../../core/categories';
import { ICON_DEFS, hasIcon, iconScene, searchIcons } from './index';

describe('icon library', () => {
  it('has 100+ icons with unique ids and labels', () => {
    expect(ICON_DEFS.length).toBeGreaterThanOrEqual(100);
    const ids = ICON_DEFS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const d of ICON_DEFS) {
      expect(d.label.length).toBeGreaterThan(1);
      expect(d.tags.length).toBeGreaterThan(0);
    }
  });
  it('has an icon for every built-in category', () => {
    for (const c of BUILTIN_CATEGORIES) expect(hasIcon(c.icon), `${c.id} -> ${c.icon}`).toBe(true);
  });
  it('builds a non-empty scene for each icon and falls back safely', () => {
    for (const d of ICON_DEFS) expect(iconScene(d.id).prims.length).toBeGreaterThan(4);
    expect(iconScene('does-not-exist').prims.length).toBeGreaterThan(4);
  });
  it('searches by label and tag', () => {
    expect(searchIcons('boba').some((d) => d.id === 'boba')).toBe(true);
    expect(searchIcons('netflix').some((d) => d.id === 'tv')).toBe(true);
    expect(searchIcons('').length).toBe(ICON_DEFS.length);
  });
});
