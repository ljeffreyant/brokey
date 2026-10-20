import { Ico, IconDef, P, Pt } from './kit';
import { INK } from '../palette';

const def = (id: string, label: string, tags: string[], draw: (b: Ico) => void): IconDef => ({ id, label, tags, draw });

export const FOOD: IconDef[] = [
  def('hsp', 'HSP', ['halal snack pack', 'kebab', 'takeaway', 'snack pack'], (b) => {
    for (const [x, y, a] of [[30, 50, -26], [40, 42, -11], [52, 38, 2], [63, 42, 13], [73, 50, 27]] as const) b.rect(x - 4.5, y - 24, 9, 30, P.fry, { rot: a, round: 3, sw: 3.6 });
    b.blob(50, 56, 29, 12, P.meat, { sw: 3.8 });
    b.tube([[33, 53], [41, 47], [49, 53], [57, 47], [66, 53]], 4, P.garlic);
    b.poly([[22, 57], [78, 55], [72, 91], [28, 93]], P.cream, { round: 8 });
    b.poly([[18, 52], [82, 50], [80, 63], [20, 65]], P.creamHi, { round: 4 });
    b.look(50, 79, 0.95, { eyes: 'half', brow: 'flat', mouth: 'smirk', blush: 'none', tilt: -3 });
  }),

  def('coffee', 'Coffee', ['cafe', 'latte', 'flat white', 'espresso'], (b) => {
    b.tube([[72, 48], [88, 50], [89, 66], [70, 70]], 4.5, P.cream);
    b.blob(50, 88, 33, 6, P.steel, { sw: 3.6 });
    b.poly([[22, 38], [76, 38], [69, 84], [29, 84]], P.cream, { round: 10 });
    b.blob(49, 38, 27, 6.5, '#6B3A1E', { flat: true, sw: 3.6 });
    b.line([[40, 30], [35, 22], [42, 14]], 3, '#FFFFFF');
    b.line([[58, 30], [62, 22], [56, 12]], 3, '#FFFFFF');
    b.look(48, 62, 0.95, { eyes: 'half', mouth: 'flat', bags: true, tilt: 2 });
  }),

  def('matcha', 'Matcha', ['green tea', 'latte', 'iced'], (b) => {
    b.tube([[60, 6], [56, 34]], 5, P.pinkHot);
    b.poly([[25, 28], [75, 28], [68, 90], [32, 90]], P.glass, { round: 9 });
    b.poly([[27, 38], [73, 38], [67, 88], [33, 88]], P.green, { round: 6, flat: true, sw: 2.4 });
    b.poly([[26, 30], [74, 30], [73, 42], [27, 42]], P.creamHi, { round: 4, flat: true, sw: 2.4 });
    b.rect(36, 50, 10, 10, P.glass, { rot: 14, round: 2, flat: true, sw: 2.6 });
    b.rect(54, 56, 9, 9, P.glass, { rot: -10, round: 2, flat: true, sw: 2.6 });
    b.face(50, 74, 0.9);
  }),

  def('boba', 'Bubble tea', ['boba', 'milk tea', 'pearls'], (b) => {
    b.tube([[58, 4], [54, 30]], 7, P.pinkHot);
    b.poly([[27, 30], [73, 30], [67, 90], [33, 90]], '#EBCDA3', { round: 9 });
    b.poly([[25, 24], [75, 24], [75, 34], [25, 34]], P.steel, { round: 4 });
    for (const [x, y] of [[40, 84], [50, 85], [60, 84], [45, 77], [55, 78]] as const) b.dot(x, y, 4.2, '#3A1F10', true);
    b.look(50, 58, 0.95, { eyes: 'wide', mouth: 'o', blush: 'one' });
  }),

  def('chips', 'Chips', ['crisps', 'snack', 'packet'], (b) => {
    b.poly([[24, 14], [34, 10], [44, 14], [54, 10], [64, 14], [76, 12], [74, 88], [64, 92], [54, 88], [44, 92], [34, 88], [26, 90]], P.fry, { round: 3, amp: 0.4 });
    b.rect(30, 38, 40, 34, P.tomato, { round: 10 });
    b.look(50, 55, 0.95, { eyes: 'wink', mouth: 'tongue', blush: 'both', tilt: -4 });
  }),

  def('burger', 'Burger', ['fast food', 'hamburger'], (b) => {
    b.poly([[20, 72], [80, 72], [78, 84], [64, 90], [36, 90], [22, 84]], '#E2A15A', { round: 7 });
    b.rect(18, 56, 64, 16, '#7A3A1E', { round: 8 });
    b.poly([[24, 52], [34, 60], [46, 52], [58, 60], [70, 52], [78, 56], [78, 60], [22, 60]], P.green, { round: 2 });
    b.poly([[26, 48], [74, 48], [60, 60], [40, 60]], P.fry, { round: 2 });
    b.poly([[18, 46], [26, 24], [50, 14], [74, 24], [82, 46]], '#E8A85C', { round: 16 });
    for (const [x, y, a] of [[40, 28, 30], [54, 24, -20], [64, 34, 50], [34, 38, -30]] as const) b.blob(x, y, 3, 1.6, P.cream, { rot: a, flat: true, sw: 1.8 });
    b.look(50, 38, 0.8, { eyes: 'dot', brow: 'raised', mouth: 'smirk', tilt: 3 });
  }),

  def('delivery', 'Delivery', ['scooter', 'uber', 'takeaway', 'courier'], (b) => {
    b.rect(8, 28, 34, 30, P.cream, { round: 4 });
    b.line([[14, 40], [36, 40]], 3);
    b.blob(24, 78, 11, 11, P.steelDeep, { sw: 4 });
    b.blob(78, 78, 11, 11, P.steelDeep, { sw: 4 });
    b.poly([[38, 62], [74, 56], [80, 72], [40, 74]], P.tomato, { round: 8 });
    b.tube([[66, 56], [62, 34], [74, 28]], 4, P.steelDeep);
    b.poly([[40, 56], [48, 40], [58, 44], [56, 58]], P.cream, { round: 4 });
    b.dot(24, 78, 3.5, P.steel, true);
    b.dot(78, 78, 3.5, P.steel, true);
    b.face(26, 48, 0.55, 'oh');
  }),

  def('plate', 'Eating out', ['restaurant', 'dinner', 'cutlery', 'dining'], (b) => {
    b.tube([[10, 20], [10, 50], [14, 78]], 3.4, P.steel);
    b.tube([[90, 20], [88, 78]], 3.4, P.steel);
    b.blob(50, 54, 33, 33, P.cream, { sw: 4.6 });
    b.blob(50, 54, 22, 22, P.creamHi, { flat: true, sw: 2.8 });
    b.face(50, 54, 1);
    b.spark(78, 18, 6);
  }),

  def('groceries', 'Groceries', ['supermarket', 'shopping', 'trolley', 'basket'], (b) => {
    b.rect(30, 10, 10, 40, '#E8B65C', { rot: 18, round: 4 });
    b.poly([[48, 26], [56, 12], [64, 26], [72, 14], [74, 38], [50, 40]], P.green, { round: 3 });
    b.poly([[12, 40], [90, 40], [80, 74], [24, 74]], P.sky, { round: 6 });
    b.line([[34, 44], [38, 70]], 2.6);
    b.line([[50, 44], [50, 70]], 2.6);
    b.line([[66, 44], [62, 70]], 2.6);
    b.tube([[6, 24], [16, 28], [20, 40]], 3.6, P.steelDeep);
    b.dot(32, 86, 5, P.steelDeep, true);
    b.dot(70, 86, 5, P.steelDeep, true);
    b.face(50, 58, 0.85);
  }),

  def('cocktail', 'Cocktail', ['drinks', 'martini', 'bar'], (b) => {
    b.tube([[70, 8], [52, 34]], 2.6, P.steelDeep);
    b.poly([[14, 30], [86, 30], [52, 62]], P.pinkHot, { round: 4 });
    b.poly([[20, 33], [80, 33], [66, 46], [34, 46]], P.creamHi, { round: 2, flat: true, sw: 2 });
    b.rect(48, 60, 6, 26, P.glass, { round: 2 });
    b.blob(50, 90, 20, 5, P.glass, { sw: 3.8 });
    b.blob(72, 14, 7, 7, P.green, { sw: 3.6 });
    b.face(50, 40, 0.85, 'wink');
  }),

  def('beer', 'Pub & beer', ['pint', 'pub', 'lager', 'bar'], (b) => {
    b.tube([[74, 36], [92, 40], [92, 66], [72, 70]], 6, P.glass);
    b.rect(22, 26, 52, 62, P.gold, { round: 8 });
    b.blob(32, 24, 12, 10, P.creamHi, { sw: 3.8 });
    b.blob(48, 20, 14, 11, P.creamHi, { sw: 3.8 });
    b.blob(64, 24, 12, 10, P.creamHi, { sw: 3.8 });
    b.line([[34, 46], [34, 78]], 4, '#FFE9A0');
    b.look(48, 58, 0.95, { eyes: 'half', mouth: 'wavy', blush: 'both', tilt: -5 });
  }),

  def('wine', 'Wine', ['red wine', 'glass', 'vino'], (b) => {
    b.poly([[28, 10], [72, 10], [70, 36], [60, 52], [40, 52], [30, 36]], P.glass, { round: 12 });
    b.poly([[30, 26], [70, 26], [68, 38], [58, 50], [42, 50], [32, 38]], '#9B1B30', { round: 10, flat: true, sw: 2.4 });
    b.rect(47, 50, 6, 32, P.glass, { round: 2 });
    b.blob(50, 88, 22, 5, P.glass, { sw: 3.8 });
    b.face(50, 34, 0.78);
  }),

  def('disco', 'Night out', ['club', 'party', 'nightclub', 'dance'], (b) => {
    b.line([[50, 0], [50, 18]], 3.4);
    b.blob(50, 52, 33, 33, P.steel, { sw: 4.6 });
    for (const [x, y, c] of [[30, 34, P.pinkHot], [48, 24, P.sky], [68, 32, P.fry], [78, 52, P.purple], [70, 72, P.pinkHot], [50, 80, P.sky], [28, 70, P.fry], [22, 50, P.purple]] as const) b.rect(x - 5, y - 5, 10, 10, c, { rot: (x * 3) % 25, round: 2, flat: true, sw: 2.4 });
    b.blob(50, 52, 17, 14, P.creamHi, { flat: true, sw: 2.6 });
    b.face(50, 52, 0.62, 'cool');
    b.spark(88, 20, 8);
    b.spark(12, 80, 6, P.pinkHot);
  }),

  def('pizza', 'Pizza', ['slice', 'pepperoni'], (b) => {
    b.poly([[12, 28], [88, 24], [52, 92]], P.gold, { round: 5 });
    b.poly([[8, 22], [92, 18], [90, 30], [10, 34]], '#D98A3D', { round: 6 });
    b.blob(36, 44, 6, 6, P.tomato, { sw: 3.4 });
    b.blob(62, 42, 6.5, 6.5, P.tomato, { sw: 3.4 });
    b.blob(50, 62, 5.5, 5.5, P.tomato, { sw: 3.4 });
    b.look(50, 50, 0.7, { eyes: 'dot', mouth: 'grin', blush: 'none', tilt: 4 });
  }),

  def('sushi', 'Sushi', ['nigiri', 'japanese', 'salmon'], (b) => {
    b.rect(16, 44, 68, 34, P.creamHi, { round: 14 });
    b.poly([[10, 28], [90, 28], [84, 52], [16, 52]], P.orange, { round: 12 });
    b.line([[30, 30], [26, 50]], 3, P.creamHi);
    b.line([[50, 30], [48, 50]], 3, P.creamHi);
    b.line([[70, 30], [70, 50]], 3, P.creamHi);
    b.rect(44, 28, 12, 54, '#2C3A2B', { round: 3 });
    b.face(50, 66, 0.8);
  }),

  def('noodles', 'Noodles', ['ramen', 'pho', 'soup', 'bowl'], (b) => {
    b.tube([[24, 8], [66, 44]], 3.4, P.wood);
    b.tube([[34, 6], [76, 40]], 3.4, P.wood);
    b.tube([[24, 46], [34, 34], [44, 46], [54, 34], [64, 46], [74, 34]], 4.6, P.gold);
    b.poly([[10, 46], [90, 46], [78, 84], [22, 84]], P.tomato, { round: 14 });
    b.blob(50, 46, 40, 8, P.gold, { flat: true, sw: 3.6 });
    b.blob(34, 46, 8, 5.5, P.cream, { flat: true, sw: 2.4 });
    b.look(50, 68, 0.9, { eyes: 'squint', mouth: 'o', blush: 'none' });
  }),

  def('dumpling', 'Dumplings', ['gyoza', 'dim sum', 'bao'], (b) => {
    b.poly([[10, 70], [20, 36], [50, 20], [80, 36], [90, 70], [50, 84]], P.creamHi, { round: 22 });
    for (const x of [32, 42, 52, 62, 70]) b.line([[x, 28 + Math.abs(x - 50) * 0.4], [x - 1, 40 + Math.abs(x - 50) * 0.3]], 2.8);
    b.face(50, 62, 0.9);
  }),

  def('kebab', 'Kebab', ['wrap', 'doner', 'shawarma'], (b) => {
    b.poly([[8, 38], [60, 18], [92, 40], [78, 86], [34, 82]], '#E8C48A', { round: 14 });
    b.blob(52, 34, 26, 10, P.meat, { rot: -18, sw: 4 });
    b.poly([[42, 26], [58, 20], [70, 28], [56, 34]], P.green, { round: 3 });
    b.tube([[36, 38], [50, 32], [64, 38], [76, 32]], 3.4, P.garlic);
    b.look(46, 66, 0.9, { eyes: 'dot', brow: 'angry', mouth: 'flat', tilt: -3 });
  }),

  def('salad', 'Salad & bowls', ['poke', 'bowl', 'healthy', 'greens'], (b) => {
    b.poly([[14, 42], [86, 42], [76, 82], [24, 82]], P.cream, { round: 14 });
    for (const [x, y, c, r] of [[26, 36, P.green, 12], [46, 30, '#5DAE2F', 13], [66, 34, P.green, 12], [76, 42, P.tomato, 8], [36, 44, P.tomato, 8]] as const) b.blob(x, y, r, r * 0.8, c, { sw: 3.8 });
    b.blob(56, 44, 7, 6, P.fry, { sw: 3 });
    b.face(50, 66, 0.9);
  }),

  def('eggs', 'Brunch', ['egg', 'breakfast', 'fried egg', 'bacon'], (b) => {
    b.tube([[78, 70], [96, 84]], 6, P.wood);
    b.blob(46, 54, 40, 36, P.steelDeep, { sw: 4.6 });
    b.blob(46, 54, 33, 29, P.creamHi, { sw: 3.4, rot: 10 });
    b.blob(44, 52, 16, 15, P.gold, { sw: 3.6 });
    b.face(44, 52, 0.75);
  }),

  def('icecream', 'Ice cream', ['gelato', 'cone', 'dessert'], (b) => {
    b.poly([[28, 50], [72, 50], [50, 96]], '#E2A15A', { round: 4 });
    b.line([[34, 60], [58, 84]], 2.4, '#B27632');
    b.line([[66, 60], [42, 84]], 2.4, '#B27632');
    b.blob(50, 42, 24, 20, P.pinkHot, { sw: 4.4 });
    b.blob(50, 26, 16, 13, P.creamHi, { sw: 4 });
    b.dot(50, 10, 5, P.tomato, true);
    b.face(50, 44, 0.85);
  }),

  def('cake', 'Dessert', ['cake', 'slice', 'sweet', 'pudding'], (b) => {
    b.poly([[14, 52], [86, 52], [86, 84], [14, 84]], P.cream, { round: 8 });
    b.rect(14, 76, 72, 6, P.pinkHot, { round: 2, flat: true });
    b.poly([[12, 40], [88, 40], [88, 54], [12, 54]], '#7A3A1E', { round: 8 });
    b.blob(50, 30, 10, 10, P.tomato, { sw: 3.8 });
    b.line([[50, 22], [54, 12]], 3);
    b.face(50, 64, 0.78);
  }),

  def('bread', 'Bakery', ['croissant', 'bread', 'pastry'], (b) => {
    b.poly([[6, 66], [22, 36], [50, 24], [78, 36], [94, 66], [78, 72], [64, 56], [36, 56], [22, 72]], '#E2A15A', { round: 12 });
    b.line([[34, 34], [38, 54]], 3, '#B27632');
    b.line([[50, 28], [50, 54]], 3, '#B27632');
    b.line([[66, 34], [62, 54]], 3, '#B27632');
    b.face(50, 62, 0.8);
  }),

  def('donut', 'Donut', ['doughnut', 'sprinkles'], (b) => {
    b.blob(50, 52, 40, 36, '#E2A15A', { sw: 4.6 });
    b.blob(50, 50, 36, 31, P.pinkHot, { sw: 3.4 });
    b.blob(50, 52, 10, 9, P.paper, { flat: true, sw: 3.4 });
    for (const [x, y, a] of [[26, 44, 30], [34, 32, -40], [66, 32, 20], [76, 46, -20], [30, 64, 60], [70, 64, -50]] as const) b.rect(x - 3, y - 1, 7, 2.6, P.cream, { rot: a, flat: true, sw: 1.6, round: 1 });
    b.face(50, 74, 0.7);
  }),

  def('chicken', 'Chicken', ['fried chicken', 'drumstick', 'wings'], (b) => {
    b.tube([[66, 70], [84, 88]], 6, P.cream);
    b.dot(86, 90, 6, P.cream, true);
    b.blob(40, 42, 34, 30, '#D98A3D', { rot: -30, sw: 4.6 });
    b.blob(32, 32, 8, 5, '#F0B46A', { flat: true, hi: false, sw: 0.1 });
    b.face(38, 44, 0.9, 'wink');
  }),

  def('taco', 'Tacos', ['mexican', 'burrito'], (b) => {
    b.poly([[8, 78], [14, 40], [50, 22], [86, 40], [92, 78]], '#F2C25A', { round: 24 });
    b.poly([[22, 50], [36, 36], [50, 46], [64, 34], [78, 50], [78, 60], [22, 60]], P.green, { round: 4 });
    b.blob(40, 54, 8, 5, P.tomato, { flat: true, sw: 2.6 });
    b.look(50, 70, 0.85, { eyes: 'uneven', mouth: 'open', blush: 'one', tilt: 5 });
  }),

  def('popcorn', 'Popcorn', ['cinema snack', 'movie'], (b) => {
    for (const [x, y, r] of [[28, 26, 12], [46, 18, 13], [64, 22, 13], [78, 32, 10], [38, 34, 11], [58, 34, 11]] as const) b.blob(x, y, r, r * 0.9, P.creamHi, { sw: 3.8 });
    b.poly([[20, 40], [80, 40], [72, 92], [28, 92]], P.tomato, { round: 6 });
    b.poly([[36, 40], [48, 40], [46, 92], [36, 92]], P.creamHi, { round: 2, flat: true, sw: 2.4 });
    b.poly([[58, 40], [68, 40], [64, 92], [56, 92]], P.creamHi, { round: 2, flat: true, sw: 2.4 });
    b.face(50, 66, 0.8);
  }),

  def('fruit', 'Fruit', ['apple', 'healthy', 'produce'], (b) => {
    b.tube([[50, 28], [54, 10]], 3.4, P.wood);
    b.poly([[54, 14], [72, 6], [74, 20], [58, 22]], P.green, { round: 6 });
    b.blob(50, 58, 34, 33, P.tomato, { sw: 4.6 });
    b.blob(34, 48, 6, 10, '#FF9A8A', { flat: true, hi: false, sw: 0.1, rot: 20 });
    b.face(50, 62, 0.95);
  }),

  def('juice', 'Juice & soft drink', ['orange juice', 'soft drink', 'soda', 'carton'], (b) => {
    b.tube([[62, 4], [58, 22]], 4.6, P.pinkHot);
    b.rect(26, 22, 48, 66, P.orange, { round: 6 });
    b.poly([[26, 22], [74, 22], [66, 10], [34, 10]], P.cream, { round: 3 });
    b.blob(50, 44, 12, 12, P.fry, { sw: 3.4 });
    b.face(50, 68, 0.85);
  }),

  def('candy', 'Sweets', ['lollies', 'chocolate', 'candy'], (b) => {
    b.poly([[6, 30], [26, 40], [24, 62], [6, 70]], P.pinkHot, { round: 3 });
    b.poly([[94, 30], [74, 40], [76, 62], [94, 70]], P.pinkHot, { round: 3 });
    b.blob(50, 50, 28, 22, P.purple, { sw: 4.6 });
    b.line([[34, 40], [44, 60]], 3.6, P.creamHi);
    b.line([[52, 36], [62, 58]], 3.6, P.creamHi);
    b.face(50, 52, 0.8);
  }),
];

export type { Pt };
export const _ink = INK;
