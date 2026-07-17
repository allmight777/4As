import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import RevealHeading from './RevealHeading'
import { GALLERY_ITEMS } from '../gallery/galleryItems'
import GalleryImage from '../gallery/GalleryImage'
import './Gallery.css'

// Aperçu : 10 items pour remplir proprement la grille (avec grid-auto-flow: dense,
// aucun trou ne subsiste même avec plusieurs tuiles "tall")
const ITEMS = GALLERY_ITEMS.slice(0, 8)

export default function Gallery() {
  const revealRef = useReveal()
  const gridRef = useReveal()

  return (
    <section id="galerie" className="section section--ink gallery">
      <div className="container">
        <div className="section-head reveal" ref={revealRef}>
          <span className="eyebrow">Instants choisis</span>
          <RevealHeading text="Un aperçu de nos mariages" />
          <p>
            Chaque union est unique : voici quelques ambiances déjà orchestrées par nos équipes,
            entre lumière naturelle, matières nobles et instants suspendus.
          </p>
        </div>

        <div className="gallery__grid reveal-group" ref={gridRef}>
          {ITEMS.map((item) => (
            <figure
              key={item.label}
              className={`gallery__tile gallery__tile--${item.variant} gallery__tile--${item.size}`}
            >
              <GalleryImage src={item.src} alt={item.label} />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>

        <div className="gallery__more">
          <Link className="btn btn-ghost" to="/galerie">
            Voir plus
          </Link>
        </div>
      </div>
    </section>
  )
}