export const STYLES = [
  { id: 'champetre', label: 'Champêtre' },
  { id: 'urbain', label: 'Chic urbain' },
  { id: 'bord_de_mer', label: 'Bord de mer' },
  { id: 'classique', label: 'Classique' },
]

export const NIVEAUX = [
  { id: 'essentiel', label: 'Essentiel', text: "L'indispensable, sans superflu" },
  { id: 'confort', label: 'Confort', text: 'Un équilibre entre qualité et budget maîtrisé' },
  { id: 'prestige', label: 'Prestige', text: 'Une expérience haut de gamme, sans compromis' },
]

export const REGIONS = [
  { id: 'cotonou', label: 'Cotonou & littoral', factor: 1.25 },
  { id: 'porto-novo', label: 'Porto-Novo & Ouémé', factor: 1.0 },
  { id: 'ouidah', label: 'Ouidah, Grand-Popo & Possotomè', factor: 1.1 },
  { id: 'autre', label: 'Autre région du Bénin', factor: 0.85 },
]

const NIVEAU_MULTIPLIER = { essentiel: 0.72, confort: 1, prestige: 1.55 }

const STYLE_FACTORS = {
  champetre: { lieu: 0.85, traiteur: 0.95, tenue: 0.92, decoration: 1.15, photoVideo: 1, animation: 0.9 },
  urbain: { lieu: 1.25, traiteur: 1.1, tenue: 1.15, decoration: 1, photoVideo: 1.05, animation: 1.1 },
  bord_de_mer: { lieu: 1.15, traiteur: 1.05, tenue: 1.05, decoration: 1.05, photoVideo: 1.1, animation: 1 },
  classique: { lieu: 1, traiteur: 1, tenue: 1, decoration: 1, photoVideo: 1, animation: 1 },
}

export const CATEGORY_LABELS = {
  lieu: 'Lieu',
  traiteur: 'Traiteur',
  tenue: 'Tenue',
  decoration: 'Décoration',
  photoVideo: 'Photo & vidéo',
  animation: 'Animation',
}

// Palette cohérente avec le thème (or, sauge, rose) plutôt que des teintes hors charte
export const CATEGORY_COLORS = {
  lieu: 'var(--gold)',
  traiteur: 'var(--sage)',
  tenue: 'var(--rose)',
  decoration: 'var(--gold-soft)',
  photoVideo: 'var(--rose-soft)',
  animation: 'var(--sage-soft)',
}

function round5000(value) {
  return Math.round(value / 5000) * 5000
}

// Montants en FCFA (XOF), calibrés pour qu'un mariage de 20 à 300 invités
// sur la gamme essentiel/confort/prestige tombe environ entre 1,5M et 20M FCFA,
// ordres de grandeur réalistes pour un mariage au Bénin.
export function calculateBudget({ guests, style, niveau, region }) {
  const niveauFactor = NIVEAU_MULTIPLIER[niveau] ?? 1
  const styleFactor = STYLE_FACTORS[style] ?? STYLE_FACTORS.classique
  const regionFactor = REGIONS.find((r) => r.id === region)?.factor ?? 1

  const raw = {
    lieu: (700000 + guests * 3500) * styleFactor.lieu * regionFactor,
    traiteur: guests * 12000 * styleFactor.traiteur,
    tenue: (350000 + guests * 500) * styleFactor.tenue,
    decoration: (400000 + guests * 2200) * styleFactor.decoration,
    photoVideo: (450000 + guests * 700) * styleFactor.photoVideo,
    animation: (250000 + guests * 1300) * styleFactor.animation,
  }

  const breakdown = {}
  let total = 0
  for (const key of Object.keys(raw)) {
    const value = round5000(raw[key] * niveauFactor)
    breakdown[key] = value
    total += value
  }

  return { breakdown, total }
}

export function formatFCFA(value) {
  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value)} FCFA`
}