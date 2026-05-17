import type { God } from '../data/gods'
import { DeityCard } from './DeityCard'
import { COLORS, FONTS, LAYOUT } from '../tokens'

interface DeityListProps {
  gods: God[]
  selectedGodId: string | null
  onSelect: (godId: string) => void
}

export function DeityList({ gods, selectedGodId, onSelect }: DeityListProps) {
  const sortedGods = [...gods].sort((a, b) => {
    const angerOrder = { high: 0, medium: 1, low: 2 }
    return angerOrder[a.angerLevel] - angerOrder[b.angerLevel]
  })

  return (
    <div
      style={{
        width: `${LAYOUT.sidebarWidth}px`,
        height: `calc(100vh - ${LAYOUT.bottomBarHeight}px)`,
        backgroundColor: COLORS.bgBase,
        borderRight: `1px solid #545454`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <h2
          style={{
            margin: 0,
            padding: 0,
            fontFamily: FONTS.spectral,
            fontSize: '16px',
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          Deities
        </h2>
        <p
          style={{
            margin: '4px 0 0 0',
            padding: 0,
            fontFamily: FONTS.spectral,
            fontSize: '14px',
            fontWeight: 400,
            color: COLORS.textSecondary,
          }}
        >
          Sorted by anger level
        </p>
      </div>

      {/* Scrollable list */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
        }}
      >
        {sortedGods.map((god) => (
          <DeityCard
            key={god.id}
            god={god}
            isSelected={selectedGodId === god.id}
            onClick={() => onSelect(god.id)}
          />
        ))}
      </div>
    </div>
  )
}
