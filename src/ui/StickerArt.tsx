import React from 'react';
import { View } from 'react-native';
import { StickerDef } from '../core';
import { useTheme } from '../theme';
import { CatIcon } from './CatIcon';
import { puff } from './clay';

const ART_ICON: Record<StickerDef['art'], string> = {
  fries: 'hsp',
  ice: 'icecream',
  flame: 'fire',
  crown: 'crown',
  receipt: 'receipt',
  bin: 'box',
  bottle: 'bottle',
  hand: 'handheart',
  moon: 'disco',
  coin: 'coin',
};

const TINTS = ['#FFD23F', '#FF9E8F', '#7CC8FF', '#9BE3A5', '#C9A7FF', '#FFB547'];

/** A sticker you earned: the icon on a tilted tag. Locked ones go grey. */
export function StickerArt({ art, size = 84, index = 0, locked }: { art: StickerDef['art']; size?: number; index?: number; locked?: boolean }) {
  const p = useTheme();
  const tilt = ((index * 7) % 9) - 4;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: locked ? p.card2 : TINTS[index % TINTS.length],
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: `${tilt}deg` }],
        opacity: locked ? 0.55 : 1, ...puff(p, locked ? p.card2 : TINTS[index % TINTS.length], 3) }}
    >
      <View style={{ opacity: locked ? 0.35 : 1 }}>
        <CatIcon id={ART_ICON[art]} size={size * 0.7} />
      </View>
    </View>
  );
}
