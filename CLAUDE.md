# Sun Keeper Design Guide

This document ensures I reliably follow your Figma design (`azSClyWIZyeWpGcjyMKOsT`) in every conversation. Read this before making code changes.

## Layout Rules (Figma Frame: MacBook Pro 14' - 35)

**Viewport:** 100vw × 100vh, background `#232323`

**Columns (left to right):**
- **Left nav strip:** 54px wide, dark background, border-right `#545454`
- **Deity sidebar:** 191px wide, dark background, border-right `#545454`, scrollable
- **Main content area:** flex: 1 (fills remaining space minus right panel)
- **Right panel:** 331px wide, border-left `#545454`, currently 10% opacity (hidden)
- **Bottom bar:** 88px tall, fixed at bottom, border-top `#545454`

**Key constraints:**
- Never add full-width headers above the main layout
- Right sidebar should remain as a 331px-wide placeholder unless a design update specifies content
- All borders are `#545454` with opacity 1.0
- Background is always `#232323` (never lighter/darker)

---

## Component API Reference

### AppShell
**File:** `src/components/AppShell.tsx`

**Props:**
```ts
interface AppShellProps {
  gods: God[]
  selectedGodId: string | null
  onSelectGod: (godId: string) => void
  resources: { prisoners: number, children: number, virgins: number, volunteers: number }
  mainContent: ReactNode
}
```

**Renders:** The full layout container. Always uses `display: flex; flex-direction: column`. Composes `SidebarNav`, `DeityList`, main content slot, right panel stub, and `ResourceBar`.

---

### SidebarNav
**File:** `src/components/SidebarNav.tsx`

**Props:**
```ts
interface SidebarNavProps {
  onNavClick?: (section: string) => void
}
```

**Renders:** 56px-wide vertical strip. Four icon buttons (☉ ◐ ※ ↻) for sections. First button (pantheon) always shows `bgCard` background. Height is `100vh - 72px`.

---

### DeityList
**File:** `src/components/DeityList.tsx`

**Props:**
```ts
interface DeityListProps {
  gods: God[]
  selectedGodId: string | null
  onSelect: (godId: string) => void
}
```

**Renders:** 191px-wide scrollable sidebar. "Pantheon" header. Gods sorted by anger level. Each god as `DeityCard` with 8px gap.

---

### DeityCard
**File:** `src/components/DeityCard.tsx`

**Props:**
```ts
interface DeityCardProps {
  god: God
  isSelected: boolean
  onClick: () => void
}
```

**Renders:** Button card, `minHeight: 245px`. Selected: `bgHover` + 2px colored border. Unselected: `bgBase` + 1px border.

---

### RitualCard
**File:** `src/components/RitualCard.tsx`

**Props:**
```ts
interface RitualCardProps {
  ritual: Ritual
  isSelected: boolean
  onClick: () => void
}
```

**Renders:** Full-width card with name, description, divider, participants, schedule. Left border shows `outcomeColor`. If unavailable: opacity 0.4 + "INSUFFICIENT RESOURCES" label.

---

### ResourceBar
**File:** `src/components/ResourceBar.tsx`

**Props:**
```ts
interface ResourceBarProps {
  prisoners: number
  children: number
  virgins: number
  volunteers: number
}
```

**Renders:** Fixed 88px-tall bottom bar. Four `ResourceItem` with 32px gap. Left padding offset by 276px (navWidth + sidebarWidth).

---

### PrimaryButton
**File:** `src/components/PrimaryButton.tsx`

**Props:**
```ts
interface PrimaryButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}
```

**Renders:** Full-width button, `FONTS.spectral` 13px uppercase. Enabled: `bgCard`. Disabled: transparent + `textMuted`.

---

### PantheonEffects
**File:** `src/components/PantheonEffects.tsx`

**Props:**
```ts
interface PantheonEffectsProps {
  ritual: Ritual | null
  gods: God[]
  onPerformRitual: () => void
}
```

**Renders:** 300px-wide right panel. Null state: placeholder text. Ritual selected: three scrollable sections (Divine Ripple, Auspicious Timing, Imperial Counsel) + Perform Ritual button at bottom.

---

## Design Tokens (src/tokens.ts)

**Never hardcode values.** Always reference `tokens.ts`:

### Colors
```ts
COLORS = {
  bgBase: '#181818',
  bgCard: '#1e1e1e',
  bgHover: '#242424',
  textBase: '#f0ede8',
  textSecondary: '#8a8580',
  textMuted: '#5a5652',
  border: '#2a2726',
}

ANGER = {
  high: '#c8322e',      // red
  medium: '#d4662a',    // orange
  low: '#c8a83c',       // gold
}

FONTS = {
  cinzel: "'Cinzel', serif",
  spectral: "'Spectral', Georgia, serif",
}

SPACING = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', xxl: '32px',
}
```

---

## Typography Rules

- **Headings:** `FONTS.cinzel`, uppercase, `textBase`
- **Body:** `FONTS.spectral`, normal case, `textSecondary`
- **Labels:** 10px uppercase, `textMuted`
- **Buttons:** `FONTS.spectral`, 13px uppercase, letter-spacing 0.8px

---

## Figma Reference

**File Key:** `azSClyWIZyeWpGcjyMKOsT`
**Main Frame:** Node `22:14653` ("MacBook Pro 14' - 35")

Before implementing layout changes: take a screenshot and compare against Figma.

---

## Dos and Don'ts

✅ **DO:**
- Use existing components
- Reference `tokens.ts` for all colors/fonts/spacing
- Test with Playwright screenshots after changes

❌ **DON'T:**
- Add headers not in Figma design
- Hardcode color/font/spacing values
- Create placeholder panels not in design

---

## God/Ritual Data Model

**16 gods, 4 rituals each, all anger levels represented.**

```ts
interface God {
  id: string
  name: string
  angerLevel: 'high' | 'medium' | 'low'
  angerColor: string
  rituals: Ritual[]
}

interface Ritual {
  id: string
  name: string
  description: string
  outcomeColor: string
  available: boolean
  effects: Array<{ godId: string; before: number; after: number }>
}
```
