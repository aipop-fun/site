import { Datasheet } from './components/Datasheet';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Pipeline } from './components/Pipeline';
import { Reel } from './components/Reel';
import { Signal } from './components/Signal';
import { useRevealObserver, useScrollProgress } from './lib/hooks';

export default function App() {
  useRevealObserver();
  const progress = useScrollProgress();

  return (
    <>
      <a className="skip-link" href="#index">
        Skip to the repository index
      </a>

      <div className="progress" aria-hidden="true">
        <div className="progress__bar" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <Nav />

      <main>
        <Hero />
        <Signal />
        <Datasheet />
        <Pipeline />
        <Reel />
      </main>

      <Footer />
    </>
  );
}
