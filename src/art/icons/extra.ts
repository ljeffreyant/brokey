import { Ico, IconDef, P, heartPts } from './kit';

const def = (id: string, label: string, tags: string[], draw: (b: Ico) => void): IconDef => ({ id, label, tags, draw });

/** Spare icons for custom categories. */
export const EXTRA: IconDef[] = [
  def('heart', 'Heart', ['love', 'dating', 'favourite', 'relationship'], (b) => {
    b.path(heartPts(50, 46, 2.3), P.tomato, { sw: 4.8 });
    b.face(50, 44, 0.9);
    b.spark(86, 16, 7);
  }),

  def('rocket', 'Rocket', ['startup', 'launch', 'goals', 'space'], (b) => {
    b.poly([[34, 52], [16, 78], [36, 72]], P.tomato, { round: 3 });
    b.poly([[66, 52], [84, 78], [64, 72]], P.tomato, { round: 3 });
    b.poly([[40, 72], [50, 96], [60, 72]], P.fry, { round: 3 });
    b.poly([[50, 4], [68, 30], [68, 74], [32, 74], [32, 30]], P.creamHi, { round: 14 });
    b.blob(50, 34, 9, 9, P.sky, { sw: 3.6 });
    b.face(50, 56, 0.55);
  }),

  def('crown', 'Crown', ['treat yourself', 'luxury', 'vip', 'royal'], (b) => {
    b.poly([[10, 74], [12, 30], [34, 50], [50, 16], [66, 50], [88, 30], [90, 74]], P.gold, { round: 6 });
    b.rect(10, 70, 80, 14, '#E8A515', { round: 4 });
    b.dot(50, 24, 4, P.tomato, true);
    b.dot(14, 30, 4, P.pinkHot, true);
    b.dot(86, 30, 4, P.sky, true);
    b.face(50, 56, 0.85);
  }),

  def('ghost', 'Ghost', ['ghosted', 'unused', 'forgotten', 'spooky'], (b) => {
    b.poly([[22, 88], [20, 40], [50, 8], [80, 40], [78, 88], [68, 78], [58, 90], [50, 80], [42, 90], [32, 78]], P.creamHi, { round: 12 });
    b.face(50, 44, 1, 'oh');
    b.spark(88, 18, 6, P.sky);
  }),

  def('fire', 'Streak', ['streak', 'hot', 'fire', 'trending'], (b) => {
    b.path([[50, 4], [64, 26], [82, 46], [84, 68], [70, 88], [50, 94], [30, 88], [16, 68], [18, 48], [32, 34], [34, 52], [44, 36]], P.orange, { sw: 4.6 });
    b.path([[50, 46], [62, 62], [64, 78], [50, 88], [36, 78], [38, 62]], P.fry, { sw: 3.4 });
    b.face(50, 70, 0.62);
  }),

  def('umbrella', 'Umbrella', ['rainy day', 'weather', 'cover'], (b) => {
    b.tube([[50, 40], [50, 80], [58, 90], [68, 84]], 3.6, P.steelDeep);
    b.poly([[8, 44], [14, 28], [50, 8], [86, 28], [92, 44], [78, 40], [64, 46], [50, 40], [36, 46], [22, 40]], P.sky, { round: 8 });
    b.face(50, 28, 0.7);
  }),

  def('hat', 'Cap', ['hat', 'cap', 'accessories', 'merch'], (b) => {
    b.blob(50, 76, 46, 9, P.navy, { sw: 4.4 });
    b.poly([[14, 74], [16, 44], [50, 22], [84, 44], [86, 74]], P.tomato, { round: 20 });
    b.dot(50, 22, 4, P.fry, true);
    b.face(50, 54, 0.85);
  }),

  def('watch', 'Watch', ['smartwatch', 'time', 'accessories'], (b) => {
    b.rect(34, 6, 32, 30, P.pinkHot, { round: 5 });
    b.rect(34, 64, 32, 30, P.pinkHot, { round: 5 });
    b.blob(50, 50, 28, 28, P.steel, { sw: 4.6 });
    b.blob(50, 50, 21, 21, P.creamHi, { flat: true, sw: 3 });
    b.face(50, 50, 0.6);
    b.dot(80, 50, 3, P.steelDeep, true);
  }),

  def('backpack', 'Backpack', ['school', 'travel', 'bag', 'hiking'], (b) => {
    b.tube([[38, 22], [38, 12], [62, 12], [62, 22]], 3.4, P.steelDeep);
    b.poly([[20, 40], [30, 20], [70, 20], [80, 40], [84, 90], [16, 90]], P.teal, { round: 14 });
    b.rect(30, 62, 40, 22, '#2FA3AB', { round: 6, flat: true, sw: 3 });
    b.rect(42, 70, 16, 5, P.fry, { round: 2, flat: true, sw: 2.2 });
    b.face(50, 44, 0.8);
  }),

  def('laptop', 'Laptop', ['computer', 'macbook', 'work', 'study'], (b) => {
    b.rect(16, 12, 68, 52, P.steelDeep, { round: 6 });
    b.rect(21, 17, 58, 42, P.sky, { round: 3, flat: true, sw: 3 });
    b.poly([[4, 68], [96, 68], [90, 84], [10, 84]], P.steel, { round: 5 });
    b.line([[40, 76], [60, 76]], 2.6, P.steelDeep);
    b.face(50, 38, 0.8);
  }),

  def('tent', 'Camping', ['camping', 'outdoors', 'festival', 'tent'], (b) => {
    b.poly([[6, 88], [50, 12], [94, 88]], P.tomato, { round: 6 });
    b.poly([[38, 88], [50, 62], [62, 88]], P.navy, { round: 3, flat: true, sw: 3 });
    b.line([[50, 12], [50, 4]], 3.4);
    b.face(50, 46, 0.55);
    b.spark(86, 22, 6);
  }),

  def('flower', 'Flowers', ['bouquet', 'florist', 'garden'], (b) => {
    b.tube([[50, 60], [50, 94]], 4.4, P.greenDeep);
    b.blob(34, 80, 12, 6, P.green, { rot: -25, sw: 3.6 });
    for (let i = 0; i < 5; i++) {
      const a = (-90 + i * 72) * (Math.PI / 180);
      b.blob(50 + Math.cos(a) * 20, 40 + Math.sin(a) * 20, 13, 13, P.pinkHot, { sw: 4 });
    }
    b.blob(50, 40, 16, 16, P.fry, { sw: 4 });
    b.face(50, 40, 0.6);
  }),

  def('calculator', 'Maths', ['calculator', 'tax', 'accounting'], (b) => {
    b.rect(20, 8, 60, 84, P.purple, { round: 10 });
    b.rect(27, 15, 46, 22, '#CFEFFF', { round: 4, flat: true, sw: 3 });
    b.face(50, 25, 0.5);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) b.rect(28 + c * 15, 46 + r * 15, 11, 11, c === 2 ? P.fry : P.creamHi, { round: 3, flat: true, sw: 2.4 });
  }),

  def('bottle', 'Water', ['water bottle', 'drink', 'hydration'], (b) => {
    b.rect(40, 6, 20, 14, P.tomato, { round: 3 });
    b.poly([[40, 20], [60, 20], [72, 34], [72, 90], [28, 90], [28, 34]], P.sky, { round: 10 });
    b.rect(30, 56, 40, 18, P.creamHi, { round: 3, flat: true, sw: 2.6 });
    b.face(50, 44, 0.8);
  }),

  def('cat', 'Cat', ['cat', 'kitty', 'pet'], (b) => {
    b.poly([[16, 44], [14, 10], [38, 26]], '#F2A65A', { round: 3 });
    b.poly([[84, 44], [86, 10], [62, 26]], '#F2A65A', { round: 3 });
    b.blob(50, 56, 38, 32, '#F2A65A', { sw: 4.6 });
    b.line([[6, 58], [22, 62]], 2.4);
    b.line([[94, 58], [78, 62]], 2.4);
    b.face(50, 54, 0.95);
  }),

  def('sun', 'Sunny', ['sun', 'summer', 'sunscreen', 'outdoors'], (b) => {
    for (let i = 0; i < 8; i++) {
      const a = (i * 45 * Math.PI) / 180;
      b.line([[50 + Math.cos(a) * 36, 50 + Math.sin(a) * 36], [50 + Math.cos(a) * 46, 50 + Math.sin(a) * 46]], 4.6);
    }
    b.blob(50, 50, 28, 28, P.fry, { sw: 4.6 });
    b.face(50, 50, 0.95);
  }),

  def('fish', 'Fish', ['fish', 'seafood', 'fish and chips'], (b) => {
    b.poly([[70, 52], [94, 30], [92, 72]], P.orange, { round: 4 });
    b.blob(44, 52, 36, 26, P.sky, { sw: 4.6 });
    b.face(38, 52, 0.8);
  }),

  def('cookie', 'Cookie', ['biscuit', 'cookie', 'snack'], (b) => {
    b.blob(50, 52, 40, 38, '#E2A15A', { sw: 4.6 });
    for (const [x, y] of [[28, 38], [68, 32], [76, 58], [38, 74], [60, 78]] as const) b.blob(x, y, 5, 4.4, '#5A2F17', { flat: true, sw: 2.4 });
    b.face(50, 54, 0.9);
  }),
];
