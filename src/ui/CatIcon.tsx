import React, { memo } from 'react';
import { View } from 'react-native';
import { SceneView } from '../art/SceneView';
import { iconScene } from '../art/icons';
import { useTheme } from '../theme';

/** One of the 117 cartoon icons. */
export const CatIcon = memo(function CatIcon({ id, size = 44 }: { id: string; size?: number }) {
  return <SceneView scene={iconScene(id)} width={size} />;
});

/** The icon on a soft coloured disc, as used in lists. */
export function IconDisc({ id, size = 48, color, ring }: { id: string; size?: number; color?: string; ring?: boolean }) {
  const p = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? p.card2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 2 : 0,
        borderColor: p.ink,
      }}
    >
      <CatIcon id={id} size={size * 0.74} />
    </View>
  );
}
