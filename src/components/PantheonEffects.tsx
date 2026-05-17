import type { God, Ritual } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { PrimaryButton } from './PrimaryButton'

interface PantheonEffectsProps {
  ritual: Ritual | null
  gods: God[]
  onPerformRitual: () => void
}

export function PantheonEffects({ ritual, gods, onPerformRitual }: PantheonEffectsProps) {
  if (!ritual) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: COLORS.bgBase,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '60%',
            height: '1px',
            backgroundColor: COLORS.border,
            marginBottom: '16px',
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.spectral,
            fontSize: '12px',
            fontStyle: 'italic',
            color: COLORS.textMuted,
            lineHeight: '1.6',
          }}
        >
          Select a ritual to reveal its consequences
        </p>
        <div
          style={{
            width: '60%',
            height: '1px',
            backgroundColor: COLORS.border,
            marginTop: '16px',
          }}
        />
      </div>
    )
  }

  const affectedGods = ritual.effects.map(effect => {
    const god = gods.find(g => g.id === effect.godId)
    return { god, before: effect.before, after: effect.after }
  }).filter(item => item.god)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.bgBase,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '24px 16px',
        }}
      >
        {/* Divine Ripple Section */}
        <div>
          <h3
            style={{
              margin: '0 0 12px 0',
              padding: 0,
              fontFamily: FONTS.spectral,
              fontSize: '9px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: COLORS.textMuted,
            }}
          >
            Divine Ripple
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {affectedGods.map(({ god, before, after }) => {
              const change = after - before
              const isIncrease = change > 0
              return (
                <div key={god!.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: god!.angerColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: FONTS.spectral,
                      fontSize: '10px',
                      color: COLORS.textSecondary,
                      flex: 1,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {god!.name}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.spectral,
                      fontSize: '9px',
                      color: isIncrease ? '#d4662a' : '#4a9d83',
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {before} → {after}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Auspicious Timing Section */}
        <div>
          <h3
            style={{
              margin: '0 0 12px 0',
              padding: 0,
              fontFamily: FONTS.spectral,
              fontSize: '9px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: COLORS.textMuted,
            }}
          >
            Auspicious Timing
          </h3>
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.spectral,
              fontSize: '10px',
              color: COLORS.textSecondary,
              lineHeight: '1.5',
            }}
          >
            No auspicious days in the next cycle
          </p>
        </div>

        {/* Imperial Counsel Section */}
        <div>
          <h3
            style={{
              margin: '0 0 12px 0',
              padding: 0,
              fontFamily: FONTS.spectral,
              fontSize: '9px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: COLORS.textMuted,
            }}
          >
            Imperial Counsel
          </h3>
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.spectral,
              fontSize: '10px',
              color: COLORS.textSecondary,
              lineHeight: '1.5',
            }}
          >
            Resources sufficient. No conflicts foreseen.
          </p>
        </div>
      </div>

      {/* Perform Ritual Button - pinned at bottom */}
      <div style={{ padding: '16px', borderTop: `1px solid ${COLORS.border}` }}>
        <PrimaryButton
          label="Perform Ritual"
          onClick={onPerformRitual}
          disabled={false}
        />
      </div>
    </div>
  )
}
