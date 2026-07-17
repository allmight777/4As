import { useEffect, useRef, useState } from 'react'
import HeroScene from './HeroScene'
import { isWebGLAvailable } from '../three/webgl'
import './Hero.css'

export default function Hero() {
  const sectionRef = useRef(null)
  const scrollRef = useRef(0)
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    setWebglOk(isWebGLAvailable())
  }, [])

  useEffect(() => {
    let frame = null
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = null
        const node = sectionRef.current
        if (!node) return
        const rect = node.getBoundingClientRect()
        const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.85)))
        scrollRef.current = progress
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="hero" className="hero" ref={sectionRef}>
      <div className="hero__canvas">
        {webglOk ? <HeroScene scrollRef={scrollRef} /> : <div className="hero__fallback" />}
      </div>

      <div className="hero__overlay">
        <div className="container hero__content">
          <span className="eyebrow">Wedding planning sur mesure</span>
          <h1 className="hero__title">
            Chaque histoire d&apos;amour
            <br />
            mérite son chapitre le plus beau
          </h1>
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
      </div>

      <div className="hero__scroll-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}
