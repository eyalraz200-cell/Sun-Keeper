import { useState } from 'react'
import type { Ritual } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { Link, Sock, SunDim, Sparkle } from '@phosphor-icons/react'

function outcomeLabel(color: string): string {
  if (color === '#c8322e') return 'Furious'
  if (color === '#d4662a') return 'Angry'
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
        minHeight: '506px',
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
      <p style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: '6px 24px 0', padding: '0', lineHeight: '1.4' }}>
        {ritual.description}
      </p>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.12)', margin: '12px 13px' }} />

      {/* Price section */}
      <div style={{ padding: '16px 24px 0' }}>
        <p style={{ fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px 0' }}>Blood Price</p>
        <div>
        {([
          { key: 'prisoners', label: 'Prisoners',  icon: <Link     size={16} color="rgba(255,255,255,0.5)" /> },
          { key: 'volunteers',label: 'Volunteers', icon: <Sparkle  size={16} color="rgba(255,255,255,0.5)" /> },
          { key: 'children',  label: 'Children',  icon: <Sock     size={16} color="rgba(255,255,255,0.5)" /> },
          { key: 'virgins',   label: 'Virgins',   icon: <SunDim   size={16} color="rgba(255,255,255,0.5)" /> },
        ] as const).filter(({ key }) => ritual.participants[key] > 0).map(({ key, label, icon }, i, arr) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < arr.length - 1 ? '6px' : 0, paddingTop: i === 0 ? '2px' : 0 }}>
            {icon}
            <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{label}</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: '12px', color: '#ffffff' }}>{ritual.participants[key]}</span>
          </div>
        ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: COLORS.border, margin: '16px 24px' }} />

      {/* Sacred Site section */}
      <div style={{ padding: '0 24px 16px' }}>
        <p style={{ fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px 0' }}>Sacred Site</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{ritual.sacredSite.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Duration</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: '12px', color: '#ffffff' }}>{ritual.duration}</span>
          </div>
      </div>

      {/* Divider + Outcome pinned to bottom */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.12)', margin: '0 13px', marginTop: 'auto' }} />

      {/* Outcome section - centered */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 24px 24px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Resulting State</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
