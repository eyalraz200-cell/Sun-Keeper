import { useRef, useState } from 'react'
import { FONTS } from '../../tokens'
import { FireIcon } from '../icons/FireIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import chichenItzaSrc from '../../assets/Other/Chichen Itza.svg'

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
  onComplete: () => void
}

export function RitualSacrificeOverlay({ counts, onComplete }: RitualSacrificeOverlayProps) {
  const activeVictims = VICTIM_ORDER.filter(key => counts[key] > 0)
  const [placed, setPlaced] = useState<Record<string, boolean>>({})
  const [dragKey, setDragKey] = useState<VictimKey | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [dragPhase, setDragPhase] = useState<'idle' | 'dragging' | 'returning' | 'absorbing'>('idle')

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const pyramidRef = useRef<HTMLImageElement>(null)
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

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragPhase !== 'dragging' || !dragStartRef.current) return
    setDragPos({ x: e.clientX - dragStartRef.current.pointerDx, y: e.clientY - dragStartRef.current.pointerDy })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragPhase !== 'dragging' || !dragKey) return
    const pyramid = pyramidRef.current
    const dropX = e.clientX
    const dropY = e.clientY
    const overPyramid = !!pyramid && (() => {
      const r = pyramid.getBoundingClientRect()
      return dropX >= r.left - DROP_MARGIN && dropX <= r.right + DROP_MARGIN && dropY >= r.top - DROP_MARGIN && dropY <= r.bottom + DROP_MARGIN
    })()

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
        backgroundColor: '#181818',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '52px',
        userSelect: 'none',
      }}
    >
      <img
        ref={pyramidRef}
        src={chichenItzaSrc}
        alt=""
        style={{ width: '567px', height: '639px', maxWidth: '70vh', maxHeight: '70vh', objectFit: 'contain' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
        <FireIcon size={32} color="rgba(255,255,255,0.35)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {activeVictims.map(key => {
            const isPlaced = !!placed[key]
            const isDraggingThis = dragKey === key
            return (
              <div
                key={key}
                ref={el => { cardRefs.current[key] = el }}
                onPointerDown={handlePointerDown(key)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                  width: '83.58px',
                  height: '90.5px',
                  border: '1px solid #d8d8d8',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isPlaced || isDraggingThis ? 0.18 : 1,
                  transition: 'opacity 0.2s ease',
                  cursor: isPlaced ? 'default' : 'grab',
                  touchAction: 'none',
                }}
              >
                <div style={{ width: '67.58px', height: '74.5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', flexShrink: 0 }}>{VICTIM_ICON[key]('#ffffff')}</div>
                  <span style={{ marginTop: '10px', fontFamily: FONTS.spectral, fontSize: '16px', lineHeight: '16px', color: '#ffffff' }}>{isPlaced ? '—' : counts[key]}</span>
                  <span style={{ marginTop: '4px', fontFamily: FONTS.spectral, fontSize: '16px', lineHeight: '16px', color: '#ffffff' }}>{VICTIM_LABEL[key]}</span>
                </div>
              </div>
            )
          })}
        </div>
        <FireIcon size={32} color="rgba(255,255,255,0.35)" />
      </div>

      <p style={{ margin: 0, fontFamily: FONTS.spectral, fontSize: '21px', fontWeight: 300, color: '#ffffff', textAlign: 'center' }}>
        Drag the tributes to their destiny to finalize decision
      </p>

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
            border: '1px solid #d8d8d8',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#181818',
            pointerEvents: 'none',
            zIndex: 4001,
            ...(dragPhase === 'returning' ? { transform: `translate(${dragStartRef.current.originLeft}px, ${dragStartRef.current.originTop}px)` } : {}),
          }}
        >
          <div style={{ width: '67.58px', height: '74.5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', flexShrink: 0 }}>{VICTIM_ICON[dragKey]('#ffffff')}</div>
            <span style={{ marginTop: '10px', fontFamily: FONTS.spectral, fontSize: '16px', lineHeight: '16px', color: '#ffffff' }}>{counts[dragKey]}</span>
            <span style={{ marginTop: '4px', fontFamily: FONTS.spectral, fontSize: '16px', lineHeight: '16px', color: '#ffffff' }}>{VICTIM_LABEL[dragKey]}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export type { VictimKey }
