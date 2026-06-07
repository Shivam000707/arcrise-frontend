import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CrackOverlaySvgProps { size: number }

// 5 fracture paths across a 120×120 viewBox, scaled to portrait size.
export default function CrackOverlaySvg({ size }: CrackOverlaySvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {/* Main crack — top-left quadrant radiating inward */}
      <Path
        d="M30 18 L40 36 L34 48 L48 60 L40 82 L46 96"
        stroke="rgba(239,68,68,0.78)"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Branch off main crack at midpoint */}
      <Path
        d="M48 60 L64 52 L76 58"
        stroke="rgba(239,68,68,0.58)"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
      {/* Right-side crack */}
      <Path
        d="M92 30 L82 50 L90 64 L76 80 L80 96"
        stroke="rgba(239,68,68,0.5)"
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lower horizontal crack */}
      <Path
        d="M32 88 L48 82 L60 90 L74 84 L86 90"
        stroke="rgba(239,68,68,0.42)"
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
      />
      {/* Hairline top-center */}
      <Path
        d="M62 6 L58 26 L64 38 L60 50"
        stroke="rgba(239,68,68,0.34)"
        strokeWidth={0.7}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
