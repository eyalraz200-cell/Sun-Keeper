# Sun Keeper Design Guide

This document ensures I reliably follow your Figma design (`azSClyWIZyeWpGcjyMKOsT`) in every conversation. Read this before making code changes.

## Before Writing or Touching Any Component (checklist)

1. **Check the Component API Reference below first** — if the component you're about to build already exists (`GodCard`, `RitualCard`, `GodSvg`, an icon, etc.), use/extend it instead of writing a new one from scratch.
2. **Colors:** use a name from `COLORS`/`ANGER`/`EYE` in `tokens.ts` (see Design Tokens section). If you're about to type a literal hex code, stop and check whether one of those names already covers it — most of the time it does.
3. **Eye/outcome circles specifically:** never hand-write the `{ color, weight }` anger lookup table — import `EYE` from `tokens.ts`. This exact table has been hand-copied into 3 different files before; don't make it 4.
4. **"Brighter"/"darker"/"bigger"/"smaller"/"bolder" instructions: step along the scale, don't invent a new value.** When the user says "make it brighter" (or darker/bigger/smaller/bolder/lighter), move to the next (or previous) key in the relevant ordered scale in `tokens.ts` — `COLORS` for brightness, `FONT_SIZE` for size, `FONT_WEIGHT` for weight, `SPACING` for gaps/padding. "Much brighter"/"much bigger" = jump 2+ steps, still landing on a defined key. Never compute or guess an in-between value (e.g. don't go from `gray30` to some new `#3a3a3a` — go to `gray40`, the next real step). This is what keeps the whole app visually uniform instead of accumulating one-off values. See the Design Tokens section below for the exact scale order.
5. **God names:** `FONTS.spectral`, always uppercase, weight 400 — never bold, never mixed-case. **Cinzel has been removed from this project entirely (2026-07-02)** — the font token, the Google Fonts `<link>`, and every usage (god names, screen headings, "AI Counsel", tier/relationship labels, resource type labels) were all switched to Spectral. If you see `FONTS.cinzel` or a literal `'Cinzel', serif` anywhere outside `_archived/`, that's stale/regressed — replace it with `FONTS.spectral`, don't reintroduce Cinzel.
6. **Any visual/UI change tied to a Figma frame:** follow the mandatory 4-step workflow below (screenshot Figma first, screenshot current code, diff, implement) — don't skip straight to coding from memory of what the design "probably" looks like.
7. **After this session's reorg:** components live under `src/components/{screens,gods,ritual,icons,layout}/` — check the right subfolder before assuming a flat `components/` layout (see App Architecture below).
8. **If editing something in `_archived/`:** don't. It's excluded from the build and described as historical-only below — ask the user before reviving any of it.
9. **Ringed circle-around-icon treatment (Temple/Grand Temple in the resource bar, ritual-site icons in `RitualCard`/`GodCard`):** use the shared `RingedIcon` component (`src/components/icons/RingedIcon.tsx`), never a hand-rolled `border-radius: 50%` div. **The ring's `borderColor` and the icon's own `color` must always be the same value** — they're not independently stylable; if you brighten/darken one, brighten/darken the other to match in the same edit.

---

## App Architecture (current, live)

`App.tsx` renders `AppShell` + `AiChat` directly — there is **no startup/intro flow active**. `AppShell` (`src/components/layout/AppShell.tsx`) holds `activeScreen` state, renders `SidebarNav` (54px nav strip) plus whichever screen is active, full-bleed, with no secondary deity sidebar and no right panel.

**Archived components:** `src/components/_archived/` contains `ScreenChooser`, `StartScreen`, `StartScreenWrathful`, `GodList`, `MiddleSection`, `ResourceBar`, `RightPanel`, and `CtaButton` — leftovers from an earlier design iteration (a cinematic intro flow + a dedicated ritual screen with a deity sidebar and wrathful Huitzilopochtli mode). They're excluded from the TypeScript build (`tsconfig.app.json` excludes this folder) and not imported anywhere live. Treat them as historical reference only — don't wire them back up or copy their patterns without being asked, since the rest of this doc no longer matches how they work.

---

## Screens

`activeScreen` state lives in `AppShell.tsx`, switched via `SidebarNav` icon clicks:

