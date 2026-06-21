import { useRef, useState, useCallback } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { FONTS } from '../tokens'
import { GodSvg } from './GodSvg'
import { GOD_SVG_MAP } from './GodCard'
import { GODS } from '../data/gods'
import { PANTHEON_NODES, PANTHEON_EDGES, NODE_POSITIONS } from '../data/godIndex'
import type { PantheonNode } from '../data/godIndex'

// Card dimensions by tier: [cardWidth, svgWidth, svgHeight]
// Name area always 38px (matching GodCard), card paddingBottom always 16px
const CARD_DIMS: Record<number, [number, number, number]> = {
  1: [191, 125, 194],
  2: [155, 100, 155],
  3: [120,  78, 120],
}
const OMETEOTL_DIMS: [number, number, number] = [191, 125, 194]
const NAME_H = 38
const CARD_PADDING_BOTTOM = 16

// Map god id → anger level from the GODS array
const GOD_ANGER = Object.fromEntries(GODS.map(g => [g.id, g.angerLevel]))

const EDGE_STYLE = {
  family: { stroke: '#ffffff', strokeWidth: 1, strokeDasharray: undefined, opacity: 0.2 },
  spouse: { stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '6 4', opacity: 0.2 },
  rival:  { stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '2 5', opacity: 0.2 },
}

// ── Detail view ──────────────────────────────────────────────────────────────

