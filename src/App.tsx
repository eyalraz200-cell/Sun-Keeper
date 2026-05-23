import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { MiddleSection } from './components/MiddleSection'
import { RightPanel } from './components/RightPanel'
import { GODS } from './data/gods'

function App() {
  const [selectedGodId, setSelectedGodId] = useState<string | null>(null)
  const [selectedRitualId, setSelectedRitualId] = useState<string | null>(null)

  const resources = {
    prisoners: 12,
    children: 5,
    virgins: 8,
    volunteers: 20,
  }

  const selectedGod = GODS.find(g => g.id === selectedGodId) ?? null
  const selectedRitual = selectedGod?.rituals.find(r => r.id === selectedRitualId) ?? null

  const handleSelectGod = (godId: string) => {
    if (selectedGodId === godId) {
      setSelectedGodId(null)
      setSelectedRitualId(null)
    } else {
      setSelectedGodId(godId)
      setSelectedRitualId(null)
    }
  }

  const handleSelectRitual = (ritualId: string) => {
    if (selectedRitualId === ritualId) {
      setSelectedRitualId(null)
    } else {
      setSelectedRitualId(ritualId)
    }
  }

  const handlePerformRitual = () => {
    console.log('Performing ritual:', selectedRitual?.name)
  }

  return (
    <AppShell
      gods={GODS}
      selectedGodId={selectedGodId}
      onSelectGod={handleSelectGod}
      resources={resources}
      mainContent={
        <MiddleSection
          selectedGod={selectedGod}
          selectedRitualId={selectedRitualId}
          onSelectRitual={handleSelectRitual}
          onPerformRitual={handlePerformRitual}
        />
      }
      rightPanelContent={
        <RightPanel
          ritual={selectedRitual}
          gods={GODS}
        />
      }
    />
  )
}

export default App
