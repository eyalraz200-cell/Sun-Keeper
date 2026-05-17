import type { Ritual } from '../data/gods'
import { COLORS, FONTS } from '../tokens'

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
        padding: '24px',
        backgroundColor: isSelected ? COLORS.bgHover : COLORS.bgCard,
        border: isSelected ? `2px solid ${ritual.outcomeColor}` : `1px solid #545454`,
        borderRadius: '8px',
        cursor: ritual.available ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        opacity: ritual.available ? 1 : 0.4,
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (ritual.available && !isSelected) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgHover
        }
      }}
      onMouseLeave={(e) => {
        if (ritual.available && !isSelected) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgCard
        }
      }}
    >
      {/* Title */}
      <h3 style={{ margin: 0, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 500, color: COLORS.textPrimary }}>
        {ritual.name}
      </h3>

      {/* Description */}
      <p style={{ margin: 0, fontFamily: FONTS.spectral, fontSize: '12px', color: COLORS.textSecondary, lineHeight: '1.4' }}>
        {ritual.description}
      </p>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', backgroundColor: COLORS.border }} />

      {/* Price section */}
      <div>
        <div style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Price</div>
        {/* Volunteers row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: COLORS.textSecondary, opacity: 0.5, borderRadius: '2px', flexShrink: 0 }} />
          <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '11px', color: COLORS.textSecondary }}>Volunteers</span>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '11px', color: COLORS.textPrimary }}>{ritual.participants.volunteers}</span>
        </div>
        {/* Virgins row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: COLORS.textSecondary, opacity: 0.5, borderRadius: '50%', flexShrink: 0 }} />
          <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '11px', color: COLORS.textSecondary }}>Virgins</span>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '11px', color: COLORS.textPrimary }}>{ritual.participants.virgins}</span>
        </div>
      </div>

      {/* Duration section */}
      <div>
        <div style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Duration</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: COLORS.textSecondary, opacity: 0.5, borderRadius: '50%', flexShrink: 0 }} />
          <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '11px', color: COLORS.textSecondary }}>{ritual.schedule}</span>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '11px', color: COLORS.textPrimary }}>{ritual.duration}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', backgroundColor: COLORS.border }} />

      {/* Outcome section — centered */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
        <div style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outcome</div>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${ritual.outcomeColor}`, flexShrink: 0 }} />
      </div>

      {/* Insufficient resources */}
      {!ritual.available && (
        <div style={{ fontFamily: FONTS.spectral, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: COLORS.textMuted }}>
          INSUFFICIENT RESOURCES
        </div>
      )}
    </button>
  )
}
