import { Ico, IconDef, P, arcPts, rotPts, heartPts } from './kit';

const def = (id: string, label: string, tags: string[], draw: (b: Ico) => void): IconDef => ({ id, label, tags, draw });

/** The boring stuff that still takes your money. */
export const BILLS: IconDef[] = [
  def('house', 'Rent', ['rent', 'home', 'mortgage', 'housing'], (b) => {
    b.rect(64, 20, 10, 22, P.steelDeep, { round: 2 });
    b.rect(16, 46, 68, 44, P.cream, { round: 4 });
    b.poly([[6, 50], [50, 12], [94, 50]], P.tomato, { round: 6 });
    b.rect(58, 60, 18, 30, P.wood, { round: 4 });
    b.dot(70, 76, 2, P.fry);
    b.face(36, 68, 0.7);
  }),

  def('bolt', 'Electricity', ['power', 'energy', 'electric', 'lightning'], (b) => {
    b.poly([[58, 4], [20, 54], [44, 54], [36, 96], [80, 40], [54, 40]], P.fry, { round: 3 });
    b.face(50, 52, 0.55);
    b.spark(84, 18, 6);
    b.spark(14, 78, 5, P.sky);
  }),

  def('drop', 'Water', ['water bill', 'plumbing', 'shower'], (b) => {
    b.poly([[50, 6], [76, 46], [84, 64], [72, 86], [50, 94], [28, 86], [16, 64], [24, 46]], P.sky, { round: 18 });
    b.face(50, 64, 0.95);
    b.spark(82, 22, 6);
  }),

  def('wifi', 'Internet', ['wifi', 'nbn', 'broadband', 'router'], (b) => {
    for (const [r, c] of [[50, P.sky], [36, P.teal], [22, P.green]] as const) b.tube(arcPts(50, 78, r, -140, -40, 8), 6, c);
    b.blob(50, 80, 13, 13, P.tomato, { sw: 4.2 });
    b.face(50, 80, 0.5);
  }),

  def('signal', 'Phone plan', ['mobile plan', 'telstra', 'data', 'sim'], (b) => {
    for (const [i, h, c] of [[0, 20, P.sky], [1, 38, P.teal], [2, 56, P.green], [3, 76, P.fry]] as const) b.rect(10 + i * 21, 90 - h, 16, h, c, { round: 5 });
    b.face(73, 66, 0.4);
    b.spark(18, 30, 6, P.pinkHot);
  }),

  def('loop', 'Subscriptions', ['subscription', 'recurring', 'membership', 'monthly'], (b) => {
    b.tube(arcPts(50, 50, 32, -170, -20, 8), 7, P.pinkHot);
    b.tube(arcPts(50, 50, 32, 10, 160, 8), 7, P.teal);
    b.poly([[76, 20], [92, 36], [66, 40]], P.pinkHot, { round: 2, sw: 3.6 });
    b.poly([[24, 80], [8, 64], [34, 60]], P.teal, { round: 2, sw: 3.6 });
    b.face(50, 50, 0.85);
  }),

  def('tv', 'Streaming', ['netflix', 'stan', 'disney', 'tv', 'streaming'], (b) => {
    b.tube([[40, 24], [30, 8]], 2.4, P.steelDeep);
    b.tube([[60, 24], [70, 8]], 2.4, P.steelDeep);
    b.rect(8, 24, 84, 58, P.navy, { round: 12 });
    b.rect(14, 30, 58, 46, P.sky, { round: 6, flat: true, sw: 3 });
    b.dot(82, 42, 3.4, P.fry, true);
    b.dot(82, 54, 3.4, P.tomato, true);
    b.face(43, 53, 0.85, 'oh');
    b.line([[24, 88], [20, 94]], 3.6);
    b.line([[76, 88], [80, 94]], 3.6);
  }),

  def('music', 'Music', ['spotify', 'records', 'vinyl', 'songs'], (b) => {
    b.blob(50, 52, 40, 40, P.navy, { sw: 4.6 });
    b.ring(50, 52, 33, 33, 1.4, '#6C7DB0');
    b.ring(50, 52, 28, 28, 1.2, '#6C7DB0');
    b.blob(50, 52, 21, 21, P.pinkHot, { sw: 3.4 });
    b.face(50, 53, 0.72);
    b.spark(90, 14, 7);
  }),

  def('shield', 'Insurance', ['cover', 'protection', 'insurance', 'safe'], (b) => {
    b.poly([[50, 6], [86, 20], [84, 56], [50, 94], [16, 56], [14, 20]], P.teal, { round: 10 });
    b.poly([[50, 16], [76, 26], [74, 54], [50, 82], [26, 54], [24, 26]], '#7FDCE2', { round: 8, flat: true, sw: 2.4 });
    b.face(50, 46, 0.9);
    b.spark(86, 80, 5);
  }),

  def('receipt', 'Fees & fines', ['fees', 'fine', 'bill', 'receipt', 'tax'], (b) => {
    b.poly([[22, 6], [78, 6], [78, 94], [70, 88], [62, 94], [54, 88], [46, 94], [38, 88], [30, 94], [22, 88]], P.creamHi, { round: 3 });
    b.line([[32, 20], [68, 20]], 3.4);
    b.line([[32, 30], [58, 30]], 3.4);
    b.face(50, 56, 0.8, 'derp');
    b.line([[32, 74], [48, 74]], 3.4);
    b.line([[58, 74], [68, 74]], 3.4);
  }),

  def('bank', 'Bank', ['bank', 'atm', 'transfer', 'savings'], (b) => {
    b.rect(14, 76, 72, 14, P.steel, { round: 3 });
    b.rect(18, 40, 64, 38, P.creamHi, { round: 3 });
    b.rect(20, 42, 10, 34, P.steel, { round: 2, flat: true, sw: 2.6 });
    b.rect(70, 42, 10, 34, P.steel, { round: 2, flat: true, sw: 2.6 });
    b.poly([[8, 40], [50, 10], [92, 40]], P.cream, { round: 4 });
    b.face(50, 60, 0.7);
    b.dot(50, 28, 5, P.gold, true);
  }),

  def('piggy', 'Savings', ['piggy bank', 'savings', 'save', 'goal'], (b) => {
    b.tube([[78, 52], [90, 46], [88, 58]], 3.2, P.pinkHot);
    b.blob(50, 56, 38, 30, P.pinkHot, { sw: 4.6 });
    b.blob(24, 30, 7, 9, P.pinkHot, { rot: -20, sw: 4 });
    b.blob(78, 58, 10, 8, '#FFB3C4', { sw: 3.6 });
    b.dot(76, 58, 1.6);
    b.dot(81, 58, 1.6);
    b.rect(32, 28, 26, 5, '#7A1E3A', { round: 2, flat: true, sw: 2 });
    b.rect(26, 80, 9, 12, P.pinkHot, { round: 3, sw: 3.6 });
    b.rect(60, 80, 9, 12, P.pinkHot, { round: 3, sw: 3.6 });
    b.face(46, 56, 0.8);
    b.blob(48, 12, 8, 8, P.gold, { sw: 3.4 });
  }),

  def('coin', 'Cash', ['cash', 'coin', 'atm', 'money'], (b) => {
    b.blob(50, 52, 38, 38, P.gold, { sw: 4.6 });
    b.ring(50, 52, 29, 29, 1.8, '#C28A00');
    b.face(50, 52, 0.95);
    b.spark(86, 14, 7);
  }),

  def('wallet', 'Wallet', ['wallet', 'purse'], (b) => {
    b.rect(10, 26, 80, 60, P.wood, { round: 10 });
    b.rect(10, 26, 80, 14, '#D69A57', { round: 6, flat: true, sw: 3 });
    b.rect(60, 50, 32, 22, P.fry, { round: 8 });
    b.dot(72, 61, 3.4, P.wood, true);
    b.face(34, 58, 0.8);
  }),

  def('handheart', 'Donations', ['charity', 'donation', 'giving', 'tip'], (b) => {
    b.path(heartPts(50, 32, 1.45), P.tomato, { sw: 4.4 });
    b.face(50, 28, 0.62);
    b.poly([[6, 74], [26, 62], [52, 66], [78, 58], [92, 64], [80, 84], [50, 92], [10, 88]], '#F5C79F', { round: 10 });
    b.line([[50, 70], [70, 66]], 2.6, '#D99D72');
    b.spark(86, 16, 6);
  }),
];

export const _b = [rotPts];
