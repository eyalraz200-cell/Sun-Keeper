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

## App Flow

### Entry Points
The app has a startup flow controlled by `chosenScreen` state in `App.tsx`:

1. **ScreenChooser** (`chosenScreen === null`) — always shown first
2. **StartScreen** (`chosenScreen === 'regular'`) — regular cinematic intro
3. **StartScreenWrathful** (`chosenScreen === 'wrathful'`) — secondary/wrathful intro
4. After either start screen dismisses → **AppShell** with full UI

When wrathful is chosen, a random god is picked and stored as `wrathfulGodId` in App state. `wrathfulGodId` is passed to `StartScreenWrathful` (for face/name) and down to `AppShell` → `GodList` → `GodCard` (to render that god's card in wrathful red style).

---

## Component API Reference

### ScreenChooser
**File:** `src/components/ScreenChooser.tsx`

**Props:**
```ts
interface ScreenChooserProps {
  onChoose: (screen: 'regular' | 'wrathful') => void
}
```

**Renders:** Full-screen dark overlay (`#181818`, `zIndex: 3000`). Centered "CHOOSE YOUR OPENING" label in Cinzel, 11px, letter-spacing 5px, `rgba(255,255,255,0.3)`. Two buttons side by side:
- **Regular** — white border (`rgba(255,255,255,0.4)`), white text; hover fills white bg, text `#181818`
- **Secondary** — red border (`rgba(200,50,46,0.5)`), red text; hover fills red bg, white text

Both buttons: Spectral 15px, 1.5px letter-spacing, 6px border-radius, `12px 40px` padding. Fade-in animations on mount (label: 0.8s delay 0.2s; buttons: 0.8s delay 0.5s).

---

### StartScreen (Regular)
**File:** `src/components/StartScreen.tsx`

**Props:**
```ts
interface StartScreenProps {
  dismissing: boolean
  onClick: () => void
}
```

**Renders:** Cinematic intro screen. `position: fixed`, `zIndex: 1500`. Fades out on dismiss.

---

### StartScreenWrathful (Secondary)
**File:** `src/components/StartScreenWrathful.tsx`

**Props:**
```ts
interface StartScreenWrathfulProps {
  dismissing: boolean
  onClick: () => void
  godId: string  // randomly chosen at ScreenChooser time in App.tsx
}
```

**Renders:** Two-phase cinematic screen. `position: fixed`, `backgroundColor: '#FF2435'`, `zIndex: 2000`.

**Background:** Radial gradient overlay `radial-gradient(ellipse at center, transparent 30%, rgba(80,0,0,0.6) 100%)` for corner darkening.

**God face (both phases):**
- Intro: `57vmin × 57vmin`, centered at `translate(-50%, calc(-50% - 12vh - 2.5vmin))`
- Punishment: `40vmin × 40vmin`, centered at `translate(-50%, calc(-50% - 20vh))`
- Transition between phases: `2.4s cubic-bezier(0.4,0,0.2,1)` on width, height, and transform
- Initial fade-in: `wrathGodFadeIn 2.5s ease 0.4s forwards`
- Rendered with `filledEyes={true}`, `eyeGlow={true}` (black filled eyes + concentric rings + body-color inside stroke), `isHovered={true}` (white body `#F0F0F0`)
- `eyeAnimation` forces black eyes: `{ fromColor: '#000000', toColor: '#000000', delay: 0, duration: 0 }`

**Intro phase text:** Anchored at `top: calc(50% - 12vh - 2.5vmin + 28.5vmin + 54px)` (just below the face). Fades in `1.6s ease 2.6s`. Single line: god name in Cinzel (uppercase, weight 400) + " Was Left Unappeased." in Spectral 28px weight 300, white.

**Punishment phase text:** Anchored at `top: calc(50% + 7vh)`. Two separate staggered animations:
1. **"DIVINE PUNISHMENT"** — Cinzel 11px, weight 500, 4px letter-spacing, uppercase, `marginBottom: 14px`. Fades in `1.6s ease 2.8s both`
2. **Description lines** — Spectral 28px weight 300, white. Two lines (`gap: 2px`). Both fade in `1.8s ease 4.0s both`:
   - "Your Armies Fall. War Is No Longer Yours To Win"
   - "Until [HUITZILOPOCHTLI in Cinzel] Is Appeased."

**CTA button** (both phases, same element):
- Label: "VIEW PUNISHMENT" (intro) → "CONTINUE" (punishment)
- Position: `bottom: 9vh`, centered
- Spectral 16px, 1.5px letter-spacing, white border + text
- Hover: instant (`transition: none`) — fills white bg, text `#FF2435`
- Initial reveal: `wrathGodFadeIn 1.2s ease 5.5s forwards`
- Intro click → transitions to punishment phase; Punishment click → calls `onClick` (enters app)

---

### AppShell
**File:** `src/components/AppShell.tsx`

**Props:**
```ts
interface AppShellProps {
  gods: God[]
  selectedGodId: string | null
  onSelectGod: (godId: string) => void
  mainContent: ReactNode
  activeRituals?: Record<string, string>
  isGodListExpanded: boolean
  onGodListExpandedChange: (expanded: boolean) => void
  wrathfulGodId?: string | null
}
```

**Renders:** Full layout container. Passes `wrathfulGodId` down to `GodList`. When god list is expanded, renders a `rgba(0,0,0,0.5)` scrim over the main content area (click to close).

---

### SidebarNav
**File:** `src/components/SidebarNav.tsx`

**Renders:** 54px-wide vertical strip. Four Phosphor icon buttons. Height is `100vh`.

---

### GodList
**File:** `src/components/GodList.tsx`

**Props:**
```ts
interface GodListProps {
  gods: God[]
  selectedGodId: string | null
  onSelect: (godId: string) => void
  activeRituals?: Record<string, string>
  isExpanded?: boolean
  onToggleExpanded?: () => void
  onCloseExpanded?: () => void
  wrathfulGodId?: string | null
}
```

**Renders:** Expandable deity sidebar. Two views: collapsed (scrollable list with sticky selected card) and expanded (5-column grid overlay). Width expands from `sidebarWidth` to `OVERLAY_WIDTH` with a `0.35s cubic-bezier` transition. `zIndex` is `1` when collapsed, `200` when expanded.

**Collapsed view behavior:**
- Selected card is `position: sticky`, sticks at `top: 24px`
- As card sticks, height compresses and padding adjusts via `stuckProgress` (0→1)
- Header fades out as card slides over it
- Scroll events clear hover state to prevent stuck hovers

**Expanded view behavior:**
- 5 columns of `GodCard` in a grid — shows ALL gods
- Clicking a card in expanded view selects it AND closes the expanded view (but only when selecting a *different* god — deselecting the same god does NOT collapse the list)
- A scrim (`rgba(0,0,0,0.5)`) covers the main content area when expanded; click scrim to close

**Wrathful mode:** When `wrathfulGodId` is set, passes `wrathful={true}` to that specific god's `GodCard` in both collapsed list and expanded grid. The wrathful god is randomly chosen at ScreenChooser time and can be any god.

**Active rituals:** Gods with active rituals are removed from the main list and shown in a collapsed drawer at the bottom that reveals individual cards on hover.

---

### GodCard
**File:** `src/components/GodCard.tsx`

**Props:**
```ts
interface GodCardProps {
  god: God
  isSelected: boolean
  onClick: () => void
  stuckProgress?: number    // 0–1, drives sticky compression
  isCollapsed?: boolean     // collapsed drawer mode (name only, no SVG)
  noBorder?: boolean
  wrathful?: boolean        // wrathful Huitzilopochtli style
}
```

**SVG map** (`GOD_SVG_MAP` in `GodCard.tsx`):
- `tlaloc` → `Tlaloc.svg`
- `quetzalcoatl` → `Quetzalcoatl.svg`
- `huitzilopochtli` → `huitzilopochtli.svg`
- `mictlantecuhtli` → `Mictlantecuhtli.svg`
- `tezcatlipoca` → `Tezcatlipoca.svg`
- `ehecatl` → `Ehecatl.svg`
- `xiuhtecuhtli` → `Xiuhtecuhtli.svg`
- `chalchiuhtlicue` → `Chalchiuhtlicue.svg`
- `tonatiuh` → `Tonatiuh.svg`

**No placeholder/duplicate SVGs.** Every god in `GODS` must have its own unique SVG file. If a god's SVG doesn't exist yet, do not add the god to `GODS` or `GOD_SVG_MAP` — wait until the real SVG is available. `coyolxauhqui` is pending a real SVG before it can be re-added.

**Standard state matrix (non-wrathful):**

| State    | Background | Border              | Name color | Body color |
|----------|------------|---------------------|------------|------------|
| Default  | `#181818`  | `1px solid #333333` | `#6C6C6C`  | `#6C6C6C`  |
| Hovered  | `#181818`  | `1px solid #ffffff` | `#F0F0F0`  | `#F0F0F0`  |
| Selected | `#ffffff`  | `1px solid #ffffff` | `#000000`  | `#000000`  |

**Wrathful state matrix (wrathful=true, Huitzilopochtli only):**

| State           | Background | Border              | Name color             | Body color |
|-----------------|------------|---------------------|------------------------|------------|
| Default         | `#FF2435`  | `1px solid #FF2435` | `rgba(255,255,255,0.9)`| `#E6E6E6`  |
| Hovered         | `#FF2435`  | `1px solid #ffffff` | `#ffffff`              | `#F0F0F0`  |
| Selected        | `#FF2435`  | `1px solid #ffffff` | `#ffffff`              | `#F0F0F0`  |

**Wrathful eye rendering:** `filledEyes={true}`, `eyeGlow={true}`, `bodyColor` from table above, `eyeAnimation` forcing black eyes (`#000000`, weight 6, delay 0, duration 0). See GodSvg `filledEyes` mode below.

**Name:** Cinzel 12px, weight 500, uppercase, 1px letter-spacing. Fades out as `stuckProgress` → 1 (opacity = `max(0, 1 - stuckProgress * 3)`).

**SVG area:** `125px × 194px`, hidden when `isCollapsed`. No transition on any property.

---

### GodSvg (generic)
**File:** `src/components/GodSvg.tsx`

**Props:**
```ts
interface GodSvgProps {
  svgRaw: string           // raw SVG string imported via ?raw
  angerLevel: AngerLevel
  isHovered?: boolean
  isSelected?: boolean
  eyeAnimation?: EyeAnimation
  filledEyes?: boolean     // use filled-circle eye mode (wrathful/starting screen)
  eyeGlow?: boolean        // add concentric rings inside filled eyes
  bodyColor?: string       // override computed body color
}

interface EyeAnimation {
  fromColor: string
  fromWeight: number
  toColor: string
  toWeight: number
  delay?: number           // default 0.8s
  duration?: number        // default 2s
  id?: string              // used to namespace @keyframes name
}
```

**Body color logic:**
- If `bodyColor` prop is passed: use it directly (overrides all state logic)
- Otherwise: `isSelected → #000000`, `isHovered → #F0F0F0`, default → `#6C6C6C`

**Standard eye mode (filledEyes=false):**

Inside-stroke technique using doubled `stroke-width` + `<clipPath>` to achieve an inward stroke. ClipPath IDs use `cx` value to avoid collisions (`ec-{cx}`).

| Anger  | Stroke color | Stroke weight | Selected override |
|--------|-------------|---------------|-------------------|
| high   | `#FF2435`   | 6             | `#FF2435`         |
| medium | `#EF7B2E`   | 4             | `#FF7913`         |
| low    | `#D7C94E`   | 3             | `#E7C104`         |
| none   | `#6C6C6C`   | 2             | `#000000`         |

On hover with `none` anger: eyes → `#F0F0F0`. When `isSelected`: outer glow filter applied via `feGaussianBlur` + `feComposite`.

If `eyeAnimation` is passed (non-filledEyes mode): eyes animate from `fromColor`/`fromWeight` to `toColor`/`toWeight` using CSS `@keyframes eyeShift-{id}`. Used in the ritual overlay screen.

**Filled eye mode (filledEyes=true):**

Used for wrathful Huitzilopochtli card and secondary start screen. Eye color = `eyeAnimation.toColor` if provided, otherwise `eye.color`.

Each eye renders (in order, inside `<defs>` + `<g id="eyes">`):
1. **Black fill** — solid filled circle at full radius
2. **Concentric rings** (only when `eyeGlow=true`) — 6 stroked rings at radii 88%, 74%, 60%, 46%, 32%, 18% of eye radius. `stroke="#ffffff"`, `stroke-width="1.3"`. Opacity fades from 0.35 → 0.04 inward. Rings are spaced to touch with no black gaps.
3. **Inside stroke** — `stroke="${bodyColor}"`, `stroke-width="1"`, clipped to eye boundary via `<clipPath id="eg-{cx}">`. Matches body color so it blends naturally.

**Eye SVG requirements:** All god SVGs must have `r="9"` eye circles in a `<g id="eyes">` group. Export from Figma with "Include id attribute" enabled.

**Path-based eyes (fallback):** If eyes use `<path>` elements instead of `<circle>`, recolors fills and adds stroke at `weight - 2`.

### Adding a new god SVG
1. Export from Figma with "Include 'id' attribute" enabled, eyes group named `eyes`
2. Drop into `src/assets/Gods/`
3. **Normalize eye radius** — SVGs exported from Figma often have `r="8"` or other values. Run: `grep -o 'r="[^"]*"' <file>.svg | sort | uniq` to check, then fix any non-`9` radius inside the `<g id="eyes">` group: `sed -i '' 's/r="8"/r="9"/g' <file>.svg`. GodSvg requires exactly `r="9"`.
4. **Normalize fill color** — SVGs exported from Figma often use `fill="white"` or `fill="#FEFEFE"`. GodSvg handles both, but verify no other unexpected fill values: `grep -o 'fill="[^"]*"' <file>.svg | sort | uniq -c`
5. Add import and entry to `GOD_SVG_MAP` in `src/components/GodCard.tsx`
6. Add the god to `GODS` array in `src/data/gods.ts`

**Rule: no placeholder SVGs.** Never map a god's ID to another god's SVG file. If the real SVG doesn't exist yet, skip steps 5–6 entirely until it does.

---

### MiddleSection
**File:** `src/components/MiddleSection.tsx`

**Renders:** Main content area. Shows god name + subtitle header, "Appeasement Ritual Options" label, 3 `RitualCard`s, and an "AUTHORIZE RITUAL" button.

**Ritual display:** Every god always shows exactly 3 ritual cards — all 3 of the god's rituals, no filtering. Cards are `250px` wide, `flexShrink: 0`.

**Card layout:**
- 3 cards: centered with consistent gap
- Ghost frames shown when no god selected — must exactly match `RitualCard` dimensions/shape

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

**Renders:** 250px-wide card, `minHeight: 465px`, `backgroundColor: #181818`. Sections top to bottom:
1. **Name** — centered, Spectral 16px light
2. **Description** — centered, Spectral 12px, `rgba(255,255,255,0.64)`
3. **Divider** — inset 13px each side
4. **Blood Price** — label + participant rows (Prisoners, Volunteers, Children, Virgins — all 4 always shown; unused at low opacity with `—`)
5. **Sacred Site** — label + site name/count + Duration
6. **Divider** — inset 13px, `marginTop: auto` (pins to bottom)
7. **Resulting State** — centered outcome eye circle + label

**Outcome eye:** `boxShadow: inset 0 0 0 {weight}px {color}`:
- `#c8322e` → red/6 ("Furious")
- `#d4662a` → orange/4 ("Offended")
- `#d4a83c` → yellow/3 ("Uneasy")
- default → white/2 ("Peaceful")

**Participant display order:** Prisoners → Volunteers → Children → Virgins

---

### ResourceBar
**File:** `src/components/ResourceBar.tsx`

**Renders:** 88px-tall bottom bar (inside main content column only). Four resource items with Phosphor icons at 32px. Gap: 32px. Padding: 32px each side.

---

### RightPanel
**File:** `src/components/RightPanel.tsx`

**Renders:** 331px-wide right panel, full viewport height. Shows ritual effect details. Only rendered when a ritual is selected.

---

### Ritual Overlay (in App.tsx)

When a ritual is performed, a full-screen `#181818` overlay renders with:
- **God face:** `57vmin`, centered at `translate(-50%, calc(-50% - 12vh - 2.5vmin))`. Fades in `2.4s ease 0.8s`.
- **Left/right gradients:** `linear-gradient(to right, rgba(0,0,0,0.85) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.85) 100%)`
- **Top/bottom gradients:** `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.5) 100%)`
- **Victim list:** anchored at `top: calc(50% - 12vh - 2.5vmin + 28.5vmin + 54px)`. Shows `victimListShow` animation (fades in then out). Filtered to non-zero counts only.
- **Outcome text:** same anchor point as victim list, fades in at 7.0s.
- **Eye animation:** god's eyes animate from current anger color to outcome color at 5.0s delay, 2s duration.
- **CONTINUE button:** `bottom: 14vh`, fades in at 8.4s; hover inverts colors.

---

## Design Tokens (src/tokens.ts)

**Never hardcode values.** Always reference `tokens.ts`:

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
  high: '#c8322e',
  medium: '#d4662a',
  low: '#c8a83c',
}

