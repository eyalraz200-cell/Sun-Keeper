import type { ComponentType } from 'react'
import { COLORS, FONTS, FONT_SIZE } from '../../tokens'

interface RitualParticipantPillProps {
  Icon: ComponentType<{ size?: number; color?: string }>
  active: boolean
  value: number
  // 'panel' = GodCard's tiny grid-card ritual panel (gray15/gray18 inactive tone).
  // 'card' = the full RitualCard (near-black/gray40-at-32%-opacity inactive tone).
  variant?: 'panel' | 'card'
  // Participant type name (e.g. "Prisoners") — only rendered for variant="card",
  // where it sits between the icon and the right-aligned value.
  label?: string
}

export function RitualParticipantPill({ Icon, active, value, variant = 'panel', label }: RitualParticipantPillProps) {
  const isCard = variant === 'card'
  const inactiveBg = isCard ? COLORS.black : COLORS.gray15
  const contentColor = active ? COLORS.gray80 : isCard ? COLORS.gray40 : COLORS.gray18
  const contentOpacity = active ? 1 : isCard ? 0.32 : 1
  const labelColor = active ? COLORS.gray60 : contentColor
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', boxSizing: 'border-box', padding: isCard ? '6px 6px' : '4px 6px', borderRadius: '8px', backgroundColor: active ? COLORS.gray20 : inactiveBg }}>
      <div style={{ display: 'flex', opacity: contentOpacity }}>
        <Icon size={16} color={contentColor} />
      </div>
      {isCard && label && (
        <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: labelColor, opacity: contentOpacity, flex: 1 }}>{label}</span>
      )}
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: contentColor, opacity: contentOpacity }}>{active ? value : '-'}</span>
    </div>
  )
}
