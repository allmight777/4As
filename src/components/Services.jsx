import { useReveal } from '../hooks/useReveal'
import './Services.css'

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

  return (
    <section id="services" className="section section--ivory-dim services">
      <div className="container">
        <div className="section-head reveal" ref={revealRef}>
          <span className="eyebrow">Nos prestations</span>
          <h2>Des services pensés pour chaque étape</h2>
          <p>
            Que vous souhaitiez nous confier l&apos;ensemble de votre mariage ou seulement
            certains aspects, nos prestations s&apos;assemblent librement selon vos besoins.
          </p>
        </div>

        <div className="services__grid">
          {SERVICES.map((service) => (
            <article key={service.title} className="services__card">
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
