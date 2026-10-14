import React from 'react';
import { Composition } from 'remotion';
import { BuildLog } from './BuildLog';
import { OgCard } from './OgCard';
import { reelProps } from '../src/lib/reel';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BuildLog"
        component={BuildLog}
        durationInFrames={372}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={reelProps}
      />
      <Composition
        id="OgCard"
        component={OgCard}
        durationInFrames={1}
        fps={30}
        width={1200}
        height={630}
        defaultProps={reelProps}
      />
    </>
  );
};
