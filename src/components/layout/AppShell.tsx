import { useState } from 'react'
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
}

export function AppShell({
  resources,
  resourceTotals = RESOURCE_TOTALS,
  aiPanelOpen,
}: AppShellProps) {
  const [activeScreen, setActiveScreen] = useState<string>('overview')

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        backgroundColor: COLORS.bgBase,
      }}
    >
      {/* Left navigation - full height */}
      <SidebarNav activeScreen={activeScreen} onNavClick={setActiveScreen} />

      {/* Main content column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
        <div style={{ flex: 1, overflow: 'hidden', backgroundColor: COLORS.bgBase, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {activeScreen === 'new' ? <NewScreen prisoners={resources?.prisoners ?? 0} volunteers={resources?.volunteers ?? 0} children={resources?.children ?? 0} virgins={resources?.virgins ?? 0} aiPanelOpen={aiPanelOpen} /> : activeScreen === 'overview' ? <HomeScreen prisoners={resources?.prisoners ?? 0} volunteers={resources?.volunteers ?? 0} children={resources?.children ?? 0} virgins={resources?.virgins ?? 0} temples={resources?.temples} greatTemples={resources?.greatTemples} resourceTotals={resourceTotals} aiPanelOpen={aiPanelOpen} /> : activeScreen === 'calendar' ? <CalendarScreen /> : activeScreen === 'dashboard' ? <DashboardScreen /> : activeScreen === 'resources' ? <ResourceScreen prisoners={resources?.prisoners ?? 0} volunteers={resources?.volunteers ?? 0} children={resources?.children ?? 0} virgins={resources?.virgins ?? 0} /> : activeScreen === 'index' ? <PantheonScreen /> : null}
        </div>
      </div>

    </div>
  )
}
