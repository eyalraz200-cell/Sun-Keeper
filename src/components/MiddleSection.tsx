import type { God, Ritual, AngerLevel } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { RitualCard } from './RitualCard'
import { CtaButton } from './CtaButton'

interface MiddleSectionProps {
  selectedGod: God | null
  selectedRitualId: string | null
  onSelectRitual: (ritualId: string) => void
  onPerformRitual: () => void
  activeRituals?: Record<string, string>
  onHoverRitual?: (ritualId: string | null) => void
}

const EYE_STYLES: Record<AngerLevel, { color: string; weight: number }> = {
  high:   { color: '#FF2435', weight: 6 },
  medium: { color: '#EF7B2E', weight: 4 },
  low:    { color: '#D7C94E', weight: 3 },
  none:   { color: '#6C6C6C', weight: 2 },
}

export function MiddleSection({ selectedGod, selectedRitualId, onSelectRitual, onPerformRitual, activeRituals = {}, onHoverRitual }: MiddleSectionProps) {
  const selectedRitual = selectedGod?.rituals.find(r => r.id === selectedRitualId) ?? null

  const outcomeOrder: Record<string, number> = { '#c8322e': 0, '#d4662a': 1, '#d4a83c': 2, '#c8a83c': 3 }

  const rituals: Ritual[] = selectedGod
    ? [...selectedGod.rituals].sort((a, b) => (outcomeOrder[a.outcomeColor] ?? 4) - (outcomeOrder[b.outcomeColor] ?? 4))
    : []

  const activeRitualId = selectedGod ? activeRituals[selectedGod.id] ?? null : null
  const ritualActiveForCurrentGod = !!activeRitualId

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingTop: '28px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 31px' }}>
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

      {/* Ritual label */}
      <div style={{ marginTop: '100px', width: '100%', display: 'flex', justifyContent: 'center', padding: '0 31px', boxSizing: 'border-box', opacity: selectedGod ? 1 : 0.12, visibility: ritualActiveForCurrentGod ? 'hidden' : 'visible' }}>
        <p style={{ margin: 0, width: '100%', maxWidth: '798px', textAlign: 'left', fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 200, color: 'rgba(255,255,255,0.55)' }}>
          Sacrificial Ritual Options
        </p>
      </div>

      <div style={{ marginTop: '14px', display: 'flex', gap: '24px', justifyContent: 'center', opacity: selectedGod ? 1 : 0.12, padding: '0 31px' }}>
        {selectedGod ? (
          <>
            {rituals.map(ritual => {
              const isActive = ritual.id === activeRitualId
              return (
                <div key={ritual.id} style={{ width: '250px', flexShrink: 0, opacity: ritualActiveForCurrentGod && !isActive ? 0.25 : 1, pointerEvents: ritualActiveForCurrentGod ? 'none' : undefined, position: 'relative' }}>
                  {isActive && (
                    <p style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, margin: '0 0 8px', fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff', textAlign: 'center', letterSpacing: '0.5px' }}>
                      Active Ritual
                    </p>
                  )}
                  <RitualCard ritual={ritual} isSelected={selectedRitualId === ritual.id} onClick={() => onSelectRitual(ritual.id)} isActive={isActive} onHoverChange={(hovered) => onHoverRitual?.(hovered ? ritual.id : null)} />
                </div>
              )
            })}</>

        ) : (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: '#181818', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '14px', minHeight: '488px', width: '250px', flexShrink: 0 }} />
          ))
        )}
      </div>
      {!ritualActiveForCurrentGod && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CtaButton
            label="AUTHORIZE RITUAL"
            onClick={onPerformRitual}
            active={!!selectedRitual}
            visible={!!selectedGod}
          />
        </div>
      )}
    </div>
  )
}
