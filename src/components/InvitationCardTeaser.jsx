import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import './InvitationCardTeaser.css'

export default function InvitationCardTeaser() {
  const revealRef = useReveal()

  return (
    <div className="invitation-teaser">
      <div className="container invitation-teaser__inner reveal" ref={revealRef}>
        <div className="invitation-teaser__text">
          <span className="eyebrow">Nouveau</span>
          <h3>Faites-vous plaisir : générez votre carte d&apos;invitation en quelques clics</h3>
          <p>Trois modèles élégants, votre texte, votre photo — et un PDF prêt à imprimer.</p>
        </div>
        <Link to="/carte-invitation" className="btn btn-primary invitation-teaser__cta">
          Essayer
        </Link>
      </div>
    </div>
  )
}
