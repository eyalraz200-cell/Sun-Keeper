import type { God, Ritual, AngerLevel } from '../data/gods'
import { COLORS, FONTS, LAYOUT, RESOURCE_TOTALS, type RitualScreenMode } from '../tokens'
import { RitualCard } from './RitualCard'
import { CtaButton } from './CtaButton'
import { ResourceBar } from './ResourceBar'

const WRATHFUL_OVERRIDE: Record<string, {
  participants: { prisoners: number; children: number; virgins: number; volunteers: number }
  sacredSite: { name: string; count: number }
  duration: string
}> = {
  huitzilopochtli: { participants: { prisoners: 480, children: 0, virgins: 7, volunteers: 200 }, sacredSite: { name: 'Grand Temple', count: 1 }, duration: '5 days' },
  tlaloc:          { participants: { prisoners: 120, children: 380, virgins: 0, volunteers: 0 }, sacredSite: { name: 'Grand Temple', count: 1 }, duration: '5 days' },
  tezcatlipoca:    { participants: { prisoners: 200, children: 0, virgins: 6, volunteers: 320 }, sacredSite: { name: 'Grand Temple', count: 1 }, duration: '5 days' },
  quetzalcoatl:    { participants: { prisoners: 0, children: 0, virgins: 7, volunteers: 480 }, sacredSite: { name: 'Grand Temple', count: 1 }, duration: '5 days' },
  mictlantecuhtli: { participants: { prisoners: 420, children: 0, virgins: 5, volunteers: 0 }, sacredSite: { name: 'Grand Temple', count: 1 }, duration: '5 days' },
  ehecatl:         { participants: { prisoners: 0, children: 0, virgins: 5, volunteers: 500 }, sacredSite: { name: 'Grand Temple', count: 1 }, duration: '5 days' },
  xiuhtecuhtli:    { participants: { prisoners: 180, children: 0, virgins: 7, volunteers: 350 }, sacredSite: { name: 'Grand Temple', count: 1 }, duration: '5 days' },
  chalchiuhtlicue: { participants: { prisoners: 0, children: 0, virgins: 7, volunteers: 380 }, sacredSite: { name: 'Grand Temple', count: 1 }, duration: '5 days' },
  tonatiuh:        { participants: { prisoners: 0, children: 0, virgins: 5, volunteers: 500 }, sacredSite: { name: 'Grand Temple', count: 1 }, duration: '5 days' },
}

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
  temples?: number
  greatTemples?: number
  resourceTotals?: typeof RESOURCE_TOTALS
  selectedRitual?: Ritual | null
  hoveredRitual?: Ritual | null
  ritualMode?: RitualScreenMode
  aiPanelOpen?: boolean
  wrathfulGodId?: string | null
  hideResourceBar?: boolean
}

const EYE_STYLES: Record<AngerLevel, { color: string; weight: number }> = {
  high:   { color: '#FF2435', weight: 6 },
  medium: { color: '#EF7B2E', weight: 4 },
  low:    { color: '#D7C94E', weight: 3 },
  none:   { color: '#6C6C6C', weight: 2 },
}

