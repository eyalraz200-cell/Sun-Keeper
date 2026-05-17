import type { God } from '../data/gods'
import { COLORS, FONTS } from '../tokens'

interface DeityCardProps {
  god: God
  isSelected: boolean
  onClick: () => void
}

export function DeityCard({ god, isSelected, onClick }: DeityCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: '245px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 0,
        backgroundColor: isSelected ? COLORS.bgHover : COLORS.bgBase,
        border: isSelected ? `2px solid ${god.angerColor}` : `1px solid ${COLORS.border}`,
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'visible',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgHover
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgBase
        }
      }}
    >
      {/* God name at top */}
      <div
        style={{
          padding: '12px 12px 8px',
          textAlign: 'center',
          width: '100%',
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            margin: 0,
            padding: 0,
            fontFamily: FONTS.cinzel,
            fontSize: '12px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: COLORS.textPrimary,
          }}
        >
          · {god.name} ·
        </h3>
      </div>

      {/* God SVG image - fixed 110×160 */}
      <div
        style={{
          position: 'relative',
          width: '110px',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <img
          src={god.svg}
          alt={god.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    </button>
  )
}
