import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { Mood } from '../art/mascot';
import { ReceiptModel } from '../export/receipt';
import { Brokey } from './Brokey';
import { Txt } from './Txt';

/** Thermal paper never changes with the app theme, so a shared receipt looks the same for everyone. */
export const PAPER = { paper: '#FFFDF6', ink: '#24120A', dim: '#7A6650', red: '#D8321F', green: '#2E8B57' };
export const RECEIPT_W = 300;
const PAD = 20;
const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'Courier New, monospace' }) as string;

const mono = (size: number, bold = false, color = PAPER.ink) => ({ fontFamily: MONO, fontSize: size, fontWeight: (bold ? '700' : '400') as '700' | '400', color, letterSpacing: 0.2 });

function Dashes() {
  return (
    <Svg width={RECEIPT_W - PAD * 2} height={6} style={{ marginVertical: 6 }}>
      <Line x1={0} y1={3} x2={RECEIPT_W - PAD * 2} y2={3} stroke={PAPER.ink} strokeWidth={1.6} strokeDasharray="5 4" />
    </Svg>
  );
}

const TOOTH = 9;

/** The paper itself: a rectangle with a torn zigzag bottom, so the teeth are truly see-through. */
function PaperShape({ height }: { height: number }) {
  if (height <= TOOTH) return null;
  const n = Math.round(RECEIPT_W / 11);
  const w = RECEIPT_W / n;
  const base = height - TOOTH;
  let d = `M0,0 L${RECEIPT_W},0 L${RECEIPT_W},${base} `;
  for (let i = n; i > 0; i--) d += `L${((i - 0.5) * w).toFixed(2)},${height} L${((i - 1) * w).toFixed(2)},${base} `;
  return (
    <Svg width={RECEIPT_W} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Path d={d + 'Z'} fill={PAPER.paper} />
    </Svg>
  );
}

function Bars({ widths }: { widths: number[] }) {
  const total = widths.reduce((a, w) => a + w * 2 + 2, 0);
  const full = RECEIPT_W - PAD * 2;
  const k = Math.min(1.6, full / total);
  let x = 0;
  return (
    <Svg width={full} height={44} viewBox={`0 0 ${full} 44`}>
      {widths.map((w, i) => {
        const bw = w * 2 * k;
        const r = <Rect key={i} x={x} y={0} width={bw} height={44} fill={PAPER.ink} />;
        x += bw + 2 * k;
        return i % 1 === 0 ? r : null;
      })}
    </Svg>
  );
}

function Pair({ l, r, bold, size = 12 }: { l: string; r: string; bold?: boolean; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 1.5 }}>
      <Txt style={[mono(size, bold), { flex: 1 }]}>{l.toUpperCase()}</Txt>
      {r ? <Txt style={mono(size, bold)}>{r}</Txt> : null}
    </View>
  );
}

export interface ReceiptProps {
  model: ReceiptModel;
  mood: Mood;
  friesLeft: number;
}

/** A till receipt for one month of snacks. Fixed 300 wide; the screen scales it to fit. */
export const Receipt = React.forwardRef<View, ReceiptProps>(function Receipt({ model, mood, friesLeft }, ref) {
  const [h, setH] = useState(0);
  const stampColor = model.stamp.kind === 'over' ? PAPER.red : model.stamp.kind === 'under' ? PAPER.green : PAPER.dim;
  return (
    <View ref={ref} collapsable={false} onLayout={(e) => setH(Math.round(e.nativeEvent.layout.height))} style={{ width: RECEIPT_W, paddingHorizontal: PAD, paddingTop: 22, paddingBottom: 18 + TOOTH }}>
      <PaperShape height={h} />
      <View style={{ alignItems: 'center' }}>
        <Brokey mood={mood} width={74} still friesLeft={friesLeft} />
        <Txt style={[mono(24, true), { letterSpacing: 4, marginTop: 4 }]}>BROKEY</Txt>
        <Txt style={[mono(12, true), { marginTop: 4, letterSpacing: 1.5 }]}>{model.title.toUpperCase()}</Txt>
        <Txt style={[mono(10.5, false, PAPER.dim), { marginTop: 2 }]}>{model.kicker.toUpperCase()}</Txt>
        <Txt style={[mono(11.5), { marginTop: 8 }]}>{model.month.toUpperCase()}</Txt>
        <Txt style={mono(10.5, false, PAPER.dim)}>{model.wallet.toUpperCase()}</Txt>
      </View>
      <Dashes />
      <View style={{ flexDirection: 'row', paddingBottom: 3 }}>
        <Txt style={[mono(10, true, PAPER.dim), { flex: 1 }]}>{model.header.item.toUpperCase()}</Txt>
        <Txt style={[mono(10, true, PAPER.dim), { width: 44, textAlign: 'right' }]}>{model.header.qty.toUpperCase()}</Txt>
        <Txt style={[mono(10, true, PAPER.dim), { width: 82, textAlign: 'right' }]}>{model.header.amt.toUpperCase()}</Txt>
      </View>
      {model.lines.map((l) => (
        <View key={l.name} style={{ flexDirection: 'row', paddingVertical: 1.5 }}>
          <Txt style={[mono(12.5), { flex: 1 }]} numberOfLines={1}>
            {l.name.toUpperCase()}
          </Txt>
          <Txt style={[mono(12.5), { width: 44, textAlign: 'right' }]}>{l.qty}</Txt>
          <Txt style={[mono(12.5, true), { width: 82, textAlign: 'right' }]}>{l.amount}</Txt>
        </View>
      ))}
      {model.empty ? <Txt style={[mono(12.5, false, PAPER.dim), { textAlign: 'center', paddingVertical: 6 }]}>{model.empty.toUpperCase()}</Txt> : null}
      <Dashes />
      {model.totals.map((r) => (
        <Pair key={r.label} l={r.label} r={r.value} bold={r.bold} size={14} />
      ))}
      <Dashes />
      {model.extras.map((r, i) => (
        <Pair key={`${r.label}${i}`} l={r.label} r={r.value} bold={r.bold} />
      ))}
      <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
        <View style={{ borderWidth: 2.5, borderColor: stampColor, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, transform: [{ rotate: '-6deg' }] }}>
          <Txt style={[mono(15, true, stampColor), { letterSpacing: 2 }]}>{model.stamp.label.toUpperCase()}</Txt>
        </View>
      </View>
      <View style={{ alignItems: 'center', marginTop: 6 }}>
        <Bars widths={model.barcode} />
        <Txt style={[mono(11, false, PAPER.dim), { marginTop: 8, textAlign: 'center' }]}>{model.thanks.toUpperCase()}</Txt>
      </View>
    </View>
  );
});

