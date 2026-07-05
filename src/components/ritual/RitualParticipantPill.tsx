import type { ComponentType } from 'react'
import { COLORS, FONTS, FONT_SIZE } from '../../tokens'

interface RitualParticipantPillProps {
  Icon: ComponentType<{ size?: number; color?: string }>
  active: boolean
  value: number
  // 'panel' = GodCard's tiny grid-card ritual panel (black/gray18 inactive tone).
  // 'card' = the full RitualCard (near-black/gray40-at-32%-opacity inactive tone).
  variant?: 'panel' | 'card'
  // Participant type name (e.g. "Prisoners") — only rendered for variant="card",
  // where it sits between the icon and the right-aligned value.
  label?: string
  // Light-mode preview (GodCard's CTA-hover reskin) — inverts the whole dark-on-black scheme
  // to a light-on-white one, mirroring each dark tone with its equivalent light-mode tone
  // rather than a literal CSS color-invert.
  light?: boolean
  // True when the card as a whole is unaffordable — steps the active value color down from its
  // usual near-white so it doesn't stay the brightest thing on an otherwise-dimmed card.
  muted?: boolean
  // Overrides the displayed number with a live/tweened value (HomeScreen's ritual-authorization
  // drain sequence, driven by GodCard's own local tween) without touching any of the styling
  // above, which stays keyed off the real `active`/`value` the whole time. Renders nothing (not
  // "0", not the inactive "-" dash) once the tweened value reaches 0 — this pill has no other way
  // to reach that state today. Undefined (the default) reproduces the exact `active ? value : '-'`
  // display every other caller already relies on.
  liveValue?: number
  // Rounds the displayed (static) value up to the nearest 10 — every participant type except
  // virgins, whose counts are small single digits (1–7) that would round up to a misleadingly
  // large "10". Only affects display; the real value still drives everything else (cost totals,
  // resource deduction, `active`).
  round?: boolean
  // True when this specific resource type doesn't have enough available to cover the ritual's
  // cost — draws a bright stroke around just this pill so it's clear which resource is the one
  // actually blocking the ritual, even though the whole card already dims via `muted` above.
  insufficient?: boolean
}

export function RitualParticipantPill({ Icon, active, value, variant = 'panel', label, light = false, muted = false, liveValue, round = false, insufficient = false }: RitualParticipantPillProps) {
  const isCard = variant === 'card'
  // Inactive pills are completely unaffected by `light` — they stay exactly as they looked before
  // the CTA hover; only active/relevant pills react to it.
  const inactiveBg = isCard ? COLORS.gray13 : COLORS.black
  const activeBg = light ? COLORS.white : '#2b2b2b'
  const inactiveContentColor = isCard ? COLORS.gray40 : COLORS.gray18
  const contentColor = active ? (light ? COLORS.gray0 : COLORS.gray80) : inactiveContentColor
  const contentOpacity = active ? 1 : isCard ? 0.32 : 1
  const labelColor = active ? (light ? COLORS.gray30 : COLORS.gray80) : contentColor
  const valueColor = active ? (light ? COLORS.gray0 : muted ? COLORS.gray60 : COLORS.gray95) : contentColor
  // ' ' (not '') once drained — a truly empty span has no text to establish its own
  // line-height, so the pill's height (set by align-items:center + the tallest child) collapses
  // down to just the icon's height the moment the number disappears. A non-breaking space is
  // invisible but keeps the same line box a real digit would, so the pill's height never changes.
  const roundedValue = round ? Math.ceil(value / 10) * 10 : value
  const displayValue = liveValue !== undefined ? (liveValue > 0 ? liveValue : ' ') : (active ? roundedValue : '-')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', boxSizing: 'border-box', padding: isCard ? '6px 8px' : '4px 6px', borderRadius: '8px', border: `1px solid ${insufficient ? COLORS.gray40 : 'transparent'}`, backgroundColor: active ? activeBg : inactiveBg, transition: 'background-color 0.4s ease, border-color 0.4s ease' }}>
      <div style={{ display: 'flex', opacity: contentOpacity, transition: 'opacity 0.4s ease' }}>
        <Icon size={16} color={contentColor} />
      </div>
      {isCard && label && (
        <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: labelColor, opacity: contentOpacity, flex: 1, transition: 'color 0.4s ease, opacity 0.4s ease' }}>{label}</span>
      )}
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: valueColor, opacity: contentOpacity, fontVariantNumeric: 'tabular-nums', transition: 'color 0.4s ease, opacity 0.4s ease' }}>{displayValue}</span>
    </div>
  )
}
