// Shared Gemini caller. Tried in order until one model succeeds — includes
// the rolling "-latest" aliases so the chain keeps working as Google retires
// dated snapshots (this bit us once: gemini-1.5-flash and gemini-1.5-flash-8b
// were retired and every fallback attempt 404'd, turning into a raw 502).
export const FREE_TIER_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest',
]

const MODEL_TIMEOUT_MS = 15000

async function callGeminiModel(model, apiKey, contents) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS)

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`Gemini (${model}) n'a pas répondu dans le délai imparti`)
    }
    throw new Error(`Gemini (${model}) est injoignable : ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Gemini (${model}) a répondu ${response.status} : ${errorBody.slice(0, 200)}`)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Gemini (${model}) a renvoyé une réponse illisible`)
  }

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
  const error = new Error('Tous les modèles Gemini disponibles ont échoué')
  error.details = errors
  throw error
}

export const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}
