import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { COLORS, FONTS } from './tokens'
import { GODS } from './data/gods'
import { RitualCard } from './components/RitualCard'
import { PantheonEffects } from './components/PantheonEffects'

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
  const selectedGod = GODS.find(g => g.id === selectedGodId) ?? null
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

  // Empty state - no god selected
  const emptyState = (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: COLORS.textMuted,
          }}
        />
        <h1
          style={{
            margin: 0,
            padding: 0,
            fontFamily: FONTS.cinzel,
            fontSize: '20px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: COLORS.textPrimary,
          }}
        >
          NO GOD SELECTED
        </h1>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: COLORS.textMuted,
          }}
        />
      </div>
    </div>
  )

  // Ritual grid - shown when a god is selected
  const ritualGrid = selectedGod ? (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingTop: '20px' }}>
      {/* God header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 31px', marginBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
          <h1 style={{ margin: 0, fontFamily: FONTS.cinzel, fontSize: '20px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#ffffff' }}>
            {selectedGod.name}
          </h1>
          <div style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
        </div>
        <div style={{ width: '32px', height: '31px', borderRadius: '50%', border: `2px solid ${selectedGod.angerColor}`, flexShrink: 0 }} />
      </div>

      {/* Subtitle */}
      <p style={{ margin: '0', padding: '0 31px', fontFamily: FONTS.spectral, fontSize: '16px', color: '#b9b9b9' }}>
        {selectedGod.subtitle}
      </p>

      {/* Separator - 4px below subtitle */}
      <div style={{ height: '1px', backgroundColor: '#545454', margin: '4px 31px 0' }} />

      {/* Section label - 70px below separator */}
      <p style={{ margin: '70px 31px 0', fontFamily: FONTS.spectral, fontSize: '16px', color: '#ffffff' }}>
        Appeasement Rituals
      </p>

      {/* Card grid - 24px below label */}
      <div style={{ marginTop: '24px', padding: '0 31px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '19px' }}>
        {selectedGod.rituals.map(ritual => (
          <RitualCard key={ritual.id} ritual={ritual} isSelected={selectedRitualId === ritual.id} onClick={() => handleSelectRitual(ritual.id)} />
        ))}
      </div>

      {/* SEND ORDER button */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '32px', paddingBottom: '24px' }}>
        <button onClick={handlePerformRitual} disabled={!selectedRitual} style={{ width: '183px', height: '44px', border: '1px solid #ffffff', borderRadius: '8px', backgroundColor: 'transparent', color: '#ffffff', fontFamily: FONTS.spectral, fontWeight: 500, fontSize: '16px', textTransform: 'uppercase', cursor: selectedRitual ? 'pointer' : 'not-allowed', opacity: selectedRitual ? 1 : 0.39 }}>
          SEND ORDER
        </button>
      </div>
    </div>
  ) : null

  const mainContent = selectedGod ? ritualGrid : emptyState

  return (
    <AppShell
      gods={GODS}
      selectedGodId={selectedGodId}
      onSelectGod={handleSelectGod}
      resources={resources}
      mainContent={mainContent}
      rightPanelContent={
        selectedRitual && (
          <PantheonEffects
            ritual={selectedRitual}
            gods={GODS}
            onPerformRitual={handlePerformRitual}
          />
        )
      }
    />
  )
}

export default App
