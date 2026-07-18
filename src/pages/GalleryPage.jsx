import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import RevealHeading from '../components/RevealHeading'
import { GALLERY_ITEMS } from '../gallery/galleryItems'
import './GalleryPage.css'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="rgba(28,27,41,0.55)" />
      <path d="M10 8.2 16 12l-6 3.8Z" fill="var(--white)" />
    </svg>
  )
}

export default function GalleryPage() {
  const revealRef = useReveal()
  const gridRef = useReveal()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <section className="section section--ink gallery-page">
      <div className="container">
        <div className="gallery-page__head reveal" ref={revealRef}>
          <Link to="/#galerie" className="gallery-page__back">
            &larr; Retour au site
          </Link>
          <span className="eyebrow">Toute la galerie</span>
          <RevealHeading as="h1" text="Photos & vidéos de nos mariages" />
          <p>
            Un aperçu plus large de nos réalisations, entre instants volés et scènes préparées.
            Cette page sera enrichie au fil de nos prochains mariages.
          </p>
        </div>

        <div className="gallery-page__grid reveal-group" ref={gridRef}>
          {GALLERY_ITEMS.map((item, index) => (
            <figure
              key={`${item.label}-${index}`}
              className={`gp-tile gp-tile--${item.variant} gp-tile--${item.size}`}
            >
              <img src={item.src} alt={item.label} loading="lazy" decoding="async" />
              {item.type === 'video' ? (
                <span className="gp-tile__badge">
                  <PlayIcon />
                  Vidéo
                </span>
              ) : null}
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}