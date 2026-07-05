import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { RESOURCE_TOTALS } from './tokens'
import { AppShell } from './components/layout/AppShell'
import { GODS } from './data/gods'
import { AiChat } from './components/AiChat'
import { MacDesktopIntro } from './components/intro/MacDesktopIntro'
import { FlowChoiceScreen } from './components/intro/FlowChoiceScreen'
import { GodPunishmentDialog, PUNISHMENT_THREATS } from './components/dialogs/GodPunishmentDialog'

// The punishing-god flow's subject — Tlaloc, matching the Figma rough draft (node 244:10627).
// Falls back to the first 'high' anger god if Tlaloc is ever removed from GODS.
const PUNISHING_GOD = GODS.find(g => g.id === 'tlaloc') ?? GODS.find(g => g.angerLevel === 'high') ?? GODS[0]
// Same fallback logic as GodPunishmentDialog's own threatText — kept identical so the
// MacDesktopIntro punishment notification and the dialog never say different things.
const PUNISHMENT_THREAT_TEXT =
  PUNISHMENT_THREATS[PUNISHING_GOD.id] ?? `The empire will suffer ${PUNISHING_GOD.name.toUpperCase()}'s wrath until he is appeased`

function App() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [actionBarVisible, setActionBarVisible] = useState(false)
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [entered, setEntered] = useState(false)
  // Dev pre-screen shown before MacDesktopIntro: 'flow1' takes the regular path through the
  // intro's own notification; 'flow2' skips the intro entirely and jumps straight into the
  // Tlaloc punishment flow. null = choice not made yet.
  const [flowChoice, setFlowChoice] = useState<'flow1' | 'flow2' | null>(null)
  const [punishmentDialogOpen, setPunishmentDialogOpen] = useState(false)
  // Only true once the punishing-god flow has actually been entered (the punishment notification
  // clicked) — the grid/list red-card treatment must stay off until then, not show from t=0
  // regardless of whether the player has even seen the notification yet.
  const [punishingActive, setPunishingActive] = useState(false)
  // Bumped (to Date.now()) by "Appease Now" so HomeScreen jumps straight to PUNISHING_GOD's
  // list-view detail panel — see HomeScreen's openGodId/openGodSignal prop comments.
  const [openGodSignal, setOpenGodSignal] = useState(0)

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
        onAuthorizingChange={setIsAuthorizing}
        entered={entered}
        punishingGodId={punishingActive ? PUNISHING_GOD.id : null}
        openGodId={PUNISHING_GOD.id}
        openGodSignal={openGodSignal}
      />

      <AiChat selectedGod={null} selectedRitual={null} gods={GODS} ritualMode="expanded" onPanelOpenChange={setAiPanelOpen} raised={actionBarVisible} hidden={isAuthorizing} />

      <AnimatePresence>
        {!entered && flowChoice === null && (
          <FlowChoiceScreen
            key="flow-choice"
            onFlow1={() => setFlowChoice('flow1')}
            onFlow2={() => setFlowChoice('flow2')}
          />
        )}

        {!entered && flowChoice !== null && (
          <MacDesktopIntro
            key="mac-intro"
            flow={flowChoice}
            onEnter={() => setEntered(true)}
            onPunishmentAlert={() => {
              setEntered(true)
              setPunishmentDialogOpen(true)
              setPunishingActive(true)
            }}
            punishingGodName={PUNISHING_GOD.name.toUpperCase()}
            punishmentThreatText={PUNISHMENT_THREAT_TEXT}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {entered && punishmentDialogOpen && (
          <GodPunishmentDialog
            key="punishment-dialog"
            god={PUNISHING_GOD}
            onAppeaseNow={() => {
              setPunishmentDialogOpen(false)
              setOpenGodSignal(Date.now())
            }}
            onAppeaseLater={() => setPunishmentDialogOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default App
