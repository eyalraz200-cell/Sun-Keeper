# Sun Keeper Design Guide

This document ensures I reliably follow your Figma design (`azSClyWIZyeWpGcjyMKOsT`) in every conversation. Read this before making code changes.

## Layout Rules (Figma Frame: MacBook Pro 14' - 35)

**Viewport:** 100vw × 100vh, background `#181818`

**Structure: Outer flex ROW (100vw × 100vh)**
- **Left nav strip:** 54px wide, full 100vh height, border-right `#333333`
- **Deity sidebar:** 191px wide, full 100vh height, border-right `#333333`, scrollable
- **Main content column:** flex: 1, flex COLUMN
  - Main content area: flex: 1, overflow: auto
  - Resource bar: 88px tall, border-top `#333333`, spans only main content width (NOT under right panel)
- **Right panel:** 331px wide, full 100vh height, border-left `#333333`, overflow: auto

**Key constraints:**
- Left nav and deity sidebar extend full viewport height (100vh) to bottom edge
- Resource bar is scoped inside main content column — does NOT extend under right panel
- Right panel is full-height sibling at top level
- All structural divider borders are `#333333`
- Background is always `#181818` (never lighter/darker)

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
  rightPanelContent?: ReactNode
}
```

**Renders:** The full layout container. Uses `display: flex; flex-direction: row` (outer flex row). Structure: SidebarNav (54px) + DeityList (191px) + Main column (flex: 1, contains main content + ResourceBar) + Right panel (331px, full height). Nav and deity sidebar extend full 100vh. ResourceBar only spans main content width (not under right panel).

---

### SidebarNav
**File:** `src/components/SidebarNav.tsx`

**Props:**
```ts
interface SidebarNavProps {
  onNavClick?: (section: string) => void
}
```

**Renders:** 54px-wide vertical strip. Four Phosphor icon buttons (House, Calendar, Sparkle, Clock) for sections. First button (pantheon) always shows `bgCard` background. Height is `100vh` (extends to bottom edge).

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

**Renders:** 191px-wide scrollable sidebar (scrollbar hidden via `scrollbarWidth: 'none'`). "Deities" header. Gods sorted by anger level (high → medium → low → none). Each god as `GodCard` with 8px gap. Currently displays 6 real gods: Huitzilopochtli (high), Tlaloc (high), Tezcatlipoca (medium), Coyolxauhqui (medium), Quetzalcoatl (low), Tonatiuh (none). Defined in `GODS` in `src/data/gods.ts`, used directly in `src/App.tsx`.

---

### GodCard
**File:** `src/components/GodCard.tsx`

**Props:**
```ts
interface GodCardProps {
  god: God
  isSelected: boolean
  onClick: () => void
  stuckProgress?: number
}
```

**Renders:** Button card sized naturally (no minHeight). Padding: `8px` top, `16px` bottom. No transition (`transition: 'none'`). Tracks hover with `useState`. Passes `isHovered` and `isSelected` to `GodSvg` via `getSvgRaw(god.id)` lookup in `GOD_SVG_MAP`.

**SVG map** (`GOD_SVG_MAP` in `GodCard.tsx`):
- `tlaloc` → `Tlaloc.svg`
- `quetzalcoatl` → `Quetzalcoatl.svg`
- `huitzilopochtli` → `huitzilopochtli.svg`
- `tezcatlipoca` → `Tezcatlipoca.svg`
- `coyolxauhqui` → `Quetzalcoatl.svg` (placeholder)
- `tonatiuh` → `huitzilopochtli.svg` (placeholder)

**State matrix:**

| State      | Background  | Border              | Name color  | Name weight | Body color  |
|------------|-------------|---------------------|-------------|-------------|-------------|
| Default    | `#181818`   | `1px solid #333333` | `#6C6C6C`   | 400         | `#6C6C6C`   |
| Hovered    | `#181818`   | `1px solid #ffffff` | `#ffffff`   | 400         | `#ffffff`   |
| Selected   | `#ffffff`   | `1px solid #ffffff` | `#000000`   | 700 (bold)  | `#000000`   |

---

### GodSvg (generic)
**File:** `src/components/GodSvg.tsx`

**Props:**
```ts
interface GodSvgProps {
  svgRaw: string      // raw SVG string imported via ?raw
  angerLevel: AngerLevel
  isHovered?: boolean
  isSelected?: boolean
}
```

**Renders:** Generic inline SVG component used for all gods. Applies dynamic body color and eye styling based on state. All per-god wrappers (TlalocSvg, QuetzalcoatlSvg, etc.) are thin wrappers that import their SVG `?raw` and pass it here.

**Body color by state:**

| State    | Body fill   |
|----------|-------------|
| Default  | `#6C6C6C`   |
| Hovered  | `#ffffff`   |
| Selected | `#000000`   |

**Eye color by anger level (default/hover):**

