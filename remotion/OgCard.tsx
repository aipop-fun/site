import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { LedgerReelProps } from '../src/lib/types';
import { Grid, hexAlpha } from './BuildLog';
import { COLORS, FONT } from './theme';

/**
 * OgCard — the 1200×630 social card, rendered from the same snapshot as the
 * page by `remotion still`. Nothing about it is hand-drawn: change the data and
 * the card changes.
 */
export const OgCard: React.FC<LedgerReelProps> = (props) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.ink,
        fontFamily: FONT,
        fontFeatureSettings: "'calt' 0, 'cv01' 1",
        color: COLORS.paper,
        padding: 56,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Grid width={1200} height={630} opacity={0.6} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120% 90% at 10% -10%, ${hexAlpha(props.accent, 0.16)}, transparent 58%)`,
        }}
      />
      <div style={{ position: 'absolute', inset: 22, border: `1px solid ${COLORS.line}` }} />

      {/* chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontSize: 15,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: COLORS.muted,
          borderBottom: `1px solid ${COLORS.line}`,
          paddingBottom: 14,
          position: 'relative',
        }}
      >
        <span style={{ color: props.accent, fontSize: 13 }}>●</span>
        <span style={{ color: COLORS.dim }}>ledger.ticker</span>
        <span style={{ color: COLORS.faint }}>/</span>
        <span>build log</span>
        <span style={{ marginLeft: 'auto' }}>og card · 1200×630</span>
      </div>

      {/* identity */}
      <div style={{ position: 'relative', marginTop: 40 }}>
        <div
          style={{
            fontSize: 124,
            fontWeight: 700,
            letterSpacing: '-0.055em',
            lineHeight: 0.9,
          }}
        >
          {props.wordmark}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 19,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: COLORS.dim,
          }}
        >
          {props.role}
        </div>
      </div>

      {/* data block, pushed to the bottom of the card */}
      <div style={{ marginTop: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 46, alignItems: 'flex-end' }}>
          {props.stats.slice(0, 4).map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: 46,
                  fontWeight: 700,
                  letterSpacing: '-0.035em',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: COLORS.muted,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}

          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 17, color: COLORS.paper, letterSpacing: '0.04em' }}>
              {props.ticks[0]?.kind ?? 'PUSH'}
            </div>
            <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>
              {props.ticks[0]?.repo ?? ''}
            </div>
          </div>
        </div>

        {/* language mix of the original work */}
        <div style={{ marginTop: 30, display: 'flex', gap: 3, height: 18 }}>
          {props.languages.map((language) => (
            <div
              key={language.name}
              style={{
                width: `${Math.max(language.share * 100, 1.2)}%`,
                backgroundColor: language.color,
              }}
            />
          ))}
        </div>
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            gap: 22,
            flexWrap: 'wrap',
            fontSize: 13,
            letterSpacing: '0.12em',
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

      {/* footer */}
      <div
        style={{
          marginTop: 34,
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: `1px solid ${COLORS.line}`,
          paddingTop: 16,
          fontSize: 16,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: COLORS.muted,
          position: 'relative',
        }}
      >
        <span style={{ color: COLORS.paper }}>{props.origin.replace('https://', '')}</span>
        <span>
          <span style={{ color: props.accent }}>iosevka</span> · remotion · typescript
        </span>
        <span>synced {props.generatedAt.slice(0, 10)}</span>
      </div>
    </AbsoluteFill>
  );
};
