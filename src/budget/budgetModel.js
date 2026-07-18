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
  champetre: { lieu: 0.85, traiteur: 0.95, decoration: 1.15, photoVideo: 1, animation: 0.9 },
  urbain: { lieu: 1.25, traiteur: 1.1, decoration: 1, photoVideo: 1.05, animation: 1.1 },
  bord_de_mer: { lieu: 1.15, traiteur: 1.05, decoration: 1.05, photoVideo: 1.1, animation: 1 },
  classique: { lieu: 1, traiteur: 1, decoration: 1, photoVideo: 1, animation: 1 },
}

export const CATEGORY_LABELS = {
  lieu: 'Lieu',
  traiteur: 'Traiteur',
  decoration: 'Décoration',
  photoVideo: 'Photo & vidéo',
  animation: 'Animation',
}

export const CATEGORY_COLORS = {
  lieu: 'var(--gold)',
  traiteur: 'var(--sage)',
  decoration: 'var(--gold-soft)',
  photoVideo: '#8a7ba8',
  animation: '#c97b63',
}

function round5000(value) {
  return Math.round(value / 5000) * 5000
}

// Amounts in FCFA (XOF), calibrated so a typical 20-300 guest wedding across
// the essentiel/confort/prestige range lands roughly in the 1.5M-20M FCFA
// bracket seen for wedding budgets in Bénin.
export function calculateBudget({ guests, style, niveau, region }) {
  const niveauFactor = NIVEAU_MULTIPLIER[niveau] ?? 1
  const styleFactor = STYLE_FACTORS[style] ?? STYLE_FACTORS.classique
  const regionFactor = REGIONS.find((r) => r.id === region)?.factor ?? 1

  const raw = {
    lieu: (400000 + guests * 3000) * styleFactor.lieu * regionFactor,
    traiteur: guests * 15000 * styleFactor.traiteur,
    decoration: (250000 + guests * 2000) * styleFactor.decoration,
    photoVideo: (350000 + guests * 1000) * styleFactor.photoVideo,
    animation: (200000 + guests * 1500) * styleFactor.animation,
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
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} FCFA`
}
