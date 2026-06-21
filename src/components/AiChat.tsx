import { useState, useRef, useEffect } from 'react'
import { X, PaperPlaneTilt } from '@phosphor-icons/react'
import Anthropic from '@anthropic-ai/sdk'
import { FONTS } from '../tokens'
import xolotlSvg from '../assets/Other/Xolotl 2.svg'
import type { God, Ritual, AngerLevel } from '../data/gods'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const XOLOTL_SYSTEM = `You are Xolotl, Aztec god of the underworld. Give the emperor blunt warnings. Each point starts with — and is 5-7 words only. Three points total. No full sentences. No explanations.`

const XOLOTL_TIP_SYSTEM = `You are Xolotl. Give the emperor ONE specific, useful tip based ONLY on the exact game data provided. Rules:
- NEVER invent numbers, costs, or facts not explicitly in the data
- NEVER say a ritual fails to appease — Offended and Uneasy are valid improvements
- Focus on: resource conflicts with other gods, site conflicts, urgency of other angry gods, or cheaper alternatives
- Exactly 2 lines, separated by a newline character. Each line is 4-7 words. No punctuation at line ends.
- Only reference names, numbers, and facts from the data given`

function outcomeLabel(color: string): string {
  if (color === '#c8322e') return 'Furious'
  if (color === '#d4662a') return 'Offended'
  if (color === '#d4a83c') return 'Uneasy'
  return 'Peaceful'
}

const ANGER_DESC: Record<AngerLevel, string> = { high: 'furious', medium: 'offended', low: 'uneasy', none: 'at peace' }

function pantheonSummary(gods: God[], excludeId: string): string {
  return gods
    .filter(g => g.id !== excludeId)
    .map(g => `${g.name}: ${ANGER_DESC[g.angerLevel]}`)
    .join(', ')
}

function buildGodPrompt(god: God, gods: God[]): string {
  const ritualList = god.rituals
    .map(r => `"${r.name}" → ${outcomeLabel(r.outcomeColor)}, site: ${r.sacredSite.name}`)
    .join('; ')
  const others = pantheonSummary(gods, god.id)
  return `Emperor's focus: ${god.name.toUpperCase()} (${ANGER_DESC[god.angerLevel]}). Rituals: ${ritualList}. Other gods: ${others}. Reply with exactly 3 bullet points, each under 8 words, starting with —`
}

