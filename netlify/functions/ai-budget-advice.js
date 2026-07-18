import { generateWithFallback, JSON_HEADERS } from './_lib/gemini.js'

function buildPrompt({ guests, style, niveau, region, total, breakdown }) {
  const breakdownLines = Object.entries(breakdown || {})
    .map(([label, amount]) => `- ${label} : ${amount} FCFA`)
    .join('\n')

  return `Tu es l'assistante virtuelle de "Ever After Events", une agence de wedding planning basée à Cotonou, au Bénin.
Un couple utilise le simulateur de budget en ligne avec les paramètres suivants :
- Nombre d'invités : ${guests}
- Style de mariage : ${style}
- Niveau de prestation : ${niveau}
- Région approximative : ${region}
- Budget total estimé : ${total} FCFA

Répartition indicative :
${breakdownLines}

Rédige un conseil personnalisé et chaleureux en français (120 à 180 mots), sans emoji, qui :
1. commente brièvement la cohérence de cette estimation pour ce style et ce nombre d'invités,
2. propose deux ou trois pistes concrètes pour optimiser le budget sans sacrifier l'essentiel,
3. se termine par une phrase engageante invitant à prendre contact avec l'agence.
Écris en paragraphes courts, sans listes à puces ni titres.`
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
      JSON.stringify({ error: "Le service de conseil IA n'est pas configuré pour le moment." }),
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

  const { guests, style, niveau, region, total, breakdown } = payload || {}
  if (!guests || !style || !niveau || !total) {
    return new Response(JSON.stringify({ error: 'Paramètres manquants' }), {
      status: 400,
      headers: JSON_HEADERS,
    })
  }

  const prompt = buildPrompt({ guests, style, niveau, region, total, breakdown })

  try {
    const { text, model } = await generateWithFallback(apiKey, [
      { role: 'user', parts: [{ text: prompt }] },
    ])
    return new Response(JSON.stringify({ advice: text, model }), { status: 200, headers: JSON_HEADERS })
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