| Anger  | Stroke color | Stroke weight | Selected override |
|--------|-------------|---------------|-------------------|
| high   | `#FF2435`   | 6             | `#FF2435`         |
| medium | `#EF7B2E`   | 4             | `#FF7913`         |
| low    | `#D7C94E`   | 3             | `#E7C104`         |
| none   | `#6C6C6C`   | 2             | `#000000`         |

On hover with `none`: eyes → `#ffffff`. On selected with `none`: eyes → `#000000`.

**Implementation:** Parses `cx`, `cy`, `r` from each `<circle>` inside `<g id="eyes">` at render time — no hardcoded coordinates. Replaces the eyes group with inside-stroke circles (doubled stroke-width + `<clipPath>`). ClipPath IDs are derived from `cx` values (e.g. `ec-71938`) to avoid collisions when multiple gods are on screen. All god SVGs must have `r="9"` in their eye circles and a `<g id="eyes">` group (export from Figma with "Include id attribute" enabled).

### TlalocSvg
**File:** `src/components/TlalocSvg.tsx` — thin wrapper over `GodSvg`, imports `src/assets/Gods/Tlaloc.svg?raw`.

### QuetzalcoatlSvg
**File:** `src/components/QuetzalcoatlSvg.tsx` — thin wrapper over `GodSvg`, imports `src/assets/Gods/Quetzalcoatl.svg?raw`.

### Adding a new god SVG
1. Export SVG from Figma with "Include 'id' attribute" enabled, name the eyes group `eyes`
2. Set eye circle radius to `r="9"` in the SVG file
3. Drop file into `src/assets/Gods/`
4. Add import and entry to `GOD_SVG_MAP` in `src/components/GodCard.tsx`
5. Add the god to `GODS` array in `src/data/gods.ts`

---

### MiddleSection
**File:** `src/components/MiddleSection.tsx`

**Props:**
```ts
interface MiddleSectionProps {
  selectedGod: God | null
  selectedRitualId: string | null
  onSelectRitual: (ritualId: string) => void
  onPerformRitual: () => void
}
```

**Renders:** Main content area. Shows god name + subtitle header, then "Appeasement Rituals" label, then a flex row of `RitualCard`s, then a centered "SEND ORDER" button.

**Ritual filtering:** Shows only rituals whose `outcomeColor` is at least as calm as the god's anger level. A `high`-anger god shows all 4 outcome colors; `medium` shows 3 (orange through gold); `low` shows 2; `none` shows 1. One ritual per outcome color, up to 4 total.

**Card layout:**
- Cards are 250px wide, `flexShrink: 0`, wrapped in a div
- 4 cards: `justifyContent: 'space-between'`
- Fewer than 4: `justifyContent: 'center'`, `gap: calc((100% - 1000px) / 3)` — matches the space-between gap of the 4-card layout at the same container width

**Ghost frames (no god selected):**
- Always mirror the selected-state card layout exactly: same `width`, `minHeight`, `borderRadius`, `border`, and `backgroundColor` as `RitualCard`
- **Rule:** Any time a visual property is changed on `RitualCard`, the ghost frame in the unselected branch of `MiddleSection` must be updated to match. The ghost is a structural placeholder — it must be visually identical in dimensions and shape to the real card.

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

**Renders:** 250px-wide card (`minHeight: 465px`, `backgroundColor: #181818`). Sections top to bottom:
1. **Name** — centered, Spectral 16px light
2. **Description** — centered, Spectral 12px, `rgba(255,255,255,0.64)`
3. **Divider** — inset `13px` each side
4. **Blood Price** — label + Volunteers row (Link icon) + Virgins row (SunDim icon)
5. **Sacred Site** — label + site name/count row + Duration row (no icons)
6. **Divider** — inset `13px`, pinned above outcome via `marginTop: auto`
7. **Resulting State** — centered outcome eye + label

**Outcome eye:** rendered as a circle with `boxShadow: inset 0 0 0 {weight}px {color}`. Colors/weights from `outcomeEye()`: `#c8322e`→red/6, `#d4662a`→orange/4, `#d4a83c`→yellow/3, default→white/2.

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

**Renders:** 88px-tall bottom bar (inside main content column only). Four `ResourceItem` with Phosphor icons (Link, Sock, SunDim, Sparkle at 32px). Gap between items: 32px. Left/right padding: 32px. Spans only main content width (not under right panel).

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

### RightPanel
**File:** `src/components/RightPanel.tsx`

**Props:**
```ts
interface RightPanelProps {
  ritual: Ritual
  gods: God[]
}
```

**Renders:** 331px-wide right panel at full viewport height. Uses width/height 100% to fill parent container. Shows ritual effect details. Only rendered when a ritual is selected (`rightPanelContent` in `AppShell` is conditionally passed from `App.tsx`).

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

## Workflow for Any UI Change (Mandatory)

**Before writing ANY code to match a Figma design, always follow this workflow:**

