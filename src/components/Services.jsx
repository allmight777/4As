import { useReveal } from '../hooks/useReveal'
import RevealHeading from './RevealHeading'
import TiltCard from './TiltCard'
import './Services.css'

// AVERTISSEMENT LICENCE : cette image provient d'une banque premium (Vecteezy).
// À remplacer avant la remise par un visuel libre de droits ou généré par IA.
// Un seul chemin à changer ci-dessous pour la remplacer.
const SERVICES_IMAGE = '/images/services-couple-coeur.jpg'

const SERVICES = [
  {
    title: 'Organisation complète',
    text: "Du choix du lieu à la liste des invités, nous prenons en charge l'intégralité de la préparation, en restant à l'écoute de votre budget et de vos envies.",
  },
  {
    title: 'Coordination jour J',
    text: "Une équipe présente dès l'aube pour orchestrer chaque prestataire, gérer les imprévus et vous laisser profiter pleinement de votre journée.",
  },
  {
    title: 'Décoration & scénographie',
    text: 'Une direction artistique cohérente, du mobilier aux compositions florales, pensée pour raconter votre histoire dans chaque détail.',
  },
  {
    title: 'Traiteur & art de la table',
    text: 'Une sélection de chefs partenaires pour un menu sur mesure, accords mets et vins compris, adapté à toutes les envies et contraintes.',
  },
  {
    title: 'Photo & vidéo',
    text: 'Des duos de photographes et vidéastes triés sur le volet pour capturer la sincérité de vos émotions, sans jamais s’imposer.',
  },
  {
    title: 'Animation & musique',
    text: "DJ, groupe live, cérémonie laïque animée : nous composons l'ambiance sonore qui vous ressemble, du cocktail jusqu'au dernier morceau.",
  },
]

export default function Services() {
  const revealRef = useReveal()
  const gridRef = useReveal()

  return (
    <section id="services" className="section section--ivory-dim services">
      <div className="container">
        <div className="services__intro reveal" ref={revealRef}>
          <div className="section-head">
            <span className="eyebrow">Nos prestations</span>
            <RevealHeading text="Des services pensés pour chaque étape" />
            <p>
              Que vous souhaitiez nous confier l&apos;ensemble de votre mariage ou seulement
              certains aspects, nos prestations s&apos;assemblent librement selon vos besoins.
            </p>
          </div>

          <div className="services__angel" aria-hidden="true">
            <img src="/images/service/Cupid.gif" alt="" />
          </div>
        </div>

        <div className="services__grid reveal-group" ref={gridRef}>
          {SERVICES.map((service) => (
            <TiltCard as="article" key={service.title} className="services__card">
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}