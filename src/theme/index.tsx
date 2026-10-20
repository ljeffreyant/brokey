import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useStore } from '../store';
import { PALETTES, Palette, PaletteId } from './palettes';

export * from './palettes';

const Ctx = createContext<Palette>(PALETTES.garlic);

export function resolvePalette(theme: string, scheme: string | null | undefined): Palette {
  if (theme === 'garlic' || theme === 'bbq' || theme === 'kebab') return PALETTES[theme as PaletteId];
  return scheme === 'light' ? PALETTES.garlic : PALETTES.bbq;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.settings.theme);
  const scheme = useColorScheme();
  const palette = useMemo(() => resolvePalette(theme, scheme), [theme, scheme]);
  return <Ctx.Provider value={palette}>{children}</Ctx.Provider>;
}

export const useTheme = (): Palette => useContext(Ctx);
