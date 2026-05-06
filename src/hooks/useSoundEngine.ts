import { useEffect, useRef } from 'react';
import { soundEngine } from '../utils/soundEngine';

type SoundType = 'beep' | 'buzz' | 'bell';

export function useSoundEngine() {
  const soundRef = useRef(soundEngine);

  useEffect(() => {
    return () => {
      soundRef.current.stop();
    };
  }, []);

  const start = (soundType: SoundType) => {
    soundRef.current.start(soundType);
  };

  const stop = () => {
    soundRef.current.stop();
  };

  const isPlaying = () => {
    return soundRef.current.isCurrentlyPlaying();
  };

  return { start, stop, isPlaying };
}
