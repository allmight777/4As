// Shared Gemini caller. Restricted to models available on the free tier
// of the Gemini API (no paid-tier-only models), tried in order until one
// succeeds.
export const FREE_TIER_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']

async function callGeminiModel(model, apiKey, contents) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
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

export async function generateWithFallback(apiKey, contents) {
  const errors = []
  for (const model of FREE_TIER_MODELS) {
    try {
      const text = await callGeminiModel(model, apiKey, contents)
      return { text, model }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
    }
  }
  const error = new Error("Tous les modèles Gemini disponibles ont échoué")
  error.details = errors
  throw error
}

export const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}
