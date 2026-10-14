import { useEffect, useState } from 'react';
import { LazyReelPlayer } from './LazyReelPlayer';
import { generatedAt, stats } from '../lib/data';
import { grouped, stamp } from '../lib/format';
import './Reel.css';

const COMPOSITIONS = [
  {
    id: 'BuildLog',
    specs: ['1920×1080', '30 fps', '372 frames', 'h264 · mp4'],
    note: 'The hero reel. Real pushes, real repositories, one line every ten frames.',
  },
  {
    id: 'OgCard',
    specs: ['1200×630', 'still', 'png', 'og:image'],
    note: 'The social card is rendered from the same snapshot, so it is never out of date either.',
  },
];

export function Reel() {
  // Autoplaying video is exactly what a reduced-motion reader asked us not to do.
  const [autoplay, setAutoplay] = useState(false);
  useEffect(() => {
    setAutoplay(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <section className="band reel" id="reel">
      <div className="wrap">
        <header className="band__head">
          <span className="band__index">005</span>
          <div>
            <span className="band__kicker">reel / remotion</span>
            <h2 className="band__title">
              The same React component is a live widget in the browser and an MP4 in the pipeline.
            </h2>
          </div>
        </header>

        <div className="reel__grid">
          <div className="reel__stage" data-reveal>
            <figure className="monitor">
              <div className="monitor__bar">
                <span className="monitor__lights" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="monitor__title">out/build-log.mp4 — rendered by remotion</span>
                <span className="monitor__live">
                  <span className="dot" aria-hidden="true" />
                  h264
                </span>
              </div>

              <div className="reel__screen">
                <video
                  className="reel__video"
                  poster="./media/build-log-poster.png"
                  src="./media/build-log.mp4"
                  controls
                  autoPlay={autoplay}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  Your browser cannot play this MP4.{' '}
                  <a href="./media/build-log.mp4">Download it instead.</a>
                </video>
              </div>

              <figcaption className="monitor__foot">
                <span>npm run remotion:render</span>
                <span>snapshot {stamp(generatedAt)}</span>
                <span>{grouped(stats.trackedRepos)} repos in scope</span>
              </figcaption>
            </figure>

            <div className="reel__live" data-reveal>
              <span className="micro">the same composition, live in this page</span>
              <div className="reel__player">
                <LazyReelPlayer controls />
              </div>
            </div>
          </div>

          <aside className="reel__side">
            {COMPOSITIONS.map((composition, i) => (
              <article
                className="composition"
                key={composition.id}
                data-reveal
                style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}
              >
                <header className="composition__head">
                  <h3>{composition.id}</h3>
                  <span className="micro">{i === 0 ? 'video' : 'still'}</span>
                </header>
                <p className="composition__note">{composition.note}</p>
                <ul className="composition__specs">
                  {composition.specs.map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
                <code className="composition__cmd">
                  {i === 0
                    ? 'pnpm remotion:render'
                    : 'pnpm remotion:still'}
                </code>
              </article>
            ))}

            <article className="composition composition--flat" data-reveal>
              <header className="composition__head">
                <h3>Why both</h3>
              </header>
              <p className="composition__note">
                The browser plays the component through <b>@remotion/player</b>, so the hero costs a
                few kilobytes of React and no video bytes. The pipeline renders the identical
                component to MP4 with headless Chrome, which is what a social embed or a launch post
                needs. One source of truth, two outputs.
              </p>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