FONTS = {
  cinzel: "'Cinzel', serif",
  spectral: "'Spectral', Georgia, serif",
}

SPACING = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', xxl: '32px',
}
```

**Wrathful color** (not in tokens, use directly): `#FF2435`

---

## Typography Rules

- **God names:** `FONTS.cinzel`, ALWAYS uppercase (`textTransform: 'uppercase'`), weight 400 (NOT bold)
- **Headings:** `FONTS.cinzel`, uppercase, `textBase`
- **Body:** `FONTS.spectral`, normal case, `textSecondary`
- **Labels:** 10px uppercase, `textMuted`
- **Buttons:** `FONTS.spectral`, 13px–16px uppercase, letter-spacing 0.8px–1.5px

---

## Font Rendering

`-webkit-font-smoothing: antialiased` has been intentionally removed from `src/index.css`. It causes blurry text on Retina/HiDPI displays. The browser default (`auto`) uses subpixel rendering which looks sharper. **Do not re-add it.**

---

## God/Ritual Data Model

**`AngerLevel`:** `'high' | 'medium' | 'low' | 'none'`

```ts
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

---

## Ritual Data Conventions

### Core rules (non-negotiable)
1. **Every god has exactly 3 ritual cards** — always shown, no filtering.
2. **Ritual outcomes must be strictly calmer than the god's current anger level.**
3. **Same outcome color within a god = similar overall cost** — neither card strictly dominates across all dimensions.
4. **More appeasement = more sacrifice** — cost increases toward the most calming option.

### Outcome colors per anger level
| God anger | Valid outcome colors            | Card composition           |
|-----------|-------------------------------|----------------------------|
| high      | Angry + Uneasy + Peaceful     | 3 unique outcome colors    |
| medium    | Uneasy + Peaceful             | 2× Uneasy + 1× Peaceful   |
| low       | Peaceful only                 | 3× Peaceful                |
| none      | Peaceful only                 | 3× Peaceful                |

### Participant count scales
- **Prisoners:** tens to hundreds; absent for low/none gods
- **Volunteers:** tens to hundreds; dominant for low/none gods
- **Children:** used by Tlaloc most heavily
- **Virgins:** single digits only (1–7 max); absent in lightest rituals

### Sacred site rules
- `{ name: 'Temple', count: 1 }` — default
- `{ name: 'Grand Temple', count: 1 }` — intense rituals (3rd card of high-anger gods)
- Only `Temple` and `Grand Temple` are valid site names

### Duration
- Always in days; lightest: 1–2 days; most demanding: 4–5 days

---

## Figma Reference

**File Key:** `azSClyWIZyeWpGcjyMKOsT`
**Main Frame:** Node `22:14653` ("MacBook Pro 14' - 35")

---

## Workflow for Any UI Change (Mandatory)

### Step 1: Get Figma Screenshot First
- User provides a specific Figma node URL (with `node-id=` parameter)
- Call `get_screenshot` on that node
- **DO NOT skip this step**

### Step 2: Screenshot Current Implementation
- Run: `npx playwright screenshot http://localhost:5173 /tmp/current.png`

### Step 3: Identify What's Different
- Compare screenshots visually
- Only implement what's actually different

### Step 4: Implement and Verify
- Make changes, take another Playwright screenshot, confirm match

---

## Dos and Don'ts

✅ **DO:**
- Use existing components
- Reference `tokens.ts` for all colors/fonts/spacing
- Test with Playwright screenshots after changes
- Keep god names in Cinzel, ALL CAPS, weight 400 (never bold)

❌ **DON'T:**
- Add headers not in Figma design
- Hardcode color/font/spacing values
- Create placeholder panels not in design
- Add `-webkit-font-smoothing: antialiased`
- Make god names bold or mixed-case
