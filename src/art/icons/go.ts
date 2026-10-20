import { Ico, IconDef, P, arcPts } from './kit';

const def = (id: string, label: string, tags: string[], draw: (b: Ico) => void): IconDef => ({ id, label, tags, draw });

/** Getting around, going away. */
export const GO: IconDef[] = [
  def('car', 'Rideshare & taxi', ['uber', 'taxi', 'car', 'cab', 'ride'], (b) => {
    b.poly([[6, 66], [12, 50], [30, 46], [40, 28], [64, 28], [76, 46], [92, 52], [94, 70], [6, 72]], P.tomato, { round: 10 });
    b.poly([[38, 46], [45, 34], [60, 34], [68, 46]], P.sky, { round: 3, flat: true, sw: 3 });
    b.rect(44, 12, 20, 12, P.fry, { round: 3 });
    b.dot(32, 74, 11, P.steelDeep, true);
    b.dot(72, 74, 11, P.steelDeep, true);
    b.dot(32, 74, 4, P.steel, true);
    b.dot(72, 74, 4, P.steel, true);
    b.face(52, 60, 0.62);
  }),

  def('tram', 'Public transport', ['train', 'bus', 'metro', 'tram', 'myki', 'opal'], (b) => {
    b.tube([[34, 20], [42, 8], [58, 8], [66, 20]], 2.4, P.steelDeep);
    b.rect(20, 20, 60, 60, P.teal, { round: 14 });
    b.rect(26, 28, 48, 22, P.glass, { round: 6, flat: true, sw: 3 });
    b.face(50, 38, 0.72);
    b.dot(32, 66, 5, P.fry, true);
    b.dot(68, 66, 5, P.fry, true);
    b.line([[26, 88], [18, 96]], 3.6);
    b.line([[74, 88], [82, 96]], 3.6);
    b.line([[34, 82], [66, 82]], 3.4, P.steelDeep);
  }),

  def('fuel', 'Fuel', ['petrol', 'gas', 'servo', 'diesel'], (b) => {
    b.tube([[64, 32], [80, 34], [84, 58], [80, 72]], 3.6, P.steelDeep);
    b.rect(16, 12, 48, 76, P.tomato, { round: 8 });
    b.rect(24, 20, 32, 22, P.creamHi, { round: 4, flat: true, sw: 3 });
    b.face(40, 30, 0.6);
    b.blob(40, 90, 30, 5, P.steelDeep, { sw: 3.6 });
    b.poly([[76, 70], [88, 70], [88, 82], [76, 82]], P.steel, { round: 3, sw: 3.4 });
    b.line([[26, 56], [54, 56]], 3, '#FFB3A8');
    b.line([[26, 66], [48, 66]], 3, '#FFB3A8');
  }),

  def('parking', 'Parking', ['car park', 'meter'], (b) => {
    b.rect(46, 66, 8, 28, P.steelDeep, { round: 2 });
    b.rect(12, 10, 76, 62, P.navy, { round: 14 });
    b.tube([[40, 22], [40, 46]], 6, P.creamHi, 0.1);
    b.tube([[40, 24], [54, 24], [60, 30], [54, 38], [40, 38]], 6, P.creamHi, 0.1);
    b.face(50, 58, 0.68);
  }),

  def('wrench', 'Repairs & car care', ['mechanic', 'service', 'car wash', 'tools'], (b) => {
    b.tube([[28, 74], [62, 40]], 15, P.steel);
    b.blob(70, 30, 21, 21, P.steel, { sw: 4.6 });
    b.blob(79, 21, 8, 8, P.paper, { flat: true, sw: 3 });
    b.blob(22, 80, 11, 11, P.steel, { sw: 4.2 });
    b.face(46, 56, 0.5);
    b.spark(14, 30, 6);
  }),

  def('plane', 'Flights', ['flight', 'airport', 'travel', 'plane'], (b) => {
    b.poly([[48, 46], [64, 46], [56, 16], [44, 16]], P.steelDeep, { round: 4 });
    b.poly([[16, 52], [8, 26], [26, 26], [36, 46]], P.tomato, { round: 4 });
    b.blob(50, 54, 42, 13, P.creamHi, { sw: 4.4 });
    b.poly([[42, 56], [62, 56], [48, 90], [34, 90]], P.sky, { round: 4 });
    b.blob(84, 52, 4, 4, P.sky, { flat: true, sw: 2.4 });
    b.face(70, 52, 0.5);
    b.spark(14, 78, 6);
    b.spark(88, 20, 7, P.pinkHot);
  }),

  def('bed', 'Hotel & stays', ['accommodation', 'airbnb', 'stay', 'hostel', 'bed'], (b) => {
    b.rect(8, 26, 12, 52, P.wood, { round: 4 });
    b.rect(8, 62, 86, 12, P.wood, { round: 4 });
    b.rect(14, 44, 80, 20, P.creamHi, { round: 8 });
    b.rect(40, 42, 54, 22, P.sky, { round: 8 });
    b.blob(30, 42, 13, 8, P.paper, { sw: 3.8 });
    b.face(66, 53, 0.55);
    b.rect(84, 74, 8, 16, P.wood, { round: 3 });
    b.rect(10, 74, 8, 16, P.wood, { round: 3 });
    b.spark(80, 18, 7);
    b.spark(92, 32, 4);
  }),

  def('palm', 'Holiday', ['beach', 'trip', 'vacation', 'island'], (b) => {
    b.blob(50, 90, 40, 12, '#F2D48A', { sw: 4.4 });
    b.tube([[52, 84], [50, 56], [56, 36]], 6, P.wood);
    for (const [x, y, rx, ry, a] of [[36, 30, 22, 8, -25], [72, 30, 22, 8, 25], [44, 20, 18, 7, -60], [66, 18, 18, 7, 55], [56, 26, 8, 14, 0]] as const) b.blob(x, y, rx, ry, P.green, { rot: a, sw: 4 });
    b.dot(52, 40, 5, '#7A4A22', true);
    b.dot(62, 40, 5, '#7A4A22', true);
    b.face(50, 90, 0.55);
    b.blob(84, 14, 9, 9, P.fry, { sw: 3.8 });
  }),

  def('bike', 'Bikes & scooters', ['bicycle', 'e-scooter', 'lime', 'cycling'], (b) => {
    b.ring(24, 68, 18, 18, 4, P.steelDeep);
    b.ring(76, 68, 18, 18, 4, P.steelDeep);
    b.tube([[24, 68], [42, 40], [66, 40], [76, 68]], 4, P.tomato);
    b.tube([[42, 40], [50, 68], [24, 68]], 4, P.tomato);
    b.tube([[66, 40], [60, 24], [72, 22]], 3.6, P.steelDeep);
    b.tube([[38, 36], [46, 36]], 4.4, P.steelDeep);
    b.dot(50, 68, 4, P.fry, true);
    b.face(54, 54, 0.48);
  }),

  def('suitcase', 'Luggage', ['bag', 'trip', 'baggage'], (b) => {
    b.tube([[38, 30], [38, 16], [62, 16], [62, 30]], 3.4, P.steelDeep);
    b.rect(14, 28, 72, 58, P.teal, { round: 10 });
    b.rect(14, 40, 72, 8, P.fry, { round: 2, flat: true, sw: 3 });
    b.dot(28, 92, 4, P.steelDeep, true);
    b.dot(72, 92, 4, P.steelDeep, true);
    b.face(50, 64, 0.8);
  }),

  def('bus', 'Buses', ['coach', 'bus'], (b) => {
    b.rect(10, 20, 80, 56, P.fry, { round: 12 });
    b.rect(16, 28, 68, 22, P.glass, { round: 6, flat: true, sw: 3 });
    b.face(50, 38, 0.7);
    b.dot(28, 80, 9, P.steelDeep, true);
    b.dot(72, 80, 9, P.steelDeep, true);
    b.dot(28, 80, 3, P.steel, true);
    b.dot(72, 80, 3, P.steel, true);
    b.dot(20, 62, 4, P.tomato, true);
    b.dot(80, 62, 4, P.tomato, true);
  }),

  def('ticket', 'Tickets', ['gig', 'event', 'show', 'admission'], (b) => {
    b.poly([[8, 28], [92, 28], [92, 42], [86, 50], [92, 58], [92, 72], [8, 72], [8, 58], [14, 50], [8, 42]], P.pinkHot, { round: 4, rot: 0 });
    b.line([[66, 32], [66, 38]], 3, P.creamHi);
    b.line([[66, 46], [66, 54]], 3, P.creamHi);
    b.line([[66, 62], [66, 68]], 3, P.creamHi);
    b.face(36, 50, 0.85);
    b.spark(84, 18, 7);
  }),

  def('mic', 'Concerts', ['gig', 'live music', 'karaoke', 'mic'], (b) => {
    b.tube([[64, 52], [30, 86]], 10, P.steelDeep);
    b.blob(36, 36, 23, 23, P.steel, { sw: 4.6 });
    b.face(36, 36, 0.8, 'oh');
    b.spark(80, 24, 7, P.pinkHot);
    b.spark(88, 56, 5);
  }),

  def('clapper', 'Cinema', ['movies', 'film', 'netflix', 'clapperboard'], (b) => {
    b.rect(12, 38, 76, 50, P.navy, { round: 6 });
    b.poly([[10, 22], [86, 16], [88, 32], [12, 38]], P.creamHi, { round: 3 });
    for (const x of [26, 46, 66]) b.poly([[x, 22], [x + 12, 20], [x + 4, 36], [x - 8, 38]], P.ink ?? '#24120A', { round: 1, flat: true, sw: 1.6 });
    b.face(50, 62, 0.85);
  }),

  def('balloon', 'Events', ['party', 'birthday', 'celebration'], (b) => {
    b.tube([[50, 66], [44, 80], [54, 92]], 1.8, P.steelDeep);
    b.blob(50, 38, 27, 31, P.pinkHot, { sw: 4.6 });
    b.poly([[44, 66], [56, 66], [52, 72], [48, 72]], P.pinkHot, { round: 1, sw: 3.4 });
    b.face(50, 38, 0.95);
    b.spark(16, 22, 6);
    b.spark(86, 62, 5, P.sky);
  }),

  def('candle', 'Dates', ['date night', 'romance', 'dinner'], (b) => {
    b.path([[50, 4], [58, 14], [60, 24], [50, 30], [40, 24], [42, 14]], P.fry, { sw: 3.8 });
    b.rect(34, 30, 32, 58, P.creamHi, { round: 6 });
    b.blob(50, 30, 16, 4, P.creamHi, { flat: true, sw: 3.4 });
    b.blob(50, 90, 28, 6, P.steelDeep, { sw: 3.6 });
    b.face(50, 58, 0.8);
  }),

  def('dice', 'Arcade & games', ['arcade', 'board games', 'bowling', 'dice'], (b) => {
    b.rect(14, 20, 56, 56, P.creamHi, { round: 12, rot: -10 });
    for (const [x, y] of [[30, 36], [52, 32], [44, 52], [26, 58], [48, 66]] as const) b.dot(x, y, 4, '#24120A');
    b.rect(54, 50, 36, 36, P.tomato, { round: 8, rot: 14 });
    b.face(72, 68, 0.5, 'wink');
  }),
];
