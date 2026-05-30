import { useState } from 'react'
import type { Ritual } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { ChildrenIcon } from './ChildrenIcon'
import { VirginIcon } from './VirginIcon'
import { PrisonerIcon } from './PrisonerIcon'
import { VolunteerIcon } from './VolunteerIcon'

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
}

export function RitualCard({ ritual, isSelected, onClick, isActive = false, onHoverChange, godName }: RitualCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true) }}
      onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false) }}
      style={{
        width: '100%',
        height: '488px',
        padding: '0',
        backgroundColor: '#181818',
        border: isSelected || isActive ? '2px solid #ffffff' : isHovered ? '2px solid rgba(255,255,255,0.35)' : '2px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        opacity: 1,
        textAlign: 'left',
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
      }}
    >
      {/* Title + Description — fixed height so middle section always aligns */}
      <div style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', padding: '0 24px' }}>
        <h3 style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '18px', color: isSelected || isActive || isHovered ? '#ffffff' : 'rgba(255,255,255,0.82)', margin: '0', textAlign: 'center' }}>
          {ritual.name}
        </h3>
        <p style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '12px', color: isSelected || isActive ? 'rgba(255,255,255,0.5)' : isHovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)', textAlign: 'center', margin: '8px 0 0', padding: '0', lineHeight: '1.4' }}>
          {ritual.description}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

      {/* Price section */}
      <div style={{ padding: '20px 24px 0' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '10px', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '12px' }}>Cost</span>
        {([
          { key: 'prisoners', label: 'Prisoners',  icon: <PrisonerIcon size={13} color="rgba(255,255,255,0.65)" /> },
          { key: 'volunteers',label: 'Volunteers', icon: <VolunteerIcon size={13} color="rgba(255,255,255,0.65)" /> },
          { key: 'children',  label: 'Children',  icon: <ChildrenIcon size={13} color="rgba(255,255,255,0.65)" /> },
          { key: 'virgins',   label: 'Virgins',   icon: <VirginIcon size={13} color="rgba(255,255,255,0.65)" /> },
        ] as const).map(({ key, label, icon }, i, arr) => {
          const active = ritual.participants[key] > 0
          return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < arr.length - 1 ? '8px' : 0, opacity: active ? 1 : 0.12 }}>
            {icon}
            <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>{active ? ritual.participants[key] : '—'}</span>
          </div>
          )
        })}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '20px 13px' }} />

      {/* Sacrificial Site section */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.45)' }}>Site</span>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>{ritual.sacredSite.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.45)' }}>Duration</span>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>{ritual.duration}</span>
        </div>
      </div>

      {/* Divider + Outcome pinned to bottom */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px', marginTop: 'auto' }} />

      {/* Outcome section */}
      <div style={{ padding: '20px 24px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.45)' }}>God's state change</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            boxShadow: `inset 0 0 0 ${outcomeEye(ritual.outcomeColor).weight}px ${outcomeEye(ritual.outcomeColor).color}`,
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>
            {outcomeLabel(ritual.outcomeColor)}
          </span>
        </div>
      </div>

    </button>
  )
}
