# Figma Parity Report — Home Screen

**Figma node:** 180:11840 (`MacBook Pro 14" - 5`), file `azSClyWIZyeWpGcjyMKOsT`
**Code file(s):** src/components/HomeScreen.tsx
**Audit date:** 2026-06-19

## Summary

- **Critical:** 0 drifts
- **Major:** 0 drifts
- **Minor:** 4 drifts
- **Token-level:** 0 drifts
- **Match:** 19 properties verified equal

Implementation matches the design closely on every structural and color property (card layout, borders, radius, typography, divider, resource-bar styling). The only drifts are sub-2px positioning rounding errors. Two structural differences from the Figma mock (4-column grid instead of 3, no bespoke right panel) are intentional per explicit user instruction, not drift — documented below for the record, not flagged for fixing.

---

## Minor drifts

| Element | Property | Figma | Code | Fix |
| --- | --- | --- | --- | --- |
| `HomeGodCard` divider line | left position | `167px` | `168px` (`DIVIDER_X`) | `DIVIDER_X = 167` |
| `HomeGodCard` SVG block | left position | `24px`* | `25px` | leave as-is — metadata gives `25px`, generated code rounds to `24px`; metadata is authoritative |
| `HomeResourceBar` icons | vertical center | `45px` of 88px bar (`top: calc(50%+1px)`) | `44px` (plain `alignItems: center`) | add `position: relative; top: 1px` to icon wrapper, or accept as negligible |
| `HomeResourceBar` outer padding | left `167.77px` / right `164.46px` (asymmetric) | `166px` both sides (symmetric) | `padding: '0 168px 0 164px'` for exact match, or accept symmetric approximation |

\* Figma's own generated Tailwind code and its layer metadata disagree by 1px (24 vs 25) on this node — metadata wins as ground truth, so code is actually already correct here; listed for transparency only, not a real drift.

---

## Other observations

- **4-column grid vs Figma's 3-column mock**: explicit user instruction overriding the Figma layout (9 gods → 4+4+1). Card size (255×248), card styling, and per-card content fully match the Figma `Button` node spec — only the column count changed. Grid gap (24px uniform) is a new value with no Figma equivalent to diff against, since the mock's 3-col gaps (107px horizontal / 63px vertical) don't apply to a column count the user explicitly changed.
- **No bespoke right panel**: Figma shows a blank 287px panel with a left border. Per user instruction, this slot is intentionally left to the existing global `AiChat` component (mounted in `App.tsx`, slides in at `right: 0`, width 331px) rather than building a second static panel. Confirmed visually — the AI chat trigger bubble renders in the bottom-right corner over the Home screen.
- **Top resource bar** is a new bespoke component (`HomeResourceBar`) rather than reusing the existing `ResourceBar.tsx`, because that component's visual style (inline icon+label+count row) doesn't match this screen's stacked label/count layout shown in Figma. This was a deliberate implementation choice to hit visual parity with node `180:12981`, not a drift.
- Long god names (e.g. "HUITZILOPOCHTLI") have no explicit `overflow`/`white-space` handling on the 161px name box. Renders fine at current font size in testing but has no safety net if a longer name is added later — flagging for awareness, not fixing now (not present in Figma source either).

---

## Items verified as matching

- Card: background `#181818`, border `1px solid #333333`, radius `10px`, size `255×248` ✓
- Card name: Cinzel, 400 weight, 12px, uppercase, 1px letter-spacing, color `#6c6c6c`, middle-dot (`·`) flanking characters, position (top 12px, left 6px, width 161px) ✓
- Card SVG face: 125×194px, rendered via `GodSvg` with real per-god `angerLevel` (matches Figma's gray default body / anger-colored eyes state) ✓
- Card divider: vertical line, height 225px, color `#333333` ✓ (position off by 1px, see drifts)
- Card placeholder text: "no ritual Selected", Spectral, 13px, color `#b3b3b3`, two-line wrap ✓
- Resource bar: height 88px, `border-bottom: 1px solid #333333` only (no top border), background `#181818` ✓
- Resource bar icons: 28px size, color `#acacac` ✓
- Resource bar label/value: Spectral 16px, label `#acacac`, value `#ffffff`, ~2px vertical gap between them ✓
- Resource bar icon-to-text gap: 19px ✓
- All 9 real gods rendered (not the Figma mock's repeated placeholder god) ✓
- `tsc --noEmit` passes with no type errors ✓
