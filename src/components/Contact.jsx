import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import RevealHeading from './RevealHeading'
import './Contact.css'

const CONTACT_EMAIL = 'bonjour@everafterevents.bj'
const INITIAL_STATE = { name: '', email: '', weddingDate: '', message: '' }

export default function Contact() {
  const revealRef = useReveal()
  const [fields, setFields] = useState(INITIAL_STATE)
  const [sent, setSent] = useState(false)

  function updateField(key) {
    return (event) => setFields((prev) => ({ ...prev, [key]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    // Honeypot: bots fill every field including this hidden one, real visitors never see it.
    if (event.target['bot-field']?.value) return

    const subject = encodeURIComponent('Demande de contact — site Ever After Events')
    const body = encodeURIComponent(
      `Nom et prénom : ${fields.name}\n` +
        `Email : ${fields.email}\n` +
        `Date de mariage envisagée : ${fields.weddingDate || 'Non précisée'}\n\n` +
        `Message :\n${fields.message}`,
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <section id="contact" className="section section--ink contact">
      <div className="container contact__grid">
        <div className="contact__intro reveal" ref={revealRef}>
          <span className="eyebrow">Parlons de votre mariage</span>
          <RevealHeading text="Racontez-nous votre histoire" />
          <p>
            Un premier échange, sans engagement, pour comprendre votre vision et vous proposer un
            accompagnement sur mesure. Nous répondons sous 48 heures.
          </p>

          <div className="contact__details">
            <a href="mailto:bonjour@everafterevents.bj">bonjour@everafterevents.bj</a>
            <a href="tel:+22901900000">+229 01 90 00 00 00</a>
            <span>Cotonou &amp; partout au Bénin</span>
          </div>
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          <p className="contact__hidden">
            <label>
              Ne pas remplir si vous êtes humain : <input name="bot-field" onChange={() => {}} />
            </label>
          </p>

          <label className="contact__field">
            <span>Nom et prénom</span>
            <input
              type="text"
              name="name"
              required
              value={fields.name}
              onChange={updateField('name')}
              autoComplete="name"
            />
          </label>

          <label className="contact__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              required
              value={fields.email}
              onChange={updateField('email')}
              autoComplete="email"
            />
          </label>

          <label className="contact__field">
            <span>Date de mariage envisagée</span>
            <input
              type="date"
              name="weddingDate"
              value={fields.weddingDate}
              onChange={updateField('weddingDate')}
            />
          </label>

          <label className="contact__field">
            <span>Votre message</span>
            <textarea
              name="message"
              rows={4}
              required
              value={fields.message}
              onChange={updateField('message')}
            />
          </label>

          <button type="submit" className="btn btn-primary">
            Envoyer ma demande
          </button>

          {sent ? (
            <p className="contact__status contact__status--success" role="status">
              Votre boîte mail va s&apos;ouvrir avec votre message pré-rempli.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}
