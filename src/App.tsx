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

  // Empty state - no god selected
  const emptyState = (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.textMuted,
        fontFamily: FONTS.spectral,
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <p
        style={{
          fontSize: '13px',
          fontStyle: 'italic',
          letterSpacing: '0.3px',
          maxWidth: '300px',
        }}
      >
        Select a deity from the pantheon to view available rituals
      </p>
    </div>
  )

  // Ritual grid - shown when a god is selected
  const ritualGrid = selectedGod ? (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
      }}
    >
      {selectedGod.rituals.map(ritual => (
        <RitualCard
          key={ritual.id}
          ritual={ritual}
          isSelected={selectedRitualId === ritual.id}
          onClick={() => handleSelectRitual(ritual.id)}
        />
      ))}
    </div>
  ) : null

  const mainContent = selectedGod ? ritualGrid : emptyState

  const handlePerformRitual = () => {
    console.log('Performing ritual:', selectedRitual?.name)
  }

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
