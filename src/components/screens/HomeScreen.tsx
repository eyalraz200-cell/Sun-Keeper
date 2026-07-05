import { useState, useRef, useLayoutEffect, useEffect, Fragment } from 'react'
import { createPortal, flushSync } from 'react-dom'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { COLORS, FONTS, FONT_SIZE, FONT_WEIGHT, EYE, ANGER, RESOURCE_TOTALS, SPACING, LAYOUT } from '../../tokens'
import { GODS, type God, type Ritual, type AngerLevel } from '../../data/gods'
import { GodSvg } from '../gods/GodSvg'
import { GodCard, CARD_WIDTH, CARD_HEIGHT, outcomeEye, getSvgRaw, hexToRgba } from '../gods/GodCard'
import { RitualCard } from '../ritual/RitualCard'
import { FireIcon } from '../icons/FireIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { PyramidIcon } from '../icons/PyramidIcon'
import { TempleIcon } from '../icons/TempleIcon'
import { RingedIcon } from '../icons/RingedIcon'
import { CaretLeft, GridFour, ListBullets } from '@phosphor-icons/react'

gsap.registerPlugin(Flip)

const AI_TOGGLE_RESERVE = '96px' // keeps the floating AI toggle button (54px circle, 12px from right edge) off the card grid

// Every god has exactly 3 rituals, always ordered cheapest to costliest (see Ritual Data
// Conventions) — index maps directly to a fixed cost-tier label shown on each RitualCard.
const RITUAL_TIER_LABELS = ['Basic Ritual', 'Major Ritual', 'Supreme Ritual']

// Gods are grouped into sections by anger tier, in this fixed order.
const ANGER_TIERS: AngerLevel[] = ['high', 'medium', 'low', 'none']
const TIER_LABELS: Record<AngerLevel, string> = {
  high: 'Furious Gods',
  medium: 'Angry Gods',
  low: 'Uneasy Gods',
  none: 'Peaceful Gods',
}

const DISPLAY_GOD_COUNT = 24
// "Furious Gods" always shows exactly this many cards, but only 2 gods are actually high-anger.
const FURIOUS_TIER_SIZE = 8
const HIGH_GODS = GODS.filter(g => g.angerLevel === 'high')

let nextDupId = 0
function withDisplayId<T extends { id: string }>(g: T): T {
  return { ...g, id: `${g.id}-dup-${nextDupId++}` }
}

