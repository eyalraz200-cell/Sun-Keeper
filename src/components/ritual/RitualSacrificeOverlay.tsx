import { useRef, useState } from 'react'
import { FONTS, COLORS, FONT_SIZE, FONT_WEIGHT } from '../../tokens'
import { FireIcon } from '../icons/FireIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { GodSvg } from '../gods/GodSvg'
import { getSvgRaw } from '../gods/GodCard'
import { GODS, type God, type Ritual } from '../../data/gods'
import chichenItzaRaw from '../../assets/Other/ChichenItza.svg?raw'

type VictimKey = 'prisoners' | 'volunteers' | 'children' | 'virgins'

const VICTIM_ORDER: VictimKey[] = ['prisoners', 'volunteers', 'children', 'virgins']

const VICTIM_LABEL: Record<VictimKey, string> = {
  prisoners: 'Prisoners',
  volunteers: 'Volunteers',
  children: 'Children',
  virgins: 'Virgins',
}

const VICTIM_ICON: Record<VictimKey, (color: string) => React.ReactNode> = {
  prisoners: color => <PrisonerIcon size={28} color={color} />,
  volunteers: color => <VolunteerIcon size={28} color={color} />,
  children: color => <ChildrenIcon size={28} color={color} />,
  virgins: color => <VirginIcon size={28} color={color} />,
}

const DROP_MARGIN = 48 // forgiving hit-area around the pyramid for a successful drop
const RETURN_DURATION = 320
const ABSORB_DURATION = 260

interface RitualSacrificeOverlayProps {
  counts: Record<VictimKey, number>
  chosenRituals: Record<string, string>
  onComplete: () => void
}

