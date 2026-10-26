import type { Mood } from './mascot';
import type { PoseId } from './poses';

/**
 * Which of the 3D poses stand in for each app mood. The first one is the default,
 * the others are what you get when you poke him.
 */
export const MOOD_POSES: Record<Mood, PoseId[]> = {
  happy: ['wave-happy', 'joy', 'wave', 'wink-thumb'],
  ok: ['neutral', 'content'],
  sideeye: ['hips-smirk', 'smug'],
  sad: ['sad', 'shrug-sad', 'cry'],
  broke: ['broke', 'shrug-meh', 'panic-run'],
  shock: ['shock', 'gasp'],
  proud: ['shades-coin', 'thumbs-up', 'coins-happy'],
  tempted: ['cheeky', 'hungry-fork', 'puzzled'],
};

/** Poses for particular moments, so screens can say what is happening instead of picking a mood. */
export const MOMENT: Record<string, PoseId> = {
  worried: 'nervous',
  calculating: 'calc-worry',
  roast: 'angry-red',
  shout: 'shout',
  lateNight: 'sleepy',
  party: 'party',
  saved: 'piggy-hug',
  calm: 'piggy-calm',
  week: 'juggle',
  shame: 'peekaboo',
  thanks: 'kiss-heart',
};

export function poseFor(mood: Mood, variant = 0): PoseId {
  const list = MOOD_POSES[mood] ?? MOOD_POSES.ok;
  return list[((variant % list.length) + list.length) % list.length];
}
