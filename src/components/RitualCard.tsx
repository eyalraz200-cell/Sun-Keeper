import { useState } from 'react'
import type { Ritual } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { Link, SunDim, Clock } from '@phosphor-icons/react'

function outcomeLabel(color: string): string {
  if (color === '#c8322e') return 'Angry'
  if (color === '#d4662a') return 'Uneasy'
  if (color === '#c8a83c') return 'Peaceful'
  return 'Peaceful'
}

interface RitualCardProps {
  ritual: Ritual
  isSelected: boolean
  onClick: () => void
}

export function RitualCard({ ritual, isSelected, onClick }: RitualCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        minHeight: '560px',
        padding: '0',
        backgroundColor: '#181818',
        border: isSelected ? '2px solid #ffffff' : isHovered ? '2px solid rgba(255,255,255,0.35)' : '2px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        opacity: 1,
        textAlign: 'left',
      }}
    >
      {/* Title */}
      <h3 style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '16px', color: '#ffffff', margin: '0', padding: '24px 24px 0', textAlign: 'center' }}>
        {ritual.name}
      </h3>

      {/* Description - centered */}
      <p style={{ fontFamily: FONTS.spectral, fontSize: '12px', color: 'rgba(255,255,255,0.64)', textAlign: 'center', margin: '12px 24px 0', padding: '0', lineHeight: '1.4' }}>
        {ritual.description}
      </p>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: COLORS.border, margin: '12px 0' }} />

      {/* Price section */}
      <div style={{ padding: '0 24px' }}>
        <p style={{ fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px 0' }}>Price</p>
        {/* Volunteers row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Link size={16} color="rgba(255,255,255,0.5)" />
          <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Volunteers</span>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '12px', color: '#ffffff' }}>{ritual.participants.volunteers}</span>
        </div>
        {/* Virgins row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SunDim size={16} color="rgba(255,255,255,0.5)" />
          <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Virgins</span>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '12px', color: '#ffffff' }}>{ritual.participants.virgins}</span>
        </div>
      </div>

      {/* Duration section */}
      <div style={{ padding: '12px 24px 0' }}>
        <p style={{ fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px 0' }}>Duration</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="rgba(255,255,255,0.5)" />
          <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{ritual.schedule}</span>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{ritual.duration}</span>
        </div>
      </div>

      {/* Divider + Outcome pinned to bottom */}
      <div style={{ height: '1px', backgroundColor: COLORS.border, margin: '12px 0 0', marginTop: 'auto' }} />

      {/* Outcome section - centered */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '8px 24px 24px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Outcome</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: ritual.outcomeColor, flexShrink: 0 }} />
          <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>
            {outcomeLabel(ritual.outcomeColor)}
          </span>
        </div>
      </div>

    </button>
  )
}
