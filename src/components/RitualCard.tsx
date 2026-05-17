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

  const resourceLabels = []
  if (ritual.participants.prisoners > 0) resourceLabels.push(`${ritual.participants.prisoners} prisoner${ritual.participants.prisoners > 1 ? 's' : ''}`)
  if (ritual.participants.children > 0) resourceLabels.push(`${ritual.participants.children} child${ritual.participants.children > 1 ? 'ren' : ''}`)
  if (ritual.participants.virgins > 0) resourceLabels.push(`${ritual.participants.virgins} virgin${ritual.participants.virgins > 1 ? 's' : ''}`)
  if (ritual.participants.volunteers > 0) resourceLabels.push(`${ritual.participants.volunteers} volunteer${ritual.participants.volunteers > 1 ? 's' : ''}`)

  return (
    <button
      onClick={handleClick}
      disabled={!ritual.available}
      style={{
        width: '100%',
        padding: '16px',
        backgroundColor: isSelected ? COLORS.bgHover : COLORS.bgCard,
        border: isSelected ? `2px solid ${ritual.outcomeColor}` : `1px solid ${COLORS.border}`,
        borderLeft: isSelected ? `2px solid ${ritual.outcomeColor}` : `2px solid ${ritual.outcomeColor}22`,
        borderRadius: '2px',
        cursor: ritual.available ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12px',
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
      {/* Header: name + outcome dot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h3
          style={{
            margin: 0,
            padding: 0,
            fontFamily: FONTS.spectral,
            fontSize: '14px',
            fontWeight: 500,
            color: COLORS.textPrimary,
          }}
        >
          {ritual.name}
        </h3>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: ritual.outcomeColor,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          padding: 0,
          fontFamily: FONTS.spectral,
          fontSize: '11px',
          fontWeight: 300,
          color: COLORS.textSecondary,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          maxWidth: '100%',
        }}
      >
        {ritual.description}
      </p>

      {/* Divider */}
      <div
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: COLORS.border,
        }}
      />

      {/* Participants */}
      <div
        style={{
          fontFamily: FONTS.spectral,
          fontSize: '10px',
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {resourceLabels.length > 0 ? resourceLabels.join(' · ') : 'No participants'}
      </div>

      {/* Footer: schedule + duration */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          fontFamily: FONTS.spectral,
          fontSize: '9px',
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          color: COLORS.textMuted,
        }}
      >
        <span>{ritual.schedule}</span>
        <span>{ritual.duration}</span>
      </div>

      {/* Insufficient resources label */}
      {!ritual.available && (
        <div
          style={{
            fontFamily: FONTS.spectral,
            fontSize: '9px',
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
