// layouts.js — the poster layouts, export sizes and colour grades for Vice Cover Studio.
// Every rectangle is a fraction of the cover (x, y, width, height). Each panel points at
// one of three photo slots, so switching layouts keeps the photos the user already placed.

export const SIZES = {
  square: { w: 1080, h: 1080, label: 'Square 1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
  wide: { w: 1920, h: 1080, label: 'Wide 1920 × 1080' },
};

export const SIZE_ORDER = ['square', 'portrait', 'wide'];

// g is the gutter between panels, as a fraction of the cover width.
const G = 0.016;

export const LAYOUTS = {
  poster: {
    label: 'Poster',
    hint: 'One big panel, two small',
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1, slot: 0 },
      { x: 0.62 + G, y: 0, w: 1 - 0.62 - G, h: 0.5 - G / 2, slot: 1 },
      { x: 0.62 + G, y: 0.5 + G / 2, w: 1 - 0.62 - G, h: 0.5 - G / 2, slot: 2 },
    ],
  },
  triple: {
    label: 'Triple',
    hint: 'Three tall panels',
    panels: [
      { x: 0, y: 0, w: (1 - 2 * G) / 3, h: 1, slot: 0 },
      { x: (1 - 2 * G) / 3 + G, y: 0, w: (1 - 2 * G) / 3, h: 1, slot: 1 },
      { x: 2 * ((1 - 2 * G) / 3 + G), y: 0, w: (1 - 2 * G) / 3, h: 1, slot: 2 },
    ],
  },
  duo: {
    label: 'Duo',
    hint: 'Wide top, wide bottom',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.62, slot: 0 },
      { x: 0, y: 0.62 + G, w: 1, h: 1 - 0.62 - G, slot: 1 },
    ],
  },
};

export const LAYOUT_ORDER = ['poster', 'triple', 'duo'];

// A grade is a colour wash drawn over every photo plus the accent colour used for
// the subtitle and the caption band. Sunset is warm orange-pink, Neon is purple-cyan,
// Noir is a hard black-and-white.
export const GRADES = {
  sunset: {
    label: 'Sunset',
    accent: '#ffb347',
    accentDark: '#ff7a3d',
    top: 'rgba(255, 150, 60, 0.16)',
    bottom: 'rgba(255, 60, 120, 0.24)',
    saturate: 1.15,
    grayscale: 0,
  },
  neon: {
    label: 'Neon',
    accent: '#00e5ff',
    accentDark: '#7b5cff',
    top: 'rgba(123, 92, 255, 0.20)',
    bottom: 'rgba(0, 229, 255, 0.18)',
    saturate: 1.35,
    grayscale: 0,
  },
  noir: {
    label: 'Noir',
    accent: '#ffffff',
    accentDark: '#9a9a9a',
    top: 'rgba(255, 255, 255, 0.05)',
    bottom: 'rgba(0, 0, 0, 0.28)',
    saturate: 1,
    grayscale: 1,
  },
};

export const GRADE_ORDER = ['sunset', 'neon', 'noir'];

export const TEXT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Sunset yellow', value: '#ffd23f' },
  { name: 'Hot pink', value: '#ff5fa2' },
];
