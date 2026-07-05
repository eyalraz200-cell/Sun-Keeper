import { COLORS } from '../../tokens'

interface RingedIconProps {
  size?: number
  borderColor?: string
  borderWidth?: number
  children: React.ReactNode
}

// Thin-bordered circle wrapping a smaller icon — the resource bar's Temple/Grand
// Temple treatment, reused wherever a ritual site icon needs the same delicate
// ringed look instead of a bare, solid-filled glyph.
export function RingedIcon({ size = 44, borderColor = COLORS.gray30, borderWidth = 1.5, children }: RingedIconProps) {
  return (
    <div style={{ flexShrink: 0, width: `${size}px`, height: `${size}px`, borderRadius: '50%', border: `${borderWidth}px solid ${borderColor}`, transition: 'border-color 0.4s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  )
}
