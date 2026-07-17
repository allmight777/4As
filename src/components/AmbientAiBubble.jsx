import { useEffect, useRef, useState } from 'react'
import './AmbientAiBubble.css'

const GREETING_DELAY = 2000
const GREETING_INTERVAL = 5 * 60 * 1000
const VISIBLE_DURATION = 7000
const SECTION_VISIBLE_DURATION = 4000

const SECTION_LABELS = {
  apropos: 'Bienvenue dans notre histoire',
  services: 'Bienvenue dans nos services',
  budget: 'Bienvenue dans notre simulateur de budget',
  galerie: 'Bienvenue dans notre galerie',
  avis: 'Bienvenue dans les avis de nos couples',
  contact: 'Bienvenue dans la section contact',
}

function greetingMessage() {
  const hour = new Date().getHours()
  const salutation = hour < 18 ? 'Bonjour' : 'Bonsoir'
  return `${salutation}, en quoi puis-je vous aider ? Félicitations pour votre union !`
}

export default function AmbientAiBubble({ chatOpen, onShow }) {
  const [bubble, setBubble] = useState(null)

  const chatOpenRef = useRef(chatOpen)
  const hideTimerRef = useRef(null)
  const sectionActiveRef = useRef(false)
  const lastSectionRef = useRef(null)
  const onShowRef = useRef(onShow)
  onShowRef.current = onShow

  useEffect(() => {
    chatOpenRef.current = chatOpen
    if (chatOpen) {
      clearTimeout(hideTimerRef.current)
      setBubble(null)
      sectionActiveRef.current = false
    }
  }, [chatOpen])

  useEffect(() => {
    function show(message, duration, isSection) {
      if (chatOpenRef.current) return
      clearTimeout(hideTimerRef.current)
      if (isSection) sectionActiveRef.current = true
      setBubble({ message, key: Date.now() })
      onShowRef.current?.()
      hideTimerRef.current = setTimeout(() => {
        setBubble(null)
        if (isSection) sectionActiveRef.current = false
      }, duration)
    }

    const initialTimer = setTimeout(() => show(greetingMessage(), VISIBLE_DURATION, false), GREETING_DELAY)
    const interval = setInterval(() => {
      if (chatOpenRef.current || sectionActiveRef.current) return
      show(greetingMessage(), VISIBLE_DURATION, false)
    }, GREETING_INTERVAL)

    const sections = Array.from(document.querySelectorAll('section[id]')).filter((el) => SECTION_LABELS[el.id])
    let observer
    if (sections.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const label = SECTION_LABELS[entry.target.id]
            if (!label || lastSectionRef.current === entry.target.id) return
            lastSectionRef.current = entry.target.id
            show(label, SECTION_VISIBLE_DURATION, true)
          })
        },
        { threshold: 0.4 },
      )
      sections.forEach((section) => observer.observe(section))
    }

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
      clearTimeout(hideTimerRef.current)
      observer?.disconnect()
    }
  }, [])

  function handleClose() {
    clearTimeout(hideTimerRef.current)
    sectionActiveRef.current = false
    setBubble(null)
  }

  if (!bubble) return null

  return (
    <div className="ambient-ai-bubble" role="status" key={bubble.key}>
      <p>{bubble.message}</p>
      <button type="button" className="ambient-ai-bubble__close" onClick={handleClose} aria-label="Fermer le message">
        &times;
      </button>
    </div>
  )
}
