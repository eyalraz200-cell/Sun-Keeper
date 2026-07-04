import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { RESOURCE_TOTALS } from './tokens'
import { AppShell } from './components/layout/AppShell'
import { GODS } from './data/gods'
import { AiChat } from './components/AiChat'
import { MacDesktopIntro } from './components/intro/MacDesktopIntro'
import { GodPunishmentDialog } from './components/dialogs/GodPunishmentDialog'

// The punishing-god flow's subject — Tlaloc, matching the Figma rough draft (node 244:10627).
// Falls back to the first 'high' anger god if Tlaloc is ever removed from GODS.
const PUNISHING_GOD = GODS.find(g => g.id === 'tlaloc') ?? GODS.find(g => g.angerLevel === 'high') ?? GODS[0]

function App() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [actionBarVisible, setActionBarVisible] = useState(false)
  const [entered, setEntered] = useState(false)
  const [punishmentDialogOpen, setPunishmentDialogOpen] = useState(false)

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
        onActionBarVisibleChange={setActionBarVisible}
        entered={entered}
      />

      <AiChat selectedGod={null} selectedRitual={null} gods={GODS} ritualMode="expanded" onPanelOpenChange={setAiPanelOpen} raised={actionBarVisible} />

      <AnimatePresence>
        {!entered && (
          <MacDesktopIntro
            key="mac-intro"
            onEnter={() => setEntered(true)}
            onPunishmentAlert={() => {
              setEntered(true)
              setPunishmentDialogOpen(true)
            }}
            punishingGodName={PUNISHING_GOD.name.toUpperCase()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {entered && punishmentDialogOpen && (
          <GodPunishmentDialog
            key="punishment-dialog"
            god={PUNISHING_GOD}
            onAppeaseNow={() => setPunishmentDialogOpen(false)}
            onAppeaseLater={() => setPunishmentDialogOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default App
