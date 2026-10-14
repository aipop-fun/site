import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { LedgerReelProps } from '../src/lib/types';
import { COLORS, FONT, clip, toneColor } from './theme';

/**
 * BuildLog — the site's kinetic hero. A twelve second read-out of what the
 * ledger just ingested: activity ticks and the language mix on the left, the
 * instrument panel on the right, a scanline sweeping the whole frame.
 *
 * Rendered in the browser by <Player> and to MP4 by `remotion render`.
 */
export const BuildLog: React.FC<LedgerReelProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const ticks = props.ticks.slice(0, 14);
  const outAt = durationInFrames - 46;
  const outro = interpolate(frame, [outAt, durationInFrames - 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  const boot = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 34 });

  const countUp = spring({
    frame: frame - 18,
    fps,
    config: { damping: 200 },
    durationInFrames: 76,
  });
  const repoCount = Math.round(props.repoTotal * countUp);

  const peak = Math.max(1, ...props.activity);
  const scanX = interpolate(frame % 108, [0, 108], [-420, width + 220], {
    easing: Easing.inOut(Easing.cubic),
  });

  const timecode = `T+${String(Math.floor(frame / fps)).padStart(2, '0')}.${String(
    Math.round(((frame % fps) / fps) * 10),
  )}`;

  const outroText = interpolate(outro, [0.32, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, fontFamily: FONT, color: COLORS.paper }}>
      <Grid width={width} height={height} opacity={0.5 * boot} />

      {/* scanline */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: scanX,
          width: 260,
          background: `linear-gradient(90deg, transparent, ${hexAlpha(props.accent, 0.09)}, transparent)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: scanX + 128,
          width: 2,
          backgroundColor: hexAlpha(props.accent, 0.5),
        }}
      />

      {/* chrome */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 62,
          borderBottom: `1px solid ${COLORS.line}`,
          display: 'flex',
          alignItems: 'center',
          paddingInline: 40,
          gap: 18,
          fontSize: 17,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: COLORS.muted,
          opacity: boot,
        }}
      >
        <span style={{ color: props.accent, fontSize: 15 }}>●</span>
        <span style={{ color: COLORS.dim }}>ledger.ticker</span>
        <span style={{ color: COLORS.faint }}>/</span>
        <span>build log</span>
        <span style={{ marginLeft: 'auto', letterSpacing: '0.16em' }}>{timecode}</span>
        <span style={{ color: COLORS.faint }}>frame {String(frame).padStart(4, '0')}</span>
      </div>

      {/* left: identity, the log, the language mix */}
      <div style={{ position: 'absolute', top: 96, left: 40, width: 1150 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${COLORS.line}`,
            paddingBottom: 14,
            opacity: boot,
            transform: `translateY(${(1 - boot) * 14}px)`,
          }}
        >
          <div>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1 }}>
              {props.wordmark}
            </div>
            <div
              style={{
                marginTop: 9,
                fontSize: 17,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: COLORS.muted,
              }}
            >
              {props.role}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 15, color: COLORS.faint, lineHeight: 1.7 }}>
            <div>orig · 1920×1080 · 30fps</div>
            <div>src · github.com/developerfred</div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
          {ticks.map((tick, i) => {
            const appear = 24 + i * 9;
            const local = spring({
              frame: frame - appear,
              fps,
              config: { damping: 200 },
              durationInFrames: 26,
            });
            if (frame < appear - 4) return null;
            const tone = toneColor(tick.tone, props.accent);
            return (
              <div
                key={`${tick.index}-${tick.repo}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  height: 36,
                  fontSize: 22,
                  opacity: local * (1 - outro * 0.9),
                  transform: `translateX(${(1 - local) * 26}px)`,
                }}
              >
                <span style={{ color: COLORS.faint, width: 40 }}>{tick.index}</span>
                <span
                  style={{
                    color: tone,
                    width: 96,
                    fontSize: 15,
                    letterSpacing: '0.14em',
                    fontWeight: 500,
                  }}
                >
                  {tick.kind}
                </span>
                <span style={{ width: 580, color: COLORS.paper, whiteSpace: 'nowrap' }}>
                  {clip(tick.repo, 43)}
                </span>
                <span style={{ color: COLORS.muted, fontSize: 17, whiteSpace: 'nowrap' }}>
                  {clip(tick.meta, 42)}
                </span>
              </div>
            );
          })}
        </div>

        {/* language mix of the original work */}
        <div
          style={{
            marginTop: 26,
            paddingTop: 20,
            borderTop: `1px solid ${COLORS.line}`,
            opacity: spring({
              frame: frame - 150,
              fps,
              config: { damping: 200 },
              durationInFrames: 30,
            }),
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 15,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: COLORS.muted,
              marginBottom: 14,
            }}
          >
            <span>language mix</span>
            <span style={{ color: COLORS.faint }}>{props.stats[1]?.value} original repositories</span>
          </div>

          <div style={{ display: 'flex', gap: 4, height: 20 }}>
            {props.languages.map((language, i) => {
              const grow = spring({
                frame: frame - 156 - i * 4,
                fps,
                config: { damping: 200 },
                durationInFrames: 30,
              });
              return (
                <div
                  key={language.name}
                  style={{
                    width: `${Math.max(language.share * 100, 1.2)}%`,
                    backgroundColor: language.color,
                    transform: `scaleX(${grow})`,
                    transformOrigin: 'left',
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 26,
              fontSize: 15,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: COLORS.muted,
            }}
          >
            {props.languages.map((language) => (
              <span key={language.name} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, backgroundColor: language.color }} />
                {language.name}
                <span style={{ color: COLORS.faint }}>{Math.round(language.share * 100)}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* right: instrument panel */}
      <div
        style={{
          position: 'absolute',
          top: 96,
          right: 40,
          width: 640,
          borderLeft: `1px solid ${COLORS.line}`,
          paddingLeft: 36,
          opacity: boot,
        }}
      >
        <div
          style={{
            fontSize: 15,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: COLORS.muted,
          }}
        >
          repositories under management
        </div>
        <div
          style={{
            fontSize: 124,
            fontWeight: 700,
            letterSpacing: '-0.05em',
            lineHeight: 1.02,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {repoCount.toLocaleString('en-US')}
        </div>

        {/* activity bars */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-end', gap: 6, height: 128 }}>
          {props.activity.map((value, i) => {
            const grow = spring({
              frame: frame - 30 - i * 2,
              fps,
              config: { damping: 200 },
              durationInFrames: 34,
            });
            const barHeight = Math.max(4, (value / peak) * 124);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: barHeight * grow,
                  backgroundColor: value > 0 ? hexAlpha(props.accent, 0.85) : COLORS.line,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            color: COLORS.faint,
            letterSpacing: '0.1em',
          }}
        >
          <span>−21d</span>
          <span>public event window</span>
          <span>now</span>
        </div>

        <div style={{ marginTop: 30, borderTop: `1px solid ${COLORS.line}` }}>
          <div
            style={{
              fontSize: 15,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: COLORS.muted,
              padding: '14px 0 8px',
            }}
          >
            most starred originals
          </div>
          {props.topRepos.slice(0, 4).map((repo, i) => {
            const reveal = spring({
              frame: frame - 60 - i * 7,
              fps,
              config: { damping: 200 },
              durationInFrames: 26,
            });
            return (
              <div
                key={repo.name}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  padding: '6px 0',
                  borderBottom: `1px solid ${COLORS.lineSoft}`,
                  fontSize: 18,
                  opacity: reveal,
                }}
              >
                <span style={{ color: props.accent, width: 46, fontVariantNumeric: 'tabular-nums' }}>
                  ★{repo.stars}
                </span>
                <span style={{ color: COLORS.paper, whiteSpace: 'nowrap' }}>
                  {clip(repo.name, 34)}
                </span>
                <span style={{ marginLeft: 'auto', color: COLORS.faint, fontSize: 14 }}>
                  {repo.lang ?? '—'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 26, borderTop: `1px solid ${COLORS.line}` }}>
          {props.stats.map((stat, i) => {
            const reveal = spring({
              frame: frame - 40 - i * 6,
              fps,
              config: { damping: 200 },
              durationInFrames: 26,
            });
            return (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '9px 0',
                  borderBottom: `1px solid ${COLORS.lineSoft}`,
                  opacity: reveal,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: COLORS.muted,
                  }}
                >
                  {stat.label}
                </span>
                <span style={{ fontSize: 28, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {stat.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 26,
          left: 40,
          right: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${COLORS.line}`,
          paddingTop: 16,
          fontSize: 16,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: COLORS.muted,
          opacity: boot,
        }}
      >
        <span>{props.origin.replace('https://', '')}</span>
        <span style={{ color: COLORS.dim }}>
          synced {props.generatedAt.slice(0, 10)} · {ticks.length} logged events
        </span>
        <span>
          <span style={{ color: props.accent }}>iosevka</span> · remotion · typescript
        </span>
      </div>

      {/* outro card — the backdrop goes opaque faster than the type fades in,
          otherwise the ledger underneath shows through as a ghost */}
      {outro > 0 ? (
        <AbsoluteFill
          style={{
            backgroundColor: hexAlpha(COLORS.ink, Math.min(1, outro * 1.8)),
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 148,
              fontWeight: 700,
              letterSpacing: '-0.05em',
              opacity: outroText,
              transform: `translateY(${(1 - outroText) * 20}px)`,
            }}
          >
            {props.wordmark}
          </div>
          <div
            style={{
              fontSize: 20,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: props.accent,
              opacity: outroText,
            }}
          >
            {props.origin.replace('https://', '')}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Grid: React.FC<{ width: number; height: number; opacity: number }> = ({
  width,
  height,
  opacity,
}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity,
      backgroundImage: `linear-gradient(${COLORS.lineSoft} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.lineSoft} 1px, transparent 1px)`,
      backgroundSize: '60px 60px',
      width,
      height,
    }}
  />
);

/** #rrggbb + alpha → rgba() so gradients and overlays can fade a token colour. */
export function hexAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const int = Number.parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
