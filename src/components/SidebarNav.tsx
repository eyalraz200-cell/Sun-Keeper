import { useState } from 'react'
import { COLORS, LAYOUT } from '../tokens'
import { Calendar, Sparkle, Clock } from '@phosphor-icons/react'
import logoUrl from '../assets/logo.svg'

function GearIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="m451.588 260.532v-9.064l45.151-68.385c4.174-6.322 4.418-14.459.63-21.02l-39.334-68.127c-3.787-6.561-10.958-10.425-18.519-9.964l-81.797 4.91-7.851-4.533-36.647-73.294c-3.387-6.775-10.313-11.055-17.888-11.055h-78.667c-7.576 0-14.5 4.28-17.889 11.056l-36.646 73.294-7.851 4.533-81.798-4.91c-7.57-.46-14.731 3.404-18.519 9.964l-39.333 68.127c-3.788 6.561-3.544 14.698.63 21.02l45.151 68.385v9.064l-45.151 68.385c-4.174 6.322-4.418 14.459-.63 21.02l39.333 68.127c3.788 6.561 10.956 10.424 18.519 9.964l81.798-4.91 7.851 4.533 36.646 73.294c3.389 6.774 10.314 11.054 17.89 11.054h78.667c7.575 0 14.501-4.28 17.889-11.056l36.647-73.294 7.851-4.533 81.797 4.91c7.559.452 14.731-3.404 18.519-9.964l39.334-68.127c3.788-6.561 3.544-14.698-.63-21.02zm-22.013 126.827c-75.786-3.499-77.569-7.129-86.653-1.885l-18.255 10.54c-9.079 5.241-6.855 8.649-41.694 75.987h-53.945c-34.82-67.3-32.614-70.745-41.694-75.987l-18.255-10.54c-9.082-5.243-10.94-1.611-86.654 1.885l-26.973-46.718c40.874-63.805 44.96-63.613 44.96-74.102v-21.078c0-10.487-4.075-10.28-44.96-74.102l26.973-46.718c75.75 3.498 77.575 7.128 86.654 1.885l18.255-10.54c9.082-5.243 6.865-8.669 41.694-75.987h53.945c34.82 67.3 32.614 70.745 41.694 75.987l18.255 10.54c9.079 5.242 10.866 1.614 86.653-1.885l26.973 46.718c-40.874 63.805-44.96 63.613-44.96 74.102v21.078c0 10.487 4.075 10.28 44.96 74.102zm-173.575-230.026c-54.405 0-98.667 44.262-98.667 98.667s44.262 98.667 98.667 98.667 98.667-44.262 98.667-98.667-44.262-98.667-98.667-98.667zm0 157.334c-32.349 0-58.667-26.318-58.667-58.667s26.318-58.667 58.667-58.667 58.667 26.318 58.667 58.667-26.318 58.667-58.667 58.667z"/>
    </svg>
  )
}

function ProfileIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="m470.995 49.377c-4.261-3.006-38.989-49.377-107.367-49.377h-215.256c-68.386 0-103.155 46.405-107.367 49.377-26.442 26.443-41.005 61.6-41.005 98.995v215.256c0 68.386 46.405 103.155 49.377 107.367 26.443 26.443 61.6 41.005 98.995 41.005h215.256c37.396 0 72.552-14.563 98.995-41.005 3.006-4.261 49.377-38.989 49.377-107.367v-215.256c0-37.395-14.562-72.552-41.005-98.995zm-107.367 422.623h-215.256c-25.534 0-49.607-9.505-68.178-26.842 86.395-120.716 265.365-120.507 351.611 0-18.57 17.337-42.643 26.842-68.177 26.842zm-205.628-255.333c0-54.038 43.963-98 98-98s98 43.962 98 98-43.963 98-98 98-98-43.963-98-98zm314 146.961c0 17.979-4.712 35.233-13.553 50.353-30.482-39.305-72.21-69.694-120.934-86.022 34.227-25.139 56.487-65.666 56.487-111.292 0-76.093-61.907-138-138-138s-138 61.907-138 138c0 45.626 22.26 86.154 56.487 111.292-48.688 16.317-90.428 46.687-120.934 86.022-8.841-15.12-13.553-32.374-13.553-50.353v-215.256c0-26.711 10.402-51.823 29.289-70.71 4.235-3.045 28.978-37.662 79.083-37.662h215.256c50.375 0 74.701 34.51 79.083 37.662 18.887 18.887 29.289 44 29.289 70.71z"/>
    </svg>
  )
}

function PyramidIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="m492 334.368h-39v-98c0-11.046-8.954-20-20-20h-39v-98c0-11.046-8.954-20-20-20h-39v-58.736c0-11.046-8.954-20-20-20h-118c-11.046 0-20 8.954-20 20v58.737h-39c-11.046 0-20 8.954-20 20v98h-39c-11.046 0-20 8.954-20 20v98h-39c-11.046 0-20 8.954-20 20v118c0 11.046 8.954 20 20 20h472c11.046 0 20-8.954 20-20v-118c0-11.046-8.954-20.001-20-20.001zm-275-274.736h78v38.737h-78zm-59 78.736h196v78h-196zm-59 118h314v78h-314zm373 196h-432v-78h432z"/>
    </svg>
  )
}

function NavButton({ onClick, children, active = false }: { onClick?: () => void; children: (color: string) => React.ReactNode; active?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const color = active ? '#ffffff' : hovered ? '#a8a4a0' : '#6a6762'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: '32px', height: '32px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
    >
      {children(color)}
    </button>
  )
}

interface SidebarNavProps {
  onNavClick?: (section: string) => void
}

export function SidebarNav({ onNavClick }: SidebarNavProps) {
  const navItems = [
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
      <NavButton onClick={() => onNavClick?.('pantheon')} active>
        {color => <PyramidIcon size={24} color={color} />}
      </NavButton>
      {navItems.map((item) => {
        const IconComponent = item.icon
        return (
          <NavButton key={item.id} onClick={() => onNavClick?.(item.id)}>
            {color => <IconComponent size={24} color={color} weight="regular" />}
          </NavButton>
        )
      })}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingBottom: '24px' }}>
        <NavButton onClick={() => onNavClick?.('settings')}>
          {color => <GearIcon size={24} color={color} />}
        </NavButton>
        <NavButton onClick={() => onNavClick?.('profile')}>
          {color => <ProfileIcon size={24} color={color} />}
        </NavButton>
      </div>
    </div>
  )
}
