import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { COLORS, FONTS } from './tokens'
import { GODS } from './data/gods'
import type { God, AngerLevel } from './data/gods'

const ANGER_LABELS: Record<AngerLevel, string> = {
  high: 'Furious',
  medium: 'Angry',
  low: 'Uneasy',
  none: 'Peaceful',
}

const tlaloc          = GODS.find(g => g.id === 'tlaloc')!
const quetzalcoatl    = GODS.find(g => g.id === 'quetzalcoatl')!
const huitzilopochtli = GODS.find(g => g.id === 'huitzilopochtli')!
const tezcatlipoca    = GODS.find(g => g.id === 'tezcatlipoca')!
const mictlantecuhtli = GODS.find(g => g.id === 'mictlantecuhtli')!

function variants(base: God, name: string): God[] {
  return [
    { ...base, id: `${base.id}-high`,   name, angerLevel: 'high',   angerColor: '#c8322e' },
    { ...base, id: `${base.id}-medium`, name, angerLevel: 'medium', angerColor: '#d4662a' },
    { ...base, id: `${base.id}-low`,    name, angerLevel: 'low',    angerColor: '#c8a83c' },
    { ...base, id: `${base.id}-none`,   name, angerLevel: 'none',   angerColor: '#6C6C6C' },
  ]
}

const DEITY_VARIANTS: God[] = [
  ...variants(tlaloc,          'Tlaloc'),
  ...variants(quetzalcoatl,    'Quetzalcoatl'),
  ...variants(huitzilopochtli, 'Huitzilopochtli'),
  ...variants(tezcatlipoca,    'Tezcatlipoca'),
  ...variants(mictlantecuhtli, 'Mictlantecuhtli'),
]
import { RitualCard } from './components/RitualCard'
import { RightPanel } from './components/RightPanel'

function App() {
  const [selectedGodId, setSelectedGodId] = useState<string | null>(null)
  const [selectedRitualId, setSelectedRitualId] = useState<string | null>(null)

  // Static resources for now
  const resources = {
    prisoners: 12,
    children: 5,
    virgins: 8,
    volunteers: 20,
  }

  // Get selected god and ritual
  const selectedGod = DEITY_VARIANTS.find(g => g.id === selectedGodId) ?? null
  const selectedRitual = selectedGod?.rituals.find(r => r.id === selectedRitualId) ?? null

  // Handle god selection
  const handleSelectGod = (godId: string) => {
    if (selectedGodId === godId) {
      setSelectedGodId(null)
      setSelectedRitualId(null)
    } else {
      setSelectedGodId(godId)
      setSelectedRitualId(null)
    }
  }

  // Handle ritual selection
  const handleSelectRitual = (ritualId: string) => {
    if (selectedRitualId === ritualId) {
      setSelectedRitualId(null)
    } else {
      setSelectedRitualId(ritualId)
    }
  }

  // Handle perform ritual
  const handlePerformRitual = () => {
    console.log('Performing ritual:', selectedRitual?.name)
  }

  const mainContent = (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingTop: '24px' }}>
      {/* Header row — always shown */}
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
      <p style={{ margin: '0', padding: '0 31px', fontFamily: FONTS.spectral, fontSize: '16px', color: selectedGod ? '#b9b9b9' : COLORS.textMuted }}>
        {selectedGod ? selectedGod.subtitle : 'Select a god to see ritual options'}
      </p>

      {/* Separator — always shown */}
      <div style={{ height: '1px', backgroundColor: '#333333', margin: '4px 31px 0' }} />

      {/* Ritual content — always shown, ghosted when no god selected */}
      <p style={{ margin: '70px 31px 0', fontFamily: FONTS.spectral, fontSize: '16px', color: '#ffffff', opacity: selectedGod ? 1 : 0.12 }}>
        Appeasement Rituals
      </p>
      <div style={{ marginTop: '24px', padding: '0 31px', display: 'grid', gridTemplateColumns: 'repeat(4, 250px)', gap: '19px', justifyContent: 'space-between', opacity: selectedGod ? 1 : 0.12 }}>
        {selectedGod ? (
          selectedGod.rituals.map(ritual => (
            <RitualCard key={ritual.id} ritual={ritual} isSelected={selectedRitualId === ritual.id} onClick={() => handleSelectRitual(ritual.id)} />
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: '#181818', border: '2px solid rgba(255,255,255,0.08)', borderRadius: '14px', minHeight: '560px', width: '250px' }} />
          ))
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={handlePerformRitual} disabled={!selectedRitual} style={{ width: '183px', height: '44px', border: selectedGod ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', backgroundColor: selectedRitual ? '#ffffff' : 'transparent', color: selectedRitual ? '#000000' : '#ffffff', fontFamily: FONTS.spectral, fontWeight: 500, fontSize: '16px', textTransform: 'uppercase', cursor: selectedRitual ? 'pointer' : 'not-allowed', opacity: selectedGod ? (selectedRitual ? 1 : 0.39) : 0.12 }}>
          SEND ORDER
        </button>
      </div>
    </div>
  )

  return (
    <AppShell
      gods={DEITY_VARIANTS}
      selectedGodId={selectedGodId}
      onSelectGod={handleSelectGod}
      resources={resources}
      mainContent={mainContent}
      rightPanelContent={
        selectedRitual && (
          <RightPanel
            ritual={selectedRitual}
            gods={GODS}
          />
        )
      }
    />
  )
}

export default App
