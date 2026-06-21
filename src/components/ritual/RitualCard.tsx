import { useState } from 'react'
import type { Ritual } from '../../data/gods'
import { FONTS } from '../../tokens'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'

function outcomeLabel(color: string): string {
  if (color === '#c8322e') return 'Furious'
  if (color === '#d4662a') return 'Offended'
  if (color === '#d4a83c') return 'Uneasy'
  if (color === '#c8a83c') return 'Peaceful'
  return 'Peaceful'
}

function outcomeEye(color: string): { color: string; weight: number } {
  if (color === '#c8322e') return { color: '#FF2435', weight: 6 }
  if (color === '#d4662a') return { color: '#EF7B2E', weight: 4 }
  if (color === '#d4a83c') return { color: '#D7C94E', weight: 3 }
  return { color: '#ffffff', weight: 2 }
}

interface RitualCardProps {
  ritual: Ritual
  isSelected: boolean
  onClick: () => void
  isActive?: boolean
  onHoverChange?: (isHovered: boolean) => void
  godName: string
  wrathful?: boolean
  overrideOutcome?: string
  overrideParticipants?: Ritual['participants']
  overrideSite?: Ritual['sacredSite']
  overrideDuration?: string
  isCompact?: boolean
  footer?: React.ReactNode
}

export function RitualCard({ ritual, isSelected, onClick, isActive = false, onHoverChange, wrathful = false, overrideOutcome, overrideParticipants, overrideSite, overrideDuration, isCompact = false, footer }: RitualCardProps) {
  const outcomeColor = overrideOutcome ?? ritual.outcomeColor
  const participants = overrideParticipants ?? ritual.participants
  const sacredSite = overrideSite ?? ritual.sacredSite
  const duration = overrideDuration ?? ritual.duration
  const [isHovered, setIsHovered] = useState(false)

  const borderStyle = wrathful
    ? isSelected || isActive || isHovered ? '2px solid #FF2435' : '2px solid rgba(255,36,53,0.28)'
    : isSelected || isActive || isHovered ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.18)'

  const eye = outcomeEye(outcomeColor)

  if (isCompact) {
    const participantItems = [
      { key: 'prisoners' as const,  label: 'Prisoners',  icon: <PrisonerIcon  size={13} color="rgba(255,255,255,0.65)" /> },
      { key: 'volunteers' as const, label: 'Volunteers', icon: <VolunteerIcon size={13} color="rgba(255,255,255,0.65)" /> },
      { key: 'children' as const,   label: 'Children',   icon: <ChildrenIcon  size={13} color="rgba(255,255,255,0.65)" /> },
      { key: 'virgins' as const,    label: 'Virgins',    icon: <VirginIcon    size={13} color="rgba(255,255,255,0.65)" /> },
    ]

    const labelStyle: React.CSSProperties = {
      fontFamily: FONTS.spectral,
      fontSize: '14px',
      fontWeight: 300,
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
          backgroundColor: '#181818',
          border: borderStyle,
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
          <span style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '18px', color: isSelected || isActive || isHovered ? '#ffffff' : 'rgba(255,255,255,0.82)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
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
            backgroundColor: isSelected || isActive ? '#ffffff' : 'transparent',
            border: '1.5px solid',
            borderColor: isSelected || isActive ? '#ffffff' : 'rgba(255,255,255,0.25)',
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
                  <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>
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
            <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>{sacredSite.name}</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>{duration}</span>
          </div>
        </div>

        <div style={{ height: '1px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

        {/* Appeases to row */}
        <div style={{ flex: 1, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Appeases to</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'transparent', boxShadow: `inset 0 0 0 ${eye.weight}px ${eye.color}`, flexShrink: 0 }} />
            <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>
              {outcomeLabel(outcomeColor)}
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true) }}
      onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false) }}
      style={{
        width: '100%',
        height: 'auto',
        padding: '0',
        backgroundColor: '#181818',
        border: borderStyle,
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        opacity: 1,
        textAlign: 'left',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
      }}
    >
      {/* Title */}
      <div style={{ padding: '20px 24px 8px' }}>
        <h3 style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '18px', color: isSelected || isActive || isHovered ? '#ffffff' : 'rgba(255,255,255,0.82)', margin: '0', textAlign: 'left' }}>
          {ritual.name}
        </h3>
      </div>

      {/* Price section */}
      <div style={{ padding: '12px 24px 0' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '10px', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '12px' }}>Cost</span>
        {([
          { key: 'prisoners', label: 'Prisoners',  icon: <PrisonerIcon size={13} color="rgba(255,255,255,0.65)" /> },
          { key: 'volunteers',label: 'Volunteers', icon: <VolunteerIcon size={13} color="rgba(255,255,255,0.65)" /> },
          { key: 'children',  label: 'Children',  icon: <ChildrenIcon size={13} color="rgba(255,255,255,0.65)" /> },
          { key: 'virgins',   label: 'Virgins',   icon: <VirginIcon size={13} color="rgba(255,255,255,0.65)" /> },
        ] as const).map(({ key, label, icon }, i, arr) => {
          const active = participants[key] > 0
          return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < arr.length - 1 ? '8px' : 0, opacity: active ? 1 : 0.12 }}>
            {icon}
            <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>{active ? participants[key] : '—'}</span>
          </div>
          )
        })}
      </div>

      {/* Sacrificial Site section */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '10px', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Site</span>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>{sacredSite.name} / {duration}</span>
        </div>
      </div>

      {footer && (
        <div onClick={e => e.stopPropagation()} style={{ padding: '24px 24px 0' }}>
          {footer}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '20px 13px' }} />

      {/* Outcome section */}
      <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '10px', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Effect</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            boxShadow: `inset 0 0 0 ${outcomeEye(outcomeColor).weight}px ${outcomeEye(outcomeColor).color}`,
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>
            {outcomeLabel(outcomeColor)}
          </span>
        </div>
      </div>

    </button>
  )
}
