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
        description: "Captives and loyal soldiers laid at the war god's feet.",
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
        id: 'heart-extraction',
        name: 'Heart Extraction',
        description: 'The ultimate offering of a beating heart to the war god.',
        participants: { prisoners: 280, children: 0, virgins: 3, volunteers: 0 },
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
        participants: { prisoners: 450, children: 0, virgins: 7, volunteers: 200 },
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
        description: 'Prisoners and children cast into the sacred pools as a first call.',
        participants: { prisoners: 50, children: 20, virgins: 0, volunteers: 0 },
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
        id: 'storm-prayer',
        name: 'Storm Prayer',
        description: 'Crying children and two sacred virgins given to the thunder.',
        participants: { prisoners: 0, children: 180, virgins: 2, volunteers: 0 },
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
        description: 'Hundreds of children and five virgins given to break the drought.',
        participants: { prisoners: 0, children: 400, virgins: 5, volunteers: 0 },
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
        id: 'shadow-walk',
        name: 'Shadow Walk',
        description: 'Captives and willing men led sightless into the obsidian dark.',
        participants: { prisoners: 70, children: 0, virgins: 0, volunteers: 80 },
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
        description: 'Willing devotees and three sacred virgins keep watch until the dark takes them.',
        participants: { prisoners: 0, children: 0, virgins: 3, volunteers: 180 },
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
        name: "Sorcerer's Rite",
        description: "Invoking dark magic and shadow work under Tezcatlipoca's domain.",
        participants: { prisoners: 0, children: 0, virgins: 4, volunteers: 300 },
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
        description: 'Two virgins and devotees offer bells and light to the moon goddess.',
        participants: { prisoners: 0, children: 0, virgins: 2, volunteers: 60 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Night',
        duration: '2 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'coyolxauhqui', before: 45, after: 38 },
          { godId: 'chalchiuhtlicue', before: 40, after: 35 },
        ],
      },
      {
        id: 'tidal-ceremony',
        name: 'Tidal Ceremony',
        description: "Virgins and devotees yielded to the moon's turning tide.",
        participants: { prisoners: 0, children: 0, virgins: 8, volunteers: 40 },
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
        description: 'Prisoners and virgins scattered in the name of the broken goddess.',
        participants: { prisoners: 80, children: 0, virgins: 12, volunteers: 0 },
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
        id: 'serpent-wisdom',
        name: "Serpent's Wisdom",
        description: 'A great gathering of devotees offers praise to the feathered serpent.',
        participants: { prisoners: 0, children: 0, virgins: 0, volunteers: 120 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Morning',
        duration: '1 day',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'quetzalcoatl', before: 35, after: 25 },
          { godId: 'ometeotl', before: 50, after: 43 },
        ],
      },
      {
        id: 'serpents-covenant',
        name: "Serpent's Covenant",
        description: 'Five sacred virgins and a small band renew the feathered covenant.',
        participants: { prisoners: 0, children: 0, virgins: 5, volunteers: 20 },
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
        name: 'Creation Myth',
        description: 'Sixty devotees and two sacred virgins enact the birth of the world.',
        participants: { prisoners: 0, children: 0, virgins: 2, volunteers: 60 },
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
        id: 'dawn-salute',
        name: 'Dawn Salute',
        description: 'Eighty devotees greet the sun at its daily rebirth into the sky.',
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
      {
        id: 'zenith-offering',
        name: 'Zenith Offering',
        description: 'A virgin and fifty devotees honor the sun at its highest point.',
        participants: { prisoners: 0, children: 0, virgins: 1, volunteers: 50 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Noon',
        duration: '2 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'tonatiuh', before: 20, after: 15 },
          { godId: 'xiuhtecuhtli', before: 40, after: 35 },
        ],
      },
      {
        id: 'solar-sanctity',
        name: 'Solar Sanctity',
        description: 'Three sacred virgins and devoted followers preserve the sun\'s blessing.',
        participants: { prisoners: 0, children: 0, virgins: 3, volunteers: 30 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Afternoon',
        duration: '2 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'tonatiuh', before: 10, after: 5 },
          { godId: 'ometeotl', before: 55, after: 48 },
        ],
      },
    ],
  },
]
