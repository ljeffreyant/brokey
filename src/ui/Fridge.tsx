import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Glyph } from './Glyph';
import { Txt } from './Txt';
import { Slab } from './kit';

/**
 * The Chill tab is a fridge. Freezer door on top (what waiting has saved you), the fridge itself below with a lamp
 * and glass shelves (each want sits on one), and a crisper drawer at the bottom for decisions already made.
 * All of it is plain Views, so it takes any content and any theme.
 */

function Handle({ tall = 58, style }: { tall?: number; style?: object }) {
  const p = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ position: 'absolute', width: 15, height: tall, borderRadius: 8, backgroundColor: p.fridge.handle, borderWidth: 2.5, borderColor: p.ink }, style]}
    >
      <View style={{ position: 'absolute', left: 2.5, top: 6, width: 3, height: tall - 22, borderRadius: 2, backgroundColor: '#FFFFFF', opacity: 0.7 }} />
    </View>
  );
}

function Frost({ style, size = 18 }: { style: object; size?: number }) {
  const p = useTheme();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[{ position: 'absolute', opacity: 0.4 }, style]}>
      <Glyph name="snow" size={size} color={p.fridge.onDoor} stroke={2} />
    </View>
  );
}

/** The whole appliance. */
export function Fridge({ freezer, children, drawer }: { freezer: ReactNode; children: ReactNode; drawer?: ReactNode }) {
  const p = useTheme();
  const fr = p.fridge;
  return (
    <View style={{ paddingBottom: 16 }}>
      {/* feet */}
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ position: 'absolute', left: 34, right: 34, bottom: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: 54, height: 22, borderRadius: 9, backgroundColor: p.ink }} />
        <View style={{ width: 54, height: 22, borderRadius: 9, backgroundColor: p.ink }} />
      </View>
      <Slab fill={fr.shell} r={36} weight="hero" depth={7} inner={{ padding: 10, gap: 10 }}>
        {/* freezer door */}
        <View style={{ borderRadius: 24, backgroundColor: fr.door, borderWidth: 3, borderColor: p.ink, paddingVertical: 12, paddingLeft: 12, paddingRight: 40, overflow: 'hidden' }}>
          <Frost style={{ right: 40, top: 7 }} size={15} />
          <Frost style={{ left: 8, top: 6 }} size={11} />
          {freezer}
          <Handle style={{ right: 12, top: 18 }} />
        </View>

        {/* the fridge itself */}
        <View style={{ borderRadius: 24, backgroundColor: fr.inside, borderWidth: 3, borderColor: p.ink, overflow: 'hidden', minHeight: 170 }}>
          {/* lamp */}
          {[96, 72, 48, 24].map((h) => (
            <View key={h} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: h, backgroundColor: fr.lamp, opacity: 0.1 }} />
          ))}
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ alignSelf: 'center', width: 74, height: 11, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: fr.lamp, borderWidth: 2.5, borderTopWidth: 0, borderColor: p.ink }} />
          {children}
        </View>

        {drawer}
      </Slab>
    </View>
  );
}

/** One glass shelf with a want standing on it. */
export function Shelf({ children }: { children: ReactNode }) {
  const p = useTheme();
  return (
    <View style={{ paddingTop: 14 }}>
      <View style={{ paddingHorizontal: 8 }}>{children}</View>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ marginTop: 10, height: 15, backgroundColor: p.fridge.shelf, borderTopWidth: 2.5, borderBottomWidth: 2.5, borderColor: p.ink }}>
        <View style={{ position: 'absolute', left: 14, top: 2, width: '34%', height: 3, borderRadius: 2, backgroundColor: '#FFFFFF', opacity: 0.6 }} />
      </View>
    </View>
  );
}

/** Nothing in there: just the light, and a note. */
export function EmptyShelf({ children }: { children: ReactNode }) {
  const p = useTheme();
  return (
    <View style={{ padding: 14, paddingTop: 22 }}>
      <View style={{ borderRadius: 18, borderWidth: 2.5, borderColor: p.ink, backgroundColor: p.accent2, padding: 16, gap: 10, alignItems: 'center', transform: [{ rotate: '-1.2deg' }] }}>{children}</View>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ marginTop: 26, marginHorizontal: -14, height: 15, backgroundColor: p.fridge.shelf, borderTopWidth: 2.5, borderBottomWidth: 2.5, borderColor: p.ink }} />
    </View>
  );
}

/** The crisper drawer: decisions you already made. */
export function Drawer({ title, children }: { title: string; children: ReactNode }) {
  const p = useTheme();
  return (
    <View style={{ borderRadius: 22, backgroundColor: p.fridge.door, borderWidth: 3, borderColor: p.ink, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 30 }}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: 9, alignSelf: 'center', width: 84, height: 14, borderRadius: 7, backgroundColor: p.fridge.inside, borderWidth: 2.5, borderColor: p.ink }} />
      <Txt v="label" color={p.fridge.onDoor} style={{ opacity: 0.75, marginBottom: 8 }}>
        {title}
      </Txt>
      {children}
    </View>
  );
}
