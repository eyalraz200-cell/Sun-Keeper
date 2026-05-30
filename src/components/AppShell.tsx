import { type ReactNode } from 'react'
import { COLORS } from '../tokens'
import { SidebarNav } from './SidebarNav'
import { GodList } from './GodList'
import type { God } from '../data/gods'

interface AppShellProps {
  gods: God[]
  selectedGodId: string | null
  onSelectGod: (godId: string) => void
  mainContent: ReactNode
  activeRituals?: Record<string, string>
}

export function AppShell({
  gods,
  selectedGodId,
  onSelectGod,
  mainContent,
  activeRituals,
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
      <GodList gods={gods} selectedGodId={selectedGodId} onSelect={onSelectGod} activeRituals={activeRituals} />

      {/* Main content column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, overflow: 'hidden', backgroundColor: COLORS.bgBase, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {mainContent}
        </div>
      </div>

    </div>
  )
}
