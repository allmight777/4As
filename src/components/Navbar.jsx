import { useState } from 'react'
import { Link } from 'react-router-dom'
import HeartIcon from './icons/HeartIcon'
import './Navbar.css'

const LINKS = [
  { href: '/#apropos', label: 'À propos' },
  { href: '/carte-invitation', label: 'Créer ma carte', isRoute: true },
  { href: '/#budget', label: 'Simulateur budget' },
  { href: '/#planning', label: 'Rétroplanning' },
  { href: '/#galerie', label: 'Galerie' },
  { href: '/#avis', label: 'Avis' },
  { href: '/#contact', label: 'Contact' },
]

function NavLink({ href, label, isRoute, onClick, className }) {
  if (isRoute) {
    return (
      <Link to={href} onClick={onClick} className={className}>
        {label}
      </Link>
    )
  }
  return (
    <a href={href} onClick={onClick} className={className}>
      {label}
    </a>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <a href="/" className="navbar__brand">
          Ever After <span>Events</span>
          <HeartIcon className="navbar__brand-heart" />
        </a>

        <nav className="navbar__links" aria-label="Navigation principale">
          {LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} isRoute={link.isRoute} />
          ))}
        </nav>

        <a className="btn btn-primary navbar__cta" href="/#services">
          Services
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
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isRoute={link.isRoute}
              onClick={() => setOpen(false)}
            />
          ))}
          <a className="btn btn-primary" href="/#services" onClick={() => setOpen(false)}>
            Services
          </a>
        </nav>
      ) : null}
    </header>
  )
}