export function MiddleSection({ selectedGod, selectedRitualId, onSelectRitual, onPerformRitual, activeRituals = {}, onHoverRitual, prisoners, childrenCount, virgins, volunteers, temples = RESOURCE_TOTALS.temples, greatTemples = RESOURCE_TOTALS.greatTemples, resourceTotals = RESOURCE_TOTALS, selectedRitual, hoveredRitual, ritualMode = 'ritual', aiPanelOpen = false, wrathfulGodId = null, hideResourceBar = false }: MiddleSectionProps) {
  const isComparisonView = ritualMode === 'expanded'
  const isWrathful = !!selectedGod && selectedGod.id === wrathfulGodId

  const outcomeOrder: Record<string, number> = { '#c8322e': 0, '#d4662a': 1, '#d4a83c': 2, '#c8a83c': 3 }

  const rituals: Ritual[] = selectedGod
    ? [...selectedGod.rituals]
        .sort((a, b) => (outcomeOrder[a.outcomeColor] ?? 4) - (outcomeOrder[b.outcomeColor] ?? 4))
        .slice(0, isWrathful ? 1 : undefined)
    : []

  const activeRitualId = selectedGod ? activeRituals[selectedGod.id] ?? null : null
  const ritualActiveForCurrentGod = !!activeRitualId

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {isComparisonView && <div style={{ height: '30px', flexShrink: 0 }} />}
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 31px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: 'transparent',
            boxShadow: isWrathful
              ? `inset 0 0 0 6px #FF2435`
              : selectedGod
              ? `inset 0 0 0 ${EYE_STYLES[selectedGod.angerLevel].weight}px ${EYE_STYLES[selectedGod.angerLevel].color}`
              : `inset 0 0 0 2px ${COLORS.textMuted}`,
          }} />
          <h1 style={{ margin: 0, fontFamily: FONTS.cinzel, fontSize: '20px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '1.2px', color: selectedGod ? '#ffffff' : COLORS.textMuted, lineHeight: '1' }}>
            {isWrathful && selectedGod ? (
              <>
                <span style={{ fontFamily: FONTS.spectral, textTransform: 'none', color: '#FF2435' }}>Punishment Active: </span>
                {selectedGod.name}
              </>
            ) : (
              selectedGod ? selectedGod.name : 'No God Selected'
            )}
          </h1>
        </div>
      </div>

      {/* Subtitle */}
      <p style={{ margin: '4px 0 0', padding: '0 31px', fontFamily: FONTS.spectral, fontSize: '16px', color: selectedGod ? '#909090' : COLORS.textMuted }}>
        {isWrathful && selectedGod
          ? selectedGod.subtitle
          : selectedGod ? selectedGod.subtitle : 'Select a god to see ritual options'
        }
      </p>

      {/* Separator */}
      <div style={{ height: '1px', backgroundColor: '#333333', margin: '7px 31px 0' }} />

      {/* flex column: label+cards | CTA — space-evenly distributes equal gaps above, between, and below */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: isComparisonView ? 'flex-start' : 'space-evenly', minHeight: 0, padding: '24px 0', gap: isComparisonView ? '24px' : undefined, opacity: isComparisonView && aiPanelOpen ? 0 : 1, transform: isComparisonView && aiPanelOpen ? 'translateX(-24px)' : 'translateX(0)', transition: 'opacity 0.25s ease, transform 0.25s ease', pointerEvents: isComparisonView && aiPanelOpen ? 'none' : undefined }}>
        {/* Label + Cards group — shared centered container so label aligns with card left edge */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 31px' }}>
          <div style={{ width: '100%', maxWidth: isComparisonView ? 'none' : '843px', display: 'flex', flexDirection: 'column' }}>
          {/* Label */}
          <div style={{ opacity: selectedGod ? 1 : 0.12, visibility: ritualActiveForCurrentGod || isWrathful ? 'hidden' : 'visible', marginBottom: '14px' }}>
            <p style={{ margin: 0, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 200, color: 'rgba(255,255,255,0.55)' }}>
              Appeasement Ritual Options
            </p>
          </div>

          {/* Cards — row in normal view, vertical stack in compressed view */}
          <div style={{ display: 'flex', flexDirection: isComparisonView ? 'column' : 'row', gap: isComparisonView ? '36px' : '24px', opacity: selectedGod ? 1 : 0.12, justifyContent: isWrathful && !isComparisonView ? 'center' : undefined }}>
            {selectedGod ? (
              <>
                {rituals.map(ritual => {
                  const isActive = ritual.id === activeRitualId
                  return (
                    <div key={ritual.id} style={{ flex: isComparisonView ? undefined : '1 1 0', width: isComparisonView ? '100%' : undefined, maxWidth: isComparisonView ? 'none' : '265px', minWidth: 0, opacity: ritualActiveForCurrentGod && !isActive ? 0.25 : 1, pointerEvents: ritualActiveForCurrentGod ? 'none' : undefined, position: 'relative' }}>
                      {isActive && !isComparisonView && (
                        <p style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, margin: '0 0 8px', fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff', textAlign: 'center', letterSpacing: '0.5px' }}>
                          Active Ritual
                        </p>
                      )}
                      <RitualCard
                        ritual={ritual}
                        isSelected={selectedRitualId === ritual.id}
                        onClick={() => onSelectRitual(ritual.id)}
                        isActive={isActive}
                        onHoverChange={(hovered) => onHoverRitual?.(hovered ? ritual.id : null)}
                        godName={selectedGod.name}
                        wrathful={isWrathful}
                        isCompact={isComparisonView}
                        overrideOutcome={isWrathful ? '#c8a83c' : undefined}
                        overrideParticipants={isWrathful ? WRATHFUL_OVERRIDE[selectedGod.id]?.participants : undefined}
                        overrideSite={isWrathful ? WRATHFUL_OVERRIDE[selectedGod.id]?.sacredSite : undefined}
                        overrideDuration={isWrathful ? WRATHFUL_OVERRIDE[selectedGod.id]?.duration : undefined}
                      />
                    </div>
                  )
                })}
              </>
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: '#181818', border: '2px solid rgba(255,255,255,0.18)', borderRadius: isComparisonView ? '10px' : '14px', height: isComparisonView ? '200px' : undefined, minHeight: isComparisonView ? undefined : '488px', flex: isComparisonView ? undefined : '1 1 0', width: isComparisonView ? '100%' : undefined, maxWidth: isComparisonView ? 'none' : '265px', minWidth: 0 }} />
              ))
            )}
          </div>
          </div>
        </div>

        {/* CTA */}
        {!ritualActiveForCurrentGod && !isComparisonView && (
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

      {!hideResourceBar && (
        <ResourceBar
          prisoners={prisoners}
          childrenCount={childrenCount}
          virgins={virgins}
          volunteers={volunteers}
          temples={temples}
          greatTemples={greatTemples}
          prisonersTotal={resourceTotals.prisoners}
          volunteersTotal={resourceTotals.volunteers}
          childrenTotal={resourceTotals.children}
          virginsTotal={resourceTotals.virgins}
          templesTotal={resourceTotals.temples}
          greatTemplesTotal={resourceTotals.greatTemples}
          selectedRitual={selectedRitual}
          hoveredRitual={hoveredRitual}
          dimmed={!selectedGod}
          twoRows={false}
        />
      )}
    </div>
  )
}
