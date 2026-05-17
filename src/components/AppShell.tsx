import type { ReactNode } from 'react'
import { COLORS, FONTS } from '../tokens'
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
  selectedGodName?: string
  selectedGodDesc?: string
}

export function AppShell({
  gods,
  selectedGodId,
  onSelectGod,
  resources,
  mainContent,
  selectedGodName,
  selectedGodDesc,
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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: `1px solid ${COLORS.borderDim}`,
          backgroundColor: COLORS.bgBase,
          minHeight: '60px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: FONTS.cinzel,
              fontSize: '20px',
              fontWeight: 'normal',
              letterSpacing: '1.2px',
              color: COLORS.textBase,
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {selectedGodName ? selectedGodName.toUpperCase() : 'NO GOD SELECTED'}
          </h1>
          {selectedGodDesc && (
            <p
              style={{
                fontFamily: FONTS.spectral,
                fontSize: '14px',
                color: COLORS.textMuted,
                margin: '4px 0 0 0',
              }}
            >
              {selectedGodDesc}
            </p>
          )}
        </div>
      </div>

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

        {/* Right sidebar (placeholder) */}
        <div
          style={{
            width: '331px',
            backgroundColor: COLORS.bgBase,
            borderLeft: `1px solid ${COLORS.borderDim}`,
            opacity: 0.1,
          }}
        />
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
