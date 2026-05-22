import type { ReactNode } from 'react'
import { COLORS, LAYOUT } from '../tokens'
import { SidebarNav } from './SidebarNav'
import { GodList } from './GodList'
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
  rightPanelContent?: ReactNode
}

export function AppShell({
  gods,
  selectedGodId,
  onSelectGod,
  resources,
  mainContent,
  rightPanelContent,
}: AppShellProps) {
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
      <SidebarNav />

      {/* Deity list sidebar - full height */}
      <GodList gods={gods} selectedGodId={selectedGodId} onSelect={onSelectGod} />

      {/* Main content column - main + resource bar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Main content area */}
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

        {/* Resource bar - only spans main content width */}
        <ResourceBar
          prisoners={resources.prisoners}
          children={resources.children}
          virgins={resources.virgins}
          volunteers={resources.volunteers}
        />
      </div>

      {/* Right panel - full height sibling */}
      <div
        style={{
          width: `${LAYOUT.rightPanelWidth}px`,
          height: '100%',
          backgroundColor: COLORS.bgBase,
          borderLeft: `1px solid #333333`,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {rightPanelContent}
      </div>
    </div>
  )
}
