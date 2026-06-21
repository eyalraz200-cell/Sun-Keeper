// Small, curated set of reusable UI colors, named by their actual grayscale
// value (a rounded lightness percentage) rather than by what they're used
// for — a color's role can change between contexts, but its value doesn't.
// "black" and "white" are the two perceptual anchors used throughout the app
// (neither is the literal #000000/#ffffff extreme — see gray0 below for true
// black). Every value here is one actually reused across multiple components
// today; don't add an entry for a one-off color used in a single place.
//
// This is an ordered SCALE, darkest to brightest. When asked to make
// something "brighter"/"darker" (one step, or "much brighter" for two+
// steps), move along this list to the next/previous existing key — don't
// invent a new in-between hex value:
//   gray0 → black → gray15 → gray18 → gray20 → gray30 → gray40 → gray60 → gray95 → white
export const COLORS = {
  gray0: '#000000',   // true black — used for text/icons that need full contrast on a light surface
  black: '#181818',   // the app's "black" — background, default card bg (~9% lightness)
  gray15: '#262626',  // GodCard's default border
  gray18: '#2e2e2e',  // ritual panel fill when hovered/highlighted
  gray20: '#333333',  // standard structural divider/border (nav strip, panel dividers, resource bar)
  gray30: '#4d4d4d',  // card/panel border, and default icon/text tone, when hovered or selected
  gray40: '#6C6C6C',  // default god name / muted label text
  gray60: '#999999',  // ritual-panel content on hover (deliberately not full white)
  gray95: '#F0F0F0',  // name/body text when a card is hovered or selected
  white: '#ffffff',   // the app's "white" — full brightness, dominant text/highlight color
} as const

export const LAYOUT = {
  navWidth: 54,
  sidebarWidth: 200,
  rightPanelWidth: 360,
  bottomBarHeight: 50,
} as const

// Data-layer anger palette — used for god.angerColor/ritual.outcomeColor data
// fields and small list dots in CalendarScreen/DashboardScreen. NOT the color
// actually rendered for any eye/circle — see EYE below for that.
export const ANGER = {
  high: '#c8322e',
  medium: '#d4662a',
  low: '#c8a83c',
} as const

// Render-layer eye palette — the single source of truth for what color/weight
// an anger-level eye or outcome circle actually draws (GodSvg's real god eyes,
// RitualCard's/GodCard's outcome eye, HomeScreen's anger-group titles). Import
// this instead of re-declaring the same lookup table locally in a new file.
export const EYE = {
  high:   { color: '#FF2435', weight: 6 },
  medium: { color: '#EF7B2E', weight: 4 },
  low:    { color: '#D7C94E', weight: 3 },
  none:   { color: '#6C6C6C', weight: 2 },
} as const

export const FONTS = {
  cinzel: "'Cinzel', serif",
  spectral: "'Spectral', Georgia, serif",
} as const

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
} as const

// Type-size scale. Same rule as COLORS above: when asked to make text
// "bigger"/"smaller", move to the next/previous key in this list — don't
// pick an arbitrary in-between px value. xs → sm → md → lg → xl
export const FONT_SIZE = {
  xs: '10px', // fine print / small labels
  sm: '12px', // secondary/dim text
  md: '14px', // default body text
  lg: '16px', // emphasized body text, buttons
  xl: '20px', // headings, large stat numbers
} as const

// Weight scale. "Bolder"/"lighter" moves one step here. Never go above
// `regular` (400) for god names specifically — see Typography Rules.
// light → regular → medium
export const FONT_WEIGHT = {
  light: 300,
  regular: 400,
  medium: 500,
} as const

export const BORDER_RADIUS = '2px'

export const BORDER_WIDTH = '1px'

export type RitualScreenMode = 'ritual' | 'expanded'

// Global resource pool totals — shared across all gods/rituals, not per-god.
export const RESOURCE_TOTALS = {
  prisoners: 1840,
  volunteers: 763,
  children: 312,
  virgins: 47,
  temples: 25,
  greatTemples: 3,
} as const