### Step 1: Get Figma Screenshot First
- User provides a specific Figma node URL (with `node-id=` parameter)
- Call `get_screenshot` on that node to see the target visual design
- **DO NOT skip this step** — it shows the actual visual truth
- Avoid `get_design_context` alone; it returns verbose code that obscures what to change

### Step 2: Screenshot Current Implementation
- Run: `npx playwright screenshot http://localhost:5173 /tmp/current.png`
- View it side-by-side with the Figma screenshot
- This is where the visual diff becomes clear

### Step 3: Identify What's Different
- Compare the two screenshots visually
- List the specific changes: colors, spacing, typography, layout, borders, etc.
- **Only implement what's actually different** — don't guess or add extra features

### Step 4: Implement and Verify
- Make the identified changes
- After changes: take another Playwright screenshot
- Compare new screenshot to Figma screenshot to confirm match
- If not matching, loop back to step 3

### Tips for Sharing Figma URLs
- Share the specific frame or component URL with the `node-id=` parameter (e.g., `?node-id=22-16012`)
- Drill down to the exact component you want implemented (ritual card, not entire page)
- Use Figma's "Copy link to selection" feature for precise node IDs
- More precise = fewer iterations needed

---

## Font Rendering

`-webkit-font-smoothing: antialiased` has been intentionally removed from `src/index.css`. It causes blurry text on Retina/HiDPI displays. The browser default (`auto`) uses subpixel rendering which looks sharper. Do not re-add it.

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
- Add `-webkit-font-smoothing: antialiased`

---

## God/Ritual Data Model

**`AngerLevel`:** `'high' | 'medium' | 'low' | 'none'` — four states, `'none'` means unappeased/grey.

The sidebar shows 6 real gods, each with a single baked-in anger state. Defined as `GODS` in `src/data/gods.ts`, used directly in `src/App.tsx`.

```ts
type AngerLevel = 'high' | 'medium' | 'low' | 'none'

interface God {
  id: string
  name: string
  subtitle: string
  angerLevel: AngerLevel
  angerColor: string
  favor: number
  rituals: Ritual[]
}

interface Ritual {
  id: string
  name: string
  description: string
  participants: { volunteers: number; virgins: number; prisoners: number; children: number }
  sacredSite: { name: string; count: number }
  duration: string
  outcomeColor: string
  available: boolean
  effects: Array<{ godId: string; before: number; after: number }>
}
```

**Sacred site values:** `{ name: 'Temple', count: 1 }` or `{ name: 'Great Temple', count: 1|2 }` — only these two site names are valid.

---

## Ritual Data Conventions

Two compounding rules govern all ritual data:
1. **Peaceful outcome = most expensive** — fully calming a god requires the most sacrifice
2. **Angrier god = harder to appease** — a HIGH god's cheapest ritual is still more demanding than a NONE god's only ritual

### Visible cards per god anger level
| Anger | Cards shown | Cards hidden |
|---|---|---|
| high | Furious + Angry + Uneasy + Peaceful | — |
| medium | Angry + Uneasy + Peaceful | Furious |
| low | Uneasy + Peaceful | Furious + Angry |
| none | Peaceful only | all others |

### Cost matrix (approximate totals)
| | Furious (cheapest) | Angry | Uneasy | Peaceful (most expensive) |
|---|---|---|---|---|
| **high** | 80–100P, 1 type, Temple×1, 2d | 150P+60V, 2 types, Temple×1, 3d | 280P+100V+25C, 3 types, GT×1, 4d | 450P+200V+70C+7Vg, 4 types, GT×2, 5d |
| **medium** | (hidden) 20P | 60P+30V, 2 types, Temple×1, 2d | 120P+70V+15C, 3 types, Temple×1, 3d | 200P+120V+35C+4Vg, GT×1, 4d |
| **low** | (hidden) 10V | (hidden) 30V | 80V+1Vg, 1 type, Temple×1, 2d | 150V+30P+10C+2Vg, Temple×1, 3d |
| **none** | (hidden) 10V | (hidden) 20V | (hidden) 40V | 80V, Temple×1, 1d |

### Participant count scales
- **Prisoners:** tens to hundreds (20–500); absent or minimal for low/none gods
- **Volunteers:** tens to hundreds; dominant for low/none gods
- **Children:** tens to hundreds; used by Tlaloc most heavily
- **Virgins:** single digits only (1–7); absent in cheapest rituals

### Victim type variety
- Each ritual has 1–4 types; set unused types to `0` (hidden on card)
- Cheapest rituals: 1 type. Most expensive: 3–4 types
- Display order: **Prisoners → Volunteers → Children → Virgins**

### Sacred site rules
- `{ name: 'Temple', count: 1 }` — default
- `{ name: 'Great Temple', count: 1 }` — intense rituals
- `{ name: 'Great Temple', count: 2 }` — most expensive (Peaceful) for HIGH gods only
- Only `Temple` and `Great Temple` are valid site names

### Duration
- Always in days; cheapest: 1–2 days; most expensive: 4–5 days
