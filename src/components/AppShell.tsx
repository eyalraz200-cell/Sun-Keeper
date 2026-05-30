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
  isGodListExpanded: boolean
  onGodListExpandedChange: (expanded: boolean) => void
  wrathfulMode?: boolean
}

export function AppShell({
  gods,
  selectedGodId,
  onSelectGod,
  mainContent,
  activeRituals,
  isGodListExpanded,
  onGodListExpandedChange,
  wrathfulMode,
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
      <GodList
        gods={gods}
        selectedGodId={selectedGodId}
        onSelect={onSelectGod}
        activeRituals={activeRituals}
        wrathfulMode={wrathfulMode}
        isExpanded={isGodListExpanded}
        onToggleExpanded={() => onGodListExpandedChange(!isGodListExpanded)}
        onCloseExpanded={() => onGodListExpandedChange(false)}
      />

      {/* Main content column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
        {/* Scrim over middle section when god list is expanded */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 150,
            opacity: isGodListExpanded ? 1 : 0,
            transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isGodListExpanded ? 'auto' : 'none',
          }}
          onClick={() => onGodListExpandedChange(false)}
        />
        <div style={{ flex: 1, overflow: 'hidden', backgroundColor: COLORS.bgBase, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {mainContent}
        </div>
      </div>

    </div>
  )
}
