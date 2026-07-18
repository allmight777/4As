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

// Safety net on top of the prompt itself: Gemini occasionally echoes a stray
// leading label like "(French): " or a lone "*" before the actual reply, and
// a maxOutputTokens ceiling that's too low can cut a reply off mid-sentence.
// Neither should ever reach the user even if a prompt tweak regresses later.
export function sanitizeReply(text) {
  if (!text) return text
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^\(.*?\)\s*:\s*/, '')
  cleaned = cleaned.replace(/^\*+\s*/, '')
  // Gemini occasionally breaks its reply into paragraphs (double newlines)
  // despite the "one fluid block" instruction in the system prompt. The chat
  // UI renders a single bubble per reply with `white-space: pre-line`, so a
  // stray paragraph gap shows up as a jarring blank line mid-sentence — easy
  // to mistake for the reply being split into two separate bubbles. Collapse
  // all line breaks so a reply is always one continuous paragraph.
  cleaned = cleaned.replace(/\s*\n+\s*/g, ' ')

  if (cleaned && !/[.!?…]["'”)\]]?$/.test(cleaned)) {
    const lastPunct = Math.max(cleaned.lastIndexOf('.'), cleaned.lastIndexOf('!'), cleaned.lastIndexOf('?'), cleaned.lastIndexOf('…'))
    // Only trim back if a substantial complete portion remains — otherwise a
    // genuinely punctuation-free short reply would get gutted for nothing.
    if (lastPunct > cleaned.length * 0.4) {
      cleaned = cleaned.slice(0, lastPunct + 1)
    }
  }

  return cleaned.trim()
}

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
        // 600 tokens is a comfortable ceiling for a 2-6 sentence reply — the
        // prompt itself is what keeps answers concise, this just makes sure
        // that ceiling is never what cuts a reply off mid-sentence.
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
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

  const rawText = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim()
  const text = sanitizeReply(rawText)
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
