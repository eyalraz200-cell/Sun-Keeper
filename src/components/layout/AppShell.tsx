import { useEffect, useState } from 'react'
import { COLORS, RESOURCE_TOTALS } from '../../tokens'
import { SidebarNav } from './SidebarNav'
import { CalendarScreen } from '../screens/CalendarScreen'
import { DashboardScreen } from '../screens/DashboardScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { NewScreen } from '../screens/NewScreen'
import { ResourceScreen } from '../screens/ResourceScreen'
import { PantheonScreen } from '../screens/PantheonScreen'

interface AppShellProps {
  resources?: { prisoners: number; volunteers: number; children: number; virgins: number; temples?: number; greatTemples?: number }
  resourceTotals?: typeof RESOURCE_TOTALS
  aiPanelOpen?: boolean
  onActionBarVisibleChange?: (visible: boolean) => void
  onAuthorizingChange?: (authorizing: boolean) => void
  // Threaded down to HomeScreen so its grid entrance animation fires when MacDesktopIntro is
  // actually dismissed, not when this component (mounted from t=0, behind the intro) first mounts.
  entered?: boolean
  // The punishing-god flow's subject (App.tsx's PUNISHING_GOD.id) — threaded down to HomeScreen
  // so it can reskin that god's card and restrict its ritual candidates. See HomeScreen.tsx.
  punishingGodId?: string | null
  // "Appease Now" jump target — see HomeScreen's openGodId/openGodSignal prop comments. Forces
  // activeScreen back to 'overview' too, in case the user had navigated elsewhere before the
  // punishment dialog's "Appease Now" was clicked.
  openGodId?: string | null
  openGodSignal?: number
}

export function AppShell({
  resources,
  resourceTotals = RESOURCE_TOTALS,
  aiPanelOpen,
  onActionBarVisibleChange,
  onAuthorizingChange,
  entered,
  punishingGodId,
  openGodId,
  openGodSignal = 0,
}: AppShellProps) {
  const [activeScreen, setActiveScreen] = useState<string>('overview')

  useEffect(() => {
    if (openGodSignal === 0) return
    setActiveScreen('overview')
  }, [openGodSignal])

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        backgroundColor: COLORS.black,
      }}
    >
      {/* Left navigation - full height */}
      <SidebarNav activeScreen={activeScreen} onNavClick={setActiveScreen} />

      {/* Main content column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, position: 'relative' }}>
        <div style={{ flex: 1, overflow: 'hidden', backgroundColor: COLORS.black, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
          {activeScreen === 'new' ? <NewScreen prisoners={resources?.prisoners ?? 0} volunteers={resources?.volunteers ?? 0} children={resources?.children ?? 0} virgins={resources?.virgins ?? 0} aiPanelOpen={aiPanelOpen} /> : activeScreen === 'overview' ? <HomeScreen prisoners={resources?.prisoners ?? 0} volunteers={resources?.volunteers ?? 0} children={resources?.children ?? 0} virgins={resources?.virgins ?? 0} temples={resources?.temples} greatTemples={resources?.greatTemples} resourceTotals={resourceTotals} aiPanelOpen={aiPanelOpen} onActionBarVisibleChange={onActionBarVisibleChange} onAuthorizingChange={onAuthorizingChange} entered={entered} punishingGodId={punishingGodId} openGodId={openGodId} openGodSignal={openGodSignal} /> : activeScreen === 'calendar' ? <CalendarScreen /> : activeScreen === 'dashboard' ? <DashboardScreen /> : activeScreen === 'resources' ? <ResourceScreen prisoners={resources?.prisoners ?? 0} volunteers={resources?.volunteers ?? 0} children={resources?.children ?? 0} virgins={resources?.virgins ?? 0} /> : activeScreen === 'index' ? <PantheonScreen /> : null}
        </div>
      </div>

    </div>
  )
}
