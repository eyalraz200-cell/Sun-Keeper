import type { God, Ritual } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { RitualCard } from './RitualCard'

interface MiddleSectionProps {
  selectedGod: God | null
  selectedRitualId: string | null
  onSelectRitual: (ritualId: string) => void
  onPerformRitual: () => void
}

export function MiddleSection({ selectedGod, selectedRitualId, onSelectRitual, onPerformRitual }: MiddleSectionProps) {
  const selectedRitual = selectedGod?.rituals.find(r => r.id === selectedRitualId) ?? null

  const outcomeOrder: Record<string, number> = { '#c8322e': 0, '#d4662a': 1, '#d4a83c': 2, '#c8a83c': 3 }
  const angerOrder: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }

  const rituals: Ritual[] = selectedGod
    ? (() => {
        const godAnger = angerOrder[selectedGod.angerLevel]
        const valid = [...selectedGod.rituals].filter(r => (outcomeOrder[r.outcomeColor] ?? 4) >= godAnger)
        const colors = ['#c8322e', '#d4662a', '#d4a83c', '#c8a83c'].filter(c => (outcomeOrder[c] ?? 4) >= godAnger)
        const used = new Set<string>()
        const result: Ritual[] = []
        // One ritual per outcome color
        for (const color of colors) {
          const match = valid.find(r => r.outcomeColor === color)
          if (match) { result.push(match); used.add(match.id) }
        }
        // Fill remaining slots with unused valid rituals (calmest first)
        const rest = valid.filter(r => !used.has(r.id)).sort((a, b) => (outcomeOrder[b.outcomeColor] ?? 4) - (outcomeOrder[a.outcomeColor] ?? 4))
        for (const r of rest) {
          if (result.length >= 4) break
          result.push(r)
        }
        return result
      })()
    : []

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingTop: '28px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 31px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: selectedGod ? '#ffffff' : COLORS.textMuted }} />
          <h1 style={{ margin: 0, fontFamily: FONTS.cinzel, fontSize: '20px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '1.2px', color: selectedGod ? '#ffffff' : COLORS.textMuted, lineHeight: '1' }}>
            {selectedGod ? selectedGod.name : 'No God Selected'}
          </h1>
          <div style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: selectedGod ? '#ffffff' : COLORS.textMuted }} />
        </div>
      </div>

      {/* Subtitle */}
      <p style={{ margin: '4px 0 0', padding: '0 31px', fontFamily: FONTS.spectral, fontSize: '16px', color: selectedGod ? '#909090' : COLORS.textMuted }}>
        {selectedGod ? selectedGod.subtitle : 'Select a god to see ritual options'}
      </p>

      {/* Separator */}
      <div style={{ height: '1px', backgroundColor: '#333333', margin: '4px 31px 0' }} />

      {/* Ritual content */}
      <p style={{ margin: '70px 31px 0', fontFamily: FONTS.spectral, fontSize: '16px', fontWeight: 300, color: '#ffffff', opacity: selectedGod ? 1 : 0.12 }}>
        Appeasement Rituals
      </p>
      <div style={{ marginTop: '24px', padding: '0 31px', display: 'grid', gridTemplateColumns: 'repeat(4, 250px)', gap: '19px', justifyContent: 'space-between', opacity: selectedGod ? 1 : 0.12 }}>
        {selectedGod ? (
          rituals.map(ritual => (
            <RitualCard key={ritual.id} ritual={ritual} isSelected={selectedRitualId === ritual.id} onClick={() => onSelectRitual(ritual.id)} />
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: '#181818', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '14px', minHeight: '560px', width: '250px' }} />
          ))
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          onClick={onPerformRitual}
          disabled={!selectedRitual}
          style={{
            width: '183px',
            height: '44px',
            border: selectedGod ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.25)',
            borderRadius: '8px',
            backgroundColor: selectedRitual ? '#ffffff' : 'transparent',
            color: selectedRitual ? '#000000' : '#ffffff',
            fontFamily: FONTS.spectral,
            fontWeight: 500,
            fontSize: '16px',
            textTransform: 'uppercase',
            cursor: selectedRitual ? 'pointer' : 'not-allowed',
            opacity: selectedGod ? (selectedRitual ? 1 : 0.39) : 0.12,
          }}
        >
          SEND ORDER
        </button>
      </div>
    </div>
  )
}
