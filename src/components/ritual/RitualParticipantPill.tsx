import type { ComponentType } from 'react'
import { COLORS, FONTS, FONT_SIZE } from '../../tokens'

interface RitualParticipantPillProps {
  Icon: ComponentType<{ size?: number; color?: string }>
  active: boolean
  value: number
  // 'panel' = GodCard's tiny grid-card ritual panel (gray15/gray18 inactive tone).
  // 'card' = the full RitualCard (near-black/gray40-at-32%-opacity inactive tone).
  variant?: 'panel' | 'card'
}

export function RitualParticipantPill({ Icon, active, value, variant = 'panel' }: RitualParticipantPillProps) {
  const inactiveBg = variant === 'card' ? COLORS.black : COLORS.gray15
  const contentColor = active ? COLORS.white : variant === 'card' ? COLORS.gray40 : COLORS.gray18
  const contentOpacity = active ? 1 : variant === 'card' ? 0.32 : 1
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', boxSizing: 'border-box', padding: '4px 6px', borderRadius: '8px', backgroundColor: active ? COLORS.gray20 : inactiveBg }}>
      <div style={{ display: 'flex', opacity: contentOpacity }}>
        <Icon size={16} color={contentColor} />
      </div>
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: contentColor, opacity: contentOpacity }}>{active ? value : '-'}</span>
    </div>
  )
}
