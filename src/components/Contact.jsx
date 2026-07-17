import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import './Contact.css'

function encodeForm(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&')
}

const INITIAL_STATE = { name: '', email: '', weddingDate: '', message: '' }

export default function Contact() {
  const revealRef = useReveal()
  const [fields, setFields] = useState(INITIAL_STATE)
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  function updateField(key) {
    return (event) => setFields((prev) => ({ ...prev, [key]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('sending')
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ 'form-name': 'contact', ...fields }),
      })
      if (!response.ok) throw new Error('Envoi impossible')
      setStatus('success')
      setFields(INITIAL_STATE)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section section--ink contact">
      <div className="container contact__grid">
        <div className="contact__intro reveal" ref={revealRef}>
          <span className="eyebrow">Parlons de votre mariage</span>
          <h2>Racontez-nous votre histoire</h2>
          <p>
            Un premier échange, sans engagement, pour comprendre votre vision et vous proposer un
            accompagnement sur mesure. Nous répondons sous 48 heures.
          </p>

          <div className="contact__details">
            <a href="mailto:bonjour@everafterevents.fr">bonjour@everafterevents.fr</a>
            <a href="tel:+33600000000">06 00 00 00 00</a>
            <span>Lyon &amp; toute la France</span>
          </div>
        </div>

        <form
          className="contact__form"
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="form-name" value="contact" />
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

          <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande'}
          </button>

          {status === 'success' ? (
            <p className="contact__status contact__status--success" role="status">
              Merci, votre message a bien été envoyé. Nous revenons vers vous très vite.
            </p>
          ) : null}

          {status === 'error' ? (
            <p className="contact__status contact__status--error" role="alert">
              Une erreur est survenue lors de l&apos;envoi. Vous pouvez réessayer ou nous écrire
              directement à bonjour@everafterevents.fr.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}
