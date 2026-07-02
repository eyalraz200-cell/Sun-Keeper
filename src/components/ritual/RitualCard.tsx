import { useState } from 'react'
import type { Ritual } from '../../data/gods'
import { FONTS, COLORS, EYE, FONT_SIZE, FONT_WEIGHT } from '../../tokens'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { PyramidIcon } from '../icons/PyramidIcon'
import { RingedIcon } from '../icons/RingedIcon'
import { RitualParticipantPill } from './RitualParticipantPill'

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

function outcomeLabel(color: string): string {
  if (color === '#c8322e') return 'Furious'
  if (color === '#d4662a') return 'Offended'
  if (color === '#d4a83c') return 'Uneasy'
  if (color === '#c8a83c') return 'Peaceful'
  return 'Peaceful'
}

function outcomeEye(color: string): { color: string; weight: number } {
  if (color === '#c8322e') return EYE.high
  if (color === '#d4662a') return EYE.medium
  if (color === '#d4a83c') return EYE.low
  return { color: COLORS.white, weight: 2 }
}

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
  // When true, the border is always the ritual's own outcome-eye color, regardless of
  // selected/active/hover/wrathful — used where the card is a drag source rather than a
  // click-to-select target, so "selected" no longer means anything for its border.
  outcomeBorder?: boolean
}

