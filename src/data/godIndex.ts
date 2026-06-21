export type Tier = 1 | 2 | 3
export type EdgeType = 'family' | 'spouse' | 'rival'

export interface PantheonNode {
  id: string
  name: string
  tier: Tier
  hasSvg: boolean
}

export interface PantheonEdge {
  source: string
  target: string
  type: EdgeType
}

// Positions relative to canvas center (0,0). y increases downward.
// Layout: Ometeotl center → 4 sons inner ring → Tier1 remainder + Tier2 middle ring → Tier3 outer ring
export const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  // Center
  ometeotl:               { x:    0,    y:    0 },

  // Inner ring — 4 sons (r≈340, diagonal placement)
  tezcatlipoca:           { x: -250,   y: -250 },
  quetzalcoatl:           { x:  250,   y: -250 },
  huitzilopochtli:        { x: -250,   y:  250 },
  'xipe-totec':           { x:  250,   y:  250 },

  // Middle ring — remaining Tier 1 + all Tier 2 (r≈640)
  tonatiuh:               { x:    0,   y: -640 },
  chalchiuhtlicue:        { x:  500,   y: -394 },
  tlaloc:                 { x:  640,   y:    0 },
  xiuhtecuhtli:           { x:  500,   y:  394 },
  coatlicue:              { x:    0,   y:  640 },
  coyolxauhqui:           { x: -394,   y:  500 },
  mictlantecuhtli:        { x: -640,   y:    0 },
  tlaltecuhtli:           { x: -500,   y: -394 },

  // Outer ring — Tier 3, clustered near their primary connections (r≈970)
  xolotl:                 { x:  363,   y: -908 },
  tlahuizcalpantecuhtli:  { x:  708,   y: -636 },
  chicomecoatl:           { x:  128,   y: -963 },
  xochiquetzal:           { x:  963,   y:  -112 },
  yacatecuhtli:           { x:  963,   y:   212 },
  centeotl:               { x:  684,   y:   684 },
  xochipilli:             { x:  527,   y:   793 },
  tlazolteotl:            { x:  781,   y:   575 },
  huehuecoyotl:           { x:  140,   y:   963 },
  omacatl:                { x:  394,   y:   908 },
  mixcoatl:               { x: -212,   y:   944 },
  cihuacoatl:             { x: -460,   y:   817 },
  itzpapalotl:            { x: -696,   y:   641 },
  tepeyollotl:            { x: -684,   y:   684 },
  mictlancihuatl:         { x: -963,   y:     0 },
  mayahuel:               { x: -950,   y:  -282 },
  patecatl:               { x: -835,   y:  -472 },
  ehecatl:                { x: -575,   y:  -781 },
}

