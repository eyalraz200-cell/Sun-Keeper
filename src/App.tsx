import { useState } from 'react'
import type { AngerLevel } from './data/gods'
import { AppShell } from './components/AppShell'
import { StartScreen } from './components/StartScreen'
import { MiddleSection } from './components/MiddleSection'
import { GodSvg } from './components/GodSvg'
import { PrisonerIcon } from './components/PrisonerIcon'
import { VolunteerIcon } from './components/VolunteerIcon'
import { ChildrenIcon } from './components/ChildrenIcon'
import { VirginIcon } from './components/VirginIcon'
import { GODS } from './data/gods'
import tlalocRaw from './assets/Gods/Tlaloc.svg?raw'
import quetzalcoatlRaw from './assets/Gods/Quetzalcoatl.svg?raw'
import huitzilopochtliRaw from './assets/Gods/huitzilopochtli.svg?raw'
import mictlantecuhtliRaw from './assets/Gods/Mictlantecuhtli.svg?raw'

const OUTCOME_LABEL: Record<string, string> = {
  '#c8322e': 'Furious',
  '#d4662a': 'Offended',
  '#d4a83c': 'Uneasy',
  '#c8a83c': 'Peaceful',
}

const OUTCOME_EYE: Record<string, { color: string; weight: number }> = {
  '#c8322e': { color: '#FF2435', weight: 6 },
  '#d4662a': { color: '#EF7B2E', weight: 4 },
  '#d4a83c': { color: '#D7C94E', weight: 3 },
  '#c8a83c': { color: '#ffffff', weight: 2 },
}

// Eye colors for the dark overlay (hovered/white body context)
const ANGER_EYE_DARK: Record<AngerLevel, { color: string; weight: number }> = {
  high:   { color: '#FF2435', weight: 6 },
  medium: { color: '#EF7B2E', weight: 4 },
  low:    { color: '#D7C94E', weight: 3 },
  none:   { color: '#F0F0F0', weight: 2 },
}

const OUTCOME_TO_ANGER: Record<string, AngerLevel> = {
  '#c8322e': 'high',
  '#d4662a': 'medium',
  '#d4a83c': 'low',
  '#c8a83c': 'none',
}

const GOD_SVG_MAP: Record<string, string> = {
  tlaloc: tlalocRaw,
  quetzalcoatl: quetzalcoatlRaw,
  huitzilopochtli: huitzilopochtliRaw,
  mictlantecuhtli: mictlantecuhtliRaw,
  tezcatlipoca: huitzilopochtliRaw,
  coyolxauhqui: quetzalcoatlRaw,
  tonatiuh: huitzilopochtliRaw,
}

