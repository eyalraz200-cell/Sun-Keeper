import { useState } from 'react'
import { FONTS } from '../tokens'

interface CtaButtonProps {
  label: string
  onClick: () => void
  active?: boolean
  visible?: boolean
}

export function CtaButton({ label, onClick, active = false, visible = true }: CtaButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const filled = active && isHovered

  return (
    <button
      onClick={onClick}
      disabled={!active}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '0 32px',
        height: '44px',
        border: visible ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.25)',
        borderRadius: '8px',
        backgroundColor: filled ? '#ffffff' : 'transparent',
        color: filled ? '#000000' : '#ffffff',
        fontFamily: FONTS.spectral,
        fontWeight: 400,
        fontSize: '16px',
        textTransform: 'uppercase',
        cursor: active ? 'pointer' : 'not-allowed',
        opacity: visible ? (active ? 1 : 0.39) : 0.12,
        boxShadow: active ? '0 4px 20px rgba(0,0,0,0.45)' : 'none',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      {label}
    </button>
  )
}
