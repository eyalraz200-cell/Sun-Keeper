export type AngerLevel = 'high' | 'medium' | 'low' | 'none'
export type RitualOutcome = 'auspicious' | 'neutral' | 'ominous'

export interface Ritual {
  id: string
  name: string
  description: string
  participants: {
    prisoners: number
    children: number
    virgins: number
    volunteers: number
  }
  sacredSite: { name: string; count: number }
  schedule: string
  duration: string
  outcomeColor: string
  available: boolean
  effects: Array<{
    godId: string
    before: number
    after: number
  }>
}

export interface God {
  id: string
  name: string
  subtitle: string
  svg: string
  angerColor: string
  angerLevel: AngerLevel
  favor: number
  rituals: Ritual[]
}

export const GODS: God[] = [
  {
    id: 'huitzilopochtli',
    name: 'Huitzilopochtli',
    subtitle: 'God of War & Sun',
    svg: '/gods/huitzilopochtli.svg',
    angerColor: '#c8322e',
    angerLevel: 'high',
    favor: 35,
    rituals: [
      {
        id: 'warriors-tribute',
        name: "Warrior's Tribute",
        description: "A tribute of slain warriors offered at the pyramid's base to honor the god's insatiable hunger for battle.",
        participants: { prisoners: 90, children: 0, virgins: 0, volunteers: 20 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Midday',
        duration: '2 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [
          { godId: 'huitzilopochtli', before: 55, after: 42 },
          { godId: 'tlaloc', before: 60, after: 52 },
        ],
      },
      {
        id: 'solar-dedication',
        name: 'Solar Dedication',
        description: 'A grand ceremony honoring the sun\'s daily journey across the sky.',
        participants: { prisoners: 150, children: 0, virgins: 0, volunteers: 60 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '3 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [
          { godId: 'huitzilopochtli', before: 75, after: 55 },
          { godId: 'tonatiuh', before: 40, after: 30 },
        ],
      },
      {
        id: 'heart-extraction',
        name: 'Heart Extraction',
        description: 'The ultimate offering of a beating heart to the war god.',
        participants: { prisoners: 280, children: 25, virgins: 0, volunteers: 100 },
        sacredSite: { name: 'Grand Temple', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'huitzilopochtli', before: 25, after: 10 },
          { godId: 'mictlantecuhtli', before: 50, after: 40 },
        ],
      },
      {
        id: 'war-march',
        name: 'Grand War March',
        description: 'A procession of warriors bearing sacred arms and shields.',
        participants: { prisoners: 450, children: 70, virgins: 7, volunteers: 200 },
        sacredSite: { name: 'Grand Temple', count: 1 },
        schedule: 'Morning',
        duration: '5 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'huitzilopochtli', before: 40, after: 20 },
          { godId: 'tezcatlipoca', before: 55, after: 45 },
        ],
      },
    ],
  },
  {
    id: 'tlaloc',
    name: 'Tlaloc',
    subtitle: 'God of Rain & Storms',
    svg: '/gods/tlaloc.svg',
    angerColor: '#c8322e',
    angerLevel: 'high',
    favor: 45,
    rituals: [
      {
        id: 'rain-beckoning',
        name: 'Rain Beckoning',
        description: 'Burning copal and casting maize into sacred pools as an opening plea to the rain god.',
        participants: { prisoners: 70, children: 15, virgins: 0, volunteers: 0 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Afternoon',
        duration: '2 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [
          { godId: 'tlaloc', before: 40, after: 30 },
          { godId: 'chalchiuhtlicue', before: 35, after: 28 },
        ],
      },
      {
        id: 'rain-dance',
        name: 'Rain Dance',
        description: 'A ceremonial dance calling the rains from the heavens.',
        participants: { prisoners: 80, children: 40, virgins: 0, volunteers: 60 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dusk',
        duration: '3 days',
        outcomeColor: '#d4662a',
        available: true,
        effects: [
          { godId: 'tlaloc', before: 65, after: 45 },
          { godId: 'chalchiuhtlicue', before: 50, after: 38 },
        ],
      },
      {
        id: 'storm-prayer',
        name: 'Storm Prayer',
        description: 'Plaintive chants invoking the thunder and lightning.',
        participants: { prisoners: 100, children: 80, virgins: 2, volunteers: 80 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '4 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'tlaloc', before: 35, after: 20 },
          { godId: 'ehecatl', before: 40, after: 30 },
        ],
      },
      {
        id: 'child-sacrifice',
        name: 'Child Sacrifice',
        description: 'The most treasured offering to ensure the rains return.',
        participants: { prisoners: 120, children: 300, virgins: 5, volunteers: 100 },
        sacredSite: { name: 'Grand Temple', count: 1 },
        schedule: 'Midnight',
        duration: '5 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'tlaloc', before: 20, after: 0 },
          { godId: 'mictecacihuatl', before: 55, after: 40 },
        ],
      },
    ],
  },
  {
    id: 'tezcatlipoca',
    name: 'Tezcatlipoca',
    subtitle: 'God of Night & Sorcery',
    svg: '/gods/tezcatlipoca.svg',
    angerColor: '#d4662a',
    angerLevel: 'medium',
    favor: 30,
    rituals: [
      {
        id: 'conflict-ceremony',
        name: 'Conflict & Strife Ceremony',
        description: 'Celebrating the chaos and struggle that defines existence.',
        participants: { prisoners: 20, children: 0, virgins: 0, volunteers: 0 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '1 day',
        outcomeColor: '#c8322e',
        available: true,
        effects: [
          { godId: 'tezcatlipoca', before: 45, after: 38 },
          { godId: 'coyolxauhqui', before: 50, after: 44 },
        ],
      },
      {
        id: 'shadow-walk',
        name: 'Shadow Walk',
        description: 'Walking blindfolded through the obsidian temple, surrendering all vision to the lord of darkness.',
        participants: { prisoners: 70, children: 0, virgins: 0, volunteers: 40 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Evening',
        duration: '2 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'tezcatlipoca', before: 50, after: 35 },
          { godId: 'tlazolteotl', before: 45, after: 35 },
        ],
      },
      {
        id: 'midnight-vigil',
        name: 'Midnight Vigil',
        description: 'An all-night observance under the stars, seeking visions.',
        participants: { prisoners: 120, children: 15, virgins: 2, volunteers: 70 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Midnight',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'tezcatlipoca', before: 70, after: 50 },
        ],
      },
      {
        id: 'sorcerer-rite',
        name: 'Sorcerer\'s Rite',
        description: 'Invoking dark magic and shadow work under Tezcatlipoca\'s domain.',
        participants: { prisoners: 200, children: 35, virgins: 4, volunteers: 120 },
        sacredSite: { name: 'Grand Temple', count: 1 },
        schedule: 'Dusk',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'tezcatlipoca', before: 35, after: 15 },
          { godId: 'coatlicue', before: 60, after: 50 },
        ],
      },
    ],
  },
  {
    id: 'coyolxauhqui',
    name: 'Coyolxauhqui',
    subtitle: 'Goddess of the Moon',
    svg: '/gods/coyolxauhqui.svg',
    angerColor: '#d4662a',
    angerLevel: 'medium',
    favor: 55,
    rituals: [
      {
        id: 'celestial-tribute',
        name: 'Celestial Tribute',
        description: 'Offering light and bells to the cosmic moon goddess.',
        participants: { prisoners: 0, children: 0, virgins: 1, volunteers: 20 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Night',
        duration: '1 day',
        outcomeColor: '#c8322e',
        available: true,
        effects: [
          { godId: 'coyolxauhqui', before: 45, after: 38 },
          { godId: 'chalchiuhtlicue', before: 40, after: 35 },
        ],
      },
      {
        id: 'bell-offering',
        name: 'Bell Offering',
        description: "Hanging sacred bells at the temple gates to echo her name across the night sky.",
        participants: { prisoners: 25, children: 0, virgins: 1, volunteers: 50 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dusk',
        duration: '2 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'coyolxauhqui', before: 60, after: 45 },
          { godId: 'tonatiuh', before: 45, after: 38 },
        ],
      },
      {
        id: 'tidal-ceremony',
        name: 'Tidal Ceremony',
        description: 'Celebrating the moon\'s influence over water and tides.',
        participants: { prisoners: 50, children: 20, virgins: 2, volunteers: 80 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Evening',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'coyolxauhqui', before: 35, after: 22 },
          { godId: 'chalchiuhtlicue', before: 45, after: 35 },
        ],
      },
      {
        id: 'dismemberment-rite',
        name: 'Dismemberment Rite',
        description: 'A ritual honoring the scattered pieces of the moon goddess.',
        participants: { prisoners: 100, children: 40, virgins: 4, volunteers: 150 },
        sacredSite: { name: 'Grand Temple', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'coyolxauhqui', before: 30, after: 10 },
          { godId: 'mictlantecuhtli', before: 50, after: 40 },
        ],
      },
    ],
  },
  {
    id: 'quetzalcoatl',
    name: 'Quetzalcoatl',
    subtitle: 'Feathered Serpent',
    svg: '/gods/quetzalcoatl.svg',
    angerColor: '#c8a83c',
    angerLevel: 'low',
    favor: 75,
    rituals: [
      {
        id: 'return-promise',
        name: 'Return Promise Ceremony',
        description: 'Renewing the promise of Quetzalcoatl\'s eventual return.',
        participants: { prisoners: 0, children: 0, virgins: 0, volunteers: 10 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Morning',
        duration: '1 day',
        outcomeColor: '#c8322e',
        available: true,
        effects: [
          { godId: 'quetzalcoatl', before: 20, after: 15 },
          { godId: 'tonatiuh', before: 55, after: 50 },
        ],
      },
      {
        id: 'serpent-wisdom',
        name: 'Serpent\'s Wisdom',
        description: 'Seeking knowledge and wisdom from the feathered serpent.',
        participants: { prisoners: 0, children: 0, virgins: 1, volunteers: 30 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Morning',
        duration: '1 day',
        outcomeColor: '#d4662a',
        available: true,
        effects: [
          { godId: 'quetzalcoatl', before: 35, after: 25 },
          { godId: 'ometeotl', before: 50, after: 43 },
        ],
      },
      {
        id: 'serpents-covenant',
        name: "Serpent's Covenant",
        description: 'Renewing the sacred covenant with feathers, flowers, and bloodless devotion.',
        participants: { prisoners: 0, children: 0, virgins: 2, volunteers: 100 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Morning',
        duration: '2 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'quetzalcoatl', before: 32, after: 20 },
        ],
      },
      {
        id: 'creation-myth',
        name: 'Creation Myth Reenactment',
        description: 'Reenacting the sacred creation myths of Quetzalcoatl.',
        participants: { prisoners: 30, children: 10, virgins: 2, volunteers: 150 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dusk',
        duration: '3 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'quetzalcoatl', before: 15, after: 5 },
          { godId: 'coatlicue', before: 50, after: 42 },
        ],
      },
    ],
  },
  {
    id: 'tonatiuh',
    name: 'Tonatiuh',
    subtitle: 'God of the Sun',
    svg: '/gods/tonatiuh.svg',
    angerColor: '#6C6C6C',
    angerLevel: 'none',
    favor: 80,
    rituals: [
      {
        id: 'eternal-warrior',
        name: 'Eternal Warrior\'s Path',
        description: 'Honoring the sun\'s battle against darkness each night.',
        participants: { prisoners: 0, children: 0, virgins: 0, volunteers: 10 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dusk',
        duration: '1 day',
        outcomeColor: '#c8322e',
        available: true,
        effects: [
          { godId: 'tonatiuh', before: 15, after: 12 },
          { godId: 'coyolxauhqui', before: 55, after: 50 },
        ],
      },
      {
        id: 'zenith-offering',
        name: 'Zenith Offering',
        description: 'Making offerings as the sun reaches its highest point.',
        participants: { prisoners: 0, children: 0, virgins: 0, volunteers: 20 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Noon',
        duration: '1 day',
        outcomeColor: '#d4662a',
        available: true,
        effects: [
          { godId: 'tonatiuh', before: 20, after: 15 },
          { godId: 'xiuhtecuhtli', before: 40, after: 35 },
        ],
      },
      {
        id: 'solar-sanctity',
        name: 'Solar Sanctity',
        description: 'Preserving the sanctity of the sun god\'s eternal journey.',
        participants: { prisoners: 0, children: 0, virgins: 1, volunteers: 40 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Afternoon',
        duration: '1 day',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'tonatiuh', before: 10, after: 5 },
          { godId: 'ometeotl', before: 55, after: 48 },
        ],
      },
      {
        id: 'dawn-salute',
        name: 'Dawn Salute',
        description: 'Greeting the sun at its daily rebirth into the sky.',
        participants: { prisoners: 0, children: 0, virgins: 0, volunteers: 80 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '1 day',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'tonatiuh', before: 30, after: 18 },
          { godId: 'huitzilopochtli', before: 50, after: 43 },
        ],
      },
    ],
  },
]