export const PANTHEON_NODES: PantheonNode[] = [
  { id: 'ometeotl',              name: 'Ometeotl',              tier: 1, hasSvg: false },
  { id: 'tezcatlipoca',          name: 'Tezcatlipoca',          tier: 1, hasSvg: true  },
  { id: 'quetzalcoatl',          name: 'Quetzalcoatl',          tier: 1, hasSvg: true  },
  { id: 'huitzilopochtli',       name: 'Huitzilopochtli',       tier: 1, hasSvg: true  },
  { id: 'xipe-totec',            name: 'Xipe Totec',            tier: 1, hasSvg: false },
  { id: 'tlaloc',                name: 'Tlaloc',                tier: 1, hasSvg: true  },
  { id: 'tonatiuh',              name: 'Tonatiuh',              tier: 1, hasSvg: true  },
  { id: 'mictlantecuhtli',       name: 'Mictlantecuhtli',       tier: 2, hasSvg: true  },
  { id: 'coatlicue',             name: 'Coatlicue',             tier: 2, hasSvg: false },
  { id: 'chalchiuhtlicue',       name: 'Chalchiuhtlicue',       tier: 2, hasSvg: true  },
  { id: 'xiuhtecuhtli',          name: 'Xiuhtecuhtli',          tier: 2, hasSvg: true  },
  { id: 'tlaltecuhtli',          name: 'Tlaltecuhtli',          tier: 2, hasSvg: false },
  { id: 'coyolxauhqui',          name: 'Coyolxauhqui',          tier: 2, hasSvg: false },
  { id: 'mictlancihuatl',        name: 'Mictlancihuatl',        tier: 3, hasSvg: false },
  { id: 'centeotl',              name: 'Centeotl',              tier: 3, hasSvg: false },
  { id: 'xochipilli',            name: 'Xochipilli',            tier: 3, hasSvg: false },
  { id: 'xochiquetzal',          name: 'Xochiquetzal',          tier: 3, hasSvg: false },
  { id: 'mayahuel',              name: 'Mayahuel',              tier: 3, hasSvg: false },
  { id: 'itzpapalotl',           name: 'Itzpapalotl',           tier: 3, hasSvg: false },
  { id: 'mixcoatl',              name: 'Mixcoatl',              tier: 3, hasSvg: false },
  { id: 'ehecatl',               name: 'Ehecatl',               tier: 3, hasSvg: true  },
  { id: 'xolotl',                name: 'Xolotl',                tier: 3, hasSvg: false },
  { id: 'tlahuizcalpantecuhtli', name: 'Tlahuizcalpantecuhtli', tier: 3, hasSvg: false },
  { id: 'chicomecoatl',          name: 'Chicomecoatl',          tier: 3, hasSvg: false },
  { id: 'cihuacoatl',            name: 'Cihuacoatl',            tier: 3, hasSvg: false },
  { id: 'tlazolteotl',           name: 'Tlazolteotl',           tier: 3, hasSvg: false },
  { id: 'yacatecuhtli',          name: 'Yacatecuhtli',          tier: 3, hasSvg: false },
  { id: 'huehuecoyotl',          name: 'Huehuecoyotl',          tier: 3, hasSvg: false },
  { id: 'patecatl',              name: 'Patecatl',              tier: 3, hasSvg: false },
  { id: 'tepeyollotl',           name: 'Tepeyollotl',           tier: 3, hasSvg: false },
  { id: 'omacatl',               name: 'Omacatl',               tier: 3, hasSvg: false },
]

// Deduplicated edges — each pair appears once
export const PANTHEON_EDGES: PantheonEdge[] = [
  // Family — solid white line
  { source: 'ometeotl',        target: 'tezcatlipoca',    type: 'family' },
  { source: 'ometeotl',        target: 'quetzalcoatl',    type: 'family' },
  { source: 'ometeotl',        target: 'huitzilopochtli', type: 'family' },
  { source: 'ometeotl',        target: 'xipe-totec',      type: 'family' },
  { source: 'quetzalcoatl',    target: 'xolotl',          type: 'family' },
  { source: 'huitzilopochtli', target: 'coatlicue',       type: 'family' },
  { source: 'huitzilopochtli', target: 'coyolxauhqui',    type: 'family' },
  { source: 'coatlicue',       target: 'coyolxauhqui',    type: 'family' },
  { source: 'centeotl',        target: 'xochiquetzal',    type: 'family' },
  { source: 'centeotl',        target: 'tlazolteotl',     type: 'family' },
  { source: 'xochipilli',      target: 'xochiquetzal',    type: 'family' },
  { source: 'itzpapalotl',     target: 'mixcoatl',        type: 'family' },
  { source: 'cihuacoatl',      target: 'mixcoatl',        type: 'family' },

  // Spouse — dashed white line
  { source: 'tezcatlipoca',    target: 'xochiquetzal',    type: 'spouse' },
  { source: 'mictlantecuhtli', target: 'mictlancihuatl',  type: 'spouse' },
  { source: 'tlaloc',          target: 'chalchiuhtlicue', type: 'spouse' },
  { source: 'tlaloc',          target: 'xochiquetzal',    type: 'spouse' },
  { source: 'xiuhtecuhtli',    target: 'xochiquetzal',    type: 'spouse' },
  { source: 'coatlicue',       target: 'mixcoatl',        type: 'spouse' },
  { source: 'mayahuel',        target: 'patecatl',        type: 'spouse' },

  // Rival — dotted red line
  { source: 'tezcatlipoca',    target: 'quetzalcoatl',    type: 'rival' },
  { source: 'huitzilopochtli', target: 'coyolxauhqui',    type: 'rival' },
  { source: 'coatlicue',       target: 'coyolxauhqui',    type: 'rival' },
]
