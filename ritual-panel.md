# Ritual Panel

The "card within a card" on the right side of `GodCard.tsx` (`src/components/GodCard.tsx`).

- Positioned `left: INNER_CARD_LEFT`, `right: RITUAL_PANEL_RIGHT_GAP (12px)`, `top/bottom: 14px` inside the outer god card
- Own border + `borderRadius: 10px`, matching the outer card's border color/highlight state
- Two states:
  - **No ritual selected**: fire icon + "No Ritual" / "Selected" text, centered — `#4d4d4d` default, `#999999` on hover/selected (never white)
  - **Ritual chosen**: participant icons/counts, sacred site, duration, divider, outcome circle

`INNER_CARD_LEFT` is derived from `FACE_LEFT + FACE_WIDTH + FACE_TO_CARD_GAP` — the gap between the god's face and the ritual panel always matches the card's left padding.

**Sizing rule:** both the gap from the face (left edge) AND the gap from the card's right edge (`RITUAL_PANEL_RIGHT_GAP`) are fixed and must never be touched to resize the panel. `RITUAL_PANEL_WIDTH` is the only thing that changes — `CARD_WIDTH` is *derived* from `INNER_CARD_LEFT + RITUAL_PANEL_WIDTH + RITUAL_PANEL_RIGHT_GAP`, so the outer `GodCard` itself grows/shrinks to fit, instead of either gap ever changing.

**Hover transition:** the panel's border-color and background-color change **instantly** on hover (no `transition` property) — border goes `#333333` → `#808080`, fill goes `transparent` → `#2e2e2e`. This matches the god's face (`GodSvg`), which also snaps instantly because it's raw SVG markup with the color baked into each `fill="..."` attribute, not a CSS-transitionable property. The outer `GodCard` no longer scales on hover (removed) — its border also brightens instantly, but by a smaller step: `#333333` → `#4d4d4d`.

**Content color on hover:** the fire icon and "No Ritual Selected" text brighten from `#4d4d4d` to `#999999` on hover/selected — deliberately NOT white, unlike the border/fill above.
