import type { God, Ritual } from '../../data/gods'
import { COLORS } from '../../tokens'

interface RightPanelProps {
  ritual: Ritual | null
  gods: God[]
}

export function RightPanel({ ritual: _ritual, gods: _gods }: RightPanelProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.bgBase,
      }}
    />
  )
}
