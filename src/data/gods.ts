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
        participants: { prisoners: 180, children: 0, virgins: 5, volunteers: 0 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
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
        participants: { prisoners: 190, children: 0, virgins: 6, volunteers: 90 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
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
        participants: { prisoners: 0, children: 117, virgins: 2, volunteers: 0 },
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
        participants: { prisoners: 0, children: 175, virgins: 5, volunteers: 0 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
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
        participants: { prisoners: 0, children: 0, virgins: 3, volunteers: 252 },
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
        participants: { prisoners: 0, children: 0, virgins: 4, volunteers: 386 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
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
        description: 'Five sacred virgins and a great host renew the feathered covenant.',
        participants: { prisoners: 0, children: 0, virgins: 5, volunteers: 199 },
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
        description: 'A vast host and two sacred virgins enact the birth of the world.',
        participants: { prisoners: 0, children: 0, virgins: 2, volunteers: 310 },
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
    id: 'mictlantecuhtli',
    name: 'Mictlantecuhtli',
    subtitle: 'God of the Dead',
    svg: '/gods/mictlantecuhtli.svg',
    angerColor: '#d4662a',
    angerLevel: 'medium',
    favor: 40,
    rituals: [
      {
        id: 'bone-offering',
        name: 'Bone Offering',
        description: 'Prisoners are sacrificed and their bones presented to the lord of the underworld.',
        participants: { prisoners: 60, children: 0, virgins: 0, volunteers: 40 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Midnight',
        duration: '2 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'mictlantecuhtli', before: 60, after: 45 },
        ],
      },
      {
        id: 'underworld-vigil',
        name: 'Underworld Vigil',
        description: 'Devotees keep a silent vigil through the night, guided by a sacred virgin.',
        participants: { prisoners: 0, children: 0, virgins: 1, volunteers: 169 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Midnight',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'mictlantecuhtli', before: 60, after: 45 },
        ],
      },
      {
        id: 'death-passage',
        name: 'Death Passage',
        description: 'A grand procession escorts chosen souls to the entrance of Mictlan.',
        participants: { prisoners: 70, children: 0, virgins: 2, volunteers: 188 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'mictlantecuhtli', before: 60, after: 30 },
        ],
      },
    ],
  },
  {
    id: 'ehecatl',
    name: 'Ehecatl',
    subtitle: 'God of Wind',
    svg: '/gods/ehecatl.svg',
    angerColor: '#c8a83c',
    angerLevel: 'low',
    favor: 70,
    rituals: [
      {
        id: 'wind-offering',
        name: 'Wind Offering',
        description: 'Devotees scatter sacred petals and burn copal to draw the wind god\'s gaze.',
        participants: { prisoners: 0, children: 0, virgins: 0, volunteers: 60 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '1 day',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'ehecatl', before: 35, after: 25 },
        ],
      },
      {
        id: 'breath-covenant',
        name: 'Breath Covenant',
        description: 'A hundred devotees and a sacred virgin breathe prayers into the four winds.',
        participants: { prisoners: 0, children: 0, virgins: 1, volunteers: 101 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Morning',
        duration: '2 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'ehecatl', before: 25, after: 12 },
          { godId: 'quetzalcoatl', before: 30, after: 22 },
        ],
      },
      {
        id: 'storm-herald',
        name: 'Storm Herald',
        description: 'Two virgins and a great host walk the sacred wind circuit at dawn.',
        participants: { prisoners: 0, children: 0, virgins: 2, volunteers: 154 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '3 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'ehecatl', before: 20, after: 5 },
          { godId: 'tlaloc', before: 40, after: 32 },
        ],
      },
    ],
  },
  {
    id: 'xiuhtecuhtli',
    name: 'Xiuhtecuhtli',
    subtitle: 'God of Fire & Time',
    svg: '/gods/xiuhtecuhtli.svg',
    angerColor: '#d4662a',
    angerLevel: 'medium',
    favor: 45,
    rituals: [
      {
        id: 'ember-vigil',
        name: 'Ember Vigil',
        description: 'Prisoners and fire-keepers tend the sacred flames through the night.',
        participants: { prisoners: 40, children: 0, virgins: 1, volunteers: 50 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Evening',
        duration: '2 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'xiuhtecuhtli', before: 55, after: 40 },
        ],
      },
      {
        id: 'sacred-fire',
        name: 'Sacred Fire',
        description: 'Two virgins and a great host of devotees feed the eternal blaze.',
        participants: { prisoners: 0, children: 0, virgins: 2, volunteers: 153 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Midnight',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'xiuhtecuhtli', before: 45, after: 30 },
          { godId: 'tonatiuh', before: 25, after: 18 },
        ],
      },
      {
        id: 'new-fire-ceremony',
        name: 'New Fire Ceremony',
        description: 'At the turn of the sacred cycle, three virgins kindle the new flame for the age.',
        participants: { prisoners: 0, children: 0, virgins: 3, volunteers: 234 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'xiuhtecuhtli', before: 30, after: 10 },
          { godId: 'tonatiuh', before: 20, after: 12 },
        ],
      },
    ],
  },
  {
    id: 'chalchiuhtlicue',
    name: 'Chalchiuhtlicue',
    subtitle: 'Goddess of Water & Lakes',
    svg: '/gods/chalchiuhtlicue.svg',
    angerColor: '#d4662a',
    angerLevel: 'medium',
    favor: 40,
    rituals: [
      {
        id: 'lake-offering',
        name: 'Lake Offering',
        description: 'Devotees cast precious jade and flowers into the sacred waters.',
        participants: { prisoners: 0, children: 0, virgins: 2, volunteers: 70 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dawn',
        duration: '2 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'chalchiuhtlicue', before: 55, after: 40 },
          { godId: 'tlaloc', before: 35, after: 28 },
        ],
      },
      {
        id: 'water-consecration',
        name: 'Water Consecration',
        description: 'Virgins and devoted water-bearers purify the sacred channels at dusk.',
        participants: { prisoners: 0, children: 0, virgins: 3, volunteers: 119 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Dusk',
        duration: '3 days',
        outcomeColor: '#d4a83c',
        available: true,
        effects: [
          { godId: 'chalchiuhtlicue', before: 45, after: 30 },
          { godId: 'ehecatl', before: 30, after: 22 },
        ],
      },
      {
        id: 'flood-covenant',
        name: 'Flood Covenant',
        description: 'A great host and four sacred virgins yield themselves to the jade waters.',
        participants: { prisoners: 0, children: 0, virgins: 4, volunteers: 183 },
        sacredSite: { name: 'Great Pyramid', count: 1 },
        schedule: 'Midnight',
        duration: '4 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'chalchiuhtlicue', before: 30, after: 10 },
          { godId: 'tlaloc', before: 25, after: 15 },
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
        description: 'A virgin and a great host of devotees honor the sun at its highest point.',
        participants: { prisoners: 0, children: 0, virgins: 1, volunteers: 135 },
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
        participants: { prisoners: 0, children: 0, virgins: 3, volunteers: 205 },
        sacredSite: { name: 'Temple', count: 1 },
        schedule: 'Afternoon',
        duration: '2 days',
        outcomeColor: '#c8a83c',
        available: true,
        effects: [
          { godId: 'tonatiuh', before: 10, after: 5 },
          { godId: 'xiuhtecuhtli', before: 35, after: 28 },
        ],
      },
    ],
  },
]
