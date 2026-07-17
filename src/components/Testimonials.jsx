import { useReveal } from '../hooks/useReveal'
import RevealHeading from './RevealHeading'
import './Testimonials.css'

// AVERTISSEMENT LICENCE : cette image provient d'une banque premium (Magnific/Freepik).
// À remplacer avant la remise par un visuel libre de droits ou généré par IA.
// Un seul chemin à changer ci-dessous pour la remplacer.
const TESTIMONIALS_IMAGE = '/images/avis-couple.jpg'

const TESTIMONIALS = [
  {
    names: 'Camille & Julien',
    date: 'Mariage en septembre, Beaujolais',
    quote:
      "Nous avions peur de perdre le contrôle en confiant notre mariage à une agence. C'est tout l'inverse qui s'est produit : nous avons enfin pu profiter, en sachant que tout était entre de bonnes mains.",
  },
  {
    names: 'Léa & Sophie',
    date: 'Mariage en juin, Côte varoise',
    quote:
      "L'équipe a su traduire en décor ce qu'on n'arrivait même pas à décrire nous-mêmes. Nos invités en parlent encore huit mois après.",
  },
  {
    names: 'Nora & Adam',
    date: 'Mariage en mai, Lyon',
    quote:
      "Coordination millimétrée le jour J, aucun imprévu visible de notre côté alors qu'on nous a raconté ensuite trois petits couacs gérés en coulisses. Exactement ce qu'on voulait.",
  },
  {
    names: 'Inès & Karim',
    date: 'Mariage en octobre, Annecy',
    quote:
      "Le simulateur de budget nous a permis de comprendre où mettre nos priorités avant même le premier rendez-vous. Un vrai gain de temps et de sérénité.",
  },
]

export default function Testimonials() {
  const portraitRef = useReveal()
  const headRef = useReveal()
  const gridRef = useReveal()

  return (
    <section id="avis" className="section section--ivory testimonials">
      <div className="container testimonials__layout">
        <div className="testimonials__portrait reveal" ref={portraitRef}>
          <img src={TESTIMONIALS_IMAGE} alt="Illustration d'un couple de mariés" loading="lazy" />
        </div>

        <div className="testimonials__side">
          <div className="section-head reveal" ref={headRef}>
            <span className="eyebrow">Ils nous ont fait confiance</span>
            <RevealHeading text="Des couples, des histoires, des jours J réussis" />
          </div>

          <div className="testimonials__grid reveal-group" ref={gridRef}>
            {TESTIMONIALS.map((item) => (
              <blockquote key={item.names} className="testimonials__card">
                <p>&laquo; {item.quote} &raquo;</p>
                <footer>
                  <span className="testimonials__names">{item.names}</span>
                  <span className="testimonials__date">{item.date}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
