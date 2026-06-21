import { useState } from 'react'
import { RESOURCE_TOTALS } from './tokens'
import { AppShell } from './components/AppShell'
import { GODS } from './data/gods'
import { AiChat } from './components/AiChat'

function App() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false)

  // Global resource pool — shared across all gods. Authorizing rituals on the overview screen
  // deducts from this via HomeScreen's own internal spentCost tracking.
  const resources = {
    prisoners: RESOURCE_TOTALS.prisoners,
    children: RESOURCE_TOTALS.children,
    virgins: RESOURCE_TOTALS.virgins,
    volunteers: RESOURCE_TOTALS.volunteers,
    temples: RESOURCE_TOTALS.temples,
    greatTemples: RESOURCE_TOTALS.greatTemples,
  }

  return (
    <>
      <AppShell
        resources={resources}
        resourceTotals={RESOURCE_TOTALS}
        aiPanelOpen={aiPanelOpen}
      />

      <AiChat selectedGod={null} selectedRitual={null} gods={GODS} ritualMode="expanded" onPanelOpenChange={setAiPanelOpen} />
    </>
  )
}

export default App
