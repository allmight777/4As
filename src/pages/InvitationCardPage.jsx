import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import InvitationCardPreview, { CARD_TEMPLATES, CARD_WIDTH, CARD_HEIGHT } from '../components/invitationCard/InvitationCardPreview'
import './InvitationCardPage.css'

const TRIES_KEY = 'eae_card_tries'
const FREE_TRIES = 3

function readTries() {
  const raw = Number(localStorage.getItem(TRIES_KEY))
  return Number.isFinite(raw) && raw > 0 ? raw : 0
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function InvitationCardPage() {
  const [template, setTemplate] = useState(CARD_TEMPLATES[0].id)
  const [brideName, setBrideName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [message, setMessage] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState(null)
  const [tries, setTries] = useState(readTries)
  const [exportStatus, setExportStatus] = useState('idle') // idle | working | error
  const previewRef = useRef(null)

  const limitReached = tries >= FREE_TRIES
  const cardData = useMemo(
    () => ({
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      weddingDate: formatDate(weddingDate),
      message: message.trim(),
      photoDataUrl,
    }),
    [brideName, groomName, weddingDate, message, photoDataUrl],
  )

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoDataUrl(reader.result)
    reader.readAsDataURL(file)
  }

  async function waitForImagesLoaded(root) {
    const images = Array.from(root.querySelectorAll('img'))
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve()
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true })
          img.addEventListener('error', resolve, { once: true })
        })
      }),
    )
  }

  async function handleDownload() {
    if (limitReached || exportStatus === 'working' || !previewRef.current) return
    setExportStatus('working')
    // The on-page preview is shrunk to fit its box via a CSS `transform: scale(...)`
    // (see .invitation-page__preview-frame .invitation-card-canvas), sitting inside
    // an `overflow: hidden` frame. Capturing that live node directly fed html2canvas
    // a transformed, clipped element and produced a cropped/shifted render (the
    // wreath arc cut off on one side). Cloning the card into an off-screen,
    // untransformed, unclipped stage guarantees html2canvas always sees the card at
    // its true native 420x595 layout, regardless of how it's scaled for display.
    const stage = document.createElement('div')
    stage.style.position = 'fixed'
    stage.style.top = '0'
    stage.style.left = '-9999px'
    stage.style.width = `${CARD_WIDTH}px`
    stage.style.height = `${CARD_HEIGHT}px`
    stage.style.overflow = 'visible'
    const clone = previewRef.current.cloneNode(true)
    clone.style.transform = 'none'
    stage.appendChild(clone)
    document.body.appendChild(stage)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])

      await Promise.all([
        waitForImagesLoaded(clone),
        document.fonts?.ready || Promise.resolve(),
      ])

      const canvas = await html2canvas(clone, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
      const slug = [brideName, groomName].filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9-]+/g, '') || 'mariage'
      pdf.save(`carte-invitation-${slug}.pdf`)

      const nextTries = tries + 1
      localStorage.setItem(TRIES_KEY, String(nextTries))
      setTries(nextTries)
      setExportStatus('idle')
    } catch (err) {
      console.error('Échec de la génération du PDF de la carte :', err)
      setExportStatus('error')
    } finally {
      document.body.removeChild(stage)
    }
  }

  return (
    <section className="section section--ivory invitation-page">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Générateur de cartes</span>
          <h1>Créez votre carte d&apos;invitation</h1>
          <p>
            Choisissez un modèle, personnalisez les textes et téléchargez votre carte en PDF, prête à
            imprimer ou à partager. Trois essais gratuits, sans inscription.
          </p>
        </div>

        <div className="invitation-page__layout">
          <div className="invitation-page__form">
            <fieldset className="invitation-page__field-group">
              <legend>Modèle</legend>
              <div className="invitation-page__templates">
                {CARD_TEMPLATES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`invitation-page__template-btn ${template === item.id ? 'is-active' : ''}`}
                    onClick={() => setTemplate(item.id)}
                    aria-pressed={template === item.id}
                  >
                    <span className="invitation-page__template-thumb">
                      <InvitationCardPreview
                        template={item.id}
                        brideName="Prénom"
                        groomName="Prénom"
                        weddingDate="12 Juin 2027"
                      />
                    </span>
                    <span className="invitation-page__template-label">{item.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="invitation-page__field">
              <span>Prénom de la mariée</span>
              <input type="text" value={brideName} onChange={(e) => setBrideName(e.target.value)} maxLength={40} />
            </label>

            <label className="invitation-page__field">
              <span>Prénom du marié</span>
              <input type="text" value={groomName} onChange={(e) => setGroomName(e.target.value)} maxLength={40} />
            </label>

            <label className="invitation-page__field">
              <span>Date du mariage</span>
              <input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
            </label>

            <label className="invitation-page__field">
              <span>Message ou citation (facultatif)</span>
              <textarea
                rows={3}
                maxLength={160}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Avec toute notre joie, nous vous invitons à célébrer notre union."
              />
            </label>

            <label className="invitation-page__field">
              <span>Photo (facultatif)</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              <span className="invitation-page__hint">
                Vos photos ne sont pas conservées : elles restent sur votre appareil et ne sont jamais
                envoyées à un serveur.
              </span>
            </label>
          </div>

          <div className="invitation-page__preview">
            <div className="invitation-page__preview-frame">
              <InvitationCardPreview ref={previewRef} template={template} {...cardData} />
            </div>

            <button
              type="button"
              className="btn btn-primary invitation-page__download"
              onClick={handleDownload}
              disabled={limitReached || exportStatus === 'working'}
            >
              {exportStatus === 'working' ? 'Génération du PDF…' : 'Télécharger en PDF'}
            </button>

            <p className="invitation-page__tries">
              {limitReached ? 'Essais gratuits épuisés (3/3)' : `${tries}/${FREE_TRIES} essai${tries > 1 ? 's' : ''} gratuit${tries > 1 ? 's' : ''} utilisé${tries > 1 ? 's' : ''}`}
            </p>

            {exportStatus === 'error' && (
              <p className="invitation-page__error" role="alert">
                Une erreur est survenue pendant la génération du PDF. Merci de réessayer.
              </p>
            )}

            {limitReached && (
              <div className="invitation-page__upsell">
                <p>
                  Vous avez utilisé vos 3 essais gratuits — contactez-nous pour une création sur mesure,
                  imprimée et livrée.
                </p>
                <Link to="/#contact" className="btn btn-ghost">
                  Contacter l&apos;agence
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