function GodDetailView({ godId, onBack }: { godId: string; onBack: () => void }) {
  const node = PANTHEON_NODES.find(n => n.id === godId)!
  const svgRaw = GOD_SVG_MAP[godId] ?? GOD_SVG_MAP['tlaloc']
  const angerLevel = 'none' as const
  const god = GODS.find(g => g.id === godId) ?? null
  const tierLabel = ['', 'Primary Deity', 'Secondary Deity', 'Minor Deity'][node.tier]

  // Derive preferred sacrifice types from ritual participant data
  const sacrificeTypes: string[] = []
  if (god) {
    const totals = god.rituals.reduce(
      (acc, r) => ({
        prisoners: acc.prisoners + r.participants.prisoners,
        children: acc.children + r.participants.children,
        virgins: acc.virgins + r.participants.virgins,
        volunteers: acc.volunteers + r.participants.volunteers,
      }),
      { prisoners: 0, children: 0, virgins: 0, volunteers: 0 }
    )
    if (totals.prisoners > 0) sacrificeTypes.push('Prisoners')
    if (totals.children > 0) sacrificeTypes.push('Children')
    if (totals.virgins > 0) sacrificeTypes.push('Virgins')
    if (totals.volunteers > 0) sacrificeTypes.push('Volunteers')
  }

  const connections = PANTHEON_EDGES
    .filter(e => e.source === godId || e.target === godId)
    .map(e => {
      const otherId = e.source === godId ? e.target : e.source
      const otherNode = PANTHEON_NODES.find(n => n.id === otherId)!
      return { node: otherNode, type: e.type }
    })

  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundColor: '#181818',
      display: 'flex',
      zIndex: 10,
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: 28, left: 28, zIndex: 11,
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.5)',
          fontFamily: FONTS.spectral, fontSize: 14, letterSpacing: '1px',
        }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Left — large god face */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '55vh', height: '55vh' }}>
          <GodSvg svgRaw={svgRaw} angerLevel={angerLevel} isHovered />
        </div>
      </div>

      {/* Right — info panel */}
      <div style={{
        width: '50%',
        display: 'flex', flexDirection: 'column',
        padding: '80px 64px',
        gap: 24,
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}>
        {/* God name */}
        <div style={{
          fontFamily: FONTS.cinzel, fontSize: 39, fontWeight: 400,
          textTransform: 'uppercase', letterSpacing: '3.3px', color: '#ffffff',
          lineHeight: 1.2,
        }}>
          {node.name}
        </div>

        {/* Description label */}
        <div style={{
          fontFamily: FONTS.spectral, fontSize: 16,
          color: '#ffffff', letterSpacing: '3.3px',
        }}>
          description
        </div>

        {/* Box 1 — Sacrifice preferences */}
        <div style={{
          border: '1px solid #ffffff',
          minHeight: 97,
          padding: '20px 24px',
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: FONTS.spectral, fontSize: 14, fontWeight: 300,
            color: 'rgba(255,255,255,0.6)',
          }}>
            {sacrificeTypes.length > 0 ? sacrificeTypes.join(' · ') : '—'}
          </span>
        </div>

        {/* Box 2 — God info */}
        <div style={{
          border: '1px solid #ffffff',
          minHeight: 272,
          padding: '28px 32px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <span style={{
            fontFamily: FONTS.spectral, fontSize: 15, fontWeight: 300,
            color: 'rgba(255,255,255,0.7)',
          }}>
            {god?.subtitle ?? '—'}
          </span>
          <span style={{
            fontFamily: FONTS.cinzel, fontSize: 10, letterSpacing: '3px',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginTop: 'auto',
          }}>
            {tierLabel}
          </span>
        </div>

        {/* Related gods */}
        {connections.length > 0 && (
          <>
            <div style={{
              fontFamily: FONTS.spectral, fontSize: 16,
              color: '#ffffff', letterSpacing: '3.3px',
            }}>
              related gods
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {connections.map(({ node: relNode, type }) => {
                const relSvg = GOD_SVG_MAP[relNode.id] ?? GOD_SVG_MAP['tlaloc']
                const relAnger = 'none' as const
                const [cw, sw, sh] = [120, 78, 120] as [number, number, number]
                const ch = NAME_H + sh + CARD_PADDING_BOTTOM
                return (
                  <div key={relNode.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: cw, height: ch,
                      backgroundColor: '#181818',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      paddingBottom: CARD_PADDING_BOTTOM,
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: NAME_H, width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        paddingTop: 12, paddingBottom: 8, paddingLeft: 6, paddingRight: 6,
                        flexShrink: 0, boxSizing: 'border-box',
                      }}>
                        <span style={{
                          fontFamily: FONTS.cinzel, fontSize: 12, fontWeight: 500,
                          textTransform: 'uppercase', letterSpacing: '1px',
                          color: '#6C6C6C', whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {relNode.name}
                        </span>
                      </div>
                      <div style={{
                        width: sw, height: sh,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <GodSvg svgRaw={relSvg} angerLevel={relAnger} />
                      </div>
                    </div>
                    <span style={{
                      fontFamily: FONTS.cinzel, fontSize: 9, letterSpacing: '3px',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                    }}>
                      {type}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Node ─────────────────────────────────────────────────────────────────────

function PantheonNode({ node, onSelect }: { node: PantheonNode; onSelect: (id: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const isOmeteotl = node.id === 'ometeotl'
  const [cardW, svgW, svgH] = isOmeteotl ? OMETEOTL_DIMS : CARD_DIMS[node.tier]
  const cardH = NAME_H + svgH + CARD_PADDING_BOTTOM
  const svgRaw = GOD_SVG_MAP[node.id] ?? GOD_SVG_MAP['tlaloc']
  const angerLevel = 'none' as const
  const pos = NODE_POSITIONS[node.id] ?? { x: 0, y: 0 }

  const borderColor = hovered ? '#ffffff' : 'rgba(255,255,255,0.08)'
  const nameColor = hovered ? '#F0F0F0' : '#6C6C6C'

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x - cardW / 2,
        top: pos.y - cardH / 2,
        width: cardW,
        height: cardH,
        cursor: 'pointer',
        backgroundColor: '#181818',
        zIndex: 1,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: CARD_PADDING_BOTTOM,
        transition: 'border-color 0.15s ease',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
      onMouseDown={e => e.stopPropagation()}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name — matches GodCard name area exactly */}
      <div style={{
        height: NAME_H,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: 12, paddingBottom: 8, paddingLeft: 6, paddingRight: 6,
        flexShrink: 0, boxSizing: 'border-box',
      }}>
        <span style={{
          fontFamily: FONTS.cinzel,
          fontSize: 12,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: nameColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color 0.15s ease',
        }}>
          {node.name}
        </span>
      </div>

      {/* SVG face — centered like GodCard's 125×194 container */}
      <div style={{
        width: svgW, height: svgH,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <GodSvg svgRaw={svgRaw} angerLevel={angerLevel} isHovered={hovered} />
      </div>
    </div>
  )
}


// ── Main screen ───────────────────────────────────────────────────────────────

export function PantheonScreen() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const scale = 1
  const [isDragging, setIsDragging] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const dragOrigin = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }, [offset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({
      x: dragOrigin.current.ox + (e.clientX - dragOrigin.current.mx),
      y: dragOrigin.current.oy + (e.clientY - dragOrigin.current.my),
    })
  }, [isDragging])

  const stopDrag = useCallback(() => setIsDragging(false), [])


  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', height: '100%',
        overflow: 'hidden', backgroundColor: '#181818',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* Canvas — origin anchored at viewport center */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: '0 0',
        willChange: 'transform',
      }}>
        {/* Edge layer */}
        <svg
          style={{
            position: 'absolute',
            left: -4000, top: -4000,
            width: 8000, height: 8000,
            overflow: 'visible',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {PANTHEON_EDGES.map((edge, i) => {
            const src = NODE_POSITIONS[edge.source]
            const tgt = NODE_POSITIONS[edge.target]
            if (!src || !tgt) return null
            const style = EDGE_STYLE[edge.type]
            return (
              <line
                key={i}
                x1={src.x + 4000} y1={src.y + 4000}
                x2={tgt.x + 4000} y2={tgt.y + 4000}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
                opacity={style.opacity}
              />
            )
          })}
        </svg>

        {/* Node layer */}
        {PANTHEON_NODES.map(node => (
          <PantheonNode
            key={node.id}
            node={node}
            onSelect={id => {
              setIsDragging(false)
              setSelectedId(id)
            }}
          />
        ))}
      </div>


      {/* Detail view */}
      {selectedId && (
        <GodDetailView
          godId={selectedId}
          onBack={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
