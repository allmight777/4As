import { useReveal } from '../hooks/useReveal'
import './Gallery.css'

const ITEMS = [
  { label: 'Cérémonie', variant: 'a', tall: true },
  { label: 'Détails de table', variant: 'b' },
  { label: 'Bouquet & fleurs', variant: 'c' },
  { label: 'Robe & préparatifs', variant: 'd', tall: true },
  { label: 'Réception', variant: 'e' },
  { label: 'Première danse', variant: 'f' },
  { label: 'Lumières du soir', variant: 'a' },
  { label: 'Scénographie', variant: 'c', tall: true },
]

export default function Gallery() {
  const revealRef = useReveal()

  return (
    <section id="galerie" className="section section--ink gallery">
      <div className="container">
        <div className="section-head reveal" ref={revealRef}>
          <span className="eyebrow">Instants choisis</span>
          <h2>Un aperçu de nos mariages</h2>
          <p>
            Chaque union est unique : voici quelques ambiances déjà orchestrées par nos équipes,
            entre lumière naturelle, matières nobles et instants suspendus.
          </p>
        </div>

        <div className="gallery__grid">
          {ITEMS.map((item, index) => (
            <figure
              key={item.label}
              className={`gallery__tile gallery__tile--${item.variant} ${item.tall ? 'gallery__tile--tall' : ''}`}
              style={{ transitionDelay: `${(index % 4) * 60}ms` }}
            >
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
