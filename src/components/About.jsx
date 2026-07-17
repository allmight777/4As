import { useReveal } from '../hooks/useReveal'
import RevealHeading from './RevealHeading'
import './About.css'

// AVERTISSEMENT LICENCE : ces images proviennent de banques premium (Vecteezy/Magnific)
// ou portent un filigrane visible (Dreamstime, histoire-2). À remplacer avant la remise
// par des visuels libres de droits ou générés par IA. Un seul chemin par entrée à changer
// ci-dessous pour les remplacer.
const VALUES = [
  {
    title: 'Écoute avant tout',
    text: "Chaque mariage commence par une conversation, pas par un catalogue. Nous prenons le temps de comprendre qui vous êtes avant de proposer quoi que ce soit. Le premier rendez-vous se fait autour d'un café, sans aucun engagement : c'est l'occasion de poser toutes vos questions, même celles qui vous semblent trop petites pour être posées. Le budget, lui, est abordé sans tabou dès cette première rencontre, pour que vous avanciez ensuite en toute confiance.",
    image: '/images/histoire-1.jpg',
  },
  {
    title: 'Exigence artisanale',
    text: "Nous travaillons avec un cercle restreint de prestataires que nous connaissons personnellement, choisis pour leur savoir-faire et leur fiabilité le jour J. Chacun a fait ses preuves sur de vrais mariages, dans de vraies conditions, souvent imparfaites. Aucun n'est référencé contre commission : notre sélection privilégie la constance et l'exigence plutôt que l'effet, pour que la qualité promise soit celle que vous retrouverez le jour venu.",
    // ATTENTION : cette image porte un filigrane Dreamstime visible — à remplacer en priorité
    // avant la remise (non professionnel + problème de droits évident pour un jury).
    image: '/images/histoire-2.jpg',
  },
  {
    title: 'Sérénité garantie',
    text: "Un interlocuteur unique du premier rendez-vous au dernier toast, pour que vous viviez votre journée sans jamais consulter votre téléphone. Un fil de communication clair, des points d'étape réguliers pour avancer sans stress, et un plan B pensé pour chaque poste critique — météo, prestataire défaillant, imprévu de dernière minute. Notre objectif : que vous soyez, ce jour-là, de simples invités d'honneur de votre propre mariage.",
    image: '/images/histoire-3.jpg',
  },
]

export default function About() {
  const revealRef = useReveal()
  const valuesRef = useReveal()

  return (
    <section id="apropos" className="section section--ivory about">
      <div className="container">
        <div className="about__intro reveal" ref={revealRef}>
          <span className="eyebrow">Notre histoire</span>
          <RevealHeading text="Née d'un mariage qui a failli mal tourner" />
          <p>
            Ever After Events est née en 2018, le lendemain d&apos;un mariage où tout avait été
            confié à trop de mains différentes : traiteur en retard, fleuriste injoignable,
            mariés livrés à eux-mêmes. Notre fondatrice, alors témoin de la mariée, a promis
            que plus jamais un couple ne devrait vivre son plus beau jour dans le stress.
          </p>
          <p>
            Depuis, notre agence accompagne chaque année une trentaine de couples partout en
            France, avec la conviction qu&apos;un mariage réussi tient à un équilibre précis
            entre planification rigoureuse et liberté laissée à l&apos;émotion.
          </p>
        </div>

        <ul className="about__values reveal-group" ref={valuesRef}>
          {VALUES.map((value) => (
            <li key={value.title} className="about__value">
              <div className="about__value-text">
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
              <div className="about__value-image">
                <img src={value.image} alt="" loading="lazy" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
