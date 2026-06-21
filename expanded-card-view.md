# Expanded Card View

On the overview screen (`HomeScreen.tsx`), clicking a god card (`HomeGodCard`) sets `selectedGodId` and swaps the grid for `HomeGodDetailPanel`:

- Larger god SVG (320px × 488px) on the left
- The god's 3 ritual cards on the right (`RitualCardWithChoose`)
- Clicking the god name/back area (`onBack`) returns to the grid

Note: `HomeGodCard` and `HomeGodDetailPanel` are defined locally in `HomeScreen.tsx` — they are separate from the shared `GodCard.tsx` component used in the sidebar `GodList`.
