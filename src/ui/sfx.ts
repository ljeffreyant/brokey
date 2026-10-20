import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { SFX_NAMES, type SfxName } from '../core';
import { useStore } from '../store';

const SOURCES: Record<SfxName, number> = {
  chomp: require('../../assets/sfx/chomp.wav'),
  coin: require('../../assets/sfx/coin.wav'),
  nope: require('../../assets/sfx/nope.wav'),
  fanfare: require('../../assets/sfx/fanfare.wav'),
  fridge: require('../../assets/sfx/fridge.wav'),
  pop: require('../../assets/sfx/pop.wav'),
};

/** a touch of balance so nothing is louder than the rest */
const VOLUME: Record<SfxName, number> = { chomp: 0.9, coin: 0.7, nope: 0.75, fanfare: 0.7, fridge: 0.9, pop: 0.7 };

const players: Partial<Record<SfxName, AudioPlayer>> = {};
let modeSet = false;

function setMode() {
  if (modeSet) return;
  modeSet = true;
  // Effects, not media: obey the silent switch, never stop the user's music, never keep the app awake.
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false, allowsRecording: false }).catch(() => {});
}

function playerFor(name: SfxName): AudioPlayer {
  let p = players[name];
  if (!p) {
    p = createAudioPlayer(SOURCES[name]);
    p.volume = VOLUME[name];
    players[name] = p;
  }
  return p;
}

const enabled = () => useStore.getState().settings.sounds !== false;

export const sfx = {
  /** Load everything once at start so the first chomp does not stutter. */
  preload() {
    if (!enabled()) return;
    try {
      setMode();
      SFX_NAMES.forEach(playerFor);
    } catch {
      /* no audio on this device: fine */
    }
  },
  play(name: SfxName | null | undefined) {
    if (!name || !enabled()) return;
    try {
      setMode();
      const p = playerFor(name);
      const go = () => {
        try {
          p.play();
        } catch {
          /* ignore */
        }
      };
      if (p.currentTime > 0.01) p.seekTo(0).then(go, go);
      else go();
    } catch {
      /* ignore */
    }
  },
};
