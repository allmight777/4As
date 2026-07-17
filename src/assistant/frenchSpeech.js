// Prepares text for SpeechSynthesisUtterance so French numbers, currencies
// and percentages are pronounced correctly instead of being read digit by
// digit or skipped by the voice engine.
export function prepareFrenchSpeechText(text) {
  if (!text) return ''

  let result = text

  // "20850€" / "20 850 €" -> "20850 euros" (keep digits grouped, spell the unit)
  result = result.replace(/(\d)\s?€/g, '$1 euros')
  result = result.replace(/€\s?(\d)/g, 'euros $1')

  // "50%" -> "50 pour cent"
  result = result.replace(/(\d)\s?%/g, '$1 pour cent')

  // Remove thousands separators (spaces or narrow spaces) inside numbers so
  // the voice reads "20850" as one number instead of pausing mid-way.
  result = result.replace(/(\d)[\s ](\d{3})/g, '$1$2')

  // Ensure a number glued to a word gets a breathing space ("90invités").
  result = result.replace(/(\d)([a-zA-ZÀ-ÿ])/g, '$1 $2')
  result = result.replace(/([a-zA-ZÀ-ÿ])(\d)/g, '$1 $2')

  return result
}

export function pickFrenchVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang?.toLowerCase() === 'fr-fr') ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('fr')) ||
    null
  )
}