// Every real god appears at least once in its own true tier. On top of that, the Furious section
// is padded up to FURIOUS_TIER_SIZE with wholly separate filler gods — their own name, subtitle,
// and independent 3-ritual set (Offended/Uneasy/Peaceful, at furious-tier cost). These are NOT
// borrowed/re-skinned real gods: real medium/low gods now carry fewer ritual cards each (see
// Ritual Data Conventions — 2 for Angry, 1 for Uneasy, 0 for Peaceful), so spreading their (now
// short) ritual arrays into a "furious" card used to leave it with too few cards. Each filler only
// reuses an existing god's SVG as portrait art, via a shared `id` that getSvgRaw() resolves back
// to that SVG after stripping the "-dup-N" suffix — the name/rituals/everything else is its own.
// Any further padding needed to reach DISPLAY_GOD_COUNT is drawn entirely from the none-anger
// (Peaceful) gods, so real duplicate cards only ever land in the calmest tier.
const FURIOUS_FILLER_GODS: God[] = [
  {
    id: 'tezcatlipoca',
    name: 'Itzpapalotl',
    subtitle: 'Obsidian Butterfly of War',
    svg: '/gods/Tezcatlipoca.svg',
    angerColor: ANGER.high,
    angerLevel: 'high',
    favor: 30,
    // Signature tribute: PRISONERS — a war goddess is fed with captives above all else.
    rituals: [
      {
        id: 'butterfly-vigil',
        name: 'Butterfly Vigil',
        description: 'War captives are laid beneath obsidian wings, few others in attendance.',
        participants: { prisoners: 90, children: 0, virgins: 0, volunteers: 10 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Evening',
        duration: '2 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [{ godId: 'tezcatlipoca', before: 58, after: 45 }],
      },
      {
        id: 'obsidian-wing-rite',
        name: 'Obsidian Wing Rite',
        description: 'A great column of captives marches beneath the night sky, two virgins at its head.',
        participants: { prisoners: 140, children: 0, virgins: 2, volunteers: 20 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Midnight',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [{ godId: 'tezcatlipoca', before: 45, after: 24 }],
      },
      {
        id: 'night-warriors-descent',
        name: "Night Warrior's Descent",
        description: 'Hundreds of captives and five virgins descend into obsidian dark.',
        participants: { prisoners: 220, children: 0, virgins: 5, volunteers: 20 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [{ godId: 'tezcatlipoca', before: 24, after: 0 }],
      },
    ],
  },
  {
    id: 'mictlantecuhtli',
    name: 'Mictecacihuatl',
    subtitle: 'Lady of the Bone Throne',
    svg: '/gods/Mictlantecuhtli.svg',
    angerColor: ANGER.high,
    angerLevel: 'high',
    favor: 30,
    // Signature tribute: VIRGINS — young life is what the bone queen craves, present from the
    // very first (Basic) ritual rather than only appearing as a token addition in later tiers.
    rituals: [
      {
        id: 'bone-queens-feast',
        name: "Bone Queen's Feast",
        description: 'Devotees and two sacred virgins are laid before the throne of the underworld queen.',
        participants: { prisoners: 20, children: 0, virgins: 2, volunteers: 70 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Midnight',
        duration: '2 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [{ godId: 'mictlantecuhtli', before: 60, after: 46 }],
      },
      {
        id: 'underworld-descent',
        name: 'Underworld Descent',
        description: 'Devotees and five sacred virgins keep watch at the gates of Mictlan.',
        participants: { prisoners: 30, children: 0, virgins: 5, volunteers: 110 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Midnight',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [{ godId: 'mictlantecuhtli', before: 46, after: 25 }],
      },
      {
        id: 'ladys-final-rite',
        name: "Lady of Mictlan's Rite",
        description: 'A grand procession of devotees and seven sacred virgins crosses into the underworld.',
        participants: { prisoners: 50, children: 0, virgins: 7, volunteers: 160 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [{ godId: 'mictlantecuhtli', before: 25, after: 0 }],
      },
    ],
  },
  {
    id: 'xiuhtecuhtli',
    name: 'Xolotl',
    subtitle: 'Twin of the Evening Star',
    svg: '/gods/Xiuhtecuhtli.svg',
    angerColor: ANGER.high,
    angerLevel: 'high',
    favor: 30,
    // Signature tribute: VOLUNTEERS — willing souls follow the dog-headed guide, not captives.
    rituals: [
      {
        id: 'twin-stars-toll',
        name: "Twin Star's Toll",
        description: 'Willing devotees follow the dog-headed guide, no captives among them.',
        participants: { prisoners: 10, children: 0, virgins: 0, volunteers: 80 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dusk',
        duration: '2 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [{ godId: 'xiuhtecuhtli', before: 52, after: 38 }],
      },
      {
        id: 'evening-star-descent',
        name: 'Evening Star Descent',
        description: 'A great host of devotees and three sacred virgins walk the sun down into darkness.',
        participants: { prisoners: 15, children: 0, virgins: 3, volunteers: 125 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dusk',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [{ godId: 'xiuhtecuhtli', before: 38, after: 18 }],
      },
      {
        id: 'xolotls-final-guide',
        name: "Xolotl's Final Guide",
        description: "Hundreds of devoted followers and five virgins are led through the underworld's trials.",
        participants: { prisoners: 25, children: 0, virgins: 5, volunteers: 175 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [{ godId: 'xiuhtecuhtli', before: 18, after: 0 }],
      },
    ],
  },
  {
    id: 'chalchiuhtlicue',
    name: 'Tlaltecuhtli',
    subtitle: 'Devourer of the Earth',
    svg: '/gods/Chalchiuhtlicue.svg',
    angerColor: ANGER.high,
    angerLevel: 'high',
    favor: 30,
    // Signature tribute: CHILDREN — the earth monster devours the young above all else.
    rituals: [
      {
        id: 'earthquake-offering',
        name: 'Earthquake Offering',
        description: 'Children are cast to still the trembling ground, a few devotees in tow.',
        participants: { prisoners: 10, children: 70, virgins: 0, volunteers: 10 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '2 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [{ godId: 'chalchiuhtlicue', before: 62, after: 48 }],
      },
      {
        id: 'devourers-hunger',
        name: "Devourer's Hunger",
        description: "A great many children and two sacred virgins feed the earth monster's endless hunger.",
        participants: { prisoners: 0, children: 110, virgins: 2, volunteers: 30 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dusk',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [{ godId: 'chalchiuhtlicue', before: 48, after: 26 }],
      },
      {
        id: 'world-below-rite',
        name: 'World-Below Rite',
        description: 'Hundreds of children, four sacred virgins, and a handful of captives are given to the earth below.',
        participants: { prisoners: 20, children: 160, virgins: 4, volunteers: 30 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [{ godId: 'chalchiuhtlicue', before: 26, after: 0 }],
      },
    ],
  },
  {
    id: 'ehecatl',
    name: 'Atlacamani',
    subtitle: 'Goddess of Storms & Sea',
    svg: '/gods/Ehecatl.svg',
    angerColor: ANGER.high,
    angerLevel: 'high',
    favor: 30,
    // Signature tribute: PRISONERS + VIRGINS — drowned captives and storm-maidens given to the sea,
    // distinct from Itzpapalotl's prisoners-only war tribute since virgins appear from the start.
    rituals: [
      {
        id: 'storm-callers-vow',
        name: "Storm Caller's Vow",
        description: 'Captives and a single storm-maiden brave the gathering squall.',
        participants: { prisoners: 60, children: 0, virgins: 1, volunteers: 20 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '2 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [{ godId: 'ehecatl', before: 48, after: 33 }],
      },
      {
        id: 'tempest-rite',
        name: 'Tempest Rite',
        description: 'A great many captives and three storm-maidens stand against the rising tempest.',
        participants: { prisoners: 90, children: 0, virgins: 3, volunteers: 35 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [{ godId: 'ehecatl', before: 33, after: 15 }],
      },
      {
        id: 'hurricanes-reckoning',
        name: "Hurricane's Reckoning",
        description: 'Hundreds of drowned captives and six storm-maidens are given to calm the raging sea.',
        participants: { prisoners: 140, children: 0, virgins: 6, volunteers: 50 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [{ godId: 'ehecatl', before: 15, after: 0 }],
      },
    ],
  },
  {
    id: 'quetzalcoatl',
    name: 'Coatlicue',
    subtitle: 'Serpent-Skirted Mother',
    svg: '/gods/Quetzalcoatl.svg',
    angerColor: ANGER.high,
    angerLevel: 'high',
    favor: 30,
    // Signature tribute: CHILDREN + VIRGINS — a mother goddess is given the young, distinct from
    // Tlaltecuhtli's children-only devouring since virgins appear from the start here too.
    rituals: [
      {
        id: 'serpent-mothers-toll',
        name: "Serpent Mother's Toll",
        description: 'Children and a single virgin kneel before the mother of the gods.',
        participants: { prisoners: 0, children: 50, virgins: 1, volunteers: 20 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Morning',
        duration: '2 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [{ godId: 'coatlicue', before: 56, after: 42 }],
      },
      {
        id: 'skirt-of-serpents-rite',
        name: 'Skirt of Serpents Rite',
        description: 'A great many children and three virgins renew her serpent skirt.',
        participants: { prisoners: 0, children: 75, virgins: 3, volunteers: 35 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dusk',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [{ godId: 'coatlicue', before: 42, after: 22 }],
      },
      {
        id: 'birth-of-war-rite',
        name: 'Birth of War Rite',
        description: 'Hundreds of children, five virgins, and a handful of captives reenact the birth of Huitzilopochtli.',
        participants: { prisoners: 20, children: 110, virgins: 5, volunteers: 40 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [{ godId: 'coatlicue', before: 22, after: 0 }],
      },
    ],
  },
]
// Same reused-SVG-with-its-own-name trick as FURIOUS_FILLER_GODS above, but for padding out the
// Peaceful tier — every real angerLevel:'none' god is just Tonatiuh, so without this, the padding
// used to fall back to NONE_ANGER_GODS (length 1) and every filler card was a literal duplicate
// Tonatiuh. Each entry here reuses a different real god's SVG (never Tonatiuh's own, so the one
// true Tonatiuh card stays the only card with that face in this section) as portrait art for an
// otherwise wholly separate peaceful/abundance deity — own name, subtitle, and (per the 0-rituals-
// for-Peaceful convention) no ritual cards.
const PEACEFUL_FILLER_GODS: God[] = [
  { id: 'huitzilopochtli', name: 'Xochiquetzal', subtitle: 'Goddess of Love and Flowers', svg: '/gods/huitzilopochtli.svg', angerColor: '#6C6C6C', angerLevel: 'none', favor: 85, rituals: [] },
  { id: 'tlaloc', name: 'Mayahuel', subtitle: 'Goddess of the Maguey', svg: '/gods/tlaloc.svg', angerColor: '#6C6C6C', angerLevel: 'none', favor: 82, rituals: [] },
  { id: 'tezcatlipoca', name: 'Chicomecoatl', subtitle: 'Goddess of Sustenance', svg: '/gods/tezcatlipoca.svg', angerColor: '#6C6C6C', angerLevel: 'none', favor: 88, rituals: [] },
  { id: 'quetzalcoatl', name: 'Xilonen', subtitle: 'Goddess of Young Maize', svg: '/gods/quetzalcoatl.svg', angerColor: '#6C6C6C', angerLevel: 'none', favor: 79, rituals: [] },
  { id: 'mictlantecuhtli', name: 'Centeotl', subtitle: 'God of Maize', svg: '/gods/mictlantecuhtli.svg', angerColor: '#6C6C6C', angerLevel: 'none', favor: 84, rituals: [] },
  { id: 'ehecatl', name: 'Tepoztecatl', subtitle: 'God of Pulque', svg: '/gods/ehecatl.svg', angerColor: '#6C6C6C', angerLevel: 'none', favor: 76, rituals: [] },
  { id: 'xiuhtecuhtli', name: 'Opochtli', subtitle: 'God of Fishing', svg: '/gods/xiuhtecuhtli.svg', angerColor: '#6C6C6C', angerLevel: 'none', favor: 81, rituals: [] },
  { id: 'chalchiuhtlicue', name: 'Yohualtecuhtli', subtitle: 'Lord of the Night', svg: '/gods/chalchiuhtlicue.svg', angerColor: '#6C6C6C', angerLevel: 'none', favor: 87, rituals: [] },
]
const furiousFillers = FURIOUS_FILLER_GODS.slice(0, Math.max(0, FURIOUS_TIER_SIZE - HIGH_GODS.length)).map(g => withDisplayId(g))
const peacefulPaddingCount = DISPLAY_GOD_COUNT - GODS.length - furiousFillers.length
const DISPLAY_GODS = [
  ...GODS.map(g => withDisplayId(g)),
  ...furiousFillers,
  ...Array.from({ length: peacefulPaddingCount }, (_, i) => withDisplayId(PEACEFUL_FILLER_GODS[i % PEACEFUL_FILLER_GODS.length])),
]
// One bucket per non-empty anger tier, in ANGER_TIERS order — feeds the grid's section headers.
// HomeScreen itself never reads this directly — it derives orderedGodBuckets/orderedGodsByTier
// from it on every render, reordering the punishing god's card to the front of its own tier (see
// that derivation for why grid, list, and every scroll-position index all need to agree on one
// consistently-ordered list rather than each reordering independently).
const DISPLAY_GOD_BUCKETS = ANGER_TIERS
  .map(level => ({ level, gods: DISPLAY_GODS.filter(g => g.angerLevel === level) }))
  .filter(bucket => bucket.gods.length > 0)

// DISPLAY_GODS suffixes every entry with "-dup-N" (see above) — strip it before comparing
// against the punishing-god flow's real id (App.tsx's PUNISHING_GOD.id), so every duplicated
// card for that god (grid and list rail alike) picks up the punishing treatment, not just one.
function isPunishingGodId(godId: string, punishingGodId?: string | null): boolean {
  return !!punishingGodId && godId.replace(/-dup-\d+$/, '') === punishingGodId
}

// While a god is actively punishing (flow 2 — see App.tsx's punishingGodId), the children pool
// is temporarily raised from RESOURCE_TOTALS.children (175) to this total, and ONLY for that
// flow — HomeScreen's main component swaps this in for `children`'s available-resource math
// below, and it reverts back to the normal global total the instant punishingGodId clears. This
// exists purely so the Ultimate Ritual's fixed 200-children cost (see buildUltimateRitual) is
// actually affordable without permanently inflating the empire's real children total.
const PUNISHING_FLOW_CHILDREN_TOTAL = 220

// The punishing-god flow's own 4th, off-menu ritual tier — deliberately NOT part of the god's
// static `rituals` array (every god has exactly 3, per the ritual data conventions), since it only
// ever exists for whichever single god the punishment flow currently targets. Costs a fixed,
// explicit toll on every participant type (not just whichever one the Supreme ritual leans on
// hardest) so the "empire-wide sacrifice" flavor comes through on prisoners/volunteers too, not
// only the god's own signature resource. Children specifically is only affordable because the
// punishing flow bumps its pool to PUNISHING_FLOW_CHILDREN_TOTAL (see above) — the normal 175
// total would never cover it. Virgins still scales off the god's own Supreme ritual (1.6x, capped
// at the real total) since every god's virgin cost differs and 8 (Tlaloc) already reads as "a lot".
function buildUltimateRitual(god: God): Ritual {
  const supreme = god.rituals[2]
  const participantTypes = ['prisoners', 'volunteers', 'children', 'virgins'] as const
  const dominant = participantTypes.reduce((a, b) => (supreme.participants[b] > supreme.participants[a] ? b : a))
  const ULTIMATE_COST_OVERRIDES: Partial<Record<typeof dominant, number>> = {
    children: 200,
    prisoners: 250,
    volunteers: 400,
  }
  const bumpedCost = (type: typeof dominant) =>
    ULTIMATE_COST_OVERRIDES[type] ?? Math.min(RESOURCE_TOTALS[type], Math.round(supreme.participants[type] * 1.6))
  const supremeDurationDays = parseInt(supreme.duration, 10) || 5
  return {
    id: `${god.id.replace(/-dup-\d+$/, '')}-ultimate`,
    name: 'Ultimate Ritual',
    description: `Every last ${dominant} the empire holds, offered at once to break ${god.name}'s wrath for good.`,
    participants: {
      prisoners: bumpedCost('prisoners'),
      volunteers: bumpedCost('volunteers'),
      children: bumpedCost('children'),
      virgins: bumpedCost('virgins'),
    },
    sacredSite: { name: 'Great Pyramid', count: 1 },
    schedule: supreme.schedule,
    duration: `${supremeDurationDays + 2} days`,
    outcomeColor: supreme.outcomeColor,
    available: true,
    effects: supreme.effects,
  }
}

// Resolves a chosen ritual id back to its Ritual object, checking the synthetic Ultimate Ritual
// (see buildUltimateRitual above) whenever the id doesn't match anything in god.rituals — every
// call site that used to do a plain `god.rituals.find(...)` on a possibly-punishing god's chosen
// ritual needs this instead, or an ultimate-ritual choice resolves to nothing everywhere outside
// HomeGodDetailPanel itself (grid card border, list rail pill, cost totals, authorize entries).
function resolveRitual(god: God, ritualId: string | null | undefined): Ritual | null {
  if (!ritualId) return null
  const found = god.rituals.find(r => r.id === ritualId)
  if (found) return found
  return ritualId === `${god.id.replace(/-dup-\d+$/, '')}-ultimate` ? buildUltimateRitual(god) : null
}

function tierLabelFor(ritual: Ritual, index: number): string {
  return ritual.name === 'Ultimate Ritual' ? 'Ultimate Ritual' : RITUAL_TIER_LABELS[index]
}

type ResourceCost = { prisoners: number; volunteers: number; children: number; virgins: number; temples: number; greatTemples: number }
const ZERO_COST: ResourceCost = { prisoners: 0, volunteers: 0, children: 0, virgins: 0, temples: 0, greatTemples: 0 }

function sumRitualCost(chosenRituals: Record<string, string>): ResourceCost {
  const total = { ...ZERO_COST }
  for (const godId in chosenRituals) {
    const god = DISPLAY_GODS.find(g => g.id === godId)
    const ritual = god ? resolveRitual(god, chosenRituals[godId]) : null
    if (!ritual) continue
    total.prisoners += ritual.participants.prisoners
    total.volunteers += ritual.participants.volunteers
    total.children += ritual.participants.children
    total.virgins += ritual.participants.virgins
    if (ritual.sacredSite.name === 'Temple') total.temples += ritual.sacredSite.count
    if (ritual.sacredSite.name === 'Great Pyramid') total.greatTemples += ritual.sacredSite.count
  }
  return total
}

// Same shape as sumRitualCost but operating on an ordered entries array (god+ritual pairs) instead
// of the chosenRituals record — needed because the authorization drain sequence sums cost over a
// specific ordered SLICE of entries (however many gods have had their turn so far), which
// sumRitualCost's record-based signature has no way to express.
function sumEntriesCost(entries: Array<{ god: God; ritual: Ritual }>): ResourceCost {
  const total = { ...ZERO_COST }
  for (const { ritual } of entries) {
    total.prisoners += ritual.participants.prisoners
    total.volunteers += ritual.participants.volunteers
    total.children += ritual.participants.children
    total.virgins += ritual.participants.virgins
    if (ritual.sacredSite.name === 'Temple') total.temples += ritual.sacredSite.count
    if (ritual.sacredSite.name === 'Great Pyramid') total.greatTemples += ritual.sacredSite.count
  }
  return total
}

// Thin vertical rule between two resource/site items — align-self:stretch fills whichever
// row it's placed in regardless of that row's own alignItems value.
// `fullBleed` pulls it past the parent's vertical padding so it reaches the container's
// full edge-to-edge height, using the page background color to read as a cut-through.
function ResourceDivider({ fullBleed }: { fullBleed?: boolean } = {}) {
  return <div style={{ flexShrink: 0, width: fullBleed ? '2px' : '1px', alignSelf: 'stretch', backgroundColor: fullBleed ? COLORS.black : COLORS.gray20, margin: fullBleed ? '-8px 0' : 0 }} />
}

const RESOURCE_COUNT_ANIM_DURATION = 1000

// Ritual-authorization drain sequence timing (see authorizeEntries/authorizeStepIndex state in
// HomeScreen below). AUTHORIZE_STEP_DURATION_MS has its own literal rather than reusing
// RESOURCE_COUNT_ANIM_DURATION (that constant is also used for the unrelated docking/undocking
// preview elsewhere), but is kept in sync BY CONVENTION with GodCard.tsx's DRAIN_DURATION_S and
// with RESOURCE_COUNT_ANIM_DURATION so each god's own pill drain and the resource bar's own
// useAnimatedNumber tween still land together, one god-turn at a time. All four are easily
// tunable starting points, not a strict spec.
const AUTHORIZE_CHROME_FADE_MS = 400
const AUTHORIZE_STEP_DURATION_MS = 1000
const AUTHORIZE_STEP_GAP_MS = 100
const AUTHORIZE_END_HOLD_MS = 450

// Chosen cards fly from their grid position into a centered "authorize stage" before the drain
// sequence begins (and fly back into the grid, as ritual-in-progress cards, once it ends) — see
// the CTA's onPerform and the finalize timeout below. Mirrors the grid<->list hero transition's
// own GSAP Flip recipe (HERO_FLIP_VARS/handleSelectGod) closely: `:card` is the outer position
// anchor and `:face` flies independently within it (nested:true corrects `:face` for `:card`'s own
// transform), rather than one whole-box `scale:true` flip — a single-target scale flip stretched
// non-uniformly here since the grid card's box and the stage layout have very different
// proportions, the same failure mode the hero transition's own whole-card-flip attempt hit before
// splitting into pieces. `:face` keeps the same aspect ratio at both ends, so growing it alone
// (nested inside `:card`) tracks smoothly with no stretch — see GodCard.tsx's stageMode branch.
const AUTHORIZE_FLY_MS = 1400
const AUTHORIZE_FLIP_VARS = { duration: AUTHORIZE_FLY_MS / 1000, ease: 'power3.out', absolute: true, nested: true, zIndex: 1500 }
// Selector covering all three authorize-stage Flip pieces (the outer card anchor, the name, and
// the face image) for every entry in a drain batch — see AUTHORIZE_FLIP_VARS above and GodCard's
// stageMode branch for why all three (not just :card, and not just :face) are needed.
const authorizeFlipSelector = (entries: Array<{ god: God; ritual: Ritual }>) =>
  entries.map(({ god }) => `[data-flip-id="${god.id}:card"], [data-flip-id="${god.id}:name"], [data-flip-id="${god.id}:face"]`).join(', ')
// Same three-piece selector as authorizeFlipSelector, but scoped to a single entry — the finalize
// timeout's fly-BACK (not the fly-in) fires one of these per entry instead of one shared
// Flip.from for the whole batch, so each entry can be given its own delay/zIndex (see
// AUTHORIZE_RETURN_STAGGER_S below).
const authorizeFlipSelectorForGod = (godId: string) =>
  `[data-flip-id="${godId}:card"], [data-flip-id="${godId}:name"], [data-flip-id="${godId}:face"]`
// Every returning card starts from roughly the same stage cluster and flies out to a DIFFERENT
// final grid slot, on a different heading — dead simultaneous flights whose slots happen to sit
// close together (e.g. the last slot of one tier directly above the last slot of the next) can
// have their straight-line paths visibly cross and overlap mid-flight, since nothing otherwise
// staggers or separates them. Firing each entry's own Flip.from a little after the previous one
// (instead of one shared Flip.from covering every entry at once) spreads their departures out in
// time so two cards are far less likely to occupy the same screen region at the same instant.
const AUTHORIZE_RETURN_STAGGER_S = 0.15

// Tweens the displayed value toward `value` over `duration`ms instead of snapping — used so
// docking/undocking a ritual reads as spending/refunding resources rather than a hard cut.
// Tracks the in-flight displayed value (not just the last committed target) so a reversal
// mid-animation (e.g. undock right after dock) resumes smoothly from wherever it currently is,
// instead of jumping back to the pre-animation start point.
function useAnimatedNumber(value: number, duration = RESOURCE_COUNT_ANIM_DURATION) {
  const [display, setDisplay] = useState(value)
  const displayRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (displayRef.current === value) return
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    const from = displayRef.current
    const to = value
    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(from + (to - from) * eased)
      displayRef.current = current
      setDisplay(current)
      rafRef.current = t < 1 ? requestAnimationFrame(tick) : null
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return display
}

function HomeResourceItem({ icon, label, count, cost, ritualActive, isFirst, isLast, onHoverChange, light }: { icon: (color: string) => React.ReactNode; label: string; count: number; cost?: number; ritualActive?: boolean; isFirst?: boolean; isLast?: boolean; onHoverChange?: (isHovered: boolean) => void; light?: boolean }) {
  const displayCount = useAnimatedNumber(count)
  const affected = (cost ?? 0) > 0
  const dimmed = ritualActive && !affected
  // Hovering this item's own section lights it up the same way the CTA-hover `light` prop does —
  // independent reasons to reach the same white-fill treatment, so they're just OR'd together.
  const [isHovered, setIsHovered] = useState(false)
  const lit = light || isHovered
  const labelColor = lit ? COLORS.gray30 : ritualActive ? (affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)') : COLORS.gray60
  const valueColor = lit ? COLORS.gray0 : ritualActive ? (affected ? COLORS.white : 'rgba(255,255,255,0.25)') : COLORS.gray95
  const valueOpacity = lit ? 1 : ritualActive && affected ? 1 : 0.7
  // Only the pill's true outer corners round to match its own border-radius — an interior edge
  // (butting against a divider, not the pill's edge) stays square, or the fill reads as its own
  // separate rounded chip floating mid-pill instead of a flush segment of one shared shape.
  const fillRadius = `${isFirst ? '8px' : '0'} ${isLast ? '8px' : '0'} ${isLast ? '8px' : '0'} ${isFirst ? '8px' : '0'}`
  // Light mode (this resource type is used by every chosen ritual combined, while the CTA is
  // hovered — or this section itself is hovered) turns this same fill rect white instead of the
  // usual dark "irrelevant" overlay — the "pill lights up" preview the rest of the item's colors
  // above key off of via `lit`.
  const fillColor = lit ? COLORS.white : dimmed ? 'rgba(0,0,0,0.18)' : 'transparent'
  return (
    <div
      onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true) }}
      onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false) }}
      // fill/stroke transition for the plain SVG icon component (PrisonerIcon etc.) — see
      // GodCard.tsx's identical use of this rule for why a `transition` in this file's own style
      // objects can't reach it. See index.css.
      className="color-transition-group"
      style={{ position: 'relative', flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: '24px', cursor: 'default' }}
    >
      {/* Bleeds the full 24px gap on each side to reach the divider itself (the divider is its own
          flex child with a 24px gap on both sides, not a shared 12px split) and to the pill's own
          top/bottom edge — so the fill reads as its full segment between dividers, not a box
          hugging the icon/text with a sliver of the pill's base color still showing around it. */}
      <div style={{ position: 'absolute', top: '-8px', bottom: '-8px', left: '-24px', right: '-24px', borderRadius: fillRadius, backgroundColor: fillColor, transition: 'background-color 0.4s ease' }} />
      <div style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon(labelColor)}</div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: labelColor, transition: 'color 0.4s ease' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: FONT_SIZE.xl, color: valueColor, opacity: valueOpacity, fontVariantNumeric: 'tabular-nums', transition: 'color 0.4s ease, opacity 0.4s ease' }}>{displayCount}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function HomeSiteItem({ icon, label, available, cost, ritualActive, light, onHoverChange }: { icon: (color: string) => React.ReactNode; label: string; available: number; cost?: number; ritualActive?: boolean; light?: boolean; onHoverChange?: (isHovered: boolean) => void }) {
  const displayAvailable = useAnimatedNumber(available)
  const affected = (cost ?? 0) > 0
  // Hovering this item's own section lights it up the same way the CTA-hover `light` prop does —
  // same OR'd-together reasoning as HomeResourceItem above.
  const [isHovered, setIsHovered] = useState(false)
  const lit = light || isHovered
  // light (this site is used by any chosen ritual, while the CTA is hovered, or this section
  // itself is hovered) steps everything up to the brightest tones on the same dark bar — unlike
  // the tribute pills, sites have no fill background to invert to white, so "brighter" here means
  // climbing the gray scale, not a theme flip. Independent of ritualActive/hoveredRitual, same
  // decoupling as HomeResourceItem above.
  const labelColor = lit ? COLORS.gray95 : ritualActive ? (affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)') : COLORS.gray60
  const valueColor = lit ? COLORS.white : ritualActive ? (affected ? COLORS.white : 'rgba(255,255,255,0.25)') : COLORS.gray95
  const valueOpacity = lit ? 1 : ritualActive && affected ? 1 : 0.7
  return (
    // Bare item, no shared pill behind it (unlike HomeResourceItem) — so unlike that one, dimming
    // here is text/ring-only, no dark fill rect to bleed toward a divider that doesn't exist.
    <div
      onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true) }}
      onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false) }}
      className="color-transition-group" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px', cursor: 'default' }}>
      <RingedIcon size={44} borderColor={labelColor}>
        {icon(labelColor)}
      </RingedIcon>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: labelColor, transition: 'color 0.4s ease' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: FONT_SIZE.xl, color: valueColor, opacity: valueOpacity, fontVariantNumeric: 'tabular-nums', transition: 'color 0.4s ease, opacity 0.4s ease' }}>{displayAvailable}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function HomeBarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: COLORS.gray60, opacity: 0.46, marginBottom: '8px' }}>{children}</span>
  )
}

function HomeResourceBar({ prisoners, volunteers, children, virgins, temples = RESOURCE_TOTALS.temples, greatTemples = RESOURCE_TOTALS.greatTemples, resourceTotals: _resourceTotals = RESOURCE_TOTALS, hoveredRitual, onResourceHover, onSiteHover, ctaHovered, reservedCost, dense = false }: { prisoners: number; volunteers: number; children: number; virgins: number; temples?: number; greatTemples?: number; resourceTotals?: ResourceCost; hoveredRitual?: Ritual | null; onResourceHover?: (type: 'prisoners' | 'volunteers' | 'children' | 'virgins' | null) => void; onSiteHover?: (site: 'Temple' | 'Great Pyramid' | null) => void; ctaHovered?: boolean; reservedCost?: ResourceCost; dense?: boolean }) {
  const ritualActive = !!hoveredRitual
  // Two independent reasons to go into the same light-mode (white-fill) preview, OR'd together:
  // the CTA is hovered and this resource type is used by ANY chosen ritual (reservedCost, the same
  // total the bottom action bar's own pills sum up), or a single ritual card is being hovered right
  // now and this type is used by that one ritual — same white-fill look either way, rather than the
  // ritualActive/cost opacity-based dim-vs-highlight scheme below applying to the relevant type.
  const prisonersLight = (!!ctaHovered && (reservedCost?.prisoners ?? 0) > 0) || !!hoveredRitual?.participants.prisoners
  const volunteersLight = (!!ctaHovered && (reservedCost?.volunteers ?? 0) > 0) || !!hoveredRitual?.participants.volunteers
  const childrenLight = (!!ctaHovered && (reservedCost?.children ?? 0) > 0) || !!hoveredRitual?.participants.children
  const virginsLight = (!!ctaHovered && (reservedCost?.virgins ?? 0) > 0) || !!hoveredRitual?.participants.virgins
  const templesLight = (!!ctaHovered && (reservedCost?.temples ?? 0) > 0) || hoveredRitual?.sacredSite.name === 'Temple'
  const greatTemplesLight = (!!ctaHovered && (reservedCost?.greatTemples ?? 0) > 0) || hoveredRitual?.sacredSite.name === 'Great Pyramid'
  return (
    <div style={{ position: 'relative', zIndex: 1, flexShrink: 0, backgroundColor: COLORS.black, borderBottom: `1px solid ${COLORS.gray20}`, boxShadow: '0 4px 8px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: dense ? '14px 48px 8px 24px' : '24px 48px 12px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <HomeBarSectionTitle>Available Tributes to Sacrifice</HomeBarSectionTitle>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px', width: '730px', borderRadius: '10px', backgroundColor: COLORS.gray15, padding: dense ? '4px 24px' : '8px 24px', overflow: 'hidden' }}>
          <HomeResourceItem icon={c => <PrisonerIcon size={28} color={c} />} label="Prisoners" count={prisoners} cost={hoveredRitual?.participants.prisoners} ritualActive={ritualActive} isFirst onHoverChange={hovered => onResourceHover?.(hovered ? 'prisoners' : null)} light={prisonersLight} />
          <ResourceDivider fullBleed />
          <HomeResourceItem icon={c => <VolunteerIcon size={28} color={c} />} label="Volunteers" count={volunteers} cost={hoveredRitual?.participants.volunteers} ritualActive={ritualActive} onHoverChange={hovered => onResourceHover?.(hovered ? 'volunteers' : null)} light={volunteersLight} />
          <ResourceDivider fullBleed />
          <HomeResourceItem icon={c => <ChildrenIcon size={28} color={c} />} label="Children" count={children} cost={hoveredRitual?.participants.children} ritualActive={ritualActive} onHoverChange={hovered => onResourceHover?.(hovered ? 'children' : null)} light={childrenLight} />
          <ResourceDivider fullBleed />
          <HomeResourceItem icon={c => <VirginIcon size={28} color={c} />} label="Virgins" count={virgins} cost={hoveredRitual?.participants.virgins} ritualActive={ritualActive} isLast onHoverChange={hovered => onResourceHover?.(hovered ? 'virgins' : null)} light={virginsLight} />
        </div>
      </div>
      <div style={{ flexShrink: 0, width: '40px' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <HomeBarSectionTitle>Available Ritual Sites</HomeBarSectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px', paddingTop: '8px' }}>
          <HomeSiteItem icon={c => <TempleIcon size={20} color={c} />} label="Temple" available={temples} cost={hoveredRitual?.sacredSite.name === 'Temple' ? hoveredRitual.sacredSite.count : 0} ritualActive={ritualActive} light={templesLight} onHoverChange={hovered => onSiteHover?.(hovered ? 'Temple' : null)} />
          <HomeSiteItem icon={c => <PyramidIcon size={24} color={c} />} label="Great Pyramid" available={greatTemples} cost={hoveredRitual?.sacredSite.name === 'Great Pyramid' ? hoveredRitual.sacredSite.count : 0} ritualActive={ritualActive} light={greatTemplesLight} onHoverChange={hovered => onSiteHover?.(hovered ? 'Great Pyramid' : null)} />
        </div>
      </div>
    </div>
  )
}

// Chip in the bottom action bar summarizing one resource type spent across all chosen
// rituals — only rendered for resource types the current selection actually costs.
function HomeActionBarPill({ icon, label, value }: { icon: (color: string) => React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: `${SPACING.sm} ${SPACING.md}`, borderRadius: '8px', backgroundColor: COLORS.gray15 }}>
      {icon(COLORS.gray80)}
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: COLORS.gray80, letterSpacing: '1px', whiteSpace: 'nowrap' }}>{label} {value}</span>
    </div>
  )
}

// Bottom bar summarizing every chosen-but-not-yet-authorized ritual's total resource cost, plus
// the CTA that authorizes them all at once (triggers HomeScreen's in-place drain sequence via
// onPerform — see authorizeEntries there). Always present on the overview screen's grid view —
// reads "0 Rituals Chosen" with no pills and a disabled CTA when nothing's been picked yet, rather
// than disappearing.
function HomeActionBar({ chosenCount, cost, onPerform, aiPanelOpen, onHoverChange }: { chosenCount: number; cost: ResourceCost; onPerform: () => void; aiPanelOpen: boolean; onHoverChange?: (hovered: boolean) => void }) {
  const [hovered, setHovered] = useState(false)
  const hasChosen = chosenCount > 0
  const allPills: Array<{ key: string; icon: (color: string) => React.ReactNode; label: string; value: number }> = [
    { key: 'prisoners', icon: c => <PrisonerIcon size={16} color={c} />, label: 'Prisoners', value: cost.prisoners },
    { key: 'volunteers', icon: c => <VolunteerIcon size={16} color={c} />, label: 'Volunteers', value: cost.volunteers },
    { key: 'children', icon: c => <ChildrenIcon size={16} color={c} />, label: 'Children', value: cost.children },
    { key: 'virgins', icon: c => <VirginIcon size={16} color={c} />, label: 'Virgins', value: cost.virgins },
  ]
  const pills = allPills.filter(p => p.value > 0)

  return (
    // marginRight mirrors the scroll container's own reserve below — only needed when the AI
    // panel is actually open (331px-wide full-height right panel). The closed toggle button now
    // sits above this bar instead of beside it (see AiChat's `raised` prop), so it no longer
    // needs a horizontal reserve here.
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '24px', backgroundColor: COLORS.black, borderTop: '1px solid rgba(255,255,255,0.17)', padding: `${SPACING.md} ${SPACING.xl}`, marginRight: aiPanelOpen ? '331px' : 0, transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <span style={{ flexShrink: 0, fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.medium, color: hasChosen ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.35)', letterSpacing: '1px', whiteSpace: 'nowrap', transition: 'color 0.15s ease' }}>
        {chosenCount} {chosenCount === 1 ? 'Ritual' : 'Rituals'} Chosen
      </span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {pills.map(p => <HomeActionBarPill key={p.key} icon={p.icon} label={p.label} value={p.value} />)}
      </div>
      <button
        onClick={hasChosen ? onPerform : undefined}
        onMouseEnter={() => { if (hasChosen) { setHovered(true); onHoverChange?.(true) } }}
        onMouseLeave={() => { setHovered(false); onHoverChange?.(false) }}
        disabled={!hasChosen}
        style={{
          flexShrink: 0,
          fontFamily: FONTS.spectral,
          fontSize: FONT_SIZE.md,
          fontWeight: FONT_WEIGHT.medium,
          color: !hasChosen ? 'rgba(255,255,255,0.3)' : COLORS.gray0,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          background: !hasChosen ? 'transparent' : hovered ? COLORS.white : COLORS.gray95,
          border: `1px solid ${hasChosen ? COLORS.white : 'rgba(255,255,255,0.25)'}`,
          borderRadius: '4px',
          padding: `${SPACING.sm} ${SPACING.md}`,
          boxShadow: hasChosen ? '0 0 13.6px rgba(0,0,0,1)' : 'none',
          cursor: hasChosen ? 'pointer' : 'default',
          transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
        }}
      >
        Authorize All Chosen Rituals
      </button>
    </div>
  )
}

// Duration/easing for the grid-card <-> detail-panel grow/shrink transition, driven by GSAP's
// Flip plugin (see handleSelectGod/handleBack below): Flip.getState() captures the clicked
// element's rect *before* the view swaps, flushSync forces React to commit the swap
// synchronously so the new element already exists in the DOM, then Flip.from() animates that
// new element from the old rect to wherever it naturally landed. This replaced an earlier
// framer-motion `layoutId` version — framer's shared-layout matching turned out to be fragile
// here (a StrictMode double-invoke left the exiting grid stuck mounted forever, and scoping the
// layoutId to only the clicked card to fix that left the FLIP with no "before" state to animate
// from, so it just popped in at full size instead of growing). GSAP's explicit before/after
// capture sidesteps both failure modes entirely. Also reused (in ms) to time the ritual-drawer's
// own CSS reveal-wipe so it plays once the box has actually landed, not while still mid-flight.
const HERO_TRANSITION_MS = 900
// The ritual candidate row's own slide-up-from-off-screen reveal (see drawerRevealStyle in
// HomeGodDetailPanel) — duration per card, and the extra delay each successive card (by its
// left-to-right index) gets stacked on top of the shared HERO_TRANSITION_MS base delay.
const DRAWER_REVEAL_DURATION_MS = 1100
const DRAWER_REVEAL_STAGGER_MS = 150
// The god rail's entrance (GodListLayout's row list + its own right-edge divider, see
// RAIL_SLIDE_STYLE's call sites), applied identically to two separate elements (row list, divider)
// so they move in lockstep without needing to be nested inside one shared wrapper (nesting the
// divider inside the rows div clipped its height down to just the scrollable rows section instead
// of running the full column height alongside the header too). Runs from t=0 over the same
// HERO_TRANSITION_MS the hero card's own Flip takes — no delay, no separate duration — so the list
// and the clicked card grow into place together and land at the same instant, rather than the rail
// only starting once the card has already finished (which read as the card arriving alone, then
// the rest of the list catching up afterward).
const RAIL_SLIDE_STYLE: React.CSSProperties = {
  animation: `homeRailSlideIn ${HERO_TRANSITION_MS}ms ease-out both`,
}
// Exit mirrors entrance exactly: same duration as the hero's own shrink-back Flip, so the rail
// (via spawnRailExitGhost, since the real rail unmounts synchronously) and the card finish
// shrinking/sliding out at the same instant, same as they finish growing/sliding in together.
const RAIL_EXIT_DURATION_MS = HERO_TRANSITION_MS
// The divider doesn't slide in sideways with the rows (no RAIL_SLIDE_STYLE) — it stays fully
// visible in its final position throughout, at a right-side seam that's still empty grid/carousel
// space until the rows arrive. Instead it's held collapsed to nothing (scaleY(0), anchored at its
// own top edge via transformOrigin) until the rows have actually landed (delay:
// HERO_TRANSITION_MS), then grows straight down to full height — reads as the seam being drawn in
// after the rest of the rail settles, rather than one more thing sliding in from off-screen.
const DIVIDER_REVEAL_DURATION_MS = 350
const DIVIDER_REVEAL_STYLE: React.CSSProperties = {
  transformOrigin: 'top',
  animation: `homeRailDividerGrow ${DIVIDER_REVEAL_DURATION_MS}ms ease-out ${HERO_TRANSITION_MS}ms both`,
}
// Mirrors DIVIDER_REVEAL_STYLE for the exit direction — the ghost clone (spawnDividerExitGhost)
// plays this in reverse (full height -> collapsed) right away, so the seam retracts back into its
// own top edge instead of sliding away sideways with the rest of the rail.
const DIVIDER_EXIT_DURATION_MS = DIVIDER_REVEAL_DURATION_MS

// handleBack's list->grid transition unmounts GodListLayout (and the rail with it) synchronously
// via flushSync, same as the grid->list direction unmounts the grid — needed so the hero Flip
// itself starts immediately rather than waiting on anything (see the "no delay before the
// transition kicks in" comment in handleSelectGod). That leaves no way to play a real exit
// animation on the ACTUAL rail elements; they're gone before any animation frame could render
// them mid-transition. Instead, right before that unmount, this clones the rail's current DOM
// (whatever it happens to look like at that exact moment — correct scroll position, highlighted
// row, etc., since it's a literal snapshot rather than a re-render) into a `position: fixed`
// overlay appended to <body>, then slides that clone out to the left with a plain CSS transition
// and removes it once done. Purely decorative — doesn't touch React state or block anything else
// in the transition, mirroring the ejectGhost/dragGhost pattern already used elsewhere in this
// file for "something needs to visibly leave, but the source element is already gone" cases.
function spawnRailExitGhost() {
  const rowsEl = document.querySelector<HTMLElement>('[data-god-rail-rows]')
  const dividerEl = document.querySelector<HTMLElement>('[data-god-rail-divider]')
  if (!rowsEl || !dividerEl) return
  const rowsRect = rowsEl.getBoundingClientRect()

  // Clips the ghost at SidebarNav's own right edge (LAYOUT.navWidth) so sliding it out to the
  // left makes it disappear BEHIND the nav strip instead of sliding on top of it — the ghost's
  // z-index (needed to stay above the incoming grid, see below) would otherwise also put it above
  // the nav, reading as the rail briefly covering the nav icons as it exits.
  const clip = document.createElement('div')
  clip.style.position = 'fixed'
  clip.style.top = `${rowsRect.top}px`
  clip.style.left = `${LAYOUT.navWidth}px`
  // Rows only now — the divider gets its own separate, non-sliding ghost (spawnDividerExitGhost),
  // so this only needs to span the rows' own width, not out to the divider's right edge anymore.
  clip.style.width = `${rowsRect.right - LAYOUT.navWidth}px`
  clip.style.height = `${rowsRect.height}px`
  clip.style.overflow = 'hidden'
  clip.style.zIndex = '2000'
  clip.style.pointerEvents = 'none'

  const ghost = document.createElement('div')
  ghost.style.position = 'absolute'
  ghost.style.top = '0'
  ghost.style.left = `${rowsRect.left - LAYOUT.navWidth}px`
  ghost.style.width = `${rowsRect.width}px`
  ghost.style.height = `${rowsRect.height}px`
  // Opaque backdrop — the real rail rows/divider never needed their own solid background (the
  // app's own black bg always showed through behind them), but this ghost slides on TOP of the
  // grid that's simultaneously fading/growing in underneath. Left transparent, both layers show
  // through at once and blend together — reading as the rail "fading out" into the grid instead of
  // a clean opaque panel sliding away to reveal it.
  ghost.style.backgroundColor = COLORS.black
  ghost.style.transition = `transform ${RAIL_EXIT_DURATION_MS}ms ease-in`
  ghost.style.willChange = 'transform'
  clip.appendChild(ghost)

  const rowsClone = rowsEl.cloneNode(true) as HTMLElement
  rowsClone.style.position = 'absolute'
  rowsClone.style.top = '0'
  rowsClone.style.left = '0'
  rowsClone.style.width = `${rowsRect.width}px`
  rowsClone.style.height = `${rowsRect.height}px`
  rowsClone.style.visibility = 'visible'
  rowsClone.style.animation = 'none'
  ghost.appendChild(rowsClone)

  document.body.appendChild(clip)
  requestAnimationFrame(() => {
    ghost.style.transform = 'translateX(-320px)'
  })
  setTimeout(() => clip.remove(), RAIL_EXIT_DURATION_MS + 50)
}

// Mirrors DIVIDER_REVEAL_STYLE for the exit direction: the divider doesn't slide away sideways
// with the rows (see spawnRailExitGhost above, which no longer includes it) — instead this clones
// it in place (no horizontal movement at all) and immediately shrinks it back up into its own top
// edge, the reverse of how it grew down into place on entrance. Same clone-before-unmount
// reasoning as spawnRailExitGhost/spawnDrawerExitGhost: the real divider is gone the instant
// flushSync commits, so only a clone can carry the shrink animation to completion.
function spawnDividerExitGhost() {
  const dividerEl = document.querySelector<HTMLElement>('[data-god-rail-divider]')
  if (!dividerEl) return
  const rect = dividerEl.getBoundingClientRect()
  const ghost = dividerEl.cloneNode(true) as HTMLElement
  ghost.style.position = 'fixed'
  ghost.style.top = `${rect.top}px`
  ghost.style.left = `${rect.left}px`
  ghost.style.width = `${rect.width}px`
  ghost.style.height = `${rect.height}px`
  ghost.style.margin = '0'
  ghost.style.transformOrigin = 'top'
  ghost.style.zIndex = '2000'
  ghost.style.pointerEvents = 'none'
  ghost.style.animation = 'none'
  ghost.style.transition = `transform ${DIVIDER_EXIT_DURATION_MS}ms ease-in`
  document.body.appendChild(ghost)
  requestAnimationFrame(() => {
    ghost.style.transform = 'scaleY(0)'
  })
  setTimeout(() => ghost.remove(), DIVIDER_EXIT_DURATION_MS + 50)
}

// The "Appease the Gods" heading + subtitle is literally the same text in both grid and list mode
// (see the "No data-transition-chrome here" comments at both header call sites), so it's never
// faded or animated itself — left alone, it just swaps instantly along with everything else the
// flushSync below commits. But the two versions aren't laid out identically: the list header sits
// in a ~252px-wide rail column, so its subtitle wraps across 2 lines (no whiteSpace: nowrap),
// while the grid header has the full content width and stays on one line (whiteSpace: nowrap). The
// instant the view swaps back to grid, that subtitle visibly snaps from wrapped to unwrapped in
// the same frame the divider starts its own retract — this masks that snap by holding a static
// clone of the OLD (wrapped) text in place over the same spot, opaque, until the divider has
// fully finished disappearing (DIVIDER_EXIT_DURATION_MS), then removing it to reveal the already-
// unwrapped grid header underneath. No animation on the clone itself — it's a hold, not a tween.
function spawnHeaderExitGhost() {
  const headerEl = document.querySelector<HTMLElement>('[data-god-header-text]')
  if (!headerEl) return
  const rect = headerEl.getBoundingClientRect()

  // Separate mask + content: the grid header underneath renders its subtitle on one un-wrapped
  // line that runs well past where the list version's text wrapped, so the opaque backdrop has to
  // reach all the way to the viewport edge to fully hide it — but the CLONED content itself must
  // stay pinned to the original narrow width, or its own subtitle div (block-level, no fixed
  // width) would immediately re-wrap to fit the wider box, defeating the point of holding the old
  // wrapped look in place.
  const mask = document.createElement('div')
  mask.style.position = 'fixed'
  mask.style.top = `${rect.top}px`
  mask.style.left = `${rect.left}px`
  mask.style.width = `${window.innerWidth - rect.left}px`
  mask.style.height = `${rect.height}px`
  mask.style.backgroundColor = COLORS.black
  mask.style.zIndex = '2000'
  mask.style.pointerEvents = 'none'

  const content = headerEl.cloneNode(true) as HTMLElement
  content.style.width = `${rect.width}px`
  mask.appendChild(content)

  document.body.appendChild(mask)
  setTimeout(() => mask.remove(), DIVIDER_EXIT_DURATION_MS)
}

// Same problem, same fix as spawnRailExitGhost above, for the candidate ritual row instead of the
// rail: handleBack's flushSync unmounts the real cards synchronously, which would cut off a GSAP
// tween started against them mid-flight (the DOM nodes it's targeting are simply gone). Cloning
// each card into its own fixed-position ghost before that unmount lets the slide-down continue
// to completion afterward, run alongside the rail ghost's slide and the hero's own Flip instead of
// having to finish beforehand.
function spawnDrawerExitGhost(godId: string) {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-drawer-row="${godId}"] > *`))
  if (els.length === 0) return
  const ghosts = els.map(el => {
    const rect = el.getBoundingClientRect()
    const clone = el.cloneNode(true) as HTMLElement
    clone.style.position = 'fixed'
    clone.style.top = `${rect.top}px`
    clone.style.left = `${rect.left}px`
    clone.style.width = `${rect.width}px`
    clone.style.height = `${rect.height}px`
    clone.style.margin = '0'
    clone.style.zIndex = '2000'
    clone.style.pointerEvents = 'none'
    // Cancel drawerRevealStyle's own entrance animation on the clone — see the matching comment
    // at its previous use in handleBack for why an active "both" fill-mode animation would
    // otherwise silently override the GSAP transform below.
    clone.style.animation = 'none'
    document.body.appendChild(clone)
    return clone
  })
  gsap.to(ghosts, {
    y: '100vh',
    duration: HERO_TRANSITION_MS / 1000,
    ease: 'power2.in',
    // from: 'end' sweeps right-to-left — the reverse of drawerRevealStyle's left-to-right rise.
    stagger: { each: DRAWER_REVEAL_STAGGER_MS / 1000, from: 'end' },
    onComplete: () => ghosts.forEach(g => g.remove()),
  })
}
// No `scale: true` — the flip targets are the card's individual pieces (name/face/panel, see
// FLIP_PARTS below), and each one's grid vs list-view box has a genuinely different aspect ratio
// (e.g. the face's narrow-tall grid box vs its wide list box). `scale: true` would render that as
// a non-uniform CSS transform: scale(sx, sy), visibly stretching the artwork/text. Animating the
// real width/height instead lets the face SVG's own viewBox + default preserveAspectRatio=
// "xMidYMid meet" (see GodSvg.tsx) keep the art itself undistorted, just growing/repositioning
// within a box that's changing shape. `absolute: true` pulls each piece out of normal flow for the
// animation's duration so its changing box size can't shove flex siblings around mid-flight.
// nested: true — card is a Flip target that's also the ancestor of the panel target (direct
// child) and the name/face targets (via the left column, itself not flipped). Without it, having
// parent and descendant elements Flip simultaneously measured the card's own fit-content "natural"
// width as ~34px (basically just its padding, as if every child had briefly collapsed to 0) instead
// of ~623px, so it shrank the wrong way for most of the tween before hard-snapping to the true
// width at the very end. nested tells Flip to account for an ancestor's own Flip-driven changes
// when it measures/animates a descendant, instead of each element being measured in isolation.
// zIndex: every data-grid-card wrapper needed position: relative for the containing-block fixes
// above, which put ALL 24 grid cards into the same "positioned elements" paint layer — so once the
// hero starts flying from its old (list) position across the grid toward its new (small) one,
// stacking order came down to DOM order rather than which card is actually animating, and it could
// paint *behind* neighboring cards it passed over instead of staying on top the whole flight. This
// forces the 4 flipping pieces above everything else for the animation's duration only; Flip
// restores whatever z-index they had before once it completes.
const HERO_FLIP_VARS = { duration: HERO_TRANSITION_MS / 1000, ease: 'power3.out', absolute: true, nested: true, zIndex: 1000 }

// The card "becomes" its expanded self piece by piece rather than as one flipped blob: card frame,
// name, face, and ritual panel each carry their own data-flip-id (`${godId}:${part}`, see
// GodCard.tsx and HomeGodDetailPanel) and get captured/animated as four independent Flip targets
// that happen to run in the same Flip.getState/Flip.from call. A single whole-card flip stretched
// everything non-uniformly as one blob, since the grid card and the list's combined card have
// entirely different proportions — flipping each meaningful part into its corresponding list-view
// element (card -> combined-card frame, name -> header, face -> face box, panel -> drop-zone) is
// what makes the *card itself*, not just its contents, read as expanding into the new one.
const FLIP_PARTS = ['card', 'name', 'face', 'panel'] as const
const flipIdsFor = (godId: string) => FLIP_PARTS.map(part => `${godId}:${part}`)
const flipSelectorFor = (godId: string) => flipIdsFor(godId).map(id => `[data-flip-id="${id}"]`).join(', ')

// Flip's absolute:true makes the hero card's flip-tagged pieces sweep across a wide swath of the
// screen while resizing in real time — easily passing directly under wherever the pointer happens
// to be sitting (e.g. right where the user just clicked to trigger the transition in the first
// place). Chromium re-hit-tests "what's under the cursor" on every layout change even without any
// actual mouse movement, so GodCard's onMouseEnter/onMouseLeave (and HomeGodDetailPanel's
// isFaceHovered) can fire mid-flight purely from the card moving under a stationary pointer —
// flashing the face to its brighter hovered body color for most of the transition before snapping
// back to its resting color right at the end. Disabling pointer events on the hero's own pieces
// for the transition's duration keeps them out of hit-testing entirely, so no spurious hover ever
// fires. Restored once heroTransitionInProgressRef is cleared (see both handlers below).
const setHeroPointerEvents = (godId: string, enabled: boolean) => {
  document.querySelectorAll<HTMLElement>(flipSelectorFor(godId)).forEach(el => {
    el.style.pointerEvents = enabled ? '' : 'none'
  })
}

// Everything in the incoming view OTHER than the clicked hero card's four pieces ([data-flip-id])
// or [data-transition-chrome] (headers, tier headers, the list rail) — faded IN after the Flip
// commits so the rest of the screen settles in smoothly instead of popping in the same tick the
// hero starts growing. The outgoing view's equivalent elements are NOT faded out first anymore —
// see the comment in handleSelectGod for why (that pre-commit fade was gating the hero Flip's
// start behind its own ~180ms duration, which read as a delay before the transition kicked in).
const CHROME_FADE_SELECTOR = '[data-flip-id], [data-transition-chrome]'
const CHROME_FADE_IN_S = 0.35
// Total spread for the fade-in's stagger, NOT a per-element delay — grid mode alone has up to
// ~23 non-hero cards x 4 flip-tagged pieces each (card/name/face/panel) now that the card frame
// is its own piece too, so a flat per-element `stagger: 0.015` scaled with target count and could
// take over 1.5s to sweep through every element, most of it sitting at low opacity for a long,
// visually awkward stretch (a "wave" of dark card frames fading in one after another instead of
// the rest of the screen just resolving in behind the hero). GSAP's `{ amount }` stagger form
// distributes this fixed total across however many targets exist, so the whole reveal always
// finishes in the same short window regardless of whether it's ~90 grid pieces or ~15 list ones.
const CHROME_FADE_IN_STAGGER_TOTAL_S = 0.15

// Drag-and-drop tuning — a phase state machine with setTimeouts matched to CSS transition
// durations to commit state once the animation finishes, with a forgiving drop margin.
const DOCK_MARGIN = 48
const RETURN_DURATION = 320
const DOCK_DURATION = 260
const RITUAL_CARD_WIDTH = 245
// Fallback only, used for the drop-zone's height until the first real RitualCard renders and
// reports its actual height (see measuredCardHeight below) — RitualCard's content keeps changing,
// so this must never be treated as the source of truth. Rule: the drop-zone always matches
// RitualCard's own rendered size exactly (same for row slots and the drag ghost) — it's measured
// live, not hardcoded, specifically so it can't drift out of sync as the card's content evolves.
const RITUAL_CARD_HEIGHT_FALLBACK = 391

// The combined card's left column (name/subtitle + face) — used both for that column's own width
// and to derive DETAIL_CARD_WIDTH below, so the two can never drift out of sync.
const DETAIL_LEFT_COLUMN_WIDTH = 320
const DETAIL_CARD_GAP = 24
const DETAIL_CARD_PADDING = 16
// Explicit width for the combined-card wrapper, replacing a `width: 'fit-content'` that measured
// wrong once the card itself became a GSAP Flip target (see the comment on its data-flip-id below).
// fit-content depends on reading its children's current rendered width — fine normally, but Flip
// applying position: absolute to several of those children (and their own descendants) as part of
// the very same animation intermittently pulls them out of flow, so fit-content briefly measures
// as if the row were empty (~34px, just the borders/padding) instead of ~623px. All the pieces that
// make up this width are fixed constants regardless of any of that, so computing it directly
// sidesteps the whole race rather than fighting over measurement timing.
const DETAIL_CARD_WIDTH = DETAIL_LEFT_COLUMN_WIDTH + DETAIL_CARD_GAP + RITUAL_CARD_WIDTH + DETAIL_CARD_PADDING * 2 + 2 // +2 for the 1px border on each side (content-box sizing)

// Vertical gap between the combined detail card and the candidate row below it — shrinks to
// CANDIDATE_ROW_MARGIN_TOP_DENSE when the viewport is too short to fit the full stack (see
// compactSpacing in the main HomeScreen component below, and COMPACT_HEIGHT_THRESHOLD).
const CANDIDATE_ROW_MARGIN_TOP = 24
const CANDIDATE_ROW_MARGIN_TOP_DENSE = 8
// Estimated normal-mode height of everything stacked above and around the candidate row that
// eats into the viewport's available vertical space: the resource bar, the detail panel's own
// container padding (16px top + 24px bottom), the combined detail card (RITUAL_CARD_HEIGHT_
// FALLBACK tall, same rule the drop-zone itself follows), the gap above, and the candidate row
// itself (same height again). Deliberately a formula over fixed named pieces, not a single raw
// magic number, and deliberately NOT derived from any live-measured height (resourceBar/card
// height both react to denseSpacing themselves — comparing against a self-shrinking reference
// would flip-flop). window.innerHeight below this threshold switches every card/bar in this
// screen to its denser padding variant; at or above it, everything renders exactly as before.
const HOME_RESOURCE_BAR_ESTIMATED_HEIGHT = 120
const DETAIL_PANEL_CONTAINER_PADDING_V = 40
const COMPACT_HEIGHT_THRESHOLD =
  HOME_RESOURCE_BAR_ESTIMATED_HEIGHT + DETAIL_PANEL_CONTAINER_PADDING_V + RITUAL_CARD_HEIGHT_FALLBACK + CANDIDATE_ROW_MARGIN_TOP + RITUAL_CARD_HEIGHT_FALLBACK

function HomeGodDetailPanel({ god, onBack, onChoose, onUnchoose, onRitualHoverChange, chosenRitualId, isActive = true, isCentered = true, highlightParticipantType, highlightSite, measuredCardHeight, onMeasuredCardHeight, availableResources, isPunishing, denseSpacing = false }: { god: God; onBack: () => void; onChoose: (ritualId: string) => void; onUnchoose: () => void; onRitualHoverChange: (ritual: Ritual | null) => void; chosenRitualId?: string | null; isActive?: boolean; isCentered?: boolean; highlightParticipantType?: 'prisoners' | 'volunteers' | 'children' | 'virgins' | null; highlightSite?: 'Temple' | 'Great Pyramid' | null; measuredCardHeight: number | null; onMeasuredCardHeight: (height: number) => void; availableResources: { prisoners: number; volunteers: number; children: number; virgins: number; temples: number; greatTemples: number }; isPunishing?: boolean; denseSpacing?: boolean }) {
  // Widened to match outcomeEye()'s return type — EYE itself is `as const` (a literal-typed
  // union per level), which would otherwise stop `to`/`from` below from ever holding an
  // outcomeEye() result once a ritual is docked.
  const baseEye: { color: string; weight: number } = EYE[god.angerLevel as AngerLevel]
  // While this god is punishing, its candidate row offers exactly one ritual — its own Ultimate
  // Ritual (see buildUltimateRitual) — instead of the normal three. Computed here (not just in the
  // row below) since chosenRitual/dragGhostRitual/ejectGhost all need to resolve against the same
  // set of candidates.
  const effectiveRituals = isPunishing ? [buildUltimateRitual(god)] : god.rituals
  const chosenRitual = chosenRitualId ? effectiveRituals.find(r => r.id === chosenRitualId) ?? null : null
  // Eyes reflect the DOCKED ritual's outcome, not whatever's under the pointer — initialize from
  // chosenRitual (already-docked on mount, e.g. re-opening this god's panel) with from===to so
  // there's no spurious animation on first paint, only on an actual dock/undock afterward.
  const initialEye = chosenRitual ? outcomeEye(chosenRitual.outcomeColor) : baseEye
  const [eyeAnim, setEyeAnim] = useState<{ from: typeof baseEye; to: typeof baseEye; key: number; delay: number } | null>(
    chosenRitual ? { from: initialEye, to: initialEye, key: 0, delay: 0 } : null
  )
  const currentEyeRef = useRef(initialEye)
  // Same "animate the fresh markup, don't rely on a CSS transition" approach as eyeAnim above,
  // applied to the face's body fill — brightens when a ritual gets docked, dims back down when
  // it's pulled back out.
  const BODY_COLOR_DOCKED = COLORS.gray80
  const BODY_COLOR_UNDOCKED = COLORS.gray60
  const initialBodyColor = chosenRitual ? BODY_COLOR_DOCKED : BODY_COLOR_UNDOCKED
  const [bodyColorAnim, setBodyColorAnim] = useState<{ from: string; to: string; key: number } | null>(null)
  const currentBodyColorRef = useRef(initialBodyColor)
  // Hovering the face/name area (outside the ritual card) previews the same brighter look
  // GodCard uses for its own highlighted state, and clicking it returns to the overview grid.
  const [isFaceHovered, setIsFaceHovered] = useState(false)

  // Drag state — one machine handles both directions around the same target rect (the
  // drop-zone): dragging a row card in (dock) and dragging the docked card out (undock).
  const [dragRitualId, setDragRitualId] = useState<string | null>(null)
  const [dragOrigin, setDragOrigin] = useState<'row' | 'dropzone' | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [dragPhase, setDragPhase] = useState<'idle' | 'dragging' | 'returning' | 'docking' | 'undocking'>('idle')
  const [isOverDropZone, setIsOverDropZone] = useState(false)
  // Separate one-shot ghost for the ritual getting bumped out of the drop-zone when a *different*
  // row card is dropped in its place — not part of the drag lifecycle above (nothing's being
  // pointer-dragged for this one), so it needs its own mount-then-animate state instead of
  // reusing dragPos/dragPhase. `animate: false` on mount pins it at the drop-zone position for one
  // frame so the browser has something to transition *from* once `animate` flips true.
  const [ejectGhost, setEjectGhost] = useState<{ ritualId: string; x: number; y: number; animate: boolean } | null>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const rowSlotRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const dragStartRef = useRef<{ originLeft: number; originTop: number; pointerDx: number; pointerDy: number } | null>(null)

  // Drop-zone height rule: always match a real rendered RitualCard's own height exactly, live —
  // never a hardcoded number, so it can't drift out of sync as the card's content keeps changing.
  // Every row slot holds the same fixed-layout card, so the first one is representative; watched
  // with a ResizeObserver (not measured once) since content changes can happen after mount too.
  // measuredCardHeight/onMeasuredCardHeight are lifted up to HomeScreen (not local state here)
  // because this whole component unmounts every time viewMode leaves 'list' — local state would
  // reset to null on every single grid<->list transition, forcing dropZoneHeight through
  // RITUAL_CARD_HEIGHT_FALLBACK for a frame before the ResizeObserver corrected it. That fallback-
  // then-correct jump is exactly what made the detail face visibly overshoot to the fallback size
  // and then snap down right after landing. Lifting it means only the very first time the app ever
  // enters list mode pays that cost — every transition after reuses the already-known value.
  useEffect(() => {
    const el = rowSlotRefs.current[effectiveRituals[0]?.id]
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const height = entries[0]?.contentRect.height
      if (height) onMeasuredCardHeight(height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [effectiveRituals[0]?.id, onMeasuredCardHeight])
  const dropZoneHeight = measuredCardHeight ?? RITUAL_CARD_HEIGHT_FALLBACK

  // Pointer capture routes all move/up events to the card that started the drag, but the
  // cursor icon itself follows whatever's under the pointer — which, mid-drag, is wherever the
  // ghost happens to be, not necessarily an element with cursor:grabbing set. Forcing it on
  // <body> for the duration of the drag keeps the "grabbing fist" showing everywhere.
  useEffect(() => {
    if (dragPhase !== 'dragging') return
    document.body.style.cursor = 'grabbing'
    return () => { document.body.style.cursor = '' }
  }, [dragPhase])

  const isPointOverDropZone = (x: number, y: number) => {
    const zone = dropZoneRef.current
    if (!zone) return false
    const r = zone.getBoundingClientRect()
    return x >= r.left - DOCK_MARGIN && x <= r.right + DOCK_MARGIN && y >= r.top - DOCK_MARGIN && y <= r.bottom + DOCK_MARGIN
  }

  // Only pointerdown is a per-card React handler (it has to start on the specific card the user
  // pressed). Move/up/cancel are handled globally on window (see the effect below) rather than
  // via setPointerCapture + per-element handlers — capture routed through a <button> (RitualCard's
  // root element) turned out to be unreliable: the browser would occasionally release capture or
  // swallow the terminating pointerup mid-drag (button focus/active-state handling stepping on
  // it), leaving dragPhase stuck at 'dragging' forever with the card visually glued to the cursor
  // and never dropping. A window-level listener doesn't depend on capture surviving the whole
  // gesture — it fires on whatever the browser reports the release against, always.
  const handleDragPointerDown = (ritualId: string, origin: 'row' | 'dropzone') => (e: React.PointerEvent) => {
    if (dragPhase !== 'idle') return
    const el = origin === 'row' ? rowSlotRefs.current[ritualId] : dropZoneRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragStartRef.current = { originLeft: rect.left, originTop: rect.top, pointerDx: e.clientX - rect.left, pointerDy: e.clientY - rect.top }
    setDragRitualId(ritualId)
    setDragOrigin(origin)
    setDragPos({ x: rect.left, y: rect.top })
    setDragPhase('dragging')
    // Drives the resource-bar preview explicitly from the drag lifecycle instead of relying on
    // this card's own onMouseLeave, which may not fire reliably once the cursor moves off it.
    onRitualHoverChange(effectiveRituals.find(r => r.id === ritualId) ?? null)
  }

  useEffect(() => {
    if (dragPhase !== 'dragging') return

    const onMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return
      setDragPos({ x: e.clientX - dragStartRef.current.pointerDx, y: e.clientY - dragStartRef.current.pointerDy })
      setIsOverDropZone(isPointOverDropZone(e.clientX, e.clientY))
    }

    const onUp = (e: PointerEvent) => {
      if (!dragRitualId || !dragOrigin) return
      const overZone = isPointOverDropZone(e.clientX, e.clientY)
      setIsOverDropZone(false)

      const settle = () => {
        setDragPhase('idle')
        setDragRitualId(null)
        setDragOrigin(null)
        setDragPos(null)
        // Preview highlight held for the whole drag (see handleDragPointerDown) only auto-clears
        // here if the pointer already left the drop-zone before releasing. If it's still over the
        // zone (a successful dock, or a dropzone-card dropped back into itself), the cursor is
        // still on the ritual — leave the highlight up and let hover-out clear it later.
        if (!overZone) onRitualHoverChange(null)
      }

      if (dragOrigin === 'row' && overZone && dropZoneRef.current) {
        const r = dropZoneRef.current.getBoundingClientRect()
        setDragPos({ x: r.left, y: r.top })
        setDragPhase('docking')
        const ritualId = dragRitualId
        const dockedRitual = effectiveRituals.find(r => r.id === ritualId) ?? null
        // A different ritual is already sitting in the drop-zone — bump it back out to its own
        // row slot with the same fly-back motion as a manual undock, instead of it just snapping
        // into view the instant onChoose replaces chosenRitualId.
        if (chosenRitualId && chosenRitualId !== ritualId) {
          const outgoingId = chosenRitualId
          const slotEl = rowSlotRefs.current[outgoingId]
          if (slotEl) {
            const toRect = slotEl.getBoundingClientRect()
            setEjectGhost({ ritualId: outgoingId, x: r.left, y: r.top, animate: false })
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setEjectGhost({ ritualId: outgoingId, x: toRect.left, y: toRect.top, animate: true })
              })
            })
            setTimeout(() => setEjectGhost(null), DOCK_DURATION)
          }
        }
        setTimeout(() => { onChoose(ritualId); setEyesTo(dockedRitual); setBodyColorTo(true); settle() }, DOCK_DURATION)
      } else if (dragOrigin === 'dropzone' && !overZone) {
        // Animate the ghost flying back to its row slot (same transform-transition treatment as
        // docking) instead of just fading out in place — the slot itself stays invisible
        // (isChosen) until onUnchoose flips it, so there's no flicker/overlap at handoff.
        const slotEl = dragRitualId ? rowSlotRefs.current[dragRitualId] : null
        if (slotEl) {
          const r = slotEl.getBoundingClientRect()
          setDragPos({ x: r.left, y: r.top })
        }
        setDragPhase('undocking')
        setTimeout(() => { onUnchoose(); setEyesTo(null); setBodyColorTo(false); settle() }, DOCK_DURATION)
      } else {
        // Either a row card missed the drop-zone, or the docked card was dropped back inside it —
        // both cases just snap back to where the drag started, no state change.
        setDragPhase('returning')
        setTimeout(settle, RETURN_DURATION)
      }
    }

    // A pointercancel (window/tab loses focus mid-drag, the OS intercepts the gesture, browser
    // scroll-to-refresh kicks in, etc.) never fires pointerup — without handling it separately,
    // dragPhase would stay stuck at 'dragging' forever with nothing left to call settle().
    const onCancel = () => {
      setIsOverDropZone(false)
      onRitualHoverChange(null)
      setDragPhase('returning')
      setTimeout(() => {
        setDragPhase('idle')
        setDragRitualId(null)
        setDragOrigin(null)
        setDragPos(null)
      }, RETURN_DURATION)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [dragPhase, dragRitualId, dragOrigin])

  // Hovering only previews the resource-bar highlight (see onRitualHoverChange) — the eyes stay
  // put until a ritual is actually dropped; see setEyesTo, called from the dock/undock handlers.
  // Ignored mid-drag: pointer capture means this card's own mouseenter/mouseleave can fire at
  // arbitrary points during a drag, which would otherwise stomp the drag-driven preview set by
  // handleDragPointerDown/settle.
  const handleRitualHover = (ritual: Ritual, hovered: boolean) => {
    if (dragPhase !== 'idle') return
    onRitualHoverChange(hovered ? ritual : null)
  }

  const setEyesTo = (ritual: Ritual | null) => {
    const target = ritual ? outcomeEye(ritual.outcomeColor) : baseEye
    const from = currentEyeRef.current
    currentEyeRef.current = target
    setEyeAnim(prev => ({ from, to: target, key: (prev?.key ?? 0) + 1, delay: 0 }))
  }

  const setBodyColorTo = (docked: boolean) => {
    const target = docked ? BODY_COLOR_DOCKED : BODY_COLOR_UNDOCKED
    const from = currentBodyColorRef.current
    currentBodyColorRef.current = target
    setBodyColorAnim(prev => ({ from, to: target, key: (prev?.key ?? 0) + 1 }))
  }

  const dragGhostRitual = dragRitualId ? effectiveRituals.find(r => r.id === dragRitualId) ?? null : null
  // Two tiers: brighter the whole time a ritual card is being dragged (any target is potentially
  // droppable), brighter still once the pointer is actually over this zone (the imminent-drop cue).
  const isDragging = dragPhase === 'dragging'
  const zoneHighlighted = isDragging && isOverDropZone
  const zoneFill = zoneHighlighted ? COLORS.gray20 : isDragging ? COLORS.gray15 : COLORS.black
  const zoneBorderColor = zoneHighlighted ? COLORS.white : isDragging ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)'
  const zoneTextColor = zoneHighlighted ? COLORS.gray95 : isDragging ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'

  // Both the drop-zone's placeholder text ("Drag and drop an appeasement ritual") and the god's
  // description/subtitle live INSIDE flip-target boxes (panel/name) that have to stay visible
  // and growing for the whole flip — see those flip targets' own comments. But that means this
  // specific TEXT, sized for its small GodCard starting point (the subtitle doesn't even exist in
  // GodCard at all — it's entirely new content), renders immediately, cramped into a box that's
  // still mid-grow. Gating this text's own opacity separately from its containing box's fixes it:
  // starts at opacity 0 (so there's nothing to visibly "pop in" cramped at the small starting
  // size — it was simply never shown then) and fades in only once HERO_TRANSITION_MS has passed
  // and the box has finished expanding to its true size. fill-mode "both" holds opacity:0 for the
  // whole delay (not just "forwards", which would only apply after the animation starts).
  const postHeroFadeInStyle: React.CSSProperties = isCentered
    ? { animation: `homeDetailPostHeroFadeIn 300ms ease-out ${HERO_TRANSITION_MS}ms both` }
    : {}

  // Slides up from below the viewport once the hero card's own grow-into-place Flip lands —
  // delayed by HERO_TRANSITION_MS so the ritual cards only ever start appearing after the god
  // card has fully finished enlarging, not layered on top of/racing that animation.
  //
  // No opacity animation anywhere here — any opacity fade (even one that finishes early, tried
  // previously) reads as "fading in", which was explicitly unwanted. Staying hidden until the
  // hero settles is instead done with `visibility`, a hard on/off switch with no interpolated
  // in-between frames, so there's nothing to perceive as a fade: base style is `visibility:
  // hidden`, then a second near-zero-duration animation flips it to visible the instant the
  // delay elapses (`forwards` fill only — NOT "both" — so that flip doesn't retroactively apply
  // during the delay the way it would with backwards fill). The actual slide (transform-only,
  // "both" fill so it holds translateY(100vh) throughout the delay) runs at the same time.
  // translateY(100vh) (not some fixed px offset like 90px, tried previously) guarantees the
  // starting position is below the visible viewport regardless of where this row's own resting
  // spot happens to sit on the page — a fixed px value that's smaller than the remaining distance
  // to the bottom of the screen never actually leaves the viewport, which read as a small nudge
  // rather than sliding in "from off screen".
  //
  // isCentered (god.id === heroRevealGodId, threaded down from HomeScreen — see that state's own
  // declaration comment) gates this per-panel. It's deliberately NOT "is this the carousel's
  // currently-centered panel" (that was tried first and replayed the reveal every time ordinary
  // scrolling brought a new god into the centered slot) — heroRevealGodId only ever names the one
  // god whose grid card was actually clicked to open list mode, and clears the moment the
  // carousel settles on a different god. So this reveal plays exactly once, for exactly one god,
  // per grid->list transition — never on plain scrolling.
  //
  // Applied per-card (not once on the row) with each card's own delay offset by its index —
  // DRAWER_REVEAL_STAGGER_MS on top of the shared HERO_TRANSITION_MS base — so the three cards
  // rise one after another left-to-right instead of as a single rigid block.
  const drawerRevealStyle = (index: number): React.CSSProperties =>
    isCentered
      ? {
          visibility: 'hidden',
          animation: `homeDetailDrawerReveal ${DRAWER_REVEAL_DURATION_MS}ms ease-out ${HERO_TRANSITION_MS + index * DRAWER_REVEAL_STAGGER_MS}ms both, homeDetailDrawerRevealVisibility 1ms linear ${HERO_TRANSITION_MS + index * DRAWER_REVEAL_STAGGER_MS}ms forwards`,
        }
      : {}

  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 24px 0', padding: '16px 24px 24px' }}>
      <div
        // The 4th GSAP Flip target (card frame), matching GodCard's own root div — see the comment
        // there. position: relative is *also* needed as the correct containing block for the
        // drop-zone below once it becomes a Flip target (absolute: true); see the matching comment
        // on the left column just below for why that matters (same reasoning, same fix).
        data-flip-id={`${god.id}:card`}
        style={{
          position: 'relative',
          display: 'flex',
          width: `${DETAIL_CARD_WIDTH}px`,
          gap: `${DETAIL_CARD_GAP}px`,
          backgroundColor: isPunishing ? EYE.high.color : COLORS.cardBg,
          // Same subtle dark radial vignette GodCard/GodPunishmentDialog use behind the punishing
          // face, for the same reason — pure flat red there reads noticeably flatter than this
          // card's usual look.
          backgroundImage: isPunishing
            ? 'radial-gradient(ellipse at 30% 55%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.35) 100%)'
            : undefined,
          border: `1px solid ${isPunishing ? 'rgba(77,77,77,0.56)' : COLORS.gray20}`,
          borderRadius: '10px',
          padding: `${DETAIL_CARD_PADDING}px`,
        }}
      >
        <div
          onClick={onBack}
          onMouseEnter={() => setIsFaceHovered(true)}
          onMouseLeave={() => setIsFaceHovered(false)}
          // position: relative is load-bearing, not decorative — the face/name boxes below are GSAP
          // Flip targets, and Flip's absolute: true temporarily takes them out of flow by switching
          // them to position: absolute. Without a positioned ancestor right here, that escapes all
          // the way up to the carousel viewport (itself position: relative, ~3x wider than this
          // column), so Flip measures/tweens toward a wrong, way-too-wide "natural" target and then
          // hard-snaps down to the true width the instant it hands control back to normal flow.
          // Anchoring the absolute positioning here keeps its containing block correct.
          style={{ position: 'relative', flexShrink: 0, width: `${DETAIL_LEFT_COLUMN_WIDTH}px`, height: `${dropZoneHeight}px`, display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}
        >
          {/* No homeDetailHeaderEnter delayed-reveal animation here anymore — this div is now a
              GSAP Flip target in its own right (growing from GodCard's name label), so it needs to
              be visible and growing throughout the flip, not held at opacity:0 until it lands. */}
          <div
            data-flip-id={`${god.id}:name`}
            style={{
              flexShrink: 0,
              width: '100%',
              textAlign: 'center',
            }}
          >

            {/* Wraps just the name line (not the subtitle below) so the chevron's vertical center,
                driven by this row's own height, always lines up with the name specifically. */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '5px',
                  borderRadius: '50%',
                  backgroundColor: isFaceHovered ? COLORS.gray18 : 'transparent',
                }}
              >
                <CaretLeft size={16} weight="bold" color={isPunishing ? (isFaceHovered ? COLORS.white : COLORS.gray95) : isFaceHovered ? COLORS.gray95 : COLORS.gray30} />
              </div>
              <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.xl, fontWeight: 300, color: isPunishing ? COLORS.gray95 : isActive ? COLORS.gray60 : COLORS.gray15, textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.15s ease' }}>{god.name}</span>
            </div>
            <p style={{ margin: '0', fontFamily: FONTS.spectral, fontSize: '16px', color: isPunishing ? COLORS.gray95 : isActive ? '#909090' : COLORS.gray15, transition: 'color 0.15s ease', ...postHeroFadeInStyle }}>{god.subtitle}</p>
          </div>
          {/* Three independent GSAP Flip targets carry the grid<->list transition — see
              handleSelectGod/handleBack in HomeScreen and the matching comment in GodCard.tsx.
              This one (the face) matches GodCard's face box; the header above matches its name
              label; the drop-zone below matches its ritual panel. Every panel gets these, not just
              the active one — querying by the specific godId being transitioned always finds the
              right ones regardless of which carousel panels happen to be mounted. */}
          <div data-flip-id={`${god.id}:face`} style={{ flex: 1, minHeight: 0, width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
            <GodSvg
              svgRaw={getSvgRaw(god.id)}
              angerLevel={god.angerLevel}
              bodyColor={isPunishing ? COLORS.white : isActive ? currentBodyColorRef.current : COLORS.gray15}
              bodyColorAnimation={!isPunishing && isActive && bodyColorAnim ? { fromColor: bodyColorAnim.from, toColor: bodyColorAnim.to, duration: 1.4, id: `body-${bodyColorAnim.key}` } : undefined}
              instanceId={`detail-${god.id}`}
              eyeAnimation={eyeAnim ? { fromColor: eyeAnim.from.color, fromWeight: eyeAnim.from.weight, toColor: eyeAnim.to.color, toWeight: eyeAnim.to.weight, delay: eyeAnim.delay, duration: 1.6, id: `eye-${eyeAnim.key}` } : undefined}
              // Forced black while punishing, matching GodCard's own "punishing wins" rule — but
              // only until a ritual is actually docked (chosenRitual). Once one is, the eyes
              // should reflect that ritual's outcome color (via eyeAnim/eyeAnimation above) like
              // any other god's, not stay locked to black — this override no longer applies then.
              eyeColor={isPunishing && !chosenRitual ? COLORS.gray0 : undefined}
            />
          </div>
        </div>
        {/* Drop-zone — a permanent dashed base layer with the docked ritual (if any) layered on
            top; dimming the docked card during an undock-drag naturally reveals the dashed base
            underneath, no extra state needed. Also the GSAP Flip target matching GodCard's ritual
            panel — already position:relative from its own pre-existing layout needs, which
            conveniently also happens to be exactly what Flip's absolute:true needs here. No
            drawerRevealStyle anymore (unlike the candidate row below, which keeps it) — this box
            IS the flip target growing from GodCard's ritual panel now, so it needs to be visible
            throughout the flip instead of held at opacity:0 until 900ms in. */}
        <div ref={dropZoneRef} data-flip-id={`${god.id}:panel`} style={{ flexShrink: 0, width: `${RITUAL_CARD_WIDTH}px`, height: `${dropZoneHeight}px`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: zoneFill,
              border: `1.75px dashed ${zoneBorderColor}`,
              borderRadius: '10px',
              // Hidden once a ritual is docked — it's redundant against the card's own border at
              // matching size, and would otherwise peek through as a faint outline. Still shown
              // while dragging the docked card back out (dimming it reveals this base as feedback
              // that it's coming loose), and fades in the same way if the drag misses its target.
              opacity: !chosenRitual || (dragOrigin === 'dropzone' && dragRitualId === chosenRitual.id && dragPhase !== 'idle') ? 1 : 0,
              transition: 'background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
            }}
          />
          {!chosenRitual && (
            <span
              style={{
                position: 'relative',
                maxWidth: '70%',
                textAlign: 'center',
                fontFamily: FONTS.spectral,
                fontSize: FONT_SIZE.md,
                fontWeight: FONT_WEIGHT.light,
                color: zoneTextColor,
                pointerEvents: 'none',
                transition: 'color 0.15s ease',
                ...postHeroFadeInStyle,
              }}
            >
              Drag and drop an appeasement ritual
            </span>
          )}
          {chosenRitual && (
            <div
              onPointerDown={handleDragPointerDown(chosenRitual.id, 'dropzone')}
              style={{
                position: 'relative',
                width: `${RITUAL_CARD_WIDTH}px`,
                cursor: 'grab',
                touchAction: 'none',
                // Hidden both while this exact card is mid-undock-drag AND while it's being
                // bumped out by an incoming replacement (ejectGhost carries it from here instead).
                // Fully hidden (not dimmed) — the dragged ghost is the only copy that should read
                // as "this card", no half-opacity shadow left behind at the source.
                opacity: (dragOrigin === 'dropzone' && dragRitualId === chosenRitual.id && dragPhase !== 'idle') || ejectGhost?.ritualId === chosenRitual.id ? 0 : 1,
              }}
            >
              <RitualCard
                ritual={chosenRitual}
                isSelected={false}
                onClick={() => {}}
                onHoverChange={hovered => handleRitualHover(chosenRitual, hovered)}
                outcomeBorder
                dropShadow={false}
                highlightParticipantType={highlightParticipantType}
                highlightSite={highlightSite}
                tierLabel={tierLabelFor(chosenRitual, effectiveRituals.findIndex(r => r.id === chosenRitual.id))}
                denseSpacing={denseSpacing}
              />
            </div>
          )}
        </div>
      </div>
      {/* Candidate row — every one of the god's rituals, in a fixed slot each. Drag one into the
          drop-zone above to choose it; its own slot here goes vacant (invisible, but still
          occupying its space) rather than closing up, so the other cards never have to move.
          Drag the docked card back out to bring it back to its same slot. */}
      {/* data-drawer-row names the god this row belongs to — handleBack (HomeScreen) uses it to
          find and slide these cards back down before the hero shrinks, mirroring their own
          slide-up-from-off-screen entrance (drawerRevealStyle above) in reverse. */}
      <div data-drawer-row={god.id} style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: denseSpacing ? `${CANDIDATE_ROW_MARGIN_TOP_DENSE}px` : `${CANDIDATE_ROW_MARGIN_TOP}px` }}>
        {(() => {
          // availableResources already has this god's own currently-docked ritual reserved out of
          // the pool — swapping it for a different candidate frees that reservation first, so add
          // it back before judging whether a candidate is affordable, or a same-or-cheaper swap
          // could wrongly read as "insufficient funds".
          const effectiveAvailable = {
            prisoners: availableResources.prisoners + (chosenRitual?.participants.prisoners ?? 0),
            volunteers: availableResources.volunteers + (chosenRitual?.participants.volunteers ?? 0),
            children: availableResources.children + (chosenRitual?.participants.children ?? 0),
            virgins: availableResources.virgins + (chosenRitual?.participants.virgins ?? 0),
          }
          // Same "add this god's own currently-docked ritual back first" reasoning as
          // effectiveAvailable above, but for the ritual site (Temple/Great Pyramid) count —
          // sites were never checked here at all before, so running out of one silently never
          // blocked a ritual as "unaffordable" the way running out of a tribute type already did.
          const effectiveAvailableSite: Record<'Temple' | 'Great Pyramid', number> = {
            Temple: availableResources.temples + (chosenRitual?.sacredSite.name === 'Temple' ? chosenRitual.sacredSite.count : 0),
            'Great Pyramid': availableResources.greatTemples + (chosenRitual?.sacredSite.name === 'Great Pyramid' ? chosenRitual.sacredSite.count : 0),
          }
          // While this god is punishing, effectiveRituals already IS just its single Ultimate
          // Ritual (see its own declaration above) — no separate filter needed here anymore.
          return effectiveRituals
          .map((ritual, index) => ({ ritual, index }))
          .map(({ ritual, index }) => {
          const isChosen = ritual.id === chosenRitualId
          const insufficientParticipantTypes = (['prisoners', 'volunteers', 'children', 'virgins'] as const)
            .filter(type => ritual.participants[type] > effectiveAvailable[type])
          const siteName = ritual.sacredSite.name as 'Temple' | 'Great Pyramid'
          const insufficientSite = ritual.sacredSite.count > effectiveAvailableSite[siteName]
          const canAfford = insufficientParticipantTypes.length === 0 && !insufficientSite
          return (
            <div
              key={ritual.id}
              ref={el => { rowSlotRefs.current[ritual.id] = el }}
              onPointerDown={isChosen || !canAfford ? undefined : handleDragPointerDown(ritual.id, 'row')}
              style={{
                width: `${RITUAL_CARD_WIDTH}px`,
                flexShrink: 0,
                cursor: isChosen ? 'default' : canAfford ? 'grab' : 'default',
                touchAction: 'none',
                pointerEvents: isChosen ? 'none' : 'auto',
                opacity: isChosen ? 0 : dragOrigin === 'row' && dragRitualId === ritual.id && dragPhase !== 'idle' ? 0 : 1,
                ...drawerRevealStyle(index),
              }}
            >
              <RitualCard
                ritual={ritual}
                isSelected={false}
                onClick={() => {}}
                onHoverChange={hovered => handleRitualHover(ritual, hovered)}
                outcomeBorder
                highlightParticipantType={highlightParticipantType}
                highlightSite={highlightSite}
                tierLabel={tierLabelFor(ritual, index)}
                insufficientResources={!canAfford}
                insufficientParticipantTypes={insufficientParticipantTypes}
                insufficientSite={insufficientSite}
                denseSpacing={denseSpacing}
              />
            </div>
          )
        })
        })()}
      </div>
      {dragGhostRitual && dragPos && createPortal(
        // Portaled to document.body — the hero card above (data-flip-id) gets a GSAP-applied
        // `transform` while it's mid-FLIP, and CSS gives any transformed ancestor a new
        // containing block for position:fixed descendants. Left nested inside it, this ghost
        // would track relative to the card's box instead of the viewport.
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: `${RITUAL_CARD_WIDTH}px`,
            transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
            transition:
              dragPhase === 'returning' ? `transform ${RETURN_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`
              : dragPhase === 'docking' || dragPhase === 'undocking' ? `transform ${DOCK_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`
              : 'none',
            opacity: 1,
            pointerEvents: 'none',
            zIndex: 4001,
            ...(dragPhase === 'returning' && dragStartRef.current
              ? { transform: `translate(${dragStartRef.current.originLeft}px, ${dragStartRef.current.originTop}px)` }
              : {}),
          }}
        >
          <RitualCard ritual={dragGhostRitual} isSelected={false} onClick={() => {}} outcomeBorder forcePopped tierLabel={tierLabelFor(dragGhostRitual, effectiveRituals.findIndex(r => r.id === dragGhostRitual.id))} denseSpacing={denseSpacing} />
        </div>,
        document.body
      )}
      {ejectGhost && (() => {
        const ejectRitual = effectiveRituals.find(r => r.id === ejectGhost.ritualId)
        if (!ejectRitual) return null
        return createPortal(
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: `${RITUAL_CARD_WIDTH}px`,
              transform: `translate(${ejectGhost.x}px, ${ejectGhost.y}px)`,
              transition: ejectGhost.animate ? `transform ${DOCK_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)` : 'none',
              pointerEvents: 'none',
              zIndex: 4000,
            }}
          >
            <RitualCard ritual={ejectRitual} isSelected={false} onClick={() => {}} outcomeBorder tierLabel={tierLabelFor(ejectRitual, effectiveRituals.findIndex(r => r.id === ejectRitual.id))} denseSpacing={denseSpacing} />
          </div>,
          document.body
        )
      })()}
      <style>{`
        @keyframes homeDetailHeaderEnter {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Ritual cards rise up from below rather than fading in — no opacity animation at all,
           purely a position move, so it never reads as a fade. See drawerRevealStyle's own
           comment for how visibility (not opacity) handles staying hidden until the hero lands. */
        @keyframes homeDetailDrawerReveal {
          from { transform: translateY(100vh); }
          to { transform: translateY(0); }
        }
        @keyframes homeDetailDrawerRevealVisibility {
          to { visibility: visible; }
        }
        /* Fades in the drop-zone placeholder and the god's description only once the hero card
           has finished expanding — see postHeroFadeInStyle's own comment. */
        @keyframes homeDetailPostHeroFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const ESTIMATED_PANEL_HEIGHT = 650

// Real spacing between stacked panels — must stay >= the trailing cover's marginTop below, or
// the cover starts before the next panel actually does and its content peeks through the gap.
const FREE_CAROUSEL_GAP = 40
const FREE_CAROUSEL_WINDOW_RADIUS = 2
// Total accumulated wheel deltaY needed to commit one step. Low enough that a single light
// scroll tick (a mouse-wheel notch is ~100, already well past this alone) or a short trackpad
// flick immediately trips it — deliberately not proportional to delta size, so a harder/faster
// scroll still can never skip past more than one god at a time (see handleWheel's lock).
const FREE_SCROLL_STEP_THRESHOLD = 30
const FREE_SNAP_DURATION = 1100

// One god at a time: each wheel gesture commits exactly one step (see handleWheel's accumulator
// + lock), animated with a real CSS transition — not the old continuous 1:1 finger-tracking,
// which let a hard fling blow past several gods and, worse, let light scrolls that never crossed
// its rounding threshold do nothing at all.
function GodFreeCarousel({ gods, scrollPos, onScrollPosChange, onSettledIndexChange, chosenRituals, onChooseRitual, onUnchooseRitual, onRitualHoverChange, onBack, highlightParticipantType, highlightSite, measuredCardHeight, onMeasuredCardHeight, availableResources, punishingGodId, heroRevealGodId, panelHeights, onPanelHeightsChange, denseSpacing }: {
  gods: God[]
  scrollPos: number
  onScrollPosChange: (pos: number) => void
  onSettledIndexChange: (index: number) => void
  chosenRituals: Record<string, string>
  onChooseRitual: (godId: string, ritualId: string) => void
  onUnchooseRitual: (godId: string) => void
  onRitualHoverChange: (ritual: Ritual | null) => void
  onBack: () => void
  highlightParticipantType?: 'prisoners' | 'volunteers' | 'children' | 'virgins' | null
  highlightSite?: 'Temple' | 'Great Pyramid' | null
  measuredCardHeight: number | null
  onMeasuredCardHeight: (height: number) => void
  availableResources: { prisoners: number; volunteers: number; children: number; virgins: number; temples: number; greatTemples: number }
  punishingGodId?: string | null
  heroRevealGodId: string | null
  panelHeights: Record<string, number>
  onPanelHeightsChange: React.Dispatch<React.SetStateAction<Record<string, number>>>
  denseSpacing?: boolean
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const setPanelHeights = onPanelHeightsChange
  const roRef = useRef<ResizeObserver | null>(null)
  const observedRef = useRef<Map<string, HTMLElement>>(new Map())
  // Accumulates wheel deltaY until FREE_SCROLL_STEP_THRESHOLD is crossed, then commits exactly
  // one step and resets to 0. wheelLockRef blocks (and drops, rather than queues) all wheel input
  // for the duration of that step's transition, so a continued flick can't stack up extra steps.
  const wheelAccumRef = useRef(0)
  const wheelLockRef = useRef(false)
  const wheelLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // scrollPos (the prop) can jump by more than one god at a time — e.g. picking a far-down row
  // in the left rail sets it directly to that god's index, not the next/previous one like a
  // wheel step does. A CSS transition can only animate an element that's already on screen: a
  // god whose panel wasn't mounted at all under the old position (outside FREE_CAROUSEL_WINDOW_
  // RADIUS) has no "before" transform to transition from, so it would just pop in already at
  // rest instead of sliding into place — no amount of widening the render window fixes that,
  // since a freshly-inserted DOM node's initial style is never animated, only *changes* to an
  // existing node's style are. renderScrollPos is the actual position everything below renders
  // from; a rAF loop eases it from wherever it currently is toward the incoming scrollPos prop
  // over FREE_SNAP_DURATION, so every intermediate god sweeps naturally into (and back out of)
  // the render window as it travels, exactly like continuous manual scrolling — one mechanism
  // that handles both a single wheel step and an arbitrary-distance row click. Panels no longer
  // need a CSS `transition` on transform at all: each frame's position is already the correct
  // eased value, computed directly, so layering a CSS transition on top would just make the
  // element lag behind chasing a moving target.
  const [renderScrollPos, setRenderScrollPos] = useState(scrollPos)
  const renderScrollPosRef = useRef(scrollPos)
  const tweenRafRef = useRef<number | null>(null)
  useEffect(() => {
    if (renderScrollPosRef.current === scrollPos) return
    if (tweenRafRef.current !== null) cancelAnimationFrame(tweenRafRef.current)
    const from = renderScrollPosRef.current
    const to = scrollPos
    const startTime = performance.now()
    // Symmetric ease-in-out (accelerate, then decelerate) — matches the curve already tuned
    // for this carousel's single-step wheel motion; see the transform transition this replaces.
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / FREE_SNAP_DURATION)
      const value = from + (to - from) * easeInOutCubic(t)
      renderScrollPosRef.current = value
      setRenderScrollPos(value)
      tweenRafRef.current = t < 1 ? requestAnimationFrame(tick) : null
    }
    tweenRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (tweenRafRef.current !== null) cancelAnimationFrame(tweenRafRef.current)
    }
  }, [scrollPos])

  useLayoutEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement
        const godId = target.dataset.godId
        if (godId) {
          const h = target.offsetHeight
          setPanelHeights(prev => (prev[godId] === h ? prev : { ...prev, [godId]: h }))
        }
      }
    })
    roRef.current = ro
    return () => ro.disconnect()
  }, [])

  const registerPanelEl = (godId: string, el: HTMLDivElement | null) => {
    const ro = roRef.current
    if (!ro) return
    const prev = observedRef.current.get(godId)
    if (prev && prev !== el) {
      ro.unobserve(prev)
      observedRef.current.delete(godId)
    }
    if (el) {
      el.dataset.godId = godId
      ro.observe(el)
      observedRef.current.set(godId, el)
    }
  }

  const heightOf = (index: number) => panelHeights[gods[index].id] ?? ESTIMATED_PANEL_HEIGHT

  // Cumulative top-edge offset of a (possibly fractional) virtual index, measured from index 0 —
  // used as a common ruler so any two positions (integer or fractional) can be placed relative to
  // each other, which is what lets the carousel track a position strictly between two gods.
  const cumulativeTop = (pos: number) => {
    const clamped = Math.max(0, Math.min(gods.length - 1, pos))
    const base = Math.floor(clamped)
    const frac = clamped - base
    let top = 0
    for (let i = 0; i < base; i++) top += heightOf(i) + FREE_CAROUSEL_GAP
    top += frac * (heightOf(base) + FREE_CAROUSEL_GAP)
    return top
  }

  const roundedIndex = Math.max(0, Math.min(gods.length - 1, Math.round(scrollPos)))

  useEffect(() => {
    onSettledIndexChange(roundedIndex)
  }, [roundedIndex])

  // windowIndices spans FREE_CAROUSEL_WINDOW_RADIUS around renderScrollPos rather than the raw
  // scrollPos prop — since renderScrollPos itself sweeps continuously from the old position to
  // the new one (see the tween above), every god along the way naturally enters this window as
  // the sweep approaches it and leaves once it's passed, the same as it would under manual
  // scrolling. No separate "hold a wide window open during the transition" bookkeeping needed.
  const windowStart = Math.max(0, Math.floor(renderScrollPos) - FREE_CAROUSEL_WINDOW_RADIUS)
  const windowEnd = Math.min(gods.length - 1, Math.ceil(renderScrollPos) + FREE_CAROUSEL_WINDOW_RADIUS)
  const windowIndices: number[] = []
  for (let i = windowStart; i <= windowEnd; i++) windowIndices.push(i)

  const anchorTop = cumulativeTop(renderScrollPos)
  // Anchored near the top of the carousel viewport (close to the resource bar) rather than
  // vertically centered — HomeGodDetailPanel's own 24px top margin already provides the breathing
  // room, so the active panel's top edge lands just below the header area.
  const baseOffset = 0

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    // Mid-step: drop this event entirely rather than queue it — the lock releasing only after
    // the transition finishes is what guarantees a fast/continued flick still lands on exactly
    // the next god, never two or three.
    if (wheelLockRef.current) return

    wheelAccumRef.current += e.deltaY
    if (Math.abs(wheelAccumRef.current) < FREE_SCROLL_STEP_THRESHOLD) return

    const direction = wheelAccumRef.current > 0 ? 1 : -1
    wheelAccumRef.current = 0
    const current = Math.round(scrollPos)
    const next = Math.max(0, Math.min(gods.length - 1, current + direction))
    if (next === current) return // already at the first/last god — nothing to step to

    wheelLockRef.current = true
    onScrollPosChange(next)
    wheelLockTimeoutRef.current = setTimeout(() => {
      wheelLockRef.current = false
    }, FREE_SNAP_DURATION)
  }

  useEffect(() => () => {
    if (wheelLockTimeoutRef.current) clearTimeout(wheelLockTimeoutRef.current)
  }, [])

  return (
    <div ref={viewportRef} onWheel={handleWheel} style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {windowIndices.map(index => {
        const god = gods[index]
        const isActive = index === roundedIndex
        // Every panel always renders at full brightness — no dimmed/inactive state — so scrolling
        // (single-step or a multi-hop row-click jump) never darkens a god's face/name, whether
        // it's the target, the source, or one being swept past in between.
        const isVisuallyActive = true
        const top = baseOffset + (cumulativeTop(index) - anchorTop)
        return (
          <div
            key={god.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              // Real, non-overlapping stacked positions (cumulativeTop already accounts for every
              // panel's real measured height + FREE_CAROUSEL_GAP) — one continuous list, each god's
              // panel sitting directly below the last, so neighbors genuinely peek in as you scroll
              // past instead of the active one being the only thing ever visible. Paint order just
              // follows list order; nothing here needs to outrank anything else since nothing overlaps.
              zIndex: index,
              // translate3d over translateY: promotes this to its own GPU compositing layer, so
              // the animation doesn't share a paint pass with (and stutter from) sibling panels.
              transform: `translate3d(0, ${top}px, 0)`,
              willChange: 'transform',
              pointerEvents: isActive ? 'auto' : 'none',
              // No CSS transition here — renderScrollPos's own rAF loop already produces an
              // eased value every frame, so `top` is always the correct in-flight position
              // directly. Adding a CSS transition on top of an already-animating value would
              // make the element perpetually lag behind, chasing a moving target.
              transition: 'none',
            }}
          >
            <div ref={el => registerPanelEl(god.id, el)} style={{ display: 'flex', justifyContent: 'center' }}>
              <HomeGodDetailPanel
                god={god}
                onBack={onBack}
                onChoose={ritualId => onChooseRitual(god.id, ritualId)}
                onUnchoose={() => onUnchooseRitual(god.id)}
                onRitualHoverChange={onRitualHoverChange}
                chosenRitualId={chosenRituals[god.id]}
                isActive={isVisuallyActive}
                isCentered={god.id === heroRevealGodId}
                highlightParticipantType={highlightParticipantType}
                highlightSite={highlightSite}
                measuredCardHeight={measuredCardHeight}
                onMeasuredCardHeight={onMeasuredCardHeight}
                availableResources={availableResources}
                isPunishing={isPunishingGodId(god.id, punishingGodId)}
                denseSpacing={denseSpacing}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Left rail: every god as a full GodCard (with its own ritual panel, used as-is), in a plain
// natively-scrolling column — always visible, independent of which god is centered in the carousel.
function GodListLayout({ gods, scrollPos, onScrollPosChange, settledIndex, onSettledIndexChange, onCardClick, chosenRituals, onChooseRitual, onUnchooseRitual, onRitualHoverChange, onBack, header, highlightParticipantType, highlightSite, measuredCardHeight, onMeasuredCardHeight, availableResources, punishingGodId, heroRevealGodId, panelHeights, onPanelHeightsChange, denseSpacing }: {
  gods: God[]
  scrollPos: number
  onScrollPosChange: (pos: number) => void
  settledIndex: number
  onSettledIndexChange: (index: number) => void
  onCardClick: (godId: string) => void
  chosenRituals: Record<string, string>
  onChooseRitual: (godId: string, ritualId: string) => void
  onUnchooseRitual: (godId: string) => void
  onRitualHoverChange: (ritual: Ritual | null) => void
  onBack: () => void
  header: React.ReactNode
  highlightParticipantType?: 'prisoners' | 'volunteers' | 'children' | 'virgins' | null
  highlightSite?: 'Temple' | 'Great Pyramid' | null
  measuredCardHeight: number | null
  onMeasuredCardHeight: (height: number) => void
  availableResources: { prisoners: number; volunteers: number; children: number; virgins: number; temples: number; greatTemples: number }
  punishingGodId?: string | null
  heroRevealGodId: string | null
  panelHeights: Record<string, number>
  onPanelHeightsChange: React.Dispatch<React.SetStateAction<Record<string, number>>>
  denseSpacing?: boolean
}) {
  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      <div
        style={{
          // Widened from 280px so the header subtitle wraps to 2 lines instead of 3
          // (232px of content width wraps it to 3; needs >=236px, this gives comfortable room).
          width: '300px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {header}
        {/* Slides open from the left every time this mounts (i.e. every grid<->list transition,
            since GodListLayout only ever exists in list mode) rather than fading in with the
            rest of the chrome — pulled out of CHROME_FADE_SELECTOR's opacity treatment (no more
            data-transition-chrome here) in favor of its own transform-only reveal, matching the
            "slide, don't fade" preference already established for the ritual candidate row. Uses
            the same hidden-until-delay-elapses `visibility` trick as that row for the same
            reason: an opacity-based hold would read as a fade no matter how it's tuned. */}
        <div
          data-god-rail-rows
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: SPACING.sm,
            padding: '12px 24px 24px',
            ...RAIL_SLIDE_STYLE,
          }}
        >
          {gods.map((god, index) => {
            const isSelected = index === settledIndex
            const chosenRitual = resolveRitual(god, chosenRituals[god.id])
            const isFirstInTier = index === 0 || gods[index - 1].angerLevel !== god.angerLevel
            return (
              <Fragment key={god.id}>
                {isFirstInTier && <ListAngerTierHeader level={god.angerLevel} count={gods.filter(g => g.angerLevel === god.angerLevel).length} isFirst={index === 0} />}
                <ListGodRow
                  god={god}
                  isSelected={isSelected}
                  chosenRitual={chosenRitual}
                  onClick={() => onCardClick(god.id)}
                  isPunishing={isPunishingGodId(god.id, punishingGodId)}
                />
              </Fragment>
            )
          })}
        </div>
      </div>
      {/* The rail's right-edge divider — a separate sibling (not nested inside the rows div
          above) so it spans the FULL column height (alongside the header too, not just the
          scrollable rows section), matching how it looked before this became animated. Nesting it
          inside the rows wrapper clipped its height down to just the rows section — leaving a gap
          where it used to run past the header. Uses DIVIDER_REVEAL_STYLE (grows top-down once the
          rows have landed), not RAIL_SLIDE_STYLE — see that constant's own comment for why it
          doesn't slide sideways in lockstep with the rows the way it used to. */}
      <div data-god-rail-divider style={{ flexShrink: 0, width: '1px', backgroundColor: COLORS.gray20, ...DIVIDER_REVEAL_STYLE }} />
      <GodFreeCarousel
        gods={gods}
        scrollPos={scrollPos}
        onScrollPosChange={onScrollPosChange}
        onSettledIndexChange={onSettledIndexChange}
        chosenRituals={chosenRituals}
        onChooseRitual={onChooseRitual}
        onUnchooseRitual={onUnchooseRitual}
        onRitualHoverChange={onRitualHoverChange}
        onBack={onBack}
        highlightParticipantType={highlightParticipantType}
        highlightSite={highlightSite}
        measuredCardHeight={measuredCardHeight}
        onMeasuredCardHeight={onMeasuredCardHeight}
        panelHeights={panelHeights}
        onPanelHeightsChange={onPanelHeightsChange}
        availableResources={availableResources}
        punishingGodId={punishingGodId}
        heroRevealGodId={heroRevealGodId}
        denseSpacing={denseSpacing}
      />
      <style>{`
        @keyframes homeRailSlideIn {
          from { transform: translateX(-320px); }
          to { transform: translateX(0); }
        }
        @keyframes homeRailDividerGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}

// One row in the GODS rail. Mirrors GodCard's own hover model exactly: a local isHovered
// state combines with isSelected into a single `highlighted` flag that drives every
// color/border/opacity toggle below, so hovering a row reads the same as hovering/selecting
// a card in grid view.
function ListGodRow({ god, isSelected, chosenRitual, onClick, isPunishing }: {
  god: God
  isSelected: boolean
  chosenRitual: Ritual | null
  onClick: () => void
  isPunishing?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  // isPunishing folds into highlighted (not just its own border/fill branch below) so the row's
  // name/eye-ring opacity read at full brightness the same way an actual hover/select would,
  // instead of needing a fourth parallel "dim unless punishing" check on every value below.
  const highlighted = isSelected || isHovered || isPunishing
  // Border and icon always share this one value — same rule as RingedIcon's borderColor/icon
  // color pairing — so the dashed/solid card and the flame read as a single unit, not two
  // independently-colored pieces. Chosen state is a flat bright white, not the ritual's own
  // outcome color — that color already lives on the eye ring/outcome circle elsewhere. The
  // not-chosen highlighted border value (gray60) is GodCard's own ritual-panel hover value,
  // copied exactly.
  const fireColor = chosenRitual
    ? COLORS.white
    : highlighted ? COLORS.gray60 : COLORS.gray20
  // Same rule as GodCard's own eyes: once a ritual is chosen, the circle shows that ritual's
  // outcome color/weight instead of the god's base anger-level color.
  const eyeStyle = chosenRitual ? outcomeEye(chosenRitual.outcomeColor) : EYE[god.angerLevel]
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        padding: '10px 12px',
        borderRadius: '4px',
        // Punishing tints the row's fill red (see backgroundColor below) but no longer its border —
        // just the plain highlighted/idle gray stroke (isPunishing already folds into `highlighted`
        // above, so a punishing row still gets the brighter gray30 stroke, not the dim default).
        border: `1px solid ${highlighted ? COLORS.gray30 : COLORS.gray15}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        // Fill reflects isSelected only, not hover — hover changes the stroke alone.
        backgroundColor: isPunishing ? hexToRgba(EYE.high.color, 0.18) : isSelected ? COLORS.gray18 : 'transparent',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          boxShadow: `inset 0 0 0 ${eyeStyle.weight}px ${eyeStyle.color}`,
          opacity: highlighted ? 1 : 0.4,
          flexShrink: 0,
          transition: 'opacity 0.15s ease, box-shadow 0.15s ease',
        }}
      />
      <span
        style={{
          fontFamily: FONTS.spectral,
          fontSize: '13px',
          fontWeight: 300,
          color: highlighted ? COLORS.white : COLORS.gray40,
          opacity: highlighted ? 1 : 0.4,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'color 0.15s ease, opacity 0.15s ease',
        }}
      >
        {god.name}
      </span>
      <span
        style={{
          display: 'flex',
          flexShrink: 0,
          marginLeft: 'auto',
          padding: '4px',
          borderRadius: '4px',
          border: `1px ${chosenRitual ? 'solid' : 'dashed'} ${fireColor}`,
          // GodCard's own ritual-panel hover fill (gray13) sits on cardBg (#151515) there, so
          // it reads as a clear lift. This card sits on the page background (and gray18 when
          // the row is selected) — gray13 is barely brighter than one and darker than the
          // other, so it doesn't visibly lift here. gray20 is the nearest token that's
          // actually lighter than both surroundings.
          backgroundColor: highlighted ? COLORS.gray20 : 'transparent',
        }}
      >
        <FireIcon size={12} color={fireColor} />
      </span>
    </div>
  )
}

function ViewModeToggle({ viewMode, onChange }: { viewMode: 'grid' | 'list'; onChange: (mode: 'grid' | 'list') => void }) {
  const option = (mode: 'grid' | 'list', icon: (color: string) => React.ReactNode) => (
    <button
      key={mode}
      aria-label={mode === 'grid' ? 'Grid view' : 'List view'}
      onClick={() => onChange(mode)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: viewMode === mode ? COLORS.gray20 : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
    >
      {icon(viewMode === mode ? COLORS.white : COLORS.gray40)}
    </button>
  )
  return (
    <div style={{ flexShrink: 0, display: 'flex', gap: '4px', border: `1px solid ${COLORS.gray20}`, borderRadius: '8px', padding: '2px' }}>
      {option('grid', c => <GridFour size={16} color={c} weight="regular" />)}
      {option('list', c => <ListBullets size={16} color={c} weight="regular" />)}
    </div>
  )
}

// Same title treatment as AngerTierHeader below (18px EYE-weight ring + label), sized for the
// list rail's own padding instead of the grid's 24px horizontal gutter.
function ListAngerTierHeader({ level, count, isFirst }: { level: AngerLevel; count: number; isFirst?: boolean }) {
  return (
    <div data-transition-chrome style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: isFirst ? '0 0 8px' : '16px 0 8px' }}>
      <div style={{ flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%', boxShadow: `inset 0 0 0 ${EYE[level].weight}px ${EYE[level].color}` }} />
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.gray80 }}>
        {TIER_LABELS[level]} ({count})
      </span>
    </div>
  )
}

// Section header above each non-empty anger tier's card grid — an 18px EYE-weight ring
// (never a smaller size, never solid-fill; matches the anger-label circle used everywhere else)
// plus the tier's label.
function AngerTierHeader({ level, count, faded }: { level: AngerLevel; count: number; faded?: boolean }) {
  return (
    <div data-transition-chrome style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 24px 0', opacity: faded ? 0 : 1, pointerEvents: faded ? 'none' : 'auto', transition: `opacity ${AUTHORIZE_CHROME_FADE_MS}ms ease` }}>
      <div style={{ flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%', boxShadow: `inset 0 0 0 ${EYE[level].weight}px ${EYE[level].color}` }} />
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.gray80 }}>
        {TIER_LABELS[level]} ({count})
      </span>
    </div>
  )
}

interface HomeScreenProps {
  prisoners: number
  volunteers: number
  children: number
  virgins: number
  temples?: number
  greatTemples?: number
  resourceTotals?: typeof RESOURCE_TOTALS
  aiPanelOpen?: boolean
  // Lets the AI toggle button (rendered outside this component, at the App level) know when
  // HomeActionBar is occupying the bottom-right corner, so it can move up out of the way
  // instead of overlapping it. See App.tsx/AiChat.tsx for the other side of this wiring.
  onActionBarVisibleChange?: (visible: boolean) => void
  // Same idea as onActionBarVisibleChange above, but for the ritual-authorization fly-to-center
  // animation (see isAuthorizing below) — lets the AI toggle button hide itself for that screen.
  onAuthorizingChange?: (authorizing: boolean) => void
  // True once the user has actually dismissed MacDesktopIntro and can see this screen. AppShell
  // (and HomeScreen inside it) is mounted from t=0 in App.tsx, sitting behind the intro overlay —
  // so the grid's GSAP entrance below fires off this instead of plain mount, or it would play out
  // completely unseen behind the splash and the user would never see the cards animate in.
  // Defaults to true so HomeScreen still animates immediately when used without that wiring.
  entered?: boolean
  // The punishing-god flow's subject (App.tsx's PUNISHING_GOD.id) — reskins that god's card red
  // in both grid and list-rail view, and restricts its ritual candidates to the single costly,
  // peaceful-outcome option in the detail panel. Null/undefined outside that flow (no god flagged).
  punishingGodId?: string | null
  // One-shot "jump straight to this god's list-view detail panel" trigger — set by App.tsx's
  // "Appease Now" button on GodPunishmentDialog. openGodSignal changes (e.g. Date.now()) every
  // time the action fires, since openGodId alone staying the same across repeat clicks wouldn't
  // re-trigger the effect below.
  openGodId?: string | null
  openGodSignal?: number
}

export function HomeScreen({ prisoners, volunteers, children, virgins, temples = RESOURCE_TOTALS.temples, greatTemples = RESOURCE_TOTALS.greatTemples, resourceTotals = RESOURCE_TOTALS, aiPanelOpen = false, onActionBarVisibleChange, onAuthorizingChange, entered = true, punishingGodId = null, openGodId = null, openGodSignal = 0 }: HomeScreenProps) {
  // Reorders DISPLAY_GOD_BUCKETS/DISPLAY_GODS_BY_TIER so the punishing god's card leads its own
  // tier's cards instead of sitting wherever it naturally falls in GODS order — every scroll-
  // position index below and the list rail itself all read from these instead of the raw module
  // constants, so grid order, list order, and index math all stay in sync with each other.
  const orderedGodBuckets = punishingGodId
    ? DISPLAY_GOD_BUCKETS.map(bucket => ({
        ...bucket,
        gods: [...bucket.gods].sort((a, b) => Number(isPunishingGodId(b.id, punishingGodId)) - Number(isPunishingGodId(a.id, punishingGodId))),
      }))
    : DISPLAY_GOD_BUCKETS
  const orderedGodsByTier = orderedGodBuckets.flatMap(bucket => bucket.gods)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [listScrollPos, setListScrollPos] = useState(0)
  const [listSettledIndex, setListSettledIndex] = useState(0)
  // Which god's ritual candidate row should play the slide-up-from-off-screen reveal (see
  // drawerRevealStyle in HomeGodDetailPanel) — set to the clicked god's id exactly once, in
  // handleSelectGod's actual grid->list transition below, and cleared the moment the settled
  // carousel position moves to a different god. Without this, gating the reveal on "is this the
  // centered panel" alone (isCentered) replayed the animation every time scrolling the carousel
  // brought a NEW god into the centered position — this should only ever happen once, for the
  // specific god whose grid card was just clicked, not on every ordinary scroll.
  const [heroRevealGodId, setHeroRevealGodId] = useState<string | null>(null)
  const [chosenRituals, setChosenRituals] = useState<Record<string, string>>({})
  const [spentCost, setSpentCost] = useState<ResourceCost>(ZERO_COST)
  // Gods whose ritual has actually been authorized (as opposed to merely chosenRituals, which is
  // cleared the moment the drain sequence finalizes) — keyed by god.id, populated at that same
  // finalize step. Drives GodCard's separate "ritual in progress" look (darker face/eyes, no panel
  // border, "Ritual in progress" label) instead of reverting straight to "No ritual chosen".
  const [inProgressRituals, setInProgressRituals] = useState<Record<string, Ritual>>({})
  // The list-view rail excludes gods with a ritual actually in progress entirely (rather than just
  // styling them differently, the way the grid does) — they're unclickable in the grid too (see
  // renderGrid's onClick), so there'd be nothing left to do with them in the detail panel anyway.
  // Every list-specific index/lookup below (scroll position, settled god, view-mode toggle target)
  // reads from this instead of the raw orderedGodsByTier, so indices stay in sync with whatever
  // GodListLayout is actually rendering.
  const listViewGodsByTier = orderedGodsByTier.filter(g => !inProgressRituals[g.id])
  // Ordered snapshot of {god, ritual} entries for the CTA-click drain sequence, captured once at
  // click time in orderedGodsByTier's visual (left-to-right/top-to-bottom) order — not
  // Object.entries(chosenRituals)'s insertion order. Non-null for exactly the duration of the
  // sequence; doubles as the isAuthorizing boolean below. chosenRituals/spentCost are NOT touched
  // when this is set — only at the very end (see the effect below) — so the resource-bar countdown
  // has a real, unchanged "before" state to animate from without a discontinuity.
  const [authorizeEntries, setAuthorizeEntries] = useState<Array<{ god: God; ritual: Ritual }> | null>(null)
  // -1 = chrome/non-relevant cards are fading out, no god's turn has begun yet. 0..entries.length-1
  // = that god's pills are draining (and stay drained once begun — see GodCard's own `draining`
  // prop comment). Never advances to entries.length — the sequencing effect below goes straight
  // from the last god's index to finalizing.
  const [authorizeStepIndex, setAuthorizeStepIndex] = useState(-1)
  // Snapshot of `available* + reservedCost.*` per resource type, captured once at click time — the
  // "as if this whole batch had never been reserved" starting point the resource bar counts down
  // from. Frozen for the sequence's duration (not recomputed), since availableX/reservedCost keep
  // changing meaning once spentCost/chosenRituals are touched at finalize.
  const [authorizeBeforeCost, setAuthorizeBeforeCost] = useState<ResourceCost>(ZERO_COST)
  // Non-null only for the fly-back Flip's own duration (set right as it starts, cleared in its
  // onComplete) — holds the set of god ids actually being flown back, so the chrome (headers,
  // heading, action bar, resource bar) and every OTHER card can stay hidden until they've actually
  // landed, instead of snapping back to fully visible the instant authorizeEntries clears (which
  // finishes in AUTHORIZE_CHROME_FADE_MS, well before the much longer fly-back animation does) —
  // that mismatch was what made the rest of the grid look like it was "already there" underneath
  // the still-arriving cards. The cards themselves aren't held back by this (see hideCard below) —
  // only their own visibility, not their position, so the Flip has something real to fly.
  const [flyingBackGodIds, setFlyingBackGodIds] = useState<Set<string> | null>(null)
  const flyingBack = flyingBackGodIds !== null
  const [hoveredRitual, setHoveredRitual] = useState<Ritual | null>(null)
  const [hoveredResourceType, setHoveredResourceType] = useState<'prisoners' | 'volunteers' | 'children' | 'virgins' | null>(null)
  const [hoveredSiteType, setHoveredSiteType] = useState<'Temple' | 'Great Pyramid' | null>(null)
  const [ctaHovered, setCtaHovered] = useState(false)
  // Lifted out of HomeGodDetailPanel (which unmounts every time viewMode leaves 'list') so the
  // measured height survives across grid<->list toggles instead of resetting to null and briefly
  // falling back to RITUAL_CARD_HEIGHT_FALLBACK on every single transition. That fallback-then-
  // correct sequence is what caused the detail face to visibly grow to the fallback size and then
  // snap/shrink to the real size right after the Flip transition landed — see its use below.
  const [measuredCardHeight, setMeasuredCardHeight] = useState<number | null>(null)
  // True once the browser window is too short to fit the resource bar + full-size detail card +
  // candidate row stack (see COMPACT_HEIGHT_THRESHOLD) — shrinks the gap between the detail card
  // and the candidate row, plus the vertical padding on every RitualCard and the resource bar
  // itself, so the whole stack has a better chance of actually fitting within GodFreeCarousel's
  // own overflow:hidden viewport instead of clipping the row. Checked against window.innerHeight
  // (not a measured element) since the threshold is a fixed estimate, not a live one — see that
  // constant's own comment for why comparing against a self-shrinking measured height would
  // oscillate.
  const [compactSpacing, setCompactSpacing] = useState(() => window.innerHeight < COMPACT_HEIGHT_THRESHOLD)
  useEffect(() => {
    const checkHeight = () => setCompactSpacing(window.innerHeight < COMPACT_HEIGHT_THRESHOLD)
    window.addEventListener('resize', checkHeight)
    return () => window.removeEventListener('resize', checkHeight)
  }, [])
  // Lifted out of GodFreeCarousel (which unmounts every time viewMode leaves 'list') for the same
  // reason as measuredCardHeight above: GodFreeCarousel stacks every panel via a cumulative sum of
  // its neighbors' heights (cumulativeTop), so if this reset to {} on every grid<->list toggle, the
  // panel above the freshly-selected god renders one frame at ESTIMATED_PANEL_HEIGHT before its
  // ResizeObserver reports the real height, and that correction shifts every panel below it —
  // including the hero panel still mid-Flip — producing a visible snap/glitch during the transition.
  const [panelHeights, setPanelHeights] = useState<Record<string, number>>({})
  // Even with measuredCardHeight lifted above, the very first grid->list transition of a session
  // still has nothing to reuse yet. preMeasureRef points at a permanently-mounted, invisible
  // RitualCard (rendered below, in grid mode's own subtree so it's present from first paint) whose
  // sole purpose is to seed measuredCardHeight before the user ever clicks a god card.
  const preMeasureRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = preMeasureRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const height = entries[0]?.contentRect.height
      if (height) setMeasuredCardHeight(prev => prev ?? height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  // Guards handleSelectGod/handleBack's fade+Flip choreography against overlapping calls — see the
  // comment at its first use in handleSelectGod for why that matters.
  const heroTransitionInProgressRef = useRef(false)

  // One-time GSAP entrance, gated on `entered` rather than plain mount — HomeScreen is already
  // mounted behind MacDesktopIntro from t=0 (see App.tsx), so a mount-keyed effect would play this
  // out fully hidden behind the splash and the user would never actually see it. hasAnimatedRef
  // guards it to fire exactly once, the first time `entered` turns true, regardless of how many
  // times this effect re-runs afterward. viewMode is always still 'grid' at that point, so every
  // god card (each wrapped in a [data-grid-card] div by renderGrid) is already in the DOM to
  // select. Deliberately does NOT re-run on every later grid<->list return trip, since handleBack's
  // own GSAP Flip tween already animates the face growing back into place then — running both at
  // once would fight over the same element's transform.
  const hasAnimatedEntranceRef = useRef(false)
  useLayoutEffect(() => {
    if (!entered || hasAnimatedEntranceRef.current) return
    hasAnimatedEntranceRef.current = true
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-grid-card]', scrollContainerRef.current)
      if (cards.length === 0) return
      gsap.from(cards, {
        opacity: 0,
        y: 28,
        scale: 0.92,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.07,
        // MacDesktopIntro's own exit fade (see MacDesktopIntro.tsx) takes 0.6s — without this
        // delay the entrance tween starts the instant `entered` flips true and is mostly done
        // fading/growing in *underneath* that still-fading overlay, so barely any of it reads as
        // visible. Waiting out the overlay's fade first means the user actually sees the cards
        // animate in, instead of finding them already settled the moment the splash clears.
        delay: 0.6,
      })
    }, scrollContainerRef)
    return () => ctx.revert()
  }, [entered])

  // Resources go down the moment a ritual is assigned (reserved), and stay down once authorized.
  const reservedCost = sumRitualCost(chosenRituals)
  const availablePrisoners = prisoners - spentCost.prisoners - reservedCost.prisoners
  const availableVolunteers = volunteers - spentCost.volunteers - reservedCost.volunteers
  // Swapped to the bumped punishing-flow pool only while a god is actively punishing (see
  // PUNISHING_FLOW_CHILDREN_TOTAL above buildUltimateRitual) — reverts to the real `children`
  // total the instant punishingGodId clears, so this bump never leaks into normal play.
  const childrenPool = punishingGodId ? PUNISHING_FLOW_CHILDREN_TOTAL : children
  const availableChildren = childrenPool - spentCost.children - reservedCost.children
  const availableVirgins = virgins - spentCost.virgins - reservedCost.virgins
  const availableTemples = temples - spentCost.temples - reservedCost.temples
  const availableGreatTemples = greatTemples - spentCost.greatTemples - reservedCost.greatTemples

  const isAuthorizing = authorizeEntries !== null
  // Drives every chrome element's own fade (headers, heading, action bar, resource bar) — stays
  // true through flyingBack as well as isAuthorizing, so none of it reappears until the fly-back
  // Flip actually lands (see flyingBackGodIds' own comment for why that gap matters).
  const chromeHidden = isAuthorizing || flyingBack
  // The resource bar stays in its normal dark look during the authorize/drain sequence itself —
  // only actual CTA hover (before the click commits) lights it up as a preview.
  const showLight = ctaHovered
  // Global visual-order index of each relevant god within authorizeEntries — needed because
  // renderGrid is called once per anger-tier bucket (a subset of orderedGodsByTier), so a
  // per-bucket array index can't be used to drive sequencing across the whole page.
  const authorizeIndexByGodId = new Map(authorizeEntries?.map((e, i) => [e.god.id, i]))
  // Cost of every entry whose turn has begun so far (authorizeStepIndex is inclusive of the
  // currently-draining god from the instant its turn starts, matching GodCard's own `draining`
  // flag flipping true at that same instant) — zero while still in the initial chrome-fade phase.
  const authorizeDrainedSoFar = authorizeEntries && authorizeStepIndex >= 0
    ? sumEntriesCost(authorizeEntries.slice(0, authorizeStepIndex + 1))
    : ZERO_COST
  // The "/ total" ceiling permanently steps down by whatever's been authorized so far — wasted
  // resources don't come back, so once the drain sequence lands on a lower total, it stays there
  // instead of reverting to the game's original resourceTotals constant. Equals resourceTotals
  // until the first ritual is ever authorized (spentCost is all zero then).
  const permanentTotals: ResourceCost = {
    prisoners: resourceTotals.prisoners - spentCost.prisoners,
    volunteers: resourceTotals.volunteers - spentCost.volunteers,
    children: resourceTotals.children - spentCost.children,
    virgins: resourceTotals.virgins - spentCost.virgins,
    temples: resourceTotals.temples - spentCost.temples,
    greatTemples: resourceTotals.greatTemples - spentCost.greatTemples,
  }
  // Fed into HomeResourceBar's `resourceTotals` prop ONLY while authorizing — i.e. this animates
  // the small "/ total" ceiling number, not the big "available" count next to it (that one stays
  // the real, unmodified available* the whole time — see the HomeResourceBar call site below).
  // Falls back to permanentTotals (not the raw resourceTotals constant) otherwise, so the ceiling
  // stays at its just-drained-to value once the sequence ends — see permanentTotals above.
  // Continuity is guaranteed by construction: at click time authorizeBeforeCost = available* +
  // reservedCost (drainedSoFar = 0), so the display starts exactly at the pre-reservation total;
  // once every entry has "begun" (drainedSoFar === reservedCost, since authorizeEntries is exactly
  // what reservedCost was summed over), the display lands exactly on the real available* value —
  // and spentCost/chosenRituals are updated in the same tick authorizeEntries clears (see the
  // effect below), so the real available* computed on the very next render matches identically,
  // which in turn is exactly what permanentTotals evaluates to once spentCost reflects the spend.
  const authorizeDisplayTotals: ResourceCost = isAuthorizing
    ? {
        prisoners: authorizeBeforeCost.prisoners - authorizeDrainedSoFar.prisoners,
        volunteers: authorizeBeforeCost.volunteers - authorizeDrainedSoFar.volunteers,
        children: authorizeBeforeCost.children - authorizeDrainedSoFar.children,
        virgins: authorizeBeforeCost.virgins - authorizeDrainedSoFar.virgins,
        temples: authorizeBeforeCost.temples - authorizeDrainedSoFar.temples,
        greatTemples: authorizeBeforeCost.greatTemples - authorizeDrainedSoFar.greatTemples,
      }
    : permanentTotals

  // Drives the CTA-click drain sequence once authorizeEntries is set (see HomeActionBar's
  // onPerform below) — one setTimeout per god's turn plus one to finalize, matching
  // RitualResultScreen's own useEffect-with-setTimeout-array shape. Only fires once per sequence:
  // authorizeEntries doesn't change again until it's cleared back to null at the very end, so this
  // effect doesn't re-run mid-sequence and re-schedule anything.
  useEffect(() => {
    if (!authorizeEntries) return
    const n = authorizeEntries.length
    // Every step is pushed back by AUTHORIZE_FLY_MS so the drain (and its eye/pill animations)
    // only starts once the fly-in Flip (triggered synchronously in onPerform, see below) has
    // actually landed the cards in the stage — otherwise the gods would start "eating" mid-flight.
    const timers = authorizeEntries.map((_, i) =>
      setTimeout(() => setAuthorizeStepIndex(i), AUTHORIZE_FLY_MS + AUTHORIZE_CHROME_FADE_MS + i * (AUTHORIZE_STEP_DURATION_MS + AUTHORIZE_STEP_GAP_MS))
    )
    const totalDrainMs = AUTHORIZE_FLY_MS + AUTHORIZE_CHROME_FADE_MS + n * AUTHORIZE_STEP_DURATION_MS + Math.max(0, n - 1) * AUTHORIZE_STEP_GAP_MS
    timers.push(setTimeout(() => {
      // Capture the stage cards' current (centered) rects before finalizing swaps them back into
      // the grid, mirroring handleSelectGod/handleBack's own Flip.getState -> flushSync -> Flip.from
      // recipe — the "old" state here is the stage position, the "new" state is wherever each card
      // naturally lands back in the grid (sorted to the end of its tier, per sortedGods below).
      const flipSelector = authorizeFlipSelector(authorizeEntries)
      const flipEls = Array.from(document.querySelectorAll<HTMLElement>(flipSelector))
      const state = flipEls.length > 0 ? Flip.getState(flipEls) : null
      // Commit the spend and clear the selection HERE, at the very end — not at click time — and
      // in the same tick as clearing authorizeEntries, so the real available*/reservedCost
      // computed on the very next render exactly match the last override value above.
      const spent = sumEntriesCost(authorizeEntries)
      const returningGodIds = new Set(authorizeEntries.map(({ god }) => god.id))
      flushSync(() => {
        setSpentCost(prev => ({
          prisoners: prev.prisoners + spent.prisoners,
          volunteers: prev.volunteers + spent.volunteers,
          children: prev.children + spent.children,
          virgins: prev.virgins + spent.virgins,
          temples: prev.temples + spent.temples,
          greatTemples: prev.greatTemples + spent.greatTemples,
        }))
        setChosenRituals({})
        // Every god just authorized flips into the "ritual in progress" look (see GodCard's own
        // ritualInProgress prop) instead of reverting straight to "No ritual chosen" — merged rather
        // than replaced, since an earlier batch's rituals may still be in progress from before.
        setInProgressRituals(prev => {
          const next = { ...prev }
          for (const { god, ritual } of authorizeEntries) next[god.id] = ritual
          return next
        })
        setAuthorizeEntries(null)
        setAuthorizeStepIndex(-1)
        // Set in the SAME commit that clears authorizeEntries — see this state's own comment for
        // why the rest of the grid needs to stay hidden until the Flip below actually finishes.
        setFlyingBackGodIds(returningGodIds)
      })
      // One Flip.from PER ENTRY (not a single shared call across the whole selector) so each can
      // carry its own stagger delay and stacking order — see AUTHORIZE_RETURN_STAGGER_S's own
      // comment for why simultaneous flights need separating. onComplete only needs to fire once,
      // so it's attached to the last (most-delayed) entry, which is always the last to land.
      if (state) {
        authorizeEntries.forEach(({ god }, i) => {
          const isLast = i === authorizeEntries.length - 1
          Flip.from(state, {
            ...AUTHORIZE_FLIP_VARS,
            targets: authorizeFlipSelectorForGod(god.id),
            delay: i * AUTHORIZE_RETURN_STAGGER_S,
            zIndex: AUTHORIZE_FLIP_VARS.zIndex + i,
            onComplete: isLast ? () => setFlyingBackGodIds(null) : undefined,
          })
        })
      }
    }, totalDrainMs + AUTHORIZE_END_HOLD_MS))
    return () => timers.forEach(clearTimeout)
  }, [authorizeEntries])

  const actionBarVisible = viewMode === 'grid'
  // Update on every visibility change...
  useEffect(() => { onActionBarVisibleChange?.(actionBarVisible) }, [actionBarVisible])
  // ...and separately reset on unmount (switching away from the overview screen), since the
  // dependency-triggered effect above never gets a final run with actionBarVisible=false here.
  useEffect(() => () => onActionBarVisibleChange?.(false), [])

  // chromeHidden (not just isAuthorizing) — the AI toggle button and the left nav strip (see
  // AppShell.tsx) should stay hidden through the fly-back window too, same as every other piece
  // of chrome in this file.
  useEffect(() => { onAuthorizingChange?.(chromeHidden) }, [chromeHidden])
  useEffect(() => () => onAuthorizingChange?.(false), [])

  // GSAP Flip: capture each of the clicked god's four pieces' rects *before* the DOM changes,
  // force React to commit the grid->list swap synchronously (flushSync — Flip needs the new
  // elements to already exist to animate them), then tween whichever elements now match those
  // recorded ids from their old rects to their natural ones. Both sides of the transition share
  // `data-flip-id={`${godId}:card/name/face/panel`}` attributes (grid: GodCard.tsx; list:
  // HomeGodDetailPanel) via flipIdsFor/flipSelectorFor above — this is the exact attribute name
  // GSAP's Flip plugin uses for its own id-based matching. `targets` is deliberately narrowed to
  // flipSelectorFor(godId) (just this god's own 4 pieces), not the wildcard '[data-flip-id]' every
  // piece on the page uses — an earlier version passed the wildcard so Flip could re-locate the new
  // elements after the DOM swap, which worked for matching, but once "card" (GodCard's own root,
  // the div that actually establishes each grid cell's height) became one of the flipped pieces,
  // Flip's own internal handling of `absolute: true` across *all* ~90+ wildcard-matched candidates
  // (not just the ~4 with recorded state) intermittently collapsed every grid card's height at
  // once — every tier's row of cards briefly measuring near-0 tall, which is what read as "dark
  // rectangles"/misplaced tier headers sweeping the page. A selector scoped to just this god's own
  // ids re-locates the same new elements (it's still a re-queried selector string, not a stale
  // resolved reference — that specific failure mode is what made an earlier attempt at narrowing
  // this go to `duration() === 0`, a same-tick no-op) without Flip ever touching the other cards.
  // Everything besides the hero's own Flip growth used to happen in the same instant: flushSync
  // swaps the grid out for the list synchronously, so every OTHER grid card and all the header/
  // tier-header chrome just vanished the moment the click landed, and the list's rail popped in
  // fully-formed the moment it landed — only the one clicked card actually animated. Fixed by
  // wrapping the swap in a quick fade-out/fade-in of everything that isn't the hero: fade the old
  // view's chrome+siblings down first (short, so it doesn't delay the Flip by much), *then* commit
  // the view swap + kick off the Flip, then fade the new view's chrome+siblings back in around it.
  const handleSelectGod = (godId: string) => {
    // This same handler is also wired to the list rail's own rows (GodListLayout's onCardClick)
    // for re-centering the carousel on a different god while already viewing the list — not just
    // grid-card clicks. Those two cases need completely different handling: a real grid->list
    // switch needs the full Flip+fade choreography below, but re-centering within the SAME view
    // isn't a view change at all — GodFreeCarousel already smoothly tweens to the new position and
    // brightens gods as the sweep passes them (see renderScrollPos/nearestToSweep) entirely on its
    // own. Running the fade choreography here too doubled up on that: it faded out the currently-
    // visible panel and the whole rail as "other" content (only the *target* row was ever excluded
    // from that fade, not whatever was already on screen), and layered a second GSAP tween on top
    // of the carousel's own translate3d position tween on the same element — the "gods disappear
    // while scrolling" / "nanosecond of refreshing" bugs. A plain scroll-position update is all a
    // same-view re-center needs.
    if (viewMode === 'list') {
      setListScrollPos(listViewGodsByTier.findIndex(g => g.id === godId))
      return
    }

    // Guards only the fade+Flip choreography below, not the recenter path above — clicking rapidly
    // (or double-clicking) used to let a second handleSelectGod/handleBack call fire mid-transition,
    // whose OWN fadeOutTargets/fadeInTargets query would catch elements a still-running fade-in
    // from the FIRST call was targeting. gsap.fromTo's explicit `from: {opacity:0}` would yank them
    // back to invisible, and if a race meant nothing after that ever tweened them back up, they'd
    // settle permanently invisible — the "cards missing their face/panel" bug. Simplest fix: while
    // one of these transitions is running, ignore clicks that would start another.
    if (heroTransitionInProgressRef.current) return
    heroTransitionInProgressRef.current = true

    const heroIds = new Set(flipIdsFor(godId))
    const isHeroPiece = (el: HTMLElement) => heroIds.has(el.getAttribute('data-flip-id') ?? '')

    const oldEls = Array.from(document.querySelectorAll<HTMLElement>(flipSelectorFor(godId)))
    const state = oldEls.length > 0 ? Flip.getState(oldEls) : null

    // Commits (and starts the hero Flip) immediately on click — no pre-commit chrome fade-out
    // gating this anymore. That fade used to run to completion (CHROME_FADE_OUT_S, ~180ms) BEFORE
    // commit() ever fired, since its targets (every OTHER grid card) get unmounted the instant
    // setViewMode flips the DOM over, so the fade could only play out on the still-mounted old
    // DOM. But gating the commit behind it meant the hero card itself sat still for that whole
    // 180ms before its own Flip animation ever started — exactly the "slight delay before the
    // transition kicks in" this was fixed for. The other grid cards now just disappear instantly
    // with the DOM swap instead of fading first; the new view's chrome still fades IN below, which
    // is the fade that actually matters for polish since it's what the user watches settle in.
    flushSync(() => {
      setListScrollPos(listViewGodsByTier.findIndex(g => g.id === godId))
      setViewMode('list')
      setHeroRevealGodId(godId)
    })
    // See setHeroPointerEvents' own comment — keeps the flying hero out of hover hit-testing so it
    // can't flash to its hovered-face color mid-flight. Applied to the NEW (post-commit) elements,
    // restored on the Flip tween's own completion specifically (not the fade-in's, which finishes
    // sooner — CHROME_FADE_IN_S plus its stagger is shorter than HERO_TRANSITION_MS, so tying it to
    // the fade-in would re-enable hover while the hero was still mid-flight).
    setHeroPointerEvents(godId, false)
    if (state) Flip.from(state, { ...HERO_FLIP_VARS, targets: flipSelectorFor(godId), onComplete: () => setHeroPointerEvents(godId, true) })
    else setHeroPointerEvents(godId, true)
    const fadeInTargets = Array.from(document.querySelectorAll<HTMLElement>(CHROME_FADE_SELECTOR)).filter(el => !isHeroPiece(el))
    // Delayed until the hero's own grow-into-place Flip fully lands (immediateRender still holds
    // these at opacity:0 for the whole delay) — previously this fired the instant the Flip started,
    // so the rest of the list UI (rail rows, other carousel gods) settled in well before the hero
    // even finished enlarging. That read as everything else "stacking up" first and the ritual
    // cards (which do wait for HERO_TRANSITION_MS via drawerRevealStyle) arriving as an afterthought
    // that pushed already-settled content. Now nothing else appears until the hero card itself is
    // done, matching the ritual row's own timing.
    if (fadeInTargets.length > 0) gsap.fromTo(fadeInTargets, { opacity: 0 }, { opacity: 1, duration: CHROME_FADE_IN_S, ease: 'power2.out', delay: state ? HERO_TRANSITION_MS / 1000 : 0, stagger: { amount: CHROME_FADE_IN_STAGGER_TOTAL_S }, onComplete: () => { heroTransitionInProgressRef.current = false } })
    else heroTransitionInProgressRef.current = false
  }

  // Mirror-image of handleSelectGod for the reverse (list->grid) direction. Targets whichever god
  // is currently centered in the list (listSettledIndex), since the user may have scrolled to a
  // different one than whichever they originally clicked in from.
  //
  // True mirror, not just a reversed Flip: on the way in, the hero card + rail grow/slide in
  // together first, and only once they've landed do the ritual candidate cards rise up
  // (drawerRevealStyle, staggered left-to-right). On the way out, that has to run in reverse
  // order too — the candidate cards slide back down first (staggered right-to-left, the exact
  // opposite sweep direction), and only once they're gone does the hero shrink + rail slide out
  // together. Without this, the candidate row would just vanish instantly with the rest of the
  // DOM the moment flushSync below swaps the view, instead of leaving the way it arrived.
  const handleBack = () => {
    // Same lock as handleSelectGod, and the same reason — see the comment there.
    if (heroTransitionInProgressRef.current) return
    heroTransitionInProgressRef.current = true

    const activeGod = listViewGodsByTier[listSettledIndex]
    const heroIds = new Set(activeGod ? flipIdsFor(activeGod.id) : [])
    const isHeroPiece = (el: HTMLElement) => heroIds.has(el.getAttribute('data-flip-id') ?? '')

    const oldEls = activeGod ? Array.from(document.querySelectorAll<HTMLElement>(flipSelectorFor(activeGod.id))) : []
    const state = oldEls.length > 0 ? Flip.getState(oldEls) : null

    // All three pieces — hero card, candidate ritual cards, and the rail — start and run at the
    // same time, over the same HERO_TRANSITION_MS, so they land together instead of one waiting
    // on another. (An earlier version ran the ritual cards' slide-down to completion first, then
    // started the card+rail; that read as a dead pause before anything else moved.) The rail rows,
    // divider, and candidate row are all snapshotted into their own ghost clones (spawnRailExitGhost,
    // spawnDividerExitGhost, spawnDrawerExitGhost) BEFORE the flushSync below unmounts the real
    // elements — a GSAP/CSS transition can't keep animating a DOM node that's just been removed,
    // so the clones are what actually carry the slide/shrink-away motion to completion.
    spawnRailExitGhost()
    // Header mask spawned BEFORE the divider ghost (not after) — both use the same z-index, so
    // paint order is DOM order, and the header mask's opaque backdrop stretches all the way to
    // the viewport edge (see its own comment) to hide the wider grid subtitle text, which means it
    // also physically overlaps the divider's x position for the top stretch of its height. Spawned
    // second, the divider ghost paints on top of that black rectangle instead of getting hidden
    // under it — appearing as a flat edge slicing across the divider line the instant the mask
    // appears, well before the divider's own shrink animation actually reaches that point.
    spawnHeaderExitGhost()
    spawnDividerExitGhost()
    if (activeGod) spawnDrawerExitGhost(activeGod.id)

    // Commits (and starts the hero Flip) immediately — see the matching comment in
    // handleSelectGod for why the old pre-commit chrome fade-out was removed.
    flushSync(() => setViewMode('grid'))
    // See setHeroPointerEvents' own comment (and the matching call in handleSelectGod) — same
    // spurious-hover-mid-flight issue applies in this direction too.
    if (activeGod) setHeroPointerEvents(activeGod.id, false)
    if (state && activeGod) Flip.from(state, { ...HERO_FLIP_VARS, targets: flipSelectorFor(activeGod.id), onComplete: () => setHeroPointerEvents(activeGod.id, true) })
    else if (activeGod) setHeroPointerEvents(activeGod.id, true)
    const fadeInTargets = Array.from(document.querySelectorAll<HTMLElement>(CHROME_FADE_SELECTOR)).filter(el => !isHeroPiece(el))
    if (fadeInTargets.length > 0) gsap.fromTo(fadeInTargets, { opacity: 0 }, { opacity: 1, duration: CHROME_FADE_IN_S, ease: 'power2.out', stagger: { amount: CHROME_FADE_IN_STAGGER_TOTAL_S }, onComplete: () => { heroTransitionInProgressRef.current = false } })
    else heroTransitionInProgressRef.current = false
  }

  // Fires handleSelectGod once per openGodSignal change (see the prop's own comment) — the
  // "Appease Now" jump straight into a god's list-view detail panel, from a cold grid mount.
  const handledOpenGodSignalRef = useRef(0)
  useEffect(() => {
    if (!openGodId || openGodSignal === 0 || openGodSignal === handledOpenGodSignalRef.current) return
    handledOpenGodSignalRef.current = openGodSignal
    handleSelectGod(openGodId)
  }, [openGodId, openGodSignal])

  // ViewModeToggle's own onChange — routes through the exact same choreography as clicking a
  // grid card (handleSelectGod) / the back chevron (handleBack) instead of calling setViewMode
  // directly. A bare setViewMode was the original wiring here, and it skipped the whole hero
  // Flip + drawerRevealStyle reveal: heroRevealGodId never got set, so isCentered was false for
  // every panel and the candidate ritual cards rendered at full opacity/position with no
  // slide-in at all — they were just already there the instant the DOM swapped. That's the
  // "I can see the ritual cards before they slide in" bug: not a timing race, a whole different
  // (non-animated) code path landing on the same screen.
  const handleViewModeToggle = (mode: 'grid' | 'list') => {
    if (mode === viewMode) return
    if (mode === 'list') {
      const targetGod = listViewGodsByTier[listSettledIndex] ?? listViewGodsByTier[0]
      if (targetGod) handleSelectGod(targetGod.id)
    } else {
      handleBack()
    }
  }

  // Clears heroRevealGodId (see its own declaration comment) once the carousel settles on a
  // DIFFERENT god than whichever originally triggered the grid->list reveal — plain scrolling
  // should never trigger that reveal animation, only the one god actually clicked from the grid.
  const handleSettledIndexChange = (index: number) => {
    setListSettledIndex(index)
    const settledGod = listViewGodsByTier[index]
    if (settledGod && settledGod.id !== heroRevealGodId) setHeroRevealGodId(null)
  }

  const handleChooseRitual = (godId: string, ritualId: string) => {
    setChosenRituals(prev => ({ ...prev, [godId]: ritualId }))
  }

  const handleUnchooseRitual = (godId: string) => {
    setChosenRituals(prev => {
      const next = { ...prev }
      delete next[godId]
      return next
    })
  }

  const renderGrid = (gods: typeof DISPLAY_GODS) => {
    // Gods with a ritual actually in progress sink to the end of their own anger section instead
    // of sitting wherever they originally fell — a stable sort, so it only ever moves those cards,
    // never reshuffles the rest of the section's own relative order.
    const sortedGods = [...gods].sort((a, b) => (inProgressRituals[a.id] ? 1 : 0) - (inProgressRituals[b.id] ? 1 : 0))
    return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${CARD_WIDTH}px)`,
        gap: '24px',
        padding: '24px',
      }}
    >
      {sortedGods.map(god => {
        const chosenRitualId = chosenRituals[god.id]
        const chosenRitual = resolveRitual(god, chosenRitualId)
        const ritualInProgress = inProgressRituals[god.id] ?? null
        const authorizeIndex = authorizeIndexByGodId.get(god.id) ?? -1
        const draining = authorizeIndex !== -1 && authorizeStepIndex >= authorizeIndex
        // A card with no chosen ritual just fades out in place while the drain sequence runs. A
        // card WITH a chosen ritual instead flies out entirely — its real GodCard now lives in
        // AuthorizeStage (see below) — leaving this grid slot as an invisible placeholder so the
        // rest of the grid doesn't reflow around the gap.
        const flyingAway = isAuthorizing && !!chosenRitual
        // While flyingBack, chosenRituals has already been cleared for the whole batch (see the
        // finalize flushSync), so "which cards are actually mid-Flip back into the grid" can't be
        // read off chosenRitual anymore — flyingBackGodIds is the snapshot taken at that exact
        // moment for this purpose. Every OTHER card (and all the chrome — see chromeHidden below)
        // stays hidden until the Flip finishes, instead of snapping back to visible the moment
        // authorizeEntries clears, well before the much slower fly-back animation actually lands.
        const isReturning = flyingBackGodIds?.has(god.id) ?? false
        const hideCard = isAuthorizing ? !chosenRitual : (flyingBack && !isReturning)
        return (
          // data-grid-card marks the whole rendered card for the entrance-animation stagger only
          // (see the useLayoutEffect above) — the actual GSAP Flip targets for the grid<->list hero
          // transition live inside GodCard itself (see its own data-flip-id comments), not on this
          // outer wrapper. position: relative here is still load-bearing though: GodCard's own root
          // div is one of those targets and gets Flip's absolute: true during the animation, which
          // needs a positioned ancestor right here to anchor to — without it, it'd escape to
          // whatever positioned ancestor is next (much further up, much bigger) and compute the
          // wrong "natural" size to animate toward, the same bug the face/name/panel all hit before.
          <div
            key={god.id}
            data-grid-card
            style={{
              position: 'relative',
              width: `${CARD_WIDTH}px`,
              height: flyingAway ? `${CARD_HEIGHT}px` : undefined,
              opacity: hideCard ? 0 : 1,
              // Blocks interaction on every card while authorizing — both the fading-out ones and
              // the currently-relevant ones — so nothing can be clicked/hovered mid-sequence. Held
              // through flyingBack too, since the returning cards are still mid-Flip then.
              pointerEvents: (isAuthorizing || flyingBack) ? 'none' : 'auto',
              transition: `opacity ${AUTHORIZE_CHROME_FADE_MS}ms ease`,
            }}
          >
            {!flyingAway && (
              <GodCard
                god={god}
                isSelected={false}
                // A ritual actually in progress has nothing left to click into (see ritualInProgress
                // below) — GodCard already reads a missing onClick to drop its own pointer cursor.
                onClick={ritualInProgress ? undefined : () => handleSelectGod(god.id)}
                chosenRitual={chosenRitual}
                onHoverChange={hovered => setHoveredRitual(hovered ? chosenRitual : null)}
                highlightParticipantType={hoveredResourceType}
                highlightSite={hoveredSiteType}
                ctaHovered={showLight}
                isPunishing={isPunishingGodId(god.id, punishingGodId)}
                draining={draining}
                ritualInProgress={ritualInProgress}
                isReturning={isReturning}
              />
            )}
          </div>
        )
      })}
    </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, position: 'relative', backgroundColor: COLORS.black }}>
      {/* Invisible, permanently-mounted (regardless of viewMode) RitualCard purely to seed
          measuredCardHeight before the user's very first grid->list transition — see the comment
          on preMeasureRef above for why that matters. Must be passed the exact same props as a
          real row-slot RitualCard (see the candidate row inside HomeGodDetailPanel) — omitting
          tierLabel here previously made this dummy render ~39px shorter than the real card (no
          tier-label pill), so the real card's own ResizeObserver would always overwrite this
          pre-measurement with a taller value right after the Flip transition landed, which is
          exactly the "settles, then grows again" jump this component exists to prevent. */}
      {GODS[0]?.rituals[0] && (
        <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', pointerEvents: 'none', visibility: 'hidden' }}>
          <div ref={preMeasureRef} style={{ width: `${RITUAL_CARD_WIDTH}px` }}>
            <RitualCard ritual={GODS[0].rituals[0]} isSelected={false} onClick={() => {}} outcomeBorder tierLabel={RITUAL_TIER_LABELS[0]} denseSpacing={compactSpacing} />
          </div>
        </div>
      )}
      <div style={{ flexShrink: 0, opacity: chromeHidden ? 0 : 1, pointerEvents: chromeHidden ? 'none' : 'auto', transition: `opacity ${AUTHORIZE_CHROME_FADE_MS}ms ease` }}>
        <HomeResourceBar prisoners={availablePrisoners} volunteers={availableVolunteers} children={availableChildren} virgins={availableVirgins} temples={availableTemples} greatTemples={availableGreatTemples} resourceTotals={authorizeDisplayTotals} hoveredRitual={hoveredRitual} onResourceHover={setHoveredResourceType} onSiteHover={setHoveredSiteType} ctaHovered={showLight} reservedCost={reservedCost} dense={compactSpacing} />
      </div>
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
          overflow: 'auto',
          marginRight: aiPanelOpen ? '331px' : AI_TOGGLE_RESERVE,
          transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {viewMode === 'grid' && (
          <>
            {/* No data-transition-chrome here — this heading's text is identical in both grid and
                list mode (see the matching header block in GodListLayout's `header` prop below),
                so fading it out on one side and back in on the other after a delay just made it
                disappear for a stretch and reappear, when the content never actually needed to
                change. Left at its default opaque state, it swaps instantly at the same moment
                everything else does, with nothing to visibly vanish. */}
            <div style={{ flexShrink: 0, position: 'relative', padding: '24px 24px 0', textAlign: 'left', opacity: chromeHidden ? 0 : 1, pointerEvents: chromeHidden ? 'none' : 'auto', transition: `opacity ${AUTHORIZE_CHROME_FADE_MS}ms ease` }}>
              {/* Fixed (not absolute) so it escapes this column's overflow:auto scroll clipping
                  and aligns with the true viewport edge, matching the floating AI button's own
                  fixed right:24px offset — an absolute negative-right offset here gets clipped
                  by the scrollable ancestor instead of reaching the actual screen edge. */}
              <div style={{ position: 'fixed', top: '163px', right: '24px', zIndex: 10 }}>
                <ViewModeToggle viewMode={viewMode} onChange={handleViewModeToggle} />
              </div>
              {/* data-god-header-text (not the outer wrapper above, which also holds the fixed-
                  position toggle) — handleBack clones just this piece into a placeholder ghost
                  that holds the OLD (narrow, wrapped) list-header text in place over this new
                  grid header until the rail divider finishes retracting. See
                  spawnHeaderExitGhost's own comment for why. */}
              <div data-god-header-text>
                <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.regular, color: COLORS.gray80 }}>Appease the Gods</div>
                <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: 'rgba(255,255,255,0.4)', marginTop: '4px', whiteSpace: 'nowrap' }}>Choose rituals and pay tributes to avoid the Gods punishments</div>
              </div>
            </div>

            {orderedGodBuckets.map(({ level, gods }) => (
              <Fragment key={level}>
                <AngerTierHeader level={level} count={gods.length} faded={chromeHidden} />
                {renderGrid(gods)}
              </Fragment>
            ))}
          </>
        )}
        {viewMode === 'list' && (
          <GodListLayout
            gods={listViewGodsByTier}
            scrollPos={listScrollPos}
            onScrollPosChange={setListScrollPos}
            settledIndex={listSettledIndex}
            onSettledIndexChange={handleSettledIndexChange}
            onCardClick={handleSelectGod}
            chosenRituals={chosenRituals}
            onChooseRitual={handleChooseRitual}
            onUnchooseRitual={handleUnchooseRitual}
            onRitualHoverChange={setHoveredRitual}
            onBack={handleBack}
            highlightParticipantType={hoveredResourceType}
            highlightSite={hoveredSiteType}
            measuredCardHeight={measuredCardHeight}
            onMeasuredCardHeight={setMeasuredCardHeight}
            panelHeights={panelHeights}
            onPanelHeightsChange={setPanelHeights}
            availableResources={{ prisoners: availablePrisoners, volunteers: availableVolunteers, children: availableChildren, virgins: availableVirgins, temples: availableTemples, greatTemples: availableGreatTemples }}
            denseSpacing={compactSpacing}
            punishingGodId={punishingGodId}
            heroRevealGodId={heroRevealGodId}
            // No data-transition-chrome here either — see the matching comment on the grid
            // header above.
            header={
              <div style={{ flexShrink: 0, position: 'relative', padding: '24px 24px 0', textAlign: 'left' }}>
                {/* Fixed (not absolute), matching the grid view's toggle — escapes this 260px-wide
                    list rail to sit at the true viewport edge instead of the rail's own right edge. */}
                <div style={{ position: 'fixed', top: '163px', right: '24px', zIndex: 10 }}>
                  <ViewModeToggle viewMode={viewMode} onChange={handleViewModeToggle} />
                </div>
                {/* data-god-header-text — see the matching grid-header comment above. This
                    (narrow, wrapped-to-2-lines) version is what handleBack's placeholder ghost
                    clones right before the swap to grid, so the sudden reflow to the grid's wider
                    single-line version stays hidden until the divider's retract finishes. */}
                <div data-god-header-text>
                  <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.regular, color: COLORS.gray80 }}>Appease the Gods</div>
                  <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Choose rituals and pay tributes to avoid the Gods punishments</div>
                </div>
              </div>
            }
          />
        )}
      </div>
      {actionBarVisible && (
        <div style={{ flexShrink: 0, opacity: chromeHidden ? 0 : 1, pointerEvents: chromeHidden ? 'none' : 'auto', transition: `opacity ${AUTHORIZE_CHROME_FADE_MS}ms ease` }}>
          <HomeActionBar
            chosenCount={Object.keys(chosenRituals).length}
            cost={reservedCost}
            onPerform={() => {
              const entries = orderedGodsByTier
                .filter(g => chosenRituals[g.id])
                .map(g => ({ god: g, ritual: resolveRitual(g, chosenRituals[g.id])! }))
              if (entries.length === 0) return // defensive — HomeActionBar already disables the CTA when nothing's chosen
              // Capture each chosen card's current grid rect BEFORE authorizeEntries flips the grid
              // over to rendering an invisible placeholder in its place (see renderGrid's
              // flyingAway branch) and mounts the real card into AuthorizeStage instead — same
              // Flip.getState -> flushSync -> Flip.from recipe as handleSelectGod's hero transition.
              const flipSelector = authorizeFlipSelector(entries)
              const flipEls = Array.from(document.querySelectorAll<HTMLElement>(flipSelector))
              const state = flipEls.length > 0 ? Flip.getState(flipEls) : null
              flushSync(() => {
                setAuthorizeBeforeCost({
                  prisoners: availablePrisoners + reservedCost.prisoners,
                  volunteers: availableVolunteers + reservedCost.volunteers,
                  children: availableChildren + reservedCost.children,
                  virgins: availableVirgins + reservedCost.virgins,
                  temples: availableTemples + reservedCost.temples,
                  greatTemples: availableGreatTemples + reservedCost.greatTemples,
                })
                setAuthorizeStepIndex(-1)
                setAuthorizeEntries(entries)
                // The action bar is about to fade out non-interactively — its own local `hovered`
                // state (and the light-mode preview it drives everywhere) won't reset on its own.
                setCtaHovered(false)
              })
              if (state) Flip.from(state, { ...AUTHORIZE_FLIP_VARS, targets: flipSelector })
            }}
            aiPanelOpen={aiPanelOpen}
            onHoverChange={setCtaHovered}
          />
        </div>
      )}
      {authorizeEntries && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1400,
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'center',
            justifyContent: 'center',
            // GodCard.tsx's stageMode branch gives :card an explicit STAGE_CARD_WIDTH (covering
            // its absolutely-positioned pills too), so this box's reported width already includes
            // the pills — a plain gap here is real breathing room between cards, not a fudge
            // factor compensating for an under-reported box width like before.
            gap: '64px',
            padding: '80px',
            // Faces stay at their normal grid-card size (see GodCard.tsx's stageMode comment) no
            // matter how many gods are in this batch, so a big enough batch could in principle
            // need more room than the viewport has — scroll instead of letting cards clip off the
            // fixed-position stage invisibly. Left interactive (no pointerEvents:'none' here,
            // unlike before) purely so that scroll can actually happen — nothing inside has an
            // onClick anyway, so this doesn't make anything clickable.
            overflow: 'auto',
          }}
        >
          {authorizeEntries.map(({ god, ritual }, i) => (
            <GodCard
              key={god.id}
              god={god}
              chosenRitual={ritual}
              draining={authorizeStepIndex >= i}
              holdBaseEyes
              stageMode
              isPunishing={isPunishingGodId(god.id, punishingGodId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
