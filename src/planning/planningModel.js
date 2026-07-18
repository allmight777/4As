// Modèle de rétroplanning : chaque tâche est définie par son délai avant le
// jour J (en mois OU en semaines), la logique se contente de soustraire ce
// délai à la date de mariage saisie par l'utilisateur.

export const CHECKLIST_TEMPLATE = [
  {
    id: 'budget-date',
    monthsBefore: 12,
    label: 'Fixer le budget global et arrêter la date',
    text: "Poser les bases : enveloppe globale, date définitive, premières envies.",
  },
  {
    id: 'venue',
    monthsBefore: 12,
    label: 'Réserver la salle de réception',
    text: 'Les meilleures salles partent vite : à verrouiller en priorité.',
  },
  {
    id: 'caterer',
    monthsBefore: 10,
    label: 'Choisir le traiteur',
    text: 'Dégustation, menu, contraintes alimentaires des invités.',
  },
  {
    id: 'save-the-date',
    monthsBefore: 10,
    label: 'Envoyer les save-the-date',
    text: 'Prévenir les proches, surtout ceux qui devront voyager.',
  },
  {
    id: 'photographe',
    monthsBefore: 9,
    label: 'Réserver photographe et vidéaste',
    text: 'Les meilleurs prestataires se réservent loin à l’avance.',
  },
  {
    id: 'tenue',
    monthsBefore: 8,
    label: 'Choisir la tenue (robe, costume)',
    text: 'Compter le temps des retouches dans le délai.',
  },
  {
    id: 'animation',
    monthsBefore: 8,
    label: 'Réserver DJ, groupe ou cérémonie animée',
    text: 'Ambiance sonore du cocktail jusqu’à la soirée.',
  },
  {
    id: 'liste-invites',
    monthsBefore: 7,
    label: 'Finaliser la liste des invités',
    text: 'Indispensable avant l’envoi des faire-part.',
  },
  {
    id: 'faire-part',
    monthsBefore: 6,
    label: 'Envoyer les faire-part',
    text: 'Prévoir un délai de réponse confortable pour les invités.',
  },
  {
    id: 'hebergement',
    monthsBefore: 5,
    label: 'Réserver les hébergements pour les invités éloignés',
    text: 'Négocier un tarif de groupe si possible.',
  },
  {
    id: 'alliances',
    monthsBefore: 4,
    label: 'Choisir les alliances',
    text: 'Compter le délai de gravure éventuelle.',
  },
  {
    id: 'plan-table-v1',
    monthsBefore: 3,
    label: 'Ébaucher le plan de table',
    text: 'Une première version, à ajuster selon les confirmations.',
  },
  {
    id: 'essais-beaute',
    monthsBefore: 3,
    label: 'Essais coiffure & maquillage',
    text: 'Tester le rendu avant le grand jour, pas pendant.',
  },
  {
    id: 'menu-final',
    monthsBefore: 2,
    label: 'Finaliser le menu avec le traiteur',
    text: 'Valider les choix définitifs et les allergies recensées.',
  },
  {
    id: 'relances-rsvp',
    monthsBefore: 2,
    label: 'Relancer les invités sans réponse',
    text: 'Sécuriser un effectif fiable avant les derniers réglages.',
  },
  {
    id: 'derniers-essayages',
    monthsBefore: 1,
    label: 'Derniers essayages et retouches',
    text: 'Récupérer la tenue définitive, prévoir les chaussures.',
  },
  {
    id: 'plan-table-final',
    monthsBefore: 1,
    label: 'Finaliser le plan de table et les marque-places',
    text: 'Version définitive à transmettre au traiteur et à la salle.',
  },
  {
    id: 'effectifs-traiteur',
    weeksBefore: 2,
    label: 'Confirmer les effectifs définitifs au traiteur',
    text: 'Le chiffre qui sert de base à la facturation finale.',
  },
  {
    id: 'repetition',
    weeksBefore: 1,
    label: 'Répétition de la cérémonie',
    text: 'Rassurant pour tout le monde, surtout le cortège.',
  },
  {
    id: 'enveloppes',
    weeksBefore: 1,
    label: 'Préparer les enveloppes prestataires et pourboires',
    text: 'À confier à un témoin de confiance le jour J.',
  },
  {
    id: 'sac-urgence',
    weeksBefore: 1,
    label: 'Préparer la trousse d’urgence (kit couture, pansements...)',
    text: 'Petit détail qui sauve la journée en cas d’imprévu.',
  },
  {
    id: 'jour-j',
    weeksBefore: 0,
    label: 'Le grand jour !',
    text: 'Respirez, profitez : tout le reste est prêt.',
    isDday: true,
  },
]

function delayLabel({ monthsBefore, weeksBefore, isDday }) {
  if (isDday) return 'Jour J'
  if (monthsBefore) return `J-${monthsBefore} mois`
  if (weeksBefore) return `J-${weeksBefore} semaine${weeksBefore > 1 ? 's' : ''}`
  return ''
}

const AVG_DAYS_PER_MONTH = 30.44
const DAY_MS = 1000 * 60 * 60 * 24

// How many days before the wedding a step is nominally due, on the template's
// own ~12-month timeline (used only to scale the schedule down, never to
// place a step directly — see generateTimeline).
function leadDaysFor({ monthsBefore, weeksBefore }) {
  return (monthsBefore || 0) * AVG_DAYS_PER_MONTH + (weeksBefore || 0) * 7
}

const MAX_LEAD_DAYS = Math.max(...CHECKLIST_TEMPLATE.map(leadDaysFor))

export function generateTimeline(weddingDateStr) {
  if (!weddingDateStr) return []
  const weddingDate = new Date(`${weddingDateStr}T00:00:00`)
  if (Number.isNaN(weddingDate.getTime())) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalLeadDays = (weddingDate - today) / DAY_MS
  // A wedding 12+ months out keeps the template's natural month-by-month
  // spacing (scale caps at 1). A closer wedding date scales every step's
  // lead time down by the same factor, so the earliest step lands on
  // today instead of at its nominal (and possibly already-past) date —
  // the whole plan compresses to fit between today and the wedding day,
  // it never spills before today.
  const scale = MAX_LEAD_DAYS > 0 ? Math.max(0, Math.min(1, totalLeadDays / MAX_LEAD_DAYS)) : 1

  return CHECKLIST_TEMPLATE.map((task) => {
    const compressedLeadDays = leadDaysFor(task) * scale
    const dueDate = new Date(weddingDate)
    dueDate.setDate(dueDate.getDate() - Math.round(compressedLeadDays))
    // Belt-and-suspenders clamp for float/edge cases (wedding date already
    // today, or in the past): a step is never shown before today nor after
    // the wedding itself.
    const clampedTime = Math.min(Math.max(dueDate.getTime(), today.getTime()), weddingDate.getTime())
    const clampedDate = new Date(clampedTime)
    return {
      ...task,
      dueDate: clampedDate,
      delayLabel: delayLabel(task),
      isPast: clampedDate < today,
    }
  }).sort((a, b) => a.dueDate - b.dueDate)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function daysUntil(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

// Une date par défaut plausible pour que la section ne soit jamais vide au chargement.
export function defaultWeddingDate() {
  const d = new Date()
  d.setMonth(d.getMonth() + 12)
  return d.toISOString().slice(0, 10)
}