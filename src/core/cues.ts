/** Which sound goes with which moment. Pure, so the choices can be tested; the playing lives in ui/sfx.ts. */
export type SfxName = 'chomp' | 'coin' | 'nope' | 'fanfare' | 'fridge' | 'pop';

export const SFX_NAMES: SfxName[] = ['chomp', 'coin', 'nope', 'fanfare', 'fridge', 'pop'];

/** Answering "was it worth it?": a coin for a good call, the sad horn for a bad one, nothing for a shrug. */
export function regretCue(answer: 'worth' | 'meh' | 'nah'): SfxName | null {
  return answer === 'worth' ? 'coin' : answer === 'nah' ? 'nope' : null;
}

/** After the bite in the eat scene: only a rough landing gets a sound on top of the chomp. */
export function afterBuyCue(mood: string): SfxName | null {
  return mood === 'broke' || mood === 'sad' ? 'nope' : null;
}
