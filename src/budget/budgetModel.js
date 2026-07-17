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
  { id: 'idf', label: 'Île-de-France', factor: 1.28 },
  { id: 'paca', label: "Provence-Alpes-Côte d'Azur", factor: 1.15 },
  { id: 'aura', label: 'Auvergne-Rhône-Alpes', factor: 1.05 },
  { id: 'autre', label: 'Autre région', factor: 0.92 },
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

function round50(value) {
  return Math.round(value / 50) * 50
}

export function calculateBudget({ guests, style, niveau, region }) {
  const niveauFactor = NIVEAU_MULTIPLIER[niveau] ?? 1
  const styleFactor = STYLE_FACTORS[style] ?? STYLE_FACTORS.classique
  const regionFactor = REGIONS.find((r) => r.id === region)?.factor ?? 1

  const raw = {
    lieu: (3200 + guests * 16) * styleFactor.lieu * regionFactor,
    traiteur: guests * 92 * styleFactor.traiteur,
    tenue: (1100 + guests * 2.5) * styleFactor.tenue,
    decoration: (2100 + guests * 11) * styleFactor.decoration,
    photoVideo: (2500 + guests * 3) * styleFactor.photoVideo,
    animation: (1300 + guests * 6) * styleFactor.animation,
  }

  const breakdown = {}
  let total = 0
  for (const key of Object.keys(raw)) {
    const value = round50(raw[key] * niveauFactor)
    breakdown[key] = value
    total += value
  }

  return { breakdown, total }
}

export function formatEuros(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}