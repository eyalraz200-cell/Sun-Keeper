import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { MiddleSection } from './components/MiddleSection'
import { RightPanel } from './components/RightPanel'
import { GODS } from './data/gods'
import type { God, AngerLevel } from './data/gods'

const tlaloc          = GODS.find(g => g.id === 'tlaloc')!
const quetzalcoatl    = GODS.find(g => g.id === 'quetzalcoatl')!
const huitzilopochtli = GODS.find(g => g.id === 'huitzilopochtli')!
const tezcatlipoca    = GODS.find(g => g.id === 'tezcatlipoca')!
const mictlantecuhtli = GODS.find(g => g.id === 'mictlantecuhtli')!

function variants(base: God, name: string): God[] {
  return [
    { ...base, id: `${base.id}-high`,   name, angerLevel: 'high'   as AngerLevel, angerColor: '#c8322e' },
    { ...base, id: `${base.id}-medium`, name, angerLevel: 'medium' as AngerLevel, angerColor: '#d4662a' },
    { ...base, id: `${base.id}-low`,    name, angerLevel: 'low'    as AngerLevel, angerColor: '#c8a83c' },
    { ...base, id: `${base.id}-none`,   name, angerLevel: 'none'   as AngerLevel, angerColor: '#6C6C6C' },
  ]
}

const DEITY_VARIANTS: God[] = [
  ...variants(tlaloc,          'Tlaloc'),
  ...variants(quetzalcoatl,    'Quetzalcoatl'),
  ...variants(huitzilopochtli, 'Huitzilopochtli'),
  ...variants(tezcatlipoca,    'Tezcatlipoca'),
  ...variants(mictlantecuhtli, 'Mictlantecuhtli'),
]

function App() {
  const [selectedGodId, setSelectedGodId] = useState<string | null>(null)
  const [selectedRitualId, setSelectedRitualId] = useState<string | null>(null)

  const resources = {
    prisoners: 12,
    children: 5,
    virgins: 8,
    volunteers: 20,
  }

  const selectedGod = DEITY_VARIANTS.find(g => g.id === selectedGodId) ?? null
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
      gods={DEITY_VARIANTS}
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
