import { useEffect, useState } from 'react'
import './Navbar.css'

const LINKS = [
  { href: '/#apropos', label: 'À propos' },
  { href: '/#services', label: 'Services' },
  { href: '/#budget', label: 'Simulateur budget' },
  { href: '/#galerie', label: 'Galerie' },
  { href: '/#avis', label: 'Avis' },
  { href: '/#contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <a href="/" className="navbar__brand">
          Ever After <span>Events</span>
        </a>

        <nav className="navbar__links" aria-label="Navigation principale">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a className="btn btn-primary navbar__cta" href="/#contact">
          Demander un devis
        </a>

        <button
          type="button"
          className="navbar__toggle"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open ? (
        <nav className="navbar__mobile" aria-label="Navigation mobile">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a className="btn btn-primary" href="/#contact" onClick={() => setOpen(false)}>
            Demander un devis
          </a>
        </nav>
      ) : null}
    </header>
  )
}
