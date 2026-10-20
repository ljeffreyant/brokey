import { Ico, IconDef, P, rotPts } from './kit';

const def = (id: string, label: string, tags: string[], draw: (b: Ico) => void): IconDef => ({ id, label, tags, draw });

const rot = (pts: [number, number][], deg: number) => rotPts(pts, 50, 50, deg);

/** Body, brain, work and chores. */
export const LIFE: IconDef[] = [
  def('cross', 'Health', ['doctor', 'medical', 'gp', 'clinic'], (b) => {
    b.poly([[38, 8], [62, 8], [62, 38], [92, 38], [92, 62], [62, 62], [62, 92], [38, 92], [38, 62], [8, 62], [8, 38], [38, 38]], P.tomato, { round: 8 });
    b.face(50, 49, 0.78);
  }),

  def('pill', 'Pharmacy', ['chemist', 'pharmacy', 'medicine', 'pills'], (b) => {
    b.rect(44.6, 25.8, 40, 24, P.creamHi, { rot: -40, round: 12 });
    b.rect(15.4, 50.2, 40, 24, P.pinkHot, { rot: -40, round: 12 });
    b.blob(78, 78, 12, 12, P.sky, { sw: 4.2 });
    b.line([[70, 78], [86, 78]], 2.4, '#3F95D8');
    b.face(50, 50, 0.55);
    b.spark(16, 20, 6);
  }),

  def('dumbbell', 'Gym', ['gym', 'fitness', 'workout', 'weights'], (b) => {
    b.tube([[20, 50], [80, 50]], 6, P.steelDeep);
    b.rect(8, 26, 14, 48, P.tomato, { round: 5 });
    b.rect(22, 33, 10, 34, P.pinkHot, { round: 3 });
    b.rect(78, 26, 14, 48, P.tomato, { round: 5 });
    b.rect(68, 33, 10, 34, P.pinkHot, { round: 3 });
    b.rect(36, 40, 28, 20, P.steel, { round: 6 });
    b.face(50, 49, 0.45);
  }),

  def('ball', 'Sport', ['sports', 'football', 'basketball', 'club'], (b) => {
    b.blob(50, 52, 38, 38, P.orange, { sw: 4.6 });
    b.line([[18, 34], [32, 52], [18, 70]], 3.2);
    b.line([[82, 34], [68, 52], [82, 70]], 3.2);
    b.line([[16, 52], [28, 52]], 3.2);
    b.line([[72, 52], [84, 52]], 3.2);
    b.line([[50, 14], [50, 24]], 3.2);
    b.line([[50, 80], [50, 90]], 3.2);
    b.face(50, 52, 0.7);
  }),

  def('tooth', 'Dentist', ['dental', 'teeth', 'dentist'], (b) => {
    b.poly([[22, 24], [34, 14], [50, 20], [66, 14], [78, 24], [80, 46], [72, 62], [68, 88], [58, 90], [52, 66], [48, 66], [42, 90], [32, 88], [28, 62], [20, 46]], P.creamHi, { round: 8 });
    b.face(50, 40, 0.8);
    b.spark(86, 16, 7, P.sky);
  }),

  def('lotus', 'Wellness', ['spa', 'massage', 'yoga', 'meditation'], (b) => {
    b.blob(50, 88, 40, 8, P.sky, { sw: 4 });
    b.poly([[8, 56], [24, 40], [40, 62], [36, 78]], P.pinkHot, { round: 12 });
    b.poly([[92, 56], [76, 40], [60, 62], [64, 78]], P.pinkHot, { round: 12 });
    b.poly([[50, 10], [68, 40], [64, 74], [50, 82], [36, 74], [32, 40]], '#FF8FAA', { round: 14 });
    b.face(50, 54, 0.62);
  }),

  def('glasses', 'Optical', ['glasses', 'optometrist', 'sunglasses', 'contacts'], (b) => {
    b.tube([[14, 50], [6, 38]], 3.2, P.steelDeep);
    b.tube([[86, 50], [94, 38]], 3.2, P.steelDeep);
    b.tube([[44, 50], [50, 46], [56, 50]], 3, P.steelDeep);
    b.blob(30, 56, 21, 17, P.glass, { sw: 5 });
    b.blob(70, 56, 21, 17, P.glass, { sw: 5 });
    b.dot(30, 56, 3.4);
    b.dot(70, 56, 3.4);
    b.dot(29, 54.6, 1.1, '#FFFFFF');
    b.dot(69, 54.6, 1.1, '#FFFFFF');
    b.line([[46, 74], [50, 78], [54, 74]], 2.2);
    b.spark(86, 22, 6);
  }),

  def('gradcap', 'Uni fees', ['uni', 'tuition', 'hecs', 'university', 'school'], (b) => {
    b.poly([[26, 44], [26, 68], [50, 80], [74, 68], [74, 44], [50, 56]], '#7A5FD6', { round: 8 });
    b.poly([[50, 12], [94, 34], [50, 56], [6, 34]], P.purple, { round: 6 });
    b.tube([[86, 38], [86, 66]], 2.6, P.fry);
    b.dot(86, 70, 5, P.fry, true);
    b.face(50, 33, 0.55);
    b.spark(14, 72, 6);
  }),

  def('book', 'Textbooks', ['textbook', 'books', 'study', 'reading'], (b) => {
    b.rect(20, 12, 62, 78, P.tomato, { round: 6 });
    b.rect(20, 12, 12, 78, '#B3261B', { round: 4, flat: true, sw: 3 });
    b.rect(30, 82, 50, 8, P.creamHi, { round: 2, flat: true, sw: 2.6 });
    b.line([[44, 26], [70, 26]], 3.4, P.creamHi);
    b.face(57, 52, 0.72);
  }),

  def('certificate', 'Courses', ['course', 'class', 'certificate', 'training'], (b) => {
    b.rect(8, 16, 84, 56, P.paper, { round: 5 });
    b.line([[20, 28], [54, 28]], 3);
    b.line([[20, 38], [44, 38]], 3);
    b.face(36, 54, 0.58);
    b.poly([[62, 70], [58, 92], [68, 86], [78, 92], [74, 70]], P.tomato, { round: 1 });
    b.blob(68, 64, 13, 13, P.fry, { sw: 4 });
    b.dot(68, 64, 5, P.gold, true);
  }),

  def('printer', 'Printing', ['printing', 'copies', 'office works', 'stationery'], (b) => {
    b.rect(30, 10, 40, 30, P.creamHi, { round: 3 });
    b.line([[38, 20], [62, 20]], 2.4);
    b.line([[38, 28], [56, 28]], 2.4);
    b.rect(10, 36, 80, 38, P.steelDeep, { round: 10 });
    b.rect(24, 62, 52, 28, P.creamHi, { round: 3 });
    b.line([[34, 74], [66, 74]], 2.4);
    b.line([[34, 82], [58, 82]], 2.4);
    b.dot(80, 46, 3.4, P.green, true);
    b.face(46, 50, 0.6);
  }),

  def('code', 'Software & apps', ['software', 'app', 'dev', 'github', 'code'], (b) => {
    b.rect(8, 14, 84, 70, '#BFE6FF', { round: 10 });
    b.rect(8, 14, 84, 15, P.navy, { round: 6, flat: true, sw: 3 });
    b.dot(20, 21.5, 3, P.tomato, true);
    b.dot(30, 21.5, 3, P.fry, true);
    b.dot(40, 21.5, 3, P.green, true);
    b.tube([[32, 44], [20, 56], [32, 68]], 3.4, P.navy, 0.1);
    b.tube([[68, 44], [80, 56], [68, 68]], 3.4, P.navy, 0.1);
    b.face(50, 55, 0.62);
  }),

  def('briefcase', 'Work', ['work', 'office', 'business', 'job'], (b) => {
    b.tube([[38, 34], [38, 20], [62, 20], [62, 34]], 3.6, P.steelDeep);
    b.rect(10, 32, 80, 54, P.wood, { round: 10 });
    b.rect(10, 52, 80, 5, '#8E5A28', { flat: true, sw: 2.4, round: 1 });
    b.rect(44, 52, 12, 11, P.gold, { round: 2, sw: 3 });
    b.face(50, 44, 0.65, 'cool');
  }),

  def('washer', 'Laundry', ['laundry', 'washing', 'dryer', 'laundromat'], (b) => {
    b.rect(16, 8, 68, 84, P.creamHi, { round: 10 });
    b.line([[16, 26], [84, 26]], 3.2);
    b.dot(28, 17, 3.4, P.tomato, true);
    b.dot(40, 17, 3.4, P.fry, true);
    b.blob(50, 58, 25, 25, P.steelDeep, { sw: 4.4 });
    b.blob(50, 58, 19, 19, P.sky, { sw: 3 });
    b.face(50, 58, 0.58);
    b.dot(62, 48, 2.6, '#FFFFFF');
  }),

  def('spray', 'Cleaning', ['cleaning', 'supplies', 'detergent', 'spray'], (b) => {
    b.poly([[28, 46], [64, 46], [68, 92], [26, 92]], P.green, { round: 8 });
    b.rect(38, 30, 18, 16, P.steelDeep, { round: 3 });
    b.poly([[32, 10], [66, 8], [78, 20], [36, 28]], P.tomato, { round: 5 });
    b.tube([[66, 20], [74, 28], [70, 36]], 3, P.steel);
    b.dot(88, 16, 2.6, P.sky);
    b.dot(92, 26, 2.2, P.sky);
    b.dot(84, 26, 2, P.sky);
    b.face(46, 70, 0.75);
  }),

  def('hammer', 'Fix-ups', ['repairs', 'tools', 'maintenance', 'handyman'], (b) => {
    const handle = rot([[44, 28], [56, 28], [56, 94], [44, 94]], 25);
    const head = rot([[14, 8], [78, 8], [78, 34], [14, 34]], 25);
    b.poly(handle, P.wood, { round: 3 });
    b.poly(head, P.steel, { round: 6 });
    b.face(52, 22, 0.5);
  }),

  def('box', 'Moving', ['moving', 'storage', 'boxes'], (b) => {
    b.poly([[16, 44], [4, 22], [34, 20], [42, 44]], '#E8BB82', { round: 3 });
    b.poly([[84, 44], [96, 22], [66, 20], [58, 44]], '#E8BB82', { round: 3 });
    b.rect(16, 44, 68, 44, '#D9A566', { round: 5 });
    b.rect(38, 50, 24, 7, '#8E5A28', { round: 3, flat: true, sw: 2.4 });
    b.face(50, 72, 0.85);
  }),

];
