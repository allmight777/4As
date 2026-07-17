const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

function buildPrompt({ guests, style, niveau, region, total, breakdown }) {
  const breakdownLines = Object.entries(breakdown || {})
    .map(([label, amount]) => `- ${label} : ${amount} €`)
    .join('\n')

  return `Tu es l'assistante virtuelle de "Ever After Events", une agence française de wedding planning.
Un couple utilise le simulateur de budget en ligne avec les paramètres suivants :
- Nombre d'invités : ${guests}
- Style de mariage : ${style}
- Niveau de prestation : ${niveau}
- Région approximative : ${region}
- Budget total estimé : ${total} €

Répartition indicative :
${breakdownLines}

Rédige un conseil personnalisé et chaleureux en français (120 à 180 mots), sans emoji, qui :
1. commente brièvement la cohérence de cette estimation pour ce style et ce nombre d'invités,
2. propose deux ou trois pistes concrètes pour optimiser le budget sans sacrifier l'essentiel,
3. se termine par une phrase engageante invitant à prendre contact avec l'agence.
Écris en paragraphes courts, sans listes à puces ni titres.`
}

async function callGemini(model, apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Gemini (${model}) a répondu ${response.status} : ${errorBody.slice(0, 200)}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim()

  if (!text) throw new Error(`Gemini (${model}) n'a renvoyé aucun texte exploitable`)

  return text
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: HEADERS })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: HEADERS,
    })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Le service de conseil IA n'est pas configuré pour le moment." }),
      { status: 503, headers: HEADERS },
    )
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Requête invalide' }), {
      status: 400,
      headers: HEADERS,
    })
  }

  const { guests, style, niveau, region, total, breakdown } = payload || {}
  if (!guests || !style || !niveau || !total) {
    return new Response(JSON.stringify({ error: 'Paramètres manquants' }), {
      status: 400,
      headers: HEADERS,
    })
  }

  const prompt = buildPrompt({ guests, style, niveau, region, total, breakdown })

  const errors = []
  for (const model of GEMINI_MODELS) {
    try {
      const advice = await callGemini(model, apiKey, prompt)
      return new Response(JSON.stringify({ advice, model }), { status: 200, headers: HEADERS })
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
    }
  }

  return new Response(
    JSON.stringify({
      error: "Notre assistante n'a pas pu répondre pour le moment. Merci de réessayer dans un instant.",
      details: errors,
    }),
    { status: 502, headers: HEADERS },
  )
}
