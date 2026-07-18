import { useEffect, useRef, useState } from 'react'
import { prepareFrenchSpeechText, pickFrenchVoice } from '../assistant/frenchSpeech'
import { onAskAssistant } from '../assistant/assistantBus'
import './AiAssistant.css'

const GREETING = 'Bienvenue jeune marié·e, en quoi puis-je vous aider ?'
const MAINTENANCE_MESSAGE =
  'Notre assistante est momentanément en pause. Merci de nous contacter directement à ' +
  'bonjour@everafterevents.bj — nous vous répondrons avec plaisir.'

function CoupleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true" className="ai-assistant__icon-svg">
      <defs>
        <linearGradient id="ai-icon-gold" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="var(--gold-soft)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </linearGradient>
        <linearGradient id="ai-icon-ivory" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="var(--ivory-dim)" />
        </linearGradient>
      </defs>
      <circle cx="17" cy="14" r="5.2" fill="url(#ai-icon-gold)" />
      <circle cx="31" cy="14" r="5.2" fill="url(#ai-icon-ivory)" />
      <path
        d="M9 40c0-8 4-14 8-14 3 0 4 2 6 2"
        fill="none"
        stroke="url(#ai-icon-gold)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M39 40c0-8-4-14-8-14-3 0-4 2-6 2"
        fill="none"
        stroke="url(#ai-icon-ivory)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="27.6" r="2.1" fill="var(--gold)" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M3 11.5 21 3l-6 18-4-8-8-1.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SpeakerIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      {active ? (
        <path d="M16 8a5 5 0 0 1 0 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M16 9a3.5 3.5 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  )
}

let messageId = 0
function nextId() {
  messageId += 1
  return messageId
}

export default function AiAssistant({ onOpenChange, pulseKey }) {
  const [open, setOpen] = useState(false)
  const [bump, setBump] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [listening, setListening] = useState(false)
  const [micSupported, setMicSupported] = useState(false)
  const [micError, setMicError] = useState('')
  const [speakingId, setSpeakingId] = useState(null)

  const recognitionRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    setMicSupported(true)
    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInput(transcript)
    }
    recognition.onerror = (event) => {
      setListening(false)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicError("Le micro n'est pas autorisé. Vérifiez les permissions de votre navigateur.")
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setMicError("La reconnaissance vocale a rencontré un problème.")
      }
    }
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    return () => recognition.abort()
  }, [])

  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!pulseKey) return
    setBump(true)
    const timer = setTimeout(() => setBump(false), 650)
    return () => clearTimeout(timer)
  }, [pulseKey])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: nextId(), role: 'assistant', text: GREETING }])
    }
  }, [open, messages.length])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, status])

  function toggleMic() {
    if (!recognitionRef.current) return
    setMicError('')
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch {
      setMicError("Impossible de démarrer le micro.")
    }
  }

  function toggleSpeak(id, text) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(prepareFrenchSpeechText(text))
    utterance.lang = 'fr-FR'
    const voice = pickFrenchVoice()
    if (voice) utterance.voice = voice
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  async function sendText(text) {
    if (!text || status === 'loading') return

    const history = messages.slice(-8).map((m) => ({ role: m.role, text: m.text }))
    const userMessage = { id: nextId(), role: 'user', text }
    setMessages((prev) => [...prev, userMessage])
    setStatus('loading')

    try {
      const response = await fetch('/.netlify/functions/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data || data.error || !data.reply) {
        throw new Error(data?.error || 'Réponse indisponible')
      }

      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: data.reply }])
      setStatus('idle')
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', text: MAINTENANCE_MESSAGE, isError: true },
      ])
      setStatus('error')
    }
  }

  function sendMessage(event) {
    event.preventDefault()
    const text = input.trim()
    setInput('')
    sendText(text)
  }

  // Lets other parts of the app (e.g. the budget simulator's "Demander
  // conseil" button) open this same chat and send it a message, instead of
  // each feature running its own separate AI call. sendTextRef always holds
  // the latest sendText (fresh `messages`/`status` closure) so this effect
  // can subscribe once without going stale.
  const sendTextRef = useRef(sendText)
  sendTextRef.current = sendText

  useEffect(() => onAskAssistant((text) => {
    setOpen(true)
    sendTextRef.current(text)
  }), [])

  return (
    <div className="ai-assistant">
      {open ? (
        <div className="ai-assistant__panel" role="dialog" aria-label="Assistante Ever After Events">
          <header className="ai-assistant__header">
            <span>Assistante Ever After Events</span>
            <button
              type="button"
              className="ai-assistant__close"
              onClick={() => setOpen(false)}
              aria-label="Fermer la discussion"
            >
              &times;
            </button>
          </header>

          <div className="ai-assistant__messages" ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-assistant__bubble ai-assistant__bubble--${message.role} ${message.isError ? 'ai-assistant__bubble--error' : ''}`}
              >
                <p>{message.text}</p>
                {message.role === 'assistant' && !message.isError ? (
                  <button
                    type="button"
                    className="ai-assistant__speak"
                    onClick={() => toggleSpeak(message.id, message.text)}
                    aria-label={speakingId === message.id ? 'Arrêter la lecture' : 'Écouter ce message'}
                  >
                    <SpeakerIcon active={speakingId === message.id} />
                  </button>
                ) : null}
              </div>
            ))}

            {status === 'loading' ? (
              <div className="ai-assistant__bubble ai-assistant__bubble--assistant ai-assistant__typing" aria-live="polite">
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </div>

          {micError ? <p className="ai-assistant__mic-error">{micError}</p> : null}

          <form className="ai-assistant__form" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre question…"
              aria-label="Votre message"
            />
            {micSupported ? (
              <button
                type="button"
                className={`ai-assistant__mic ${listening ? 'is-listening' : ''}`}
                onClick={toggleMic}
                aria-label={listening ? 'Arrêter le micro' : 'Parler à l’assistante'}
              >
                <MicIcon />
              </button>
            ) : null}
            <button type="submit" className="ai-assistant__send" aria-label="Envoyer">
              <SendIcon />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className={`ai-assistant__toggle ${bump ? 'ai-assistant__toggle--bump' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer l'assistante" : "Ouvrir l'assistante"}
        aria-expanded={open}
      >
        <span className="ai-assistant__halo" aria-hidden="true" />
        <CoupleIcon />
      </button>
    </div>
  )
}
