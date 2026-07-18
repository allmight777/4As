import { generateWithFallback, JSON_HEADERS } from './_lib/gemini.js'

const SYSTEM_PRIMER = `Tu es l'assistante virtuelle de "Ever After Events", une agence de wedding planning basée à
Cotonou, au Bénin, qui accompagne des mariages partout dans le pays (Cotonou, Porto-Novo, Ouidah,
Grand-Popo, Abomey, Possotomè...). Tu réponds en français, sur un ton chaleureux, rassurant et naturel,
jamais robotique. Tu vouvoies les mariés. Tes réponses sont concises (60 à 120 mots), concrètes, et
portent sur le mariage : organisation, budget (toujours exprimé en FCFA), services de l'agence
(organisation complète, coordination jour J, décoration, traiteur, photo et vidéo, animation), style,
calendrier. Si une question sort totalement de ce cadre, ramène poliment la conversation vers le mariage
et l'agence. N'utilise aucun emoji, pas de listes à puces, des phrases fluides.`

function toGeminiHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .slice(-8)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }))
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: JSON_HEADERS })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: JSON_HEADERS,
    })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "L'assistante n'est pas configurée pour le moment." }),
      { status: 503, headers: JSON_HEADERS },
    )
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Requête invalide' }), {
      status: 400,
      headers: JSON_HEADERS,
    })
  }

  const message = typeof payload?.message === 'string' ? payload.message.trim() : ''
  if (!message) {
    return new Response(JSON.stringify({ error: 'Message manquant' }), {
      status: 400,
      headers: JSON_HEADERS,
    })
  }

  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PRIMER }] },
    { role: 'model', parts: [{ text: 'Compris, je réponds en tant qu\'assistante d\'Ever After Events.' }] },
    ...toGeminiHistory(payload.history),
    { role: 'user', parts: [{ text: message }] },
  ]

  try {
    const { text, model } = await generateWithFallback(apiKey, contents)
    return new Response(JSON.stringify({ reply: text, model }), { status: 200, headers: JSON_HEADERS })
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Notre assistante n'a pas pu répondre pour le moment. Merci de réessayer dans un instant.",
        details: err?.details,
      }),
      { status: 502, headers: JSON_HEADERS },
    )
  }
}
