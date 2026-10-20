import { GroupId } from '../core/types';

export type PaletteId = 'garlic' | 'bbq' | 'kebab' | 'chilli' | 'mint';
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
  /** the Chill fridge: outer body, door fronts, inside, glass shelf, handles, lamp glow, text on a door */
  fridge: { shell: string; door: string; inside: string; shelf: string; handle: string; lamp: string; onDoor: string };
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
  fridge: { shell: '#BFE3F5', door: '#E2F3FB', inside: '#E8F6FD', shelf: '#CDE9F6', handle: '#FFFDF6', lamp: '#FFFFFF', onDoor: '#24120A' },
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
  fridge: { shell: '#456B82', door: '#2D4556', inside: '#1B2A35', shelf: '#4F7891', handle: '#A9C4D4', lamp: '#8FD0F2', onDoor: '#EAF6FF' },
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
  fridge: { shell: '#2A4BC2', door: '#1B2F85', inside: '#0C1650', shelf: '#2F5BE0', handle: '#35E8FF', lamp: '#35E8FF', onDoor: '#EAF2FF' },
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

/** Hot sauce. Light, loud and red, for people who like their budget with a bit of heat. */
export const CHILLI: Palette = {
  id: 'chilli',
  name: 'Chilli',
  tagline: 'hot sauce, hotter takes',
  dark: false,
  bg: '#FFEDE6',
  card: '#FFF9F6',
  card2: '#FADCCF',
  line: '#EBC3B1',
  ink: '#2A0A06',
  text: '#2A0A06',
  textDim: '#7A4338',
  textFaint: '#AE7F74',
  accent: '#D81F26',
  accentDeep: '#9C1018',
  onAccent: '#FFF3EE',
  accent2: '#FF9A1F',
  accent2Deep: '#D46A00',
  onAccent2: '#2A0A06',
  good: '#2F9E55',
  bad: '#D81F26',
  info: '#3F8FD8',
  glow: false,
  fridge: { shell: '#D8392E', door: '#F4705E', inside: '#FFEDE6', shelf: '#F8C9BF', handle: '#FFF3EE', lamp: '#FFFFFF', onDoor: '#2A0A06' },
  groups: {
    chips: { bg: '#FFC21F', fg: '#2A0A06', deep: '#D99A00' },
    meat: { bg: '#B5532A', fg: '#FFF3EE', deep: '#7A3416' },
    garlic: { bg: '#FFF9F6', fg: '#2A0A06', deep: '#E6CFC4' },
    chilli: { bg: '#D81F26', fg: '#FFF3EE', deep: '#8F1016' },
    bbq: { bg: '#6B2410', fg: '#FFF3EE', deep: '#42150A' },
  },
  weather: {
    sunny: { field: '#FFB02E', blob: '#FFCD73', text: '#2A0A06', textDim: '#6B3A08' },
    mild: { field: '#FF8A3D', blob: '#FFB07F', text: '#2A0A06', textDim: '#6B2A0A' },
    tight: { field: '#EF4A3C', blob: '#F7857A', text: '#2A0A06', textDim: '#44080A' },
    broke: { field: '#6A0F14', blob: '#8A1F25', text: '#FFF3EE', textDim: '#F0BDB4' },
  },
  statusBar: 'dark',
};

/** The cool white sauce. Light, green and calm, here to settle the heat. */
export const MINT: Palette = {
  id: 'mint',
  name: 'Mint Yoghurt',
  tagline: 'cool, creamy, here to calm you down',
  dark: false,
  bg: '#EEF7EC',
  card: '#FBFFF9',
  card2: '#DCEFD8',
  line: '#BFDCB9',
  ink: '#10261A',
  text: '#10261A',
  textDim: '#47634F',
  textFaint: '#7A9781',
  accent: '#17874C',
  accentDeep: '#0E6A37',
  onAccent: '#F3FFF6',
  accent2: '#C9EA5B',
  accent2Deep: '#98BC2A',
  onAccent2: '#10261A',
  good: '#17874C',
  bad: '#D9432E',
  info: '#2F8FD0',
  glow: false,
  fridge: { shell: '#9DD8B8', door: '#D3F0E0', inside: '#EAF8F0', shelf: '#BFE6D0', handle: '#FFFFFF', lamp: '#FFFFFF', onDoor: '#10261A' },
  groups: {
    chips: { bg: '#F4D43A', fg: '#10261A', deep: '#C9A500' },
    meat: { bg: '#A86A3A', fg: '#FBFFF9', deep: '#6E4020' },
    garlic: { bg: '#FBFFF9', fg: '#10261A', deep: '#CFE2CB' },
    chilli: { bg: '#D9432E', fg: '#FBFFF9', deep: '#8F2414' },
    bbq: { bg: '#5B3B22', fg: '#FBFFF9', deep: '#37220F' },
  },
  weather: {
    sunny: { field: '#C9EA5B', blob: '#E0F59A', text: '#10261A', textDim: '#3F5A12' },
    mild: { field: '#7FD6A0', blob: '#AEE8C4', text: '#10261A', textDim: '#1F5236' },
    tight: { field: '#F2A65A', blob: '#F8C896', text: '#10261A', textDim: '#6B3A0A' },
    broke: { field: '#1F4A33', blob: '#2D6347', text: '#F3FFF6', textDim: '#B6DCC4' },
  },
  statusBar: 'dark',
};

export const PALETTES: Record<PaletteId, Palette> = { garlic: GARLIC, bbq: BBQ, kebab: KEBAB, chilli: CHILLI, mint: MINT };

/** Every theme a person can pick, in the order the picker shows them. */
export const PALETTE_IDS: PaletteId[] = ['garlic', 'bbq', 'kebab', 'chilli', 'mint'];

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const radius = { sm: 12, md: 18, lg: 26, xl: 34, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
