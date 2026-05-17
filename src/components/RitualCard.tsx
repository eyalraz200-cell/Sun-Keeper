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
      <h3
        style={{
          margin: 0,
          padding: 0,
          fontFamily: FONTS.spectral,
          fontSize: '16px',
          fontWeight: 500,
          color: COLORS.textPrimary,
        }}
      >
        {ritual.name}
      </h3>

      {/* Description */}
      <p
        style={{
          margin: 0,
          padding: 0,
          fontFamily: FONTS.spectral,
          fontSize: '12px',
          fontWeight: 400,
          color: COLORS.textSecondary,
          lineHeight: '1.4',
        }}
      >
        {ritual.description}
      </p>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', backgroundColor: COLORS.border }} />

      {/* Price/Participants Section */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: COLORS.textSecondary,
            opacity: 0.5,
            borderRadius: '2px',
            flexShrink: 0,
            marginTop: '2px',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ fontFamily: FONTS.spectral, fontSize: '11px', color: COLORS.textPrimary }}>
              <div style={{ color: COLORS.textMuted, fontSize: '9px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Volunteers
              </div>
              <div>{ritual.participants.volunteers}</div>
            </div>
            <div style={{ fontFamily: FONTS.spectral, fontSize: '11px', color: COLORS.textPrimary }}>
              <div style={{ color: COLORS.textMuted, fontSize: '9px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Virgins
              </div>
              <div>{ritual.participants.virgins}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule/Duration Section */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: COLORS.textSecondary,
            opacity: 0.5,
            borderRadius: '50%',
            flexShrink: 0,
            marginTop: '2px',
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '9px',
              color: COLORS.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              marginBottom: '4px',
            }}
          >
            Duration
          </div>
          <div style={{ fontFamily: FONTS.spectral, fontSize: '11px', color: COLORS.textPrimary }}>
            {ritual.duration}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', backgroundColor: COLORS.border }} />

      {/* Outcome Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            fontSize: '10px',
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Outcome
        </div>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: ritual.outcomeColor,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Insufficient resources label */}
      {!ritual.available && (
        <div
          style={{
            fontFamily: FONTS.spectral,
            fontSize: '10px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: COLORS.textMuted,
            marginTop: '4px',
          }}
        >
          INSUFFICIENT RESOURCES
        </div>
      )}
    </button>
  )
}
