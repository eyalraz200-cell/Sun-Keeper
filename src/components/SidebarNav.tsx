import { COLORS, LAYOUT } from '../tokens'
import { HouseLine, Calendar, Sparkle, Clock, User, Gear } from '@phosphor-icons/react'
import logoUrl from '../assets/logo.svg'

interface SidebarNavProps {
  onNavClick?: (section: string) => void
}

export function SidebarNav({ onNavClick }: SidebarNavProps) {
  const navItems = [
    { id: 'pantheon', icon: HouseLine },
    { id: 'calendar', icon: Calendar },
    { id: 'omens', icon: Sparkle },
    { id: 'history', icon: Clock },
  ]

  return (
    <div
      style={{
        width: `${LAYOUT.navWidth}px`,
        height: '100vh',
        flexShrink: 0,
        backgroundColor: COLORS.bgBase,
        borderRight: `1px solid #333333`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '28px',
        gap: '16px',
      }}
    >
      <img src={logoUrl} alt="Sun Keeper" style={{ width: '29px', height: '36px', marginBottom: '12px' }} />
      {navItems.map((item, idx) => {
        const IconComponent = item.icon
        return (
          <button
            key={item.id}
            onClick={() => onNavClick?.(item.id)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '2px',
              backgroundColor: 'transparent',
              border: 'none',
              color: COLORS.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgHover
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            <IconComponent size={24} color={idx === 0 ? COLORS.textPrimary : '#6a6762'} weight="regular" />
          </button>
        )
      })}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingBottom: '24px' }}>
        {[{ id: 'settings', icon: Gear }, { id: 'profile', icon: User }].map((item) => {
          const IconComponent = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavClick?.(item.id)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '2px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgHover
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              }}
            >
              <IconComponent size={24} color="#6a6762" weight="regular" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