| `activeScreen` value | Screen component | Nav icon |
|---|---|---|
| `overview` (default) | `screens/HomeScreen.tsx` | Pyramid |
| `dashboard` | `screens/DashboardScreen.tsx` | Squares (Phosphor `SquaresFour`) |
| `calendar` | `screens/CalendarScreen.tsx` | Calendar |
| `resources` | `screens/ResourceScreen.tsx` | Prisoner icon |
| `index` | `screens/PantheonScreen.tsx` | Skull |
| `new` | `screens/NewScreen.tsx` | *(not wired to any nav button — currently unreachable from the UI; treat as WIP)* |

`settings` and `profile` nav buttons exist in `SidebarNav` but have no screen wired up in `AppShell` — clicking them renders nothing.

**@overview screen** (`activeScreen === 'overview'`):
- The default screen on app load (pyramid icon in `SidebarNav`)
- Renders `HomeScreen.tsx`
- God cards are grouped into sections by `angerLevel` (`high` → `medium` → `low` → `none`), each with its own group title — no flat ungrouped grid
- Group title = **18px** render-layer eye circle (see "Standard eye mode" rule under `RitualCard`/`GodSvg` below — `high: #FF2435/6px`, `medium: #EF7B2E/4px`, `low: #D7C94E/3px`, `none: #6C6C6C/2px`, NOT the data-layer ANGER palette) + sentence-case label in `FONTS.spectral` 14px weight 300 white (NOT uppercase): "Furious Gods" / "Angry Gods" / "Uneasy Gods" / "Peaceful Gods" (`TIER_LABELS` in `HomeScreen.tsx`). Re-confirmed against a fresh Figma pull on 2026-07-02 — if you see the older wording ("Furious" / "Offended" / "Uneasy" / "At Peace", no "Gods" suffix) anywhere, that's stale, this is the current version.
- Titles are hidden while a god is selected (detail panel open), same as the page-level heading (see below)
- The page-level heading reads "Choose rituals to appease the gods" (`FONTS.spectral`, sentence case, `FONT_SIZE.xl`/20px — NOT the old Cinzel-uppercase "Gods" label) with a subtitle "Avoid punishment by performing appeasement rituals for the angry gods" underneath; grid-mode only, the list-mode header (passed as `GodListLayout`'s `header` prop) hasn't been updated to match and still reads the old copy
- A resource bar (`HomeResourceBar`, defined locally inside `HomeScreen.tsx` — there is no separate `ResourceBar.tsx` component anymore) shows available Prisoners/Volunteers/Children/Virgins and Temple/Grand Temple counts at the top of the screen. Prisoners/Volunteers/Children/Virgins share one rounded (`10px`) `COLORS.gray15` pill container with `1px COLORS.gray20` dividers between each; Temple/Grand Temple sit bare (no shared pill) with a `PyramidIcon` in a 48px ringed circle each, also divider-separated. Both share a `HomeBarSectionTitle` label ("Available Resources" / "Available Ritual Sites") above them.

**God detail panel (`HomeGodDetailPanel`, defined locally in `HomeScreen.tsx`):** clicking any god card (grid or list-rail) switches `viewMode` to `'list'` and opens this panel inside `GodListLayout`'s `GodFreeCarousel` — there is no separate `HomeGodCard`/simple-swap flow anymore, and no shared `GodCard.tsx` usage here (that component is grid-view only). Re-audited against a fresh Figma pull (node `240:3580`) on 2026-07-02, replacing an older click-to-select design:
- **Layout:** one combined card (`COLORS.cardBg` background, `10px` radius) holds a 320px-wide left half (god name/subtitle + a `300px`-tall `GodSvg`) and a right half — the **drop-zone**, a permanent dashed-border empty slot with the docked `RitualCard` (if any) layered on top of it. Below this combined card, a row holds every ritual *not* currently docked (up to 3, shrinking as one gets chosen).
- **Rule: the drop-zone's size must always exactly match a rendered `RitualCard`'s own size** (`DROP_ZONE_WIDTH`/`DROP_ZONE_HEIGHT` = `RITUAL_CARD_WIDTH`/`RITUAL_CARD_HEIGHT` in `HomeScreen.tsx`, currently `245×391`) — no padding, no oversized frame. This applies to the drop-zone, the candidate row slots, and the drag ghost alike, so a card is exactly the same size whether it's sitting in the row, mid-drag, or docked. If `RitualCard`'s natural rendered height ever changes (e.g. its content layout changes), update `RITUAL_CARD_HEIGHT` to match — don't let the drop-zone drift out of sync.
- **Interaction is drag-and-drop, not click-to-select:** dragging a candidate card from the row into the drop-zone docks it (`onChoose`) and removes it from the row; dragging the docked card back out of the drop-zone un-docks it (`onUnchoose`, a new callback threaded `HomeScreen → GodListLayout → GodFreeCarousel → HomeGodDetailPanel` alongside the existing `onChoose` path) and returns it to the row. Hand-rolled pointer-event drag (no library — see `RitualSacrificeOverlay` below, the pattern this reuses): `onPointerDown`/`setPointerCapture` on the card, a `position:fixed` ghost tracking the pointer via `transform`, a `DOCK_MARGIN` (48px) forgiving hit-test against the drop-zone's `getBoundingClientRect()`, and a phase state machine (`dragging`/`returning`/`docking`/`undocking`) with `setTimeout`s matched to the CSS transition durations.
- **The drag ghost is portaled to `document.body`** (`createPortal`), not rendered inline — `panelRef` (the FLIP animation's transform target) gets a non-`'none'` `transform` set directly on its DOM node once the entrance animation settles, and any transformed ancestor creates a new CSS containing block for `position:fixed` descendants. A ghost left nested inside `panelRef` tracks relative to the panel's box instead of the viewport — easy to miss since it fails silently (wrong position, no error) rather than throwing.
- Every row/docked `RitualCard` here is called with `outcomeBorder` (border always = that ritual's own outcome-eye color, not the click-selection white/dim styling) and `isSelected={false}` (selection has no meaning under drag — a ritual is either present in the row or docked, never "selected").
- `ChooseRitualButton`/`RitualCardWithChoose` (the old "Select Ritual" footer button + click wrapper) are gone, replaced by the drag wrapper described above.
- Clicking the god face/name area (outside the ritual card) calls `onBack`, threaded `HomeScreen → GodListLayout → GodFreeCarousel → HomeGodDetailPanel`, which switches `viewMode` back to `'grid'`. Hovering that same area brightens a `CaretLeft` chevron (in a padded, stroked circle, top-left of the combined card) from `gray30` to `gray95` — the name/face themselves do NOT brighten on this hover, only the chevron+circle.

**Ritual sacrifice flow:** clicking "Authorize All Selected Rituals" on the overview screen sets `sacrificeCost` and renders `RitualSacrificeOverlay` (see Component API Reference below) — a drag-and-drop interaction, not a passive animated cutscene.

The other screens (`DashboardScreen`, `CalendarScreen`, `ResourceScreen`, `PantheonScreen`, `NewScreen`) don't yet have a detailed spec in this doc — audit them against Figma individually before making pixel-level claims about their layout.

---

## Layout Rules (Figma Frame: MacBook Pro 14' - 35)

**Viewport:** 100vw × 100vh, background `#1A1A1A`

**Structure: Outer flex ROW (100vw × 100vh)**
- **Left nav strip (`SidebarNav`):** 54px wide, full 100vh height, border-right `#333333`
- **Main content column:** flex: 1, renders the active screen full-bleed — there is currently no secondary deity sidebar and no right panel in the live UI (both existed in the archived design iteration; see App Architecture above)

**Key constraints:**
- `SidebarNav` extends full viewport height (100vh) to bottom edge
- Background is always `#1A1A1A` (never lighter/darker)

---

## Component API Reference

### AppShell
**File:** `src/components/layout/AppShell.tsx`

**Props:**
```ts
interface AppShellProps {
  resources?: { prisoners: number; volunteers: number; children: number; virgins: number; temples?: number; greatTemples?: number }
  resourceTotals?: typeof RESOURCE_TOTALS
  aiPanelOpen?: boolean
}
```

**Renders:** `SidebarNav` + whichever screen matches internal `activeScreen` state (see Screens table above). No god/ritual selection state lives here — each screen manages its own.

---

### SidebarNav
**File:** `src/components/layout/SidebarNav.tsx`

**Props:**
```ts
interface SidebarNavProps {
  activeScreen?: string
  onNavClick?: (section: string) => void
}
```

**Renders:** 54px-wide vertical strip, full `100vh`. Logo at top, then 5 screen nav buttons (Pyramid/Squares/Calendar/Prisoner/Skull — see Screens table), then a `settings`/`profile` pair pinned to the bottom via `marginTop: auto`. Active button color `#ffffff`, hover `#a8a4a0`, default `#6a6762`.

---

### GodCard
**File:** `src/components/gods/GodCard.tsx`

**Props:**
```ts
interface GodCardProps {
  god: God
  isSelected?: boolean
  onClick?: () => void
  chosenRitual?: Ritual | null
  domRef?: (el: HTMLDivElement | null) => void
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

**Current state matrix** (`highlighted = isSelected || isHovered` — selected and hovered currently render identically, there is no distinct "selected" look):

| State                | Border              | Name color | Body color (passed to `GodSvg`) |
|----------------------|---------------------|------------|----------------------------------|
| Default              | `1px solid #262626` | `#6c6c6c`  | *(unset — `GodSvg` computes its own default)* |
| Highlighted (hover/selected) | `1px solid #4d4d4d` | `#F0F0F0`  | `#e0e0e0` |

**Chosen-ritual border (orthogonal to the table above — independent of `highlighted`):** once `chosenRitual` is set, the outer card border becomes a `linear-gradient(to right, EYE[god.angerLevel].color, outcomeEye(chosenRitual.outcomeColor).color)` instead of a flat color — visualizing the ritual's appeasement effect (current anger → resulting outcome) directly on the card. Implemented via the standard two-layer `background-image`/`background-clip: padding-box, border-box` trick (a plain CSS `border` can't render a gradient). This is why the ritual panel no longer needs its own outcome circle (see Ritual Panel below) — the gradient border carries the same before/after information, plus the starting state the circle never showed.

Background is always `COLORS.bgBase`, regardless of state. There is currently no wrathful/Huitzilopochtli-specific styling wired into `GodCard` — that lived in the now-archived `StartScreenWrathful` flow.

**SVG area:** `125px × 194px` (`FACE_LEFT`/`FACE_WIDTH` constants), positioned at `top: 38px`.

**Ritual Panel** — the "card within a card" on the right side of `GodCard`:
- Positioned `left: INNER_CARD_LEFT`, `right: RITUAL_PANEL_RIGHT_GAP (12px)`, `top/bottom: 14px` inside the outer god card
- Own border + `borderRadius: 10px`, matching the outer card's border color/highlight state
- Two states:
  - **No ritual selected**: fire icon + single-line "No ritual chosen" text (wraps to 2 lines), centered — `#4d4d4d` default, `#999999` on hover/selected (never white)
  - **Ritual chosen**: fire icon, then each participant type rendered as its own pill (`RitualParticipantPill` — `borderRadius: 8px`, full panel width, `backgroundColor: COLORS.gray20` + white icon/text when that type is used by the ritual, `COLORS.gray15` + `COLORS.gray18` icon/text "ghost" look when it isn't — same information the old whole-row `opacity: 0.12` dimming conveyed, via color-scale tokens instead of an opacity value), then a divider, then a `PyramidIcon` + duration only (no sacred-site name/abbreviation text anymore — the icon carries that meaning). **No outcome circle** — that information now lives on the outer card's gradient border instead (see the state matrix above).
- `INNER_CARD_LEFT` is derived from `FACE_LEFT + FACE_WIDTH + FACE_TO_CARD_GAP` — the gap between the god's face and the ritual panel always matches the card's left padding.
- **Sizing rule:** both the gap from the face (left edge) AND the gap from the card's right edge (`RITUAL_PANEL_RIGHT_GAP`) are fixed and must never be touched to resize the panel. `RITUAL_PANEL_WIDTH` is the only thing that changes — `CARD_WIDTH` is *derived* from `INNER_CARD_LEFT + RITUAL_PANEL_WIDTH + RITUAL_PANEL_RIGHT_GAP`, so the outer `GodCard` itself grows/shrinks to fit, instead of either gap ever changing.
- **Hover transition:** the panel's border-color and background-color change **instantly** on hover (no `transition` property) — border goes `#333333` → `#808080`, fill goes `transparent` → `#2e2e2e`. This matches the god's face (`GodSvg`), which also snaps instantly because it's raw SVG markup with the color baked into each `fill="..."` attribute, not a CSS-transitionable property. The outer `GodCard` border also brightens instantly: `#262626` → `#4d4d4d`.
- **Content color on hover:** the fire icon and "No ritual chosen" text brighten from `#4d4d4d` to `#999999` on hover/selected — deliberately NOT white, unlike the border/fill above.
- **`RITUAL_PANEL_WIDTH` is currently `112`** (→ `CARD_WIDTH = 293`, matching the Figma frame this card was last audited against) — still the only one of the panel's dimensions that should ever change; see the Sizing rule above.

---

### GodSvg (generic)
**File:** `src/components/gods/GodSvg.tsx`

**Props:**
```ts
interface GodSvgProps {
  svgRaw: string           // raw SVG string imported via ?raw
  angerLevel: AngerLevel
  isHovered?: boolean
  isSelected?: boolean
  eyeAnimation?: EyeAnimation
  filledEyes?: boolean     // use filled-circle eye mode — currently unused by any live caller, kept for a possible future wrathful-style mode
  eyeGlow?: boolean        // add concentric rings inside filled eyes — same, unused live
  bodyColor?: string       // override computed body color
  hideEyes?: boolean
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

**Standard eye mode (filledEyes=false) — this is the mode actually used everywhere live today:**

Inside-stroke technique using doubled `stroke-width` + `<clipPath>` to achieve an inward stroke. ClipPath IDs use `cx` value to avoid collisions (`ec-{cx}`).

| Anger  | Stroke color | Stroke weight | Selected override |
|--------|-------------|---------------|-------------------|
| high   | `#FF2435`   | 6             | `#FF2435`         |
| medium | `#EF7B2E`   | 4             | `#FF7913`         |
| low    | `#D7C94E`   | 3             | `#E7C104`         |
| none   | `#6C6C6C`   | 2             | `#000000`         |

On hover with `none` anger: eyes → `#F0F0F0`. When `isSelected`: outer glow filter applied via `feGaussianBlur` + `feComposite`.

If `eyeAnimation` is passed (non-filledEyes mode): eyes animate from `fromColor`/`fromWeight` to `toColor`/`toWeight` using CSS `@keyframes eyeShift-{id}`.

**Filled eye mode (filledEyes=true) — currently dormant, no live caller passes `filledEyes={true}`:**

Originally built for the wrathful Huitzilopochtli card and the now-archived secondary start screen. Eye color = `eyeAnimation.toColor` if provided, otherwise `eye.color`.

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
5. Add import and entry to `GOD_SVG_MAP` in `src/components/gods/GodCard.tsx`
6. Add the god to `GODS` array in `src/data/gods.ts`

**Rule: no placeholder SVGs.** Never map a god's ID to another god's SVG file. If the real SVG doesn't exist yet, skip steps 5–6 entirely until it does.

---

### RingedIcon
**File:** `src/components/icons/RingedIcon.tsx`

**Props:**
```ts
interface RingedIconProps {
  size?: number        // default 44 — the resource bar's Temple/Grand Temple size
  borderColor?: string // default COLORS.gray30
  children: React.ReactNode
}
```

**Renders:** a thin-bordered (`1.5px solid borderColor`) circle (`border-radius: 50%`) wrapping a smaller icon passed as `children` — the resource bar's Temple/Grand Temple treatment, reused wherever a ritual/sacred-site icon needs this delicate ringed look instead of a bare glyph. Used in `HomeScreen.tsx`'s `HomeSiteItem`, `RitualCard.tsx`'s ritual-site row, and `GodCard.tsx`'s chosen-ritual duration row.

**Hard rule: the ring's `borderColor` and the wrapped icon's own `color` prop must always match.** They're two separate props (the ring doesn't read the icon's color automatically), so every call site passes the same value to both — e.g. `<RingedIcon borderColor={COLORS.gray80}><PyramidIcon color={COLORS.gray80} /></RingedIcon>`. If you brighten/darken one, brighten/darken the other in the same edit, or the ring and glyph drift out of sync.

**Never hand-roll this pattern inline** (a raw `<div>` with `borderRadius: '50%'` and a manual border) — import `RingedIcon` instead, same reasoning as the `EYE` table above: this shape had been duplicated inline before being consolidated into one component.

---

### RitualCard
**File:** `src/components/ritual/RitualCard.tsx`

**Props:**
```ts
interface RitualCardProps {
  ritual: Ritual
  isSelected: boolean
  onClick: () => void
  isActive?: boolean
  onHoverChange?: (isHovered: boolean) => void
  godName?: string
  wrathful?: boolean
  overrideOutcome?: string
  overrideParticipants?: Ritual['participants']
  overrideSite?: Ritual['sacredSite']
  overrideDuration?: string
  isCompact?: boolean
  footer?: React.ReactNode
  // When true, border is always the ritual's own outcome-eye color, ignoring
  // selected/active/hover/wrathful — used at drag-source call sites (the
  // HomeGodDetailPanel row/drop-zone), where "selected" has no meaning.
  outcomeBorder?: boolean
}
```

**Renders (default, non-`isCompact` branch)** — width is controlled by the parent (`HomeGodDetailPanel` uses `RITUAL_CARD_WIDTH = 245px`), `height: auto`, `borderRadius: 14px`, `padding: 16px 20px`, a single flex column with `gap: 8px` (re-audited against Figma node `240:4013` on 2026-07-02 — this flat single-gap list, not per-section padding, is what keeps the card short enough to fit 3-in-a-row without the panel overflowing 100vh). Children in order:
1. **Title** — `ritual.name`, Spectral 16px light
2. **"Cost" label** — 10px uppercase, 30% opacity
3. **Four `RitualParticipantPill` rows** (`variant="card"`) — Prisoners → Volunteers → Children → Virgins, each with its own `label` prop now (icon + type name on the left, value right-aligned; unused types show `—` at 32% opacity). Every pill lives directly in the card's flex column, not in its own nested sub-list.
4. **"Ritual Site" label** + a row with `PyramidIcon` (26px) + `"{site.name} / {duration}"`
5. Optional `footer`
6. **Divider** — full-width 1px line, no extra margin (just another flex-column child)
7. **Effect row** — "Effect" label (flex:1) + outcome eye circle (20px, `outcomeEye()` lookup) + outcome label ("Furious"/"Offended"/"Uneasy"/"Peaceful")

**Border:** `outcomeBorder` → `1px solid {eye.color}` (matches Figma's per-card colored border — each of the 3 example cards in node `240:4013` has a different solid border color equal to its own outcome-eye color). Otherwise the pre-existing selected/hover/wrathful white-border logic.

**Outcome eye:** `boxShadow: inset 0 0 0 {weight}px {color}`, circle is **20px** in this component specifically. The ritual's `outcomeColor` data field (`#c8322e`/`#d4662a`/`#d4a83c`/other — the ANGER-token palette) is NOT the rendered color — it's looked up via `outcomeEye()` in `RitualCard.tsx` to the actual rendered color/weight, which is the same "Standard eye mode" table the real god SVG eyes use (see GodSvg section above):
- `outcomeColor #c8322e` → renders `#FF2435` / weight 6 → label "Furious"
- `outcomeColor #d4662a` → renders `#EF7B2E` / weight 4 → label "Offended"
- `outcomeColor #d4a83c` → renders `#D7C94E` / weight 3 → label "Uneasy"
- default → renders `#ffffff` / weight 2 → label "Peaceful"

**Do not confuse the data-layer ANGER palette (`#c8322e`/`#d4662a`/`#c8a83c`, used for `god.angerColor`/`ritual.outcomeColor` data fields and small list dots in `CalendarScreen.tsx`/`DashboardScreen.tsx`) with the render-layer eye palette (`#FF2435`/`#EF7B2E`/`#D7C94E`/`#6C6C6C`, weights 6/4/3/2) used for actual circle/eye visuals.** Any new standalone anger/outcome circle (icon + label, not a small list dot) must use the render-layer palette, sized **18px** to match the real god SVG eye's hole-to-ring ratio exactly (`r="9"` circle, doubled-stroke-width + clipPath technique — see GodSvg section). This RitualCard instance uses 20px because it predates that rule; don't copy its size for new circles, only its color/weight lookup. Note: `outcomeEye()` is also re-exported from `GodCard.tsx` for use in `HomeScreen.tsx` — there are two independent local implementations, kept in sync by convention rather than a shared import.

**Participant display order:** Prisoners → Volunteers → Children → Virgins

**`isCompact` branch is a separate, unrelated render path** — "the ritual panel," a different fixed-height (200px) horizontal-row card used elsewhere. Don't conflate the two or edit both for a change meant for only one — see [[feedback_ritual_card_vs_panel]].

---

### RitualSacrificeOverlay
**File:** `src/components/ritual/RitualSacrificeOverlay.tsx`

**Props:**
```ts
interface RitualSacrificeOverlayProps {
  counts: Record<'prisoners' | 'volunteers' | 'children' | 'virgins', number>
  onComplete: () => void
}
```

**Renders:** A full-screen drag-and-drop interaction triggered from `HomeScreen.tsx` after clicking "Authorize All Selected Rituals" — **not** a passive animated cutscene. The player drags victim-type icons (Prisoners/Volunteers/Children/Virgins, in that order) onto a Chichen Itza temple graphic to confirm the sacrifice; `onComplete` fires once all victims are placed, at which point `HomeScreen` deducts the cost from spent resources. Has its own drop-margin tolerance (`DROP_MARGIN`) and short return/absorb animation timings (`RETURN_DURATION`, `ABSORB_DURATION`) for icons that miss the drop target.

---

## Design Tokens (src/tokens.ts)

**Never hardcode a color value if one of these names already covers it.** This is the actual, current palette — every entry is a value already reused across multiple live components (verified by grepping the codebase, not aspirational).

**Names are based on the color's actual grayscale value (a rounded lightness percentage), not on what it's currently used for** — a color's role can shift between contexts (a border today might become a hover-text color tomorrow) but its value doesn't, so naming by value keeps the name accurate forever. `black` and `white` are the two perceptual anchors (the app's dominant near-black background and its dominant full-bright text/highlight color) — neither is the literal `#000000`/`#ffffff` extreme. `gray0` is reserved for true, literal black.

**This is an ordered scale, darkest to brightest — `gray0 → cardBg → black → gray15 → gray18 → gray20 → gray30 → gray40 → gray60 → gray95 → white`.** When the user says "make it brighter"/"darker" (or "much brighter" for 2+ steps), move along this list to the next/previous key. Never compute a new in-between hex.

```ts
COLORS = {
  gray0: '#000000',   // true black — text/icons needing full contrast on a light surface
  cardBg: '#151515',  // GodCard background — slightly darker than the app background
  black: '#1A1A1A',   // the app's "black" — viewport/page background
  gray15: '#262626',  // GodCard's default border
  gray18: '#2e2e2e',  // ritual panel fill when hovered/highlighted
  gray20: '#333333',  // standard structural divider/border (nav strip, panel dividers, resource bar)
  gray30: '#4d4d4d',  // card/panel border, and default icon/text tone, when hovered or selected
  gray40: '#6C6C6C',  // default god name / muted label text
  gray60: '#999999',  // ritual-panel content on hover (deliberately not full white)
  gray95: '#F0F0F0',  // name/body text when a card is hovered or selected
  white: '#ffffff',   // the app's "white" — full brightness, dominant text/highlight color
}
```

If you need a color and none of these fit, that's a real one-off — don't force it into this list, and don't invent a near-duplicate of an existing value either (e.g. don't add a new `#262525` entry when `gray15: '#262626'` is already close enough).

```ts
ANGER = {
  high: '#c8322e',
  medium: '#d4662a',
  low: '#c8a83c',
}

EYE = {
  high:   { color: '#FF2435', weight: 6 },
  medium: { color: '#EF7B2E', weight: 4 },
  low:    { color: '#D7C94E', weight: 3 },
  none:   { color: '#6C6C6C', weight: 2 },
}
```

**`ANGER` is data-layer only** — `god.angerColor` / `ritual.outcomeColor`, and the small 16px list dots in `CalendarScreen.tsx`/`DashboardScreen.tsx`. It is NOT the color used to render any anger/outcome eye circle.

**`EYE` is the render-layer palette** — the single source of truth for what color/weight an anger-level eye or outcome circle actually draws (`GodSvg`'s real god eyes, `RitualCard`'s/`GodCard`'s outcome eye, `HomeScreen.tsx`'s anger-group titles). `GodSvg.tsx`, `GodCard.tsx`, and `RitualCard.tsx` all import this one constant now — previously each file had its own hand-copied version of this exact lookup table, which is exactly the kind of repeated mistake this doc exists to prevent. **If you ever find yourself typing `{ color: '#FF2435', weight: 6 }` (or any of the other three rows) directly in a new file, stop — import `EYE` from `tokens.ts` instead.** Never substitute the data-layer `ANGER` hex into a rendered circle.

```ts
FONTS = {
  spectral: "'Spectral', Georgia, serif",
}

SPACING = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', xxl: '32px',
}
```

**Type scale — same step-along-the-scale rule applies to "bigger"/"smaller" and "bolder"/"lighter" requests:**

```ts
FONT_SIZE = {
  xs: '10px', // fine print / small labels
  sm: '12px', // secondary/dim text
  md: '14px', // default body text
  lg: '16px', // emphasized body text, buttons
  xl: '20px', // headings, large stat numbers
}

FONT_WEIGHT = {
  light: 300,   // body text (Spectral default)
  regular: 400, // headings, god names
  medium: 500,  // small emphasis labels
}
```

`FONT_SIZE` order: `xs → sm → md → lg → xl`. `FONT_WEIGHT` order: `light → regular → medium`. **Never go above `regular` (400) for god names specifically** — see Typography Rules. `SPACING`'s order (`xs → sm → md → lg → xl → xxl`) is the same kind of scale for gaps/padding when asked to make something "tighter" or "more spaced out."

`tokens.ts` also exports a `RitualScreenMode = 'ritual' | 'expanded'` type and `LAYOUT`/`RESOURCE_TOTALS` constants. `RitualScreenMode` is now only passed as a hardcoded `ritualMode="expanded"` prop to `AiChat` (it only affects `AiChat`'s own bottom offset) — it is **not** a toggleable dual-layout system anymore; that was the archived `MiddleSection` design.

**Wrathful color** (not in tokens, use directly): `#FF2435`

**Note on existing code:** this palette was curated from real usage on 2026-06-21 — older code (most of `src/components/*`) still has hardcoded hex values that predate it and haven't been retrofitted. Don't treat their literal hex values as precedent for new code; use the names above instead.

---

## Typography Rules

- **God names:** `FONTS.spectral`, ALWAYS uppercase (`textTransform: 'uppercase'`), weight 400 (NOT bold)
- **Headings:** `FONTS.spectral`, uppercase, `textBase`
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
3. **More appeasement = more sacrifice** — cost (participant total) always strictly increases Basic < Major < Supreme, never flat or inverted.
4. **Batching up should always be worth it — cost scaling is capped, not "same outcome = same cost."** Major ritual cost must stay under 2× the Basic ritual's cost, and Supreme under 3× — in practice, rebalanced (2026-07-05) to Major ≈ 1.7× Basic and Supreme ≈ 2.6× Basic for every god, uniformly, regardless of whether Basic/Major share the same outcome color (e.g. the "2× Uneasy" medium-anger composition below). This supersedes the older "same outcome color = similar cost" framing — that idea predates the cap and is no longer the rule to follow.

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
- Keep god names in Spectral, ALL CAPS, weight 400 (never bold)

❌ **DON'T:**
- Add headers not in Figma design
- Hardcode color/font/spacing values
- Create placeholder panels not in design
- Add `-webkit-font-smoothing: antialiased`
- Make god names bold or mixed-case

---

## Git Workflow Policy (authorized in advance)

The user has explicitly authorized autonomous git commits and pushes for this project, so Claude does **not** need to ask before each one:

- **Commit** after every logical change (a feature, fix, refactor, or other discrete piece of work) — small, frequent commits with descriptive messages, not one giant batch at the end. **Exception:** during a rapid back-and-forth on one visual element (user reacts to a screenshot, gives a one-line correction, repeat) don't commit after each correction — that's one continuous iteration, not several discrete changes. Wait until the user moves on or the result settles, then make one commit covering the whole thing.
- **Push in batches, not after every commit.** Don't push automatically after each individual commit, especially during rapid iteration (e.g. a string of small visual tweaks based on live feedback) — that creates push noise. Push at natural stopping points: a feature/fix is done and verified, the user asks, or a meaningful chunk of related commits has accumulated.
- Still never use destructive operations (`--force` push, `reset --hard`, rewriting published history, skipping hooks) without explicit confirmation — this blanket authorization covers normal commit + push only.
- If a change is exploratory/experimental and the user signals they might want to discard it, hold off on committing until that's resolved.
