import { useEffect, useState } from 'react'
import HeroProposalScene from './HeroProposalScene'
import AnimatedTitle from './AnimatedTitle'
import { isWebGLAvailable } from '../three/webgl'
import './Hero.css'

export default function Hero() {
  const [webglOk, setWebglOk] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setWebglOk(isWebGLAvailable())
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const handler = (e) => setReducedMotion(e.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  return (
    <section id="hero" className="hero">
      <div className="container hero__grid">
        <div className="hero__text">
          <span className="eyebrow">Wedding planning sur mesure</span>
          <AnimatedTitle
            className="hero__title"
            text="Chaque histoire d'amour mérite son chapitre le plus beau"
          />
          <p className="hero__subtitle">
            Ever After Events imagine et orchestre votre mariage de bout en bout, de la première
            idée griffonnée sur un carnet jusqu&apos;au dernier au revoir sur la piste de danse.
          </p>
          <div className="hero__actions">
            <a className="btn btn-primary" href="#contact">
              Demander un devis
            </a>
            <a className="btn btn-ghost" href="#services">
              Découvrir nos services
            </a>
          </div>
        </div>

        <div className="hero__model" aria-hidden="true">
          {webglOk ? (
            <HeroProposalScene reducedMotion={reducedMotion} />
          ) : (
            <div className="hero__model-fallback" />
          )}
        </div>
      </div>

      <div className="hero__scroll-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}
