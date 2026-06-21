// Small, curated set of reusable UI colors — every value here is one actually
// reused across multiple components today. Reference these by name instead of
// retyping a hex code; don't add a new entry for a one-off color used in a
// single place.
export const COLORS = {
  bgBase: '#181818',          // app background, default card background
  bgPanelHover: '#2e2e2e',    // ritual panel fill when hovered/highlighted
  border: '#333333',          // standard structural divider/border (nav strip, panel dividers, resource bar)
  borderCard: '#262626',      // GodCard's own default (subtler) border
  borderHighlight: '#4d4d4d', // card/panel border, and default icon/text tone, when hovered or selected
  textDim: '#6C6C6C',         // default god name / muted label text
  textHover: '#999999',       // ritual-panel content on hover (deliberately not white)
  textBright: '#F0F0F0',      // name/body text when a card is hovered or selected
  white: '#ffffff',
  black: '#000000',
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