function App() {
  const [startScreen, setStartScreen] = useState<'visible' | 'dismissing' | 'gone'>('visible')
  const [selectedGodId, setSelectedGodId] = useState<string | null>(null)
  const [selectedRitualId, setSelectedRitualId] = useState<string | null>(null)
  const [hoveredRitualId, setHoveredRitualId] = useState<string | null>(null)
  const [ritualActive, setRitualActive] = useState(false)
  const [ritualDismissing, setRitualDismissing] = useState(false)
  const [activeRituals, setActiveRituals] = useState<Record<string, string>>({})  // godId → ritualId

  const resources = {
    prisoners: 1840,
    children: 312,
    virgins: 47,
    volunteers: 763,
  }

  const selectedGod = GODS.find(g => g.id === selectedGodId) ?? null
  const selectedRitual = selectedGod?.rituals.find(r => r.id === selectedRitualId) ?? null
  const hoveredRitual = selectedGod?.rituals.find(r => r.id === hoveredRitualId) ?? null

  const handleEnter = () => {
    setStartScreen('dismissing')
    setTimeout(() => setStartScreen('gone'), 600)
  }

  const handleSelectGod = (godId: string) => {
    if (selectedGodId === godId) {
      setSelectedGodId(null)
      setSelectedRitualId(null)
    } else {
      setSelectedGodId(godId)
      setSelectedRitualId(null)
    }
  }

  const handleSelectRitual = (ritualId: string) => {
    if (selectedRitualId === ritualId) {
      setSelectedRitualId(null)
    } else {
      setSelectedRitualId(ritualId)
    }
  }

  const handlePerformRitual = () => {
    if (!selectedGod || !selectedRitualId) return
    setActiveRituals(prev => ({ ...prev, [selectedGod.id]: selectedRitualId }))
    setRitualActive(true)
  }

  const handleDismissRitual = () => {
    setRitualDismissing(true)
    setTimeout(() => {
      setRitualActive(false)
      setRitualDismissing(false)
    }, 700)
  }

  return (
    <>
      {startScreen !== 'gone' && (
        <StartScreen dismissing={startScreen === 'dismissing'} onClick={handleEnter} />
      )}
      <AppShell
        gods={GODS}
        selectedGodId={selectedGodId}
        onSelectGod={handleSelectGod}
        activeRituals={activeRituals}
        mainContent={
          <MiddleSection
            selectedGod={selectedGod}
            selectedRitualId={selectedRitualId}
            onSelectRitual={handleSelectRitual}
            onPerformRitual={handlePerformRitual}
            activeRituals={activeRituals}
            onHoverRitual={setHoveredRitualId}
            prisoners={resources.prisoners}
            childrenCount={resources.children}
            virgins={resources.virgins}
            volunteers={resources.volunteers}
            selectedRitual={selectedRitual}
            hoveredRitual={hoveredRitual}
          />
        }
      />

      {ritualActive && selectedGod && selectedRitual && (() => {
        const fromEye = ANGER_EYE_DARK[selectedGod.angerLevel]
        const toAnger = OUTCOME_TO_ANGER[selectedRitual.outcomeColor] ?? 'none'
        const toEye = ANGER_EYE_DARK[toAnger]
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#181818',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              animation: ritualDismissing ? 'fadeFromBlack 0.7s ease forwards' : 'fadeToBlack 0.6s ease forwards',
            }}
          >
            {/* Left/right gradients */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%)', pointerEvents: 'none', zIndex: 2 }} />
            {/* Top/bottom gradients */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 88%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none', zIndex: 2 }} />
            {/* Face: independently centered, nudged up */}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, calc(-50% - 12vh - 2.5vmin))', width: '57vmin', height: '57vmin', zIndex: 3, opacity: 0, animation: 'contentFadeIn 2.4s ease 0.8s forwards' }}>
              <GodSvg
                svgRaw={GOD_SVG_MAP[selectedGod.id] ?? tlalocRaw}
                angerLevel={ritualDismissing ? toAnger : selectedGod.angerLevel}
                isHovered={true}
                eyeAnimation={ritualDismissing ? undefined : { fromColor: fromEye.color, fromWeight: fromEye.weight, toColor: toEye.color, toWeight: toEye.weight, delay: 5.0, duration: 2 }}
              />
            </div>
            {/* Victim list: fades in early, fades out before eye animation */}
            {(() => {
              const { prisoners, volunteers, children, virgins } = selectedRitual.participants
              const items = [
                { label: 'Prisoners', count: prisoners, Icon: PrisonerIcon },
                { label: 'Volunteers', count: volunteers, Icon: VolunteerIcon },
                { label: 'Children', count: children, Icon: ChildrenIcon },
                { label: 'Virgins', count: virgins, Icon: VirginIcon },
              ].filter(item => item.count > 0)
              return (
                <div style={{ position: 'absolute', top: 'calc(50% - 12vh - 2.5vmin + 28.5vmin + 54px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 3, opacity: 0, animation: 'victimListShow 4.0s ease 2.0s both' }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: '16px', fontWeight: 400, color: '#ffffff', letterSpacing: '2px', opacity: 0.5, marginBottom: '4px' }}>Blood Sacrifice</span>
                  {items.map(({ label, count, Icon }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: "'Spectral', serif", fontSize: '20px', fontWeight: 300, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {count.toLocaleString()}
                      </span>
                      <Icon size={20} color="#ffffff" />
                      <span style={{ fontFamily: "'Spectral', serif", fontSize: '20px', fontWeight: 300, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })()}
            {/* Text: anchored independently */}
            <div style={{ position: 'absolute', top: 'calc(50% - 12vh - 2.5vmin + 28.5vmin + 54px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap', zIndex: 3, opacity: 0, animation: 'contentFadeIn 1.4s ease 7.0s forwards' }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', fontWeight: 400, color: '#ffffff', letterSpacing: '1px' }}>
                  {selectedGod.name.toUpperCase()}
                </span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: '20px', fontWeight: 300, color: '#ffffff' }}>
                  will turn
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    boxShadow: `inset 0 0 0 ${OUTCOME_EYE[selectedRitual.outcomeColor]?.weight ?? 2}px ${OUTCOME_EYE[selectedRitual.outcomeColor]?.color ?? '#000000'}`,
                  }} />
                  <span style={{ fontFamily: "'Spectral', serif", fontSize: '20px', fontWeight: 300, color: '#ffffff' }}>
                    {OUTCOME_LABEL[selectedRitual.outcomeColor] ?? 'Peaceful'}
                  </span>
                </div>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: '20px', fontWeight: 300, color: '#ffffff' }}>
                  in {selectedRitual.duration}
                </span>
            </div>
            {/* Button: anchored independently */}
            <button
              onClick={handleDismissRitual}
              className="ritual-continue-btn"
              style={{
                position: 'absolute',
                bottom: '14vh',
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: "'Spectral', Georgia, serif",
                fontSize: '16px',
                fontWeight: 400,
                letterSpacing: '1.5px',
                border: '1px solid #ffffff',
                borderRadius: '6px',
                padding: '10px 36px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                zIndex: 3,
                opacity: 0,
                animation: 'contentFadeIn 0.6s ease 8.4s forwards',
              }}
            >
              CONTINUE
            </button>
          </div>
        )
      })()}

      <style>{`
        @keyframes fadeToBlack {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeFromBlack {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes contentFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes victimListShow {
          0% { opacity: 0; }
          20% { opacity: 1; }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
        .ritual-continue-btn {
          background-color: transparent;
          color: #ffffff;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .ritual-continue-btn:hover {
          background-color: #ffffff;
          color: #181818;
        }
      `}</style>
    </>
  )
}

export default App
