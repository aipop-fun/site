import { Suspense, lazy } from 'react';

const ReelPlayer = lazy(() =>
  import('./ReelPlayer').then((module) => ({ default: module.ReelPlayer })),
);

/**
 * Remotion's player is ~430 KB of JavaScript. It is the point of the page, but it
 * is not the point of the first paint — so it is fetched after the shell renders.
 */
export function LazyReelPlayer({ controls = false }: { controls?: boolean }) {
  return (
    <Suspense fallback={<BootScreen />}>
      <ReelPlayer controls={controls} />
    </Suspense>
  );
}

function BootScreen() {
  return (
    <div className="boot" role="status" aria-live="polite">
      <span className="boot__line">
        <span className="boot__caret" aria-hidden="true">
          ▍
        </span>
        loading remotion player…
      </span>
      {Array.from({ length: 6 }).map((_, i) => (
        <span className="boot__row" key={i} style={{ '--i': i } as React.CSSProperties}>
          <span />
        </span>
      ))}
    </div>
  );
}
