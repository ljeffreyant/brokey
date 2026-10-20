import { Ico, IconDef, P, rotPts, starPts } from './kit';

const def = (id: string, label: string, tags: string[], draw: (b: Ico) => void): IconDef => ({ id, label, tags, draw });

/** Things you did not need. */
export const SHOP: IconDef[] = [
  def('tee', 'Clothes', ['fashion', 'shirt', 'tee', 'outfit'], (b) => {
    b.poly([[30, 18], [42, 12], [58, 12], [70, 18], [92, 34], [82, 52], [72, 44], [72, 88], [28, 88], [28, 44], [18, 52], [8, 34]], P.teal, { round: 6 });
    b.blob(50, 16, 10, 5, P.paper, { flat: true, sw: 3.4 });
    b.face(50, 58, 0.95);
  }),

  def('sneaker', 'Shoes', ['sneakers', 'trainers', 'footwear', 'kicks'], (b) => {
    b.poly([[8, 70], [8, 40], [26, 32], [38, 44], [62, 54], [90, 60], [94, 72]], P.tomato, { round: 10 });
    b.poly([[6, 72], [94, 72], [94, 84], [8, 86]], P.creamHi, { round: 6 });
    b.line([[34, 46], [28, 54]], 3, P.creamHi);
    b.line([[44, 52], [38, 60]], 3, P.creamHi);
    b.line([[54, 56], [48, 64]], 3, P.creamHi);
    b.face(22, 60, 0.55);
  }),

  def('bag', 'Bags', ['handbag', 'tote', 'shopping bag'], (b) => {
    b.tube([[36, 34], [36, 18], [64, 18], [64, 34]], 3.6, P.steelDeep);
    b.poly([[18, 34], [82, 34], [90, 90], [10, 90]], P.pinkHot, { round: 6 });
    b.face(50, 62, 0.95, 'wink');
  }),

  def('ring', 'Jewellery', ['jewelry', 'diamond', 'ring', 'bling'], (b) => {
    b.ring(50, 66, 24, 24, 8, P.gold);
    b.poly([[38, 18], [62, 18], [72, 30], [50, 50], [28, 30]], P.sky, { round: 3 });
    b.line([[28, 30], [72, 30]], 2.2, P.glass);
    b.face(50, 31, 0.5);
    b.spark(86, 14, 7);
    b.spark(14, 52, 5, P.pinkHot);
  }),

  def('phone', 'Phone & tech', ['iphone', 'gadget', 'mobile', 'tech'], (b) => {
    b.rect(26, 8, 48, 84, P.navy, { round: 12 });
    b.rect(32, 18, 36, 62, '#CFEFFF', { round: 5, flat: true, sw: 3 });
    b.line([[44, 13], [56, 13]], 2.6, P.steel);
    b.face(50, 48, 0.9);
    b.dot(50, 86, 2.6, P.steel);
  }),

  def('headphones', 'Headphones', ['audio', 'airpods', 'earbuds', 'speaker'], (b) => {
    b.tube([[18, 58], [18, 38], [32, 20], [50, 14], [68, 20], [82, 38], [82, 58]], 6, P.steelDeep);
    b.blob(50, 62, 18, 16, P.creamHi, { sw: 4 });
    b.blob(19, 66, 11, 17, P.tomato, { sw: 4.4 });
    b.blob(81, 66, 11, 17, P.tomato, { sw: 4.4 });
    b.face(50, 62, 0.62);
  }),

  def('gamepad', 'Gaming', ['games', 'xbox', 'playstation', 'controller'], (b) => {
    b.blob(22, 74, 14, 17, P.purple, { sw: 4.4 });
    b.blob(78, 74, 14, 17, P.purple, { sw: 4.4 });
    b.blob(50, 54, 42, 26, P.purple, { sw: 4.6 });
    b.rect(18, 50, 20, 7, P.creamHi, { round: 2, flat: true, sw: 2.8 });
    b.rect(24.5, 43.5, 7, 20, P.creamHi, { round: 2, flat: true, sw: 2.8 });
    b.dot(72, 50, 4.6, P.tomato, true);
    b.dot(82, 58, 4.6, P.fry, true);
    b.face(50, 54, 0.62);
  }),

  def('camera', 'Photo & video', ['photography', 'camera', 'film'], (b) => {
    b.rect(36, 18, 28, 14, P.steelDeep, { round: 4 });
    b.rect(8, 28, 84, 56, P.steel, { round: 12 });
    b.rect(14, 34, 14, 8, P.tomato, { round: 2, flat: true, sw: 2.6 });
    b.blob(50, 56, 24, 24, P.steelDeep, { sw: 4.4 });
    b.blob(50, 56, 18, 18, P.sky, { sw: 3 });
    b.face(50, 56, 0.55, 'oh');
    b.spark(84, 20, 7);
  }),

  def('lipstick', 'Beauty', ['makeup', 'cosmetics', 'lipstick', 'sephora'], (b) => {
    b.poly([[40, 46], [40, 22], [48, 10], [62, 18], [60, 46]], P.tomato, { round: 4 });
    b.rect(34, 44, 32, 10, P.steelDeep, { round: 3 });
    b.rect(34, 54, 32, 38, P.gold, { round: 5 });
    b.face(50, 72, 0.62);
    b.spark(80, 24, 6, P.pinkHot);
  }),

  def('skincare', 'Skincare', ['moisturiser', 'serum', 'face', 'lotion'], (b) => {
    b.tube([[46, 26], [46, 14], [66, 14]], 4, P.steelDeep);
    b.rect(40, 24, 12, 18, P.steel, { round: 3 });
    b.rect(26, 40, 40, 50, P.creamHi, { round: 10 });
    b.rect(30, 62, 32, 18, P.pinkHot, { round: 4, flat: true, sw: 2.6 });
    b.face(46, 53, 0.6);
    b.blob(78, 40, 6, 8, P.sky, { sw: 3.4 });
    b.spark(80, 70, 6);
  }),

  def('scissors', 'Haircut', ['barber', 'salon', 'hair', 'scissors'], (b) => {
    b.tube([[26, 14], [60, 58]], 5, P.steel);
    b.tube([[74, 14], [40, 58]], 5, P.steel);
    b.ring(30, 76, 12, 12, 5, P.tomato);
    b.ring(70, 76, 12, 12, 5, P.tomato);
    b.dot(50, 44, 4, P.steelDeep, true);
    b.tube([[40, 58], [34, 66]], 5, P.tomato);
    b.tube([[60, 58], [66, 66]], 5, P.tomato);
    b.spark(14, 40, 6);
    b.spark(88, 40, 5, P.pinkHot);
  }),

  def('gift', 'Gifts', ['present', 'birthday', 'gift'], (b) => {
    b.rect(16, 46, 68, 42, P.tomato, { round: 6 });
    b.rect(12, 34, 76, 16, P.pinkHot, { round: 4 });
    b.rect(44, 34, 12, 16, P.fry, { round: 2, flat: true, sw: 3 });
    b.blob(38, 24, 13, 9, P.fry, { rot: -25, sw: 4 });
    b.blob(62, 24, 13, 9, P.fry, { rot: 25, sw: 4 });
    b.dot(50, 30, 5, P.gold, true);
    b.face(50, 68, 0.85);
  }),

  def('palette', 'Hobbies', ['art', 'craft', 'paint', 'hobby'], (b) => {
    b.tube([[70, 92], [90, 50]], 6, P.wood);
    b.poly([[84, 56], [96, 56], [90, 40]], P.pinkHot, { round: 1, sw: 3 });
    b.blob(46, 52, 40, 34, '#E8B65C', { sw: 4.6, rot: -8 });
    b.blob(66, 68, 8, 7, P.paper, { flat: true, sw: 3 });
    for (const [x, y, c] of [[22, 40, P.tomato], [34, 24, P.sky], [56, 22, P.green], [74, 34, P.purple]] as const) b.dot(x, y, 6, c, true);
    b.face(42, 56, 0.7);
  }),

  def('lamp', 'Homewares', ['decor', 'lamp', 'home', 'kmart', 'ikea'], (b) => {
    b.tube([[50, 50], [50, 82]], 4, P.steelDeep);
    b.blob(50, 88, 20, 5, P.steel, { sw: 3.8 });
    b.poly([[22, 54], [78, 54], [66, 14], [34, 14]], P.fry, { round: 6 });
    b.face(50, 36, 0.8);
    b.spark(86, 22, 6);
    b.spark(12, 28, 5);
  }),

  def('chair', 'Furniture', ['sofa', 'couch', 'chair', 'desk'], (b) => {
    b.line([[24, 84], [22, 94]], 4.4);
    b.line([[76, 84], [78, 94]], 4.4);
    b.rect(22, 14, 56, 46, P.purple, { round: 16 });
    b.rect(8, 44, 18, 40, P.purple, { round: 8 });
    b.rect(74, 44, 18, 40, P.purple, { round: 8 });
    b.rect(20, 54, 60, 28, '#C3AEFF', { round: 8 });
    b.face(50, 36, 0.9);
  }),

  def('plant', 'Plants', ['garden', 'plant', 'flowers', 'bunnings'], (b) => {
    b.blob(36, 38, 9, 20, P.green, { rot: -30, sw: 4 });
    b.blob(64, 38, 9, 20, P.green, { rot: 30, sw: 4 });
    b.blob(50, 28, 9, 22, '#5DAE2F', { sw: 4 });
    b.poly([[26, 58], [74, 58], [66, 92], [34, 92]], '#D9784A', { round: 6 });
    b.rect(22, 54, 56, 10, '#E88B5C', { round: 4 });
    b.face(50, 76, 0.75);
  }),

  def('paw', 'Pets', ['dog', 'cat', 'vet', 'pet food'], (b) => {
    for (const [x, y, rx, ry, a] of [[20, 46, 9, 12, -25], [38, 28, 9, 13, -8], [62, 28, 9, 13, 8], [80, 46, 9, 12, 25]] as const) b.blob(x, y, rx, ry, P.wood, { rot: a, sw: 4.2 });
    b.path([[50, 46], [68, 58], [76, 76], [64, 90], [50, 84], [36, 90], [24, 76], [32, 58]], P.wood, { sw: 4.6 });
    b.face(50, 72, 0.7);
  }),

  def('parcel', 'Online shopping', ['amazon', 'delivery', 'package', 'online'], (b) => {
    b.poly([[12, 32], [88, 32], [88, 88], [12, 88]], '#D9A566', { round: 5 });
    b.rect(40, 32, 20, 56, P.creamHi, { round: 1, flat: true, sw: 3 });
    b.rect(66, 62, 16, 18, P.paper, { round: 2, flat: true, sw: 2.6 });
    b.line([[70, 68], [78, 68]], 1.8);
    b.line([[70, 74], [76, 74]], 1.8);
    b.face(26, 62, 0.58);
    b.poly([[12, 32], [18, 18], [82, 18], [88, 32]], '#E8BB82', { round: 3 });
  }),

  def('questionbox', 'Random', ['mystery', 'misc', 'random', 'impulse'], (b) => {
    b.rect(16, 14, 68, 74, P.purple, { round: 14 });
    b.tube([[40, 36], [40, 28], [50, 22], [60, 28], [58, 38], [50, 44], [50, 50]], 5, P.creamHi, 0.1);
    b.dot(50, 58, 3.6, P.creamHi, true);
    b.face(50, 74, 0.6);
  }),

  def('star', 'Other', ['misc', 'other', 'favourite'], (b) => {
    const pts = starPts(50, 52, 40, 20);
    b.poly(pts, P.gold, { round: 5 });
    b.face(50, 54, 0.8);
    b.spark(86, 16, 6);
  }),
];

export const _rot = rotPts;