export function RitualSacrificeOverlay({ counts, chosenRituals, onComplete }: RitualSacrificeOverlayProps) {
  const activeVictims = VICTIM_ORDER.filter(key => counts[key] > 0)
  const sacrificeEntries = Object.entries(chosenRituals)
    .map(([godId, ritualId]) => {
      const god = GODS.find(g => g.id === godId.replace(/-dup-\d+$/, ''))
      const ritual = god?.rituals.find(r => r.id === ritualId)
      return god && ritual ? { god, ritual } : null
    })
    .filter((entry): entry is { god: God; ritual: Ritual } => !!entry)
  const [placed, setPlaced] = useState<Record<string, boolean>>({})
  const [hoveredKey, setHoveredKey] = useState<VictimKey | null>(null)
  const [dragKey, setDragKey] = useState<VictimKey | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [dragPhase, setDragPhase] = useState<'idle' | 'dragging' | 'returning' | 'absorbing'>('idle')
  const [isOverPyramid, setIsOverPyramid] = useState(false)

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const pyramidRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ originLeft: number; originTop: number; pointerDx: number; pointerDy: number } | null>(null)

  const handlePointerDown = (key: VictimKey) => (e: React.PointerEvent) => {
    if (placed[key] || dragPhase !== 'idle') return
    const card = cardRefs.current[key]
    if (!card) return
    const rect = card.getBoundingClientRect()
    dragStartRef.current = {
      originLeft: rect.left,
      originTop: rect.top,
      pointerDx: e.clientX - rect.left,
      pointerDy: e.clientY - rect.top,
    }
    setDragKey(key)
    setDragPos({ x: rect.left, y: rect.top })
    setDragPhase('dragging')
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const isPointOverPyramid = (x: number, y: number) => {
    const pyramid = pyramidRef.current
    if (!pyramid) return false
    const r = pyramid.getBoundingClientRect()
    return x >= r.left - DROP_MARGIN && x <= r.right + DROP_MARGIN && y >= r.top - DROP_MARGIN && y <= r.bottom + DROP_MARGIN
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragPhase !== 'dragging' || !dragStartRef.current) return
    setDragPos({ x: e.clientX - dragStartRef.current.pointerDx, y: e.clientY - dragStartRef.current.pointerDy })
    setIsOverPyramid(isPointOverPyramid(e.clientX, e.clientY))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragPhase !== 'dragging' || !dragKey) return
    const pyramid = pyramidRef.current
    const overPyramid = isPointOverPyramid(e.clientX, e.clientY)
    setIsOverPyramid(false)

    if (overPyramid && pyramid) {
      const r = pyramid.getBoundingClientRect()
      setDragPos({ x: r.left + r.width / 2 - 12, y: r.top + r.height / 2 - 12 })
      setDragPhase('absorbing')
      const key = dragKey
      setTimeout(() => {
        setPlaced(prev => {
          const next = { ...prev, [key]: true }
          if (VICTIM_ORDER.filter(k => counts[k] > 0).every(k => next[k])) {
            setTimeout(onComplete, 500)
          }
          return next
        })
        setDragPhase('idle')
        setDragKey(null)
        setDragPos(null)
      }, ABSORB_DURATION)
    } else {
      setDragPhase('returning')
      setTimeout(() => {
        setDragPhase('idle')
        setDragKey(null)
        setDragPos(null)
      }, RETURN_DURATION)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '52px',
        userSelect: 'none',
      }}
    >
      {/* Two stacked background layers crossfaded via opacity — `background` (gradient) cannot be
          smoothly interpolated between two different radial-gradient() values in this browser, it
          snaps instantly regardless of a declared transition. Opacity transitions are reliably
          smooth, so we fade the "dragging" layer in/out over the idle layer instead. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background: `radial-gradient(circle at 50% 40%, ${COLORS.gray18} 0%, ${COLORS.gray18} 40%, ${COLORS.black} 220%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background: `radial-gradient(circle at 50% 40%, ${COLORS.white} 0%, ${COLORS.white} 40%, ${COLORS.black} 220%)`,
          opacity: dragPhase === 'dragging' ? 1 : 0,
          transition: 'opacity 900ms ease-in-out',
        }}
      />
      {sacrificeEntries.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
          {sacrificeEntries.map(({ god }) => (
            <div key={god.id} style={{ width: '135px', height: '209px' }}>
              <GodSvg
                svgRaw={getSvgRaw(god.id)}
                angerLevel={god.angerLevel}
                bodyColor={dragPhase === 'dragging' ? COLORS.gray0 : undefined}
              />
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '52px',
          filter: dragPhase === 'dragging' ? 'invert(1)' : 'none',
          transition: 'filter 900ms ease-in-out',
        }}
      >
        <div
          ref={pyramidRef}
          style={{
            width: '397px',
            height: '447px',
            maxWidth: '49vh',
            maxHeight: '49vh',
            opacity: 0.8,
            filter: isOverPyramid ? `drop-shadow(0 0 10px ${COLORS.white})` : 'none',
            transition: 'filter 0.2s ease',
          }}
          dangerouslySetInnerHTML={{
            __html: chichenItzaRaw
              .replace(/(<svg[^>]*)\swidth="[^"]*"/, '$1 width="100%"')
              .replace(/(<svg[^>]*)\sheight="[^"]*"/, '$1 height="100%"'),
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
          <FireIcon size={64} color={COLORS.white} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {activeVictims.filter(key => !placed[key]).map(key => {
              const isDraggingThis = dragKey === key
              const isHovered = hoveredKey === key && !isDraggingThis
              return (
                <div
                  key={key}
                  ref={el => { cardRefs.current[key] = el }}
                  onPointerDown={handlePointerDown(key)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerEnter={() => setHoveredKey(key)}
                  onPointerLeave={() => setHoveredKey(prev => (prev === key ? null : prev))}
                  style={{
                    width: '83.58px',
                    height: '90.5px',
                    backgroundColor: COLORS.gray15,
                    borderRadius: '12px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                    opacity: isDraggingThis ? 0.18 : 1,
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    // counters the wrapper's filter: invert(1) while dragging, so cards keep their normal colors
                    filter: dragPhase === 'dragging' ? 'invert(1)' : 'none',
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                    cursor: 'grab',
                    touchAction: 'none',
                  }}
                >
                  <div style={{ width: '67.58px', height: '74.5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', flexShrink: 0 }}>{VICTIM_ICON[key](COLORS.gray60)}</div>
                    <span style={{ marginTop: '10px', fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, lineHeight: '16px', color: COLORS.gray95 }}>{counts[key]}</span>
                    <span style={{ marginTop: '4px', fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, lineHeight: '16px', color: COLORS.gray95 }}>{VICTIM_LABEL[key]}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <FireIcon size={64} color={COLORS.white} />
        </div>

        <p style={{ margin: 0, fontFamily: FONTS.spectral, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.light, color: COLORS.white, textAlign: 'center' }}>
          Drag the tributes to the altar to authorize the ritual
        </p>
      </div>

      {dragKey && dragPos && dragStartRef.current && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
            transition: dragPhase === 'returning' ? `transform ${RETURN_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)` : dragPhase === 'absorbing' ? `transform ${ABSORB_DURATION}ms ease-in, opacity ${ABSORB_DURATION}ms ease-in` : 'none',
            opacity: dragPhase === 'absorbing' ? 0 : 1,
            width: '83.58px',
            height: '90.5px',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.gray15,
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            zIndex: 4001,
            ...(dragPhase === 'returning' ? { transform: `translate(${dragStartRef.current.originLeft}px, ${dragStartRef.current.originTop}px)` } : {}),
          }}
        >
          <div style={{ width: '67.58px', height: '74.5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', flexShrink: 0 }}>{VICTIM_ICON[dragKey](COLORS.gray60)}</div>
            <span style={{ marginTop: '10px', fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, lineHeight: '16px', color: COLORS.gray95 }}>{counts[dragKey]}</span>
            <span style={{ marginTop: '4px', fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, lineHeight: '16px', color: COLORS.gray95 }}>{VICTIM_LABEL[dragKey]}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export type { VictimKey }
