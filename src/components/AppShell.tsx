import type { ReactNode } from 'react'
import { COLORS } from '../tokens'
import { SidebarNav } from './SidebarNav'
import { DeityList } from './DeityList'
import { ResourceBar } from './ResourceBar'
import type { God } from '../data/gods'

interface AppShellProps {
  gods: God[]
  selectedGodId: string | null
  onSelectGod: (godId: string) => void
  resources: {
    prisoners: number
    children: number
    virgins: number
    volunteers: number
  }
  mainContent: ReactNode
}

export function AppShell({
  gods,
  selectedGodId,
  onSelectGod,
  resources,
  mainContent,
}: AppShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        backgroundColor: COLORS.bgBase,
      }}
    >
      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left navigation */}
        <SidebarNav />

        {/* Deity list sidebar */}
        <DeityList gods={gods} selectedGodId={selectedGodId} onSelect={onSelectGod} />

        {/* Main content area (rituals or empty state) */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: COLORS.bgBase,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {mainContent}
        </div>
      </div>

      {/* Resource bar at bottom */}
      <ResourceBar
        prisoners={resources.prisoners}
        children={resources.children}
        virgins={resources.virgins}
        volunteers={resources.volunteers}
      />
    </div>
  )
}
