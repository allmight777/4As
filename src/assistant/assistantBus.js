// Minimal cross-component channel so any part of the app (e.g. the budget
// simulator's "Demander conseil" button) can open the floating chat and have
// it send a message, without lifting AiAssistant's state up through App.jsx.
// One AI endpoint/one chat UI to maintain instead of a separate inline
// implementation per feature.
const ASK_EVENT = 'eae:ask-assistant'

export function askAssistant(message) {
  window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: { message } }))
}

export function onAskAssistant(handler) {
  const listener = (event) => handler(event.detail?.message)
  window.addEventListener(ASK_EVENT, listener)
  return () => window.removeEventListener(ASK_EVENT, listener)
}
