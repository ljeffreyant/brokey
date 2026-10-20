import { GroupId } from '../core/types';

export type PaletteId = 'garlic' | 'bbq' | 'kebab';
export type WeatherId = 'sunny' | 'mild' | 'tight' | 'broke';

export interface GroupColor {
  bg: string;
  fg: string;
  deep: string;
}

export interface WeatherColor {
  /** the big colour field behind Brokey */
  field: string;
  /** a second tone for blobs and halftone */
  blob: string;
  /** text on the field */
  text: string;
  textDim: string;
}

export interface Palette {
  id: PaletteId;
  name: string;
  tagline: string;
  dark: boolean;
  bg: string;
  card: string;
  card2: string;
  line: string;
  /** sticker outline and hard shadow colour */
  ink: string;
  text: string;
  textDim: string;
  textFaint: string;
  accent: string;
  accentDeep: string;
  onAccent: string;
  accent2: string;
  accent2Deep: string;
  onAccent2: string;
  good: string;
  bad: string;
  info: string;
  /** neon glow on headline text */
  glow: boolean;
  groups: Record<GroupId, GroupColor>;
  weather: Record<WeatherId, WeatherColor>;
  statusBar: 'light' | 'dark';
}

export const GARLIC: Palette = {
  id: 'garlic',
  name: 'Garlic',
  tagline: 'light, creamy, a bit too much sauce',
  dark: false,
  bg: '#FFF6E6',
  card: '#FFFDF6',
  card2: '#F6E8CE',
  line: '#E6D5B5',
  ink: '#24120A',
  text: '#24120A',
  textDim: '#6E5844',
  textFaint: '#A89478',
  accent: '#EE3B2B',
  accentDeep: '#B3261B',
  onAccent: '#FFF6E6',
  accent2: '#FFD23F',
  accent2Deep: '#E8A515',
  onAccent2: '#24120A',
  good: '#3FA34D',
  bad: '#EE3B2B',
  info: '#3F95D8',
  glow: false,
  groups: {
    chips: { bg: '#FFD23F', fg: '#24120A', deep: '#E8A515' },
    meat: { bg: '#B56D36', fg: '#FFF6E6', deep: '#7A3F1A' },
    garlic: { bg: '#FFFDF3', fg: '#24120A', deep: '#E1D7B8' },
    chilli: { bg: '#EE3B2B', fg: '#FFF6E6', deep: '#9F2016' },
    bbq: { bg: '#7A3517', fg: '#FFF6E6', deep: '#4D200C' },
  },
  weather: {
    sunny: { field: '#FFD23F', blob: '#FFE680', text: '#24120A', textDim: '#6B4E0E' },
    mild: { field: '#FFB547', blob: '#FFD08A', text: '#24120A', textDim: '#6B3F08' },
    tight: { field: '#FF7A59', blob: '#FFA78F', text: '#24120A', textDim: '#6B2410' },
    broke: { field: '#7A3517', blob: '#9A4B26', text: '#FFF6E6', textDim: '#E5C3A6' },
  },
  statusBar: 'dark',
};

export const BBQ: Palette = {
  id: 'bbq',
  name: 'BBQ',
  tagline: 'dark, smoky, late-night order',
  dark: true,
  bg: '#16110E',
  card: '#241A14',
  card2: '#2F231B',
  line: '#3B2D23',
  ink: '#0B0705',
  text: '#FFF3DC',
  textDim: '#C9B79F',
  textFaint: '#8A7A68',
  accent: '#FF5A47',
  accentDeep: '#B3261B',
  onAccent: '#1A0D08',
  accent2: '#FFD23F',
  accent2Deep: '#E8A515',
  onAccent2: '#24120A',
  good: '#6FD27C',
  bad: '#FF5A47',
  info: '#7CC8FF',
  glow: false,
  groups: {
    chips: { bg: '#FFD23F', fg: '#24120A', deep: '#E8A515' },
    meat: { bg: '#C67A3C', fg: '#1A0D08', deep: '#7A3F1A' },
    garlic: { bg: '#FFF6E6', fg: '#24120A', deep: '#CDBE9A' },
    chilli: { bg: '#FF5A47', fg: '#1A0D08', deep: '#B3261B' },
    bbq: { bg: '#A8532A', fg: '#FFF3DC', deep: '#6B3213' },
  },
  weather: {
    sunny: { field: '#FFD23F', blob: '#FFE680', text: '#24120A', textDim: '#6B4E0E' },
    mild: { field: '#FFA63D', blob: '#FFC677', text: '#24120A', textDim: '#6B3F08' },
    tight: { field: '#FF6A4D', blob: '#FF9A85', text: '#24120A', textDim: '#6B2410' },
    broke: { field: '#4A2410', blob: '#6B3213', text: '#FFF3DC', textDim: '#D8B99A' },
  },
  statusBar: 'light',
};

/** The extra theme: a kebab shop at 3am. Deep night blue, neon signs, pink and cyan. */
export const KEBAB: Palette = {
  id: 'kebab',
  name: '3AM Kebab Shop',
  tagline: 'neon sign, empty street, full tray',
  dark: true,
  bg: '#0A0F2E',
  card: '#141B4D',
  card2: '#1D2766',
  line: '#2B3685',
  ink: '#04061A',
  text: '#F2F4FF',
  textDim: '#A9B2F0',
  textFaint: '#6C77C2',
  accent: '#FF2E93',
  accentDeep: '#B3166A',
  onAccent: '#0A0F2E',
  accent2: '#35E8FF',
  accent2Deep: '#10B7CC',
  onAccent2: '#04061A',
  good: '#5CFFB0',
  bad: '#FF2E93',
  info: '#35E8FF',
  glow: true,
  groups: {
    chips: { bg: '#FFE14D', fg: '#04061A', deep: '#D1B400' },
    meat: { bg: '#FF9F43', fg: '#04061A', deep: '#C46A10' },
    garlic: { bg: '#35E8FF', fg: '#04061A', deep: '#10B7CC' },
    chilli: { bg: '#FF2E93', fg: '#04061A', deep: '#B3166A' },
    bbq: { bg: '#8F6BFF', fg: '#F2F4FF', deep: '#5A39C9' },
  },
  weather: {
    sunny: { field: '#35E8FF', blob: '#8FF3FF', text: '#04061A', textDim: '#0B5A66' },
    mild: { field: '#9B7BFF', blob: '#C0AAFF', text: '#04061A', textDim: '#2E1C7A' },
    tight: { field: '#FF2E93', blob: '#FF7DBB', text: '#04061A', textDim: '#5E0A38' },
    broke: { field: '#2A1470', blob: '#3D1FA0', text: '#F2F4FF', textDim: '#B6A4F2' },
  },
  statusBar: 'light',
};

export const PALETTES: Record<PaletteId, Palette> = { garlic: GARLIC, bbq: BBQ, kebab: KEBAB };

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const radius = { sm: 12, md: 18, lg: 26, xl: 34, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
