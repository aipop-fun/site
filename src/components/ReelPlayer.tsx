import { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { BuildLog } from '../../remotion/BuildLog';
import { reelProps } from '../lib/reel';

const DURATION = 372;
const FPS = 30;

/**
 * The site's live Remotion surface: the very same composition that
 * `remotion render` turns into MP4, playing in the browser with no server.
 */
export function ReelPlayer({
  controls = false,
  className = '',
}: {
  controls?: boolean;
  className?: string;
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <Player
      className={className}
      component={BuildLog}
      inputProps={reelProps}
      durationInFrames={DURATION}
      fps={FPS}
      compositionWidth={1920}
      compositionHeight={1080}
      style={{ width: '100%', height: '100%' }}
      autoPlay={!reduced}
      loop
      controls={controls}
      clickToPlay={false}
      doubleClickToFullscreen={controls}
      acknowledgeRemotionLicense
      initiallyMuted
    />
  );
}
