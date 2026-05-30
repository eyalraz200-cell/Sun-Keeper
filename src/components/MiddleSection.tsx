import type { God, Ritual, AngerLevel } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { RitualCard } from './RitualCard'
import { CtaButton } from './CtaButton'
import { ResourceBar } from './ResourceBar'

interface MiddleSectionProps {
  selectedGod: God | null
  selectedRitualId: string | null
  onSelectRitual: (ritualId: string) => void
  onPerformRitual: () => void
  activeRituals?: Record<string, string>
  onHoverRitual?: (ritualId: string | null) => void
  prisoners: number
  childrenCount: number
  virgins: number
  volunteers: number
  selectedRitual?: Ritual | null
  hoveredRitual?: Ritual | null
}

const EYE_STYLES: Record<AngerLevel, { color: string; weight: number }> = {
  high:   { color: '#FF2435', weight: 6 },
  medium: { color: '#EF7B2E', weight: 4 },
  low:    { color: '#D7C94E', weight: 3 },
  none:   { color: '#6C6C6C', weight: 2 },
}

export function MiddleSection({ selectedGod, selectedRitualId, onSelectRitual, onPerformRitual, activeRituals = {}, onHoverRitual, prisoners, childrenCount, virgins, volunteers, selectedRitual, hoveredRitual }: MiddleSectionProps) {

  const outcomeOrder: Record<string, number> = { '#c8322e': 0, '#d4662a': 1, '#d4a83c': 2, '#c8a83c': 3 }

  const rituals: Ritual[] = selectedGod
    ? [...selectedGod.rituals].sort((a, b) => (outcomeOrder[a.outcomeColor] ?? 4) - (outcomeOrder[b.outcomeColor] ?? 4))
    : []

  const activeRitualId = selectedGod ? activeRituals[selectedGod.id] ?? null : null
  const ritualActiveForCurrentGod = !!activeRitualId

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 31px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: 'transparent',
            boxShadow: selectedGod
              ? `inset 0 0 0 ${EYE_STYLES[selectedGod.angerLevel].weight}px ${EYE_STYLES[selectedGod.angerLevel].color}`
              : `inset 0 0 0 2px ${COLORS.textMuted}`,
          }} />
          <h1 style={{ margin: 0, fontFamily: FONTS.cinzel, fontSize: '20px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '1.2px', color: selectedGod ? '#ffffff' : COLORS.textMuted, lineHeight: '1' }}>
            {selectedGod ? selectedGod.name : 'No God Selected'}
          </h1>
        </div>
      </div>

      {/* Subtitle */}
      <p style={{ margin: '4px 0 0', padding: '0 31px', fontFamily: FONTS.spectral, fontSize: '16px', color: selectedGod ? '#909090' : COLORS.textMuted }}>
        {selectedGod ? selectedGod.subtitle : 'Select a god to see ritual options'}
      </p>

      {/* Separator */}
      <div style={{ height: '1px', backgroundColor: '#333333', margin: '4px 31px 0' }} />

      {/* flex column: label+cards | CTA — space-evenly distributes equal gaps above, between, and below */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', minHeight: 0, padding: '24px 0' }}>
        {/* Label + Cards group — shared centered container so label aligns with card left edge */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 31px' }}>
          <div style={{ width: '100%', maxWidth: '843px', display: 'flex', flexDirection: 'column' }}>
          {/* Label */}
          <div style={{ opacity: selectedGod ? 1 : 0.12, visibility: ritualActiveForCurrentGod ? 'hidden' : 'visible', marginBottom: '14px' }}>
            <p style={{ margin: 0, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 200, color: 'rgba(255,255,255,0.55)' }}>
              Appeasement Ritual Options
            </p>
          </div>

          {/* Cards row */}
          <div style={{ display: 'flex', gap: '24px', opacity: selectedGod ? 1 : 0.12 }}>
            {selectedGod ? (
              <>
                {rituals.map(ritual => {
                  const isActive = ritual.id === activeRitualId
                  return (
                    <div key={ritual.id} style={{ flex: '1 1 0', maxWidth: '265px', minWidth: 0, opacity: ritualActiveForCurrentGod && !isActive ? 0.25 : 1, pointerEvents: ritualActiveForCurrentGod ? 'none' : undefined, position: 'relative' }}>
                      {isActive && (
                        <p style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, margin: '0 0 8px', fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff', textAlign: 'center', letterSpacing: '0.5px' }}>
                          Active Ritual
                        </p>
                      )}
                      <RitualCard ritual={ritual} isSelected={selectedRitualId === ritual.id} onClick={() => onSelectRitual(ritual.id)} isActive={isActive} onHoverChange={(hovered) => onHoverRitual?.(hovered ? ritual.id : null)} godName={selectedGod.name} />
                    </div>
                  )
                })}
              </>
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: '#181818', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '14px', minHeight: '488px', flex: '1 1 0', maxWidth: '265px', minWidth: 0 }} />
              ))
            )}
          </div>
          </div>
        </div>

        {/* CTA */}
        {!ritualActiveForCurrentGod && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CtaButton
              label="AUTHORIZE RITUAL"
              onClick={onPerformRitual}
              active={!!selectedRitual}
              visible={!!selectedGod}
            />
          </div>
        )}
      </div>

      <ResourceBar
        prisoners={prisoners}
        childrenCount={childrenCount}
        virgins={virgins}
        volunteers={volunteers}
        selectedRitual={selectedRitual}
        hoveredRitual={hoveredRitual}
        dimmed={!selectedGod}
      />
    </div>
  )
}
