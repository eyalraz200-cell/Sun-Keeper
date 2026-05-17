import type { Ritual } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { Link, SunDim, Clock } from '@phosphor-icons/react'

interface RitualCardProps {
  ritual: Ritual
  isSelected: boolean
  onClick: () => void
}

export function RitualCard({ ritual, isSelected, onClick }: RitualCardProps) {
  const handleClick = () => {
    if (ritual.available) {
      onClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!ritual.available}
      style={{
        width: '100%',
        padding: '0',
        backgroundColor: '#232323',
        border: isSelected ? `2px solid ${ritual.outcomeColor}` : '2px solid rgba(255,255,255,0.18)',
        borderRadius: '14px',
        cursor: ritual.available ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        opacity: ritual.available ? 1 : 0.4,
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (ritual.available && !isSelected) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#232323'
        }
      }}
      onMouseLeave={(e) => {
        if (ritual.available && !isSelected) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#232323'
        }
      }}
    >
      {/* Title */}
      <h3 style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '16px', color: '#ffffff', margin: '0', padding: '24px 24px 0' }}>
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

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: COLORS.border, margin: '12px 0' }} />

      {/* Outcome section - centered */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '8px 24px 24px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Outcome</span>
        <div style={{ width: '32px', height: '31px', borderRadius: '50%', border: `2px solid ${ritual.outcomeColor}`, backgroundColor: 'transparent' }} />
      </div>

      {/* Insufficient resources label */}
      {!ritual.available && (
        <div style={{ fontFamily: FONTS.spectral, fontSize: '10px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textAlign: 'center', paddingBottom: '12px' }}>
          INSUFFICIENT RESOURCES
        </div>
      )}
    </button>
  )
}
