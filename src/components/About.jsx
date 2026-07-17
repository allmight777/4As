import { useReveal } from '../hooks/useReveal'
import './About.css'

const VALUES = [
  {
    title: 'Écoute avant tout',
    text: "Chaque mariage commence par une conversation, pas par un catalogue. Nous prenons le temps de comprendre qui vous êtes avant de proposer quoi que ce soit.",
  },
  {
    title: 'Exigence artisanale',
    text: "Nous travaillons avec un cercle restreint de prestataires que nous connaissons personnellement, choisis pour leur savoir-faire et leur fiabilité le jour J.",
  },
  {
    title: 'Sérénité garantie',
    text: 'Un interlocuteur unique du premier rendez-vous au dernier toast, pour que vous viviez votre journée sans jamais consulter votre téléphone.',
  },
]

export default function About() {
  const revealRef = useReveal()

  return (
    <section id="apropos" className="section section--ivory about">
      <div className="container about__grid">
        <div className="about__intro reveal" ref={revealRef}>
          <span className="eyebrow">Notre histoire</span>
          <h2>Née d&apos;un mariage qui a failli mal tourner</h2>
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

        <ul className="about__values">
          {VALUES.map((value) => (
            <li key={value.title} className="about__value">
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
