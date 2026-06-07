import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HeroState, HeroStats, PortraitStage } from '@/types/hero';
import { Colors } from '@/constants/colors';
import { heroStateFromStats } from '@/utils/heroVisuals';
import AuraRing from './AuraRing';
import CrackOverlay from './CrackOverlay';

interface HeroPortraitProps {
  stage: PortraitStage;
  heroState?: HeroState;
  stats?: HeroStats;
  size?: number;
}

// ─── Silhouette SVG paths — 120×120 viewBox ───────────────────────────────────
// Each stage is a progressively more defined hooded figure.

const SILHOUETTE: Record<PortraitStage, string> = {
  1: // Amorphous shadow blob
    'M60 22 C44 20 28 32 26 50 C24 66 28 84 42 96 C50 102 70 102 78 96 C92 84 96 66 94 50 C92 32 76 20 60 22 Z',

  2: // Emerging figure, slight hood suggestion
    'M60 16 C46 14 30 22 26 40 C20 58 24 80 38 94 C48 104 72 104 82 94 C96 80 100 58 94 40 C90 22 74 14 60 16 Z',

  3: // Defined hood and shoulders
    'M60 10 C52 10 42 16 40 28 C36 40 26 48 22 62 C18 78 24 96 38 106 C48 112 72 112 82 106 C96 96 102 78 98 62 C94 48 84 40 80 28 C78 16 68 10 60 10 Z',

  4: // Strong posture, full cloak silhouette
    'M60 6 C48 4 36 12 32 26 C26 40 16 52 14 68 C12 86 22 102 38 110 C48 116 72 116 82 110 C98 102 108 86 106 68 C104 52 94 40 88 26 C84 12 72 4 60 6 Z',

  5: // Legendary — same as stage 4 (gold accents added separately below)
    'M60 6 C48 4 36 12 32 26 C26 40 16 52 14 68 C12 86 22 102 38 110 C48 116 72 116 82 110 C98 102 108 86 106 68 C104 52 94 40 88 26 C84 12 72 4 60 6 Z',
};

// Gold accent lines for Stage 5 — follow the cloak edges
const STAGE5_ACCENTS = [
  'M32 26 C26 40 16 52 14 68',     // left cloak edge
  'M88 26 C94 40 104 52 106 68',   // right cloak edge
  'M60 6 C48 4 36 12 32 26',       // left hood top
];

// ─── Color maps by heroState ──────────────────────────────────────────────────

const BG_COLOR: Record<HeroState, string> = {
  thriving:  '#2D1B5E',
  fading:    '#1C1230',
  corrupted: '#181818',
};

const SILHOUETTE_COLOR: Record<HeroState, string> = {
  thriving:  '#4B2F8A',
  fading:    '#2E2240',
  corrupted: '#222222',
};

const AURA_COLOR: Record<HeroState, string> = {
  thriving:  Colors.violet,
  fading:    '#4B3A8A',
  corrupted: '#7F2222',
};

// Desaturation overlay opacity — the "opacity layering trick"
const DESATURATE_OPACITY: Record<HeroState, number> = {
  thriving:  0,
  fading:    0.42,
  corrupted: 0.72,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroPortrait({
  stage,
  heroState: heroStateProp,
  stats,
  size = 72,
}: HeroPortraitProps) {
  // Resolve heroState: explicit prop wins, otherwise compute from stats
  const heroState: HeroState =
    heroStateProp ??
    (stats ? heroStateFromStats(stats, new Date().toISOString()) : 'thriving');

  const portraitSize = size * 0.84;
  const radius       = portraitSize / 2;
  const bgColor      = BG_COLOR[heroState];
  const fillColor    = SILHOUETTE_COLOR[heroState];
  const auraColor    = AURA_COLOR[heroState];
  const desaturate   = DESATURATE_OPACITY[heroState];
  const path         = SILHOUETTE[stage];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Aura ring behind portrait */}
      <AuraRing size={size} color={auraColor} heroState={heroState} />

      {/* Circular portrait container — overflow: hidden clips to circle */}
      <View
        style={[
          s.portrait,
          {
            width: portraitSize,
            height: portraitSize,
            borderRadius: radius,
            backgroundColor: bgColor,
          },
        ]}
      >
        {/* Silhouette SVG */}
        <Svg width={portraitSize} height={portraitSize} viewBox="0 0 120 120">
          <Path d={path} fill={fillColor} />

          {/* Stage 5 gold accent lines */}
          {stage === 5 &&
            STAGE5_ACCENTS.map((d, i) => (
              <Path
                key={i}
                d={d}
                stroke="rgba(244,197,66,0.65)"
                strokeWidth={1.5}
                fill="none"
                strokeLinecap="round"
              />
            ))}
        </Svg>

        {/* Desaturation overlay — simulates reduced color saturation */}
        {desaturate > 0 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: `rgba(100,100,100,${desaturate})` },
            ]}
          />
        )}

        {/* Corrupted: crack overlay on top */}
        <CrackOverlay size={portraitSize} visible={heroState === 'corrupted'} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  portrait: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