function buildRitualPrompt(god: God, ritual: Ritual, gods: God[]): string {
  const p = ritual.participants
  const sacrifices = [
    p.prisoners  > 0 ? `${p.prisoners} prisoners`  : '',
    p.volunteers > 0 ? `${p.volunteers} volunteers` : '',
    p.children   > 0 ? `${p.children} children`     : '',
    p.virgins    > 0 ? `${p.virgins} virgins`        : '',
  ].filter(Boolean).join(', ')
  const othersNeedingGrandTemple = gods.filter(g => g.id !== god.id && g.angerLevel === 'high' && ritual.sacredSite.name === 'Grand Temple')
  const templeWarning = othersNeedingGrandTemple.length > 0
    ? ` Note: ${othersNeedingGrandTemple.map(g => g.name).join(', ')} also urgently need the Grand Temple.`
    : ''
  return `Emperor considers "${ritual.name}" for ${god.name.toUpperCase()}. Cost: ${sacrifices}. Site: ${ritual.sacredSite.name}. Duration: ${ritual.duration}. Outcome: ${god.name} becomes ${outcomeLabel(ritual.outcomeColor)}.${templeWarning} Reply with exactly 3 bullet points, each under 8 words, starting with —`
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AiChatProps {
  selectedGod: God | null
  selectedRitual: Ritual | null
  gods: God[]
  ritualMode?: import('../tokens').RitualScreenMode
  onPanelOpenChange?: (open: boolean) => void
}

export function AiChat({ selectedGod, selectedRitual, gods, ritualMode = 'ritual', onPanelOpenChange }: AiChatProps) {
  const isExpandedMode = ritualMode === 'expanded'
  const chatBottom = isExpandedMode ? '84px' : '62px'
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [, setTip] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const latestMessagesRef = useRef<Message[]>([])
  const prevGodIdRef = useRef<string | null | undefined>(undefined)
  const prevRitualIdRef = useRef<string | null | undefined>(undefined)

  useEffect(() => { latestMessagesRef.current = messages }, [messages])
  useEffect(() => { onPanelOpenChange?.(isOpen) }, [isOpen])

  // Tip: fires on any selection change
  useEffect(() => {
    if (selectedRitual && selectedGod) {
      const p = selectedRitual.participants
      const resourceLines: string[] = []

      // Find other gods whose cheapest ritual shares key resources
      const resourceKeys = (['prisoners', 'children', 'virgins', 'volunteers'] as const).filter(k => p[k] > 0)
      gods.filter(g => g.id !== selectedGod.id && g.angerLevel !== 'none').forEach(g => {
        g.rituals.forEach(r => {
          resourceKeys.forEach(k => {
            if (r.participants[k] > 0) {
              resourceLines.push(`${g.name} (${ANGER_DESC[g.angerLevel]}) also needs ${k} for their ritual "${r.name}"`)
            }
          })
        })
      })

      // Sacred site conflicts
      const siteConflicts = gods
        .filter(g => g.id !== selectedGod.id && g.angerLevel !== 'none')
        .filter(g => g.rituals.some(r => r.sacredSite.name === selectedRitual.sacredSite.name))
        .map(g => g.name)

      // Cheaper ritual with same or better outcome
      const cheaper = selectedGod.rituals.find(r =>
        r.id !== selectedRitual.id &&
        r.outcomeColor === selectedRitual.outcomeColor &&
        (r.participants.prisoners + r.participants.children + r.participants.virgins + r.participants.volunteers) <
        (p.prisoners + p.children + p.virgins + p.volunteers)
      )

      const urgentGods = gods.filter(g => g.id !== selectedGod.id && g.angerLevel === 'high').map(g => g.name)

      const context = [
        `Selected ritual: "${selectedRitual.name}" for ${selectedGod.name} (${ANGER_DESC[selectedGod.angerLevel]}).`,
        `Exact cost: ${Object.entries(p).filter(([,v]) => v > 0).map(([k,v]) => `${v} ${k}`).join(', ')}.`,
        `Site: ${selectedRitual.sacredSite.name}. Duration: ${selectedRitual.duration}. Outcome: ${selectedGod.name} becomes ${outcomeLabel(selectedRitual.outcomeColor)}.`,
        resourceLines.length > 0 ? `Resource conflicts: ${[...new Set(resourceLines)].slice(0, 3).join('; ')}.` : '',
        siteConflicts.length > 0 ? `These gods also need the ${selectedRitual.sacredSite.name}: ${siteConflicts.join(', ')}.` : '',
        cheaper ? `Cheaper alternative: "${cheaper.name}" achieves the same outcome with fewer sacrifices.` : '',
        urgentGods.length > 0 ? `Other furious gods: ${urgentGods.join(', ')}.` : '',
        `Give one specific, useful tip based on this data.`,
      ].filter(Boolean).join(' ')

      callTip(context)
    } else if (selectedGod) {
      const urgentGods = gods.filter(g => g.id !== selectedGod.id && g.angerLevel === 'high').map(g => g.name)
      const bestRitual = [...selectedGod.rituals].sort((a, b) => {
        const order = { '#c8a83c': 0, '#d4a83c': 1, '#d4662a': 2, '#c8322e': 3 }
        return (order[a.outcomeColor as keyof typeof order] ?? 4) - (order[b.outcomeColor as keyof typeof order] ?? 4)
      })[0]

      const context = [
        `Emperor views ${selectedGod.name}, who is ${ANGER_DESC[selectedGod.angerLevel]}.`,
        `Available rituals: ${selectedGod.rituals.map(r => `"${r.name}" (outcome: ${outcomeLabel(r.outcomeColor)}, cost: ${Object.entries(r.participants).filter(([,v]) => v > 0).map(([k,v]) => `${v} ${k}`).join(', ')})`).join('; ')}.`,
        bestRitual ? `Best outcome ritual: "${bestRitual.name}".` : '',
        urgentGods.length > 0 ? `Other furious gods also need attention: ${urgentGods.join(', ')}.` : '',
        `Give one specific, useful tip based on this data.`,
      ].filter(Boolean).join(' ')

      callTip(context)
    } else {
      setTip(null)
    }
  }, [selectedGod?.id, selectedRitual?.id])

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const callTip = async (prompt: string) => {
    setTip(null)
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 40,
        system: XOLOTL_TIP_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      const text = raw.includes('\n')
        ? raw
        : (() => {
            const words = raw.split(' ')
            const mid = Math.ceil(words.length / 2)
            return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ')
          })()
      setTip(text)
    } catch { /* silent */ }
  }

  const callXolotl = async (contextPrompt: string, history: Message[]) => {
    setLoading(true)
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: XOLOTL_SYSTEM,
        messages: [...history, { role: 'user', content: contextPrompt }],
      })
      const raw = response.content[0].type === 'text' ? response.content[0].text : ''
      // Keep only lines that are bullet points
      const bullets = raw
        .split('\n')
        .filter(l => l.trim().startsWith('—') || l.trim().startsWith('-'))
        .slice(0, 3)
        .join('\n')
      setMessages(prev => [...prev, { role: 'assistant', content: bullets || raw }])
    } catch (e) {
      console.error(e)
      setMessages(prev => [...prev, { role: 'assistant', content: 'The god is silent...' }])
    } finally {
      setLoading(false)
    }
  }

  // Auto-suggest on selection change
  useEffect(() => {
    const godId = selectedGod?.id ?? null
    const ritualId = selectedRitual?.id ?? null

    const isMount = prevGodIdRef.current === undefined
    const godChanged = !isMount && godId !== prevGodIdRef.current
    const ritualChanged = !isMount && ritualId !== prevRitualIdRef.current

    prevGodIdRef.current = godId
    prevRitualIdRef.current = ritualId

    if (isMount) return

    if (godChanged) {
      const fresh: Message[] = []
      setMessages(fresh)
      latestMessagesRef.current = fresh
      if (selectedGod) callXolotl(buildGodPrompt(selectedGod, gods), [])
    } else if (ritualChanged && selectedRitual && selectedGod) {
      callXolotl(buildRitualPrompt(selectedGod, selectedRitual, gods), latestMessagesRef.current)
    }
  }, [selectedGod?.id, selectedRitual?.id])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: XOLOTL_SYSTEM,
        messages: newMessages,
      })
      const reply = response.content[0].type === 'text' ? response.content[0].text : ''
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'The god is silent...' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .xolotl-trigger { border-color: #333333; }
        .xolotl-trigger:hover { border-color: #ffffff; }
        .xolotl-input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

      {!isOpen && (
        <button
          className="xolotl-trigger"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#181818',
            border: '1px solid',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            zIndex: 500,
            transition: 'border-color 0.15s ease',
          }}
        >
          <img src={xolotlSvg} width={30} height={38} style={{ display: 'block' }} />
        </button>
      )}

      {/* Overview mode: full-height right panel */}
      {isExpandedMode && (
        <div style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '331px',
          backgroundColor: '#181818',
          borderLeft: '1px solid #333333',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 400,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 20px 16px', borderBottom: '1px solid #333333', flexShrink: 0 }}>
            <span style={{ fontFamily: FONTS.cinzel, fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)' }}>AI Counsel</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.3)' }}>
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 ? (
              <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8 }}>
                {selectedGod ? 'Consulting the shadows...' : 'Select a god to receive counsel.'}
              </span>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: msg.role === 'user' ? '#ffffff' : 'rgba(255,255,255,0.65)', lineHeight: 1.8, whiteSpace: 'pre-line', maxWidth: '90%' }}>
                    {msg.content}
                  </span>
                </div>
              ))
            )}
            {loading && <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.3)' }}>. . .</span>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <input
              className="xolotl-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask the god..."
              style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{ background: 'none', border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: loading || !input.trim() ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)', transition: 'color 0.15s ease' }}
            >
              <PaperPlaneTilt size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Ritual mode: small floating panel */}
      {!isExpandedMode && isOpen && (
        <div style={{
          position: 'fixed',
          right: '12px',
          bottom: chatBottom,
          width: '240px',
          height: '200px',
          backgroundColor: '#181818',
          border: '1px solid #555555',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 500,
          overflow: 'hidden',
        }}>
          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 12px 0', flexShrink: 0 }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.3)' }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Message — always shows only the latest */}
          <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'flex-start' }}>
            {loading ? (
              <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.3)' }}>. . .</span>
            ) : messages.length === 0 ? (
              <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.3)' }}>
                {selectedGod ? 'Consulting the shadows...' : 'Select a god to receive counsel.'}
              </span>
            ) : (
              <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: messages[messages.length - 1].role === 'user' ? '#ffffff' : 'rgba(255,255,255,0.65)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {messages[messages.length - 1].content}
              </span>
            )}
          </div>

          {/* Input row */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <input
              className="xolotl-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask the god..."
              style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{ background: 'none', border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: loading || !input.trim() ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)', transition: 'color 0.15s ease' }}
            >
              <PaperPlaneTilt size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