export function RitualCard({ ritual, isSelected, onClick, isActive = false, onHoverChange, wrathful = false, overrideOutcome, overrideParticipants, overrideSite, overrideDuration, isCompact = false, footer, outcomeBorder = false }: RitualCardProps) {
  const outcomeColor = overrideOutcome ?? ritual.outcomeColor
  const participants = overrideParticipants ?? ritual.participants
  const sacredSite = overrideSite ?? ritual.sacredSite
  const duration = overrideDuration ?? ritual.duration
  const [isHovered, setIsHovered] = useState(false)

  const compactBorderStyle = wrathful
    ? isSelected || isActive || isHovered ? '2px solid #FF2435' : '2px solid rgba(255,36,53,0.28)'
    : isSelected || isActive || isHovered ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.18)'

  const eye = outcomeEye(outcomeColor)
  const cardBg = isSelected || isActive || isHovered ? COLORS.gray15 : COLORS.black

  const borderStyle = wrathful
    ? isSelected || isActive || isHovered ? '2px solid #FF2435' : '2px solid rgba(255,36,53,0.28)'
    : isSelected || isActive || isHovered ? `2px solid ${COLORS.gray95}` : '2px solid rgba(255,255,255,0.18)'

  // Figma fades the outcome-color border from a low-opacity tint at the top edge
  // down to gray at the bottom — same opacity/endpoint convention GodCard.tsx's
  // chosen-ritual gradient border uses, not a full-opacity color.
  const borderGradient = outcomeBorder
    ? `linear-gradient(to bottom, ${hexToRgba(eye.color, eye.color === COLORS.white ? 0.8 : 0.5)}, ${COLORS.gray30})`
    : null

  if (isCompact) {
    const participantItems = [
      { key: 'prisoners' as const,  label: 'Prisoners',  icon: <PrisonerIcon  size={13} color="rgba(255,255,255,0.65)" /> },
      { key: 'volunteers' as const, label: 'Volunteers', icon: <VolunteerIcon size={13} color="rgba(255,255,255,0.65)" /> },
      { key: 'children' as const,   label: 'Children',   icon: <ChildrenIcon  size={13} color="rgba(255,255,255,0.65)" /> },
      { key: 'virgins' as const,    label: 'Virgins',    icon: <VirginIcon    size={13} color="rgba(255,255,255,0.65)" /> },
    ]

    const labelStyle: React.CSSProperties = {
      fontFamily: FONTS.spectral,
      fontSize: FONT_SIZE.md,
      fontWeight: FONT_WEIGHT.light,
      color: 'rgba(255,255,255,0.45)',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }

    return (
      <button
        onClick={onClick}
        onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true) }}
        onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false) }}
        style={{
          width: '100%',
          height: '200px',
          padding: '0',
          backgroundColor: COLORS.black,
          border: compactBorderStyle,
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          textAlign: 'left',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Name */}
        <div style={{ flex: 1, padding: '0 18px', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <span style={{ fontFamily: FONTS.spectral, fontWeight: FONT_WEIGHT.light, fontSize: FONT_SIZE.lg, color: isSelected || isActive || isHovered ? COLORS.white : 'rgba(255,255,255,0.82)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {ritual.name}
          </span>
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '18px',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: isSelected || isActive ? COLORS.white : 'transparent',
            border: '1.5px solid',
            borderColor: isSelected || isActive ? COLORS.white : 'rgba(255,255,255,0.25)',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
            flexShrink: 0,
          }} />
        </div>

        <div style={{ height: '1px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

        {/* Price row */}
        <div style={{ flex: 1, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Price</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            {participantItems.map(({ key, icon }) => {
              const active = participants[key] > 0
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: active ? 1 : 0.12 }}>
                  {icon}
                  <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>
                    {active ? participants[key] : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ height: '1px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

        {/* Details row */}
        <div style={{ flex: 1, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Details</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>{sacredSite.name}</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>{duration}</span>
          </div>
        </div>

        <div style={{ height: '1px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

        {/* Appeases to row */}
        <div style={{ flex: 1, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Appeases to</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'transparent', boxShadow: `inset 0 0 0 ${eye.weight}px ${eye.color}`, flexShrink: 0 }} />
            <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>
              {outcomeLabel(outcomeColor)}
            </span>
          </div>
        </div>
      </button>
    )
  }

  const sectionLabelStyle: React.CSSProperties = { fontFamily: FONTS.spectral, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.regular, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true) }}
      onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false) }}
      style={{
        width: '100%',
        height: 'auto',
        padding: '19px 20px',
        border: borderGradient ? '1px solid transparent' : borderStyle,
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '12px',
        opacity: 1,
        textAlign: 'left',
        ...(borderGradient
          ? {
              backgroundImage: `linear-gradient(${cardBg}, ${cardBg}), ${borderGradient}`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }
          : { backgroundColor: cardBg }),
      }}
    >
      <h3 style={{ fontFamily: FONTS.spectral, fontWeight: FONT_WEIGHT.light, fontSize: FONT_SIZE.lg, color: isSelected || isActive || isHovered ? COLORS.white : 'rgba(255,255,255,0.82)', margin: '0', textAlign: 'left' }}>
        {ritual.name}
      </h3>

      <span style={sectionLabelStyle}>Cost</span>
      {([
        { key: 'prisoners', label: 'Prisoners', Icon: PrisonerIcon },
        { key: 'volunteers', label: 'Volunteers', Icon: VolunteerIcon },
        { key: 'children', label: 'Children', Icon: ChildrenIcon },
        { key: 'virgins', label: 'Virgins', Icon: VirginIcon },
      ] as const).map(({ key, label, Icon }) => (
        <RitualParticipantPill key={key} Icon={Icon} label={label} active={participants[key] > 0} value={participants[key]} variant="card" />
      ))}

      <span style={sectionLabelStyle}>Ritual Site</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <RingedIcon size={26}>
          <PyramidIcon size={16} color={COLORS.white} />
        </RingedIcon>
        <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>{sacredSite.name} / {duration}</span>
      </div>

      {footer && (
        <div onClick={e => e.stopPropagation()}>
          {footer}
        </div>
      )}

      <div style={{ height: '1px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.06)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ flex: 1, ...sectionLabelStyle }}>Effect</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            boxShadow: `inset 0 0 0 ${eye.weight}px ${eye.color}`,
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>
            {outcomeLabel(outcomeColor)}
          </span>
        </div>
      </div>
    </button>
  )
}
