import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">
            Ever After <em>Events</em>
          </span>
          <p>De la demande au jour J, nous tissons le fil de votre histoire.</p>
        </div>

        <nav className="footer__links" aria-label="Liens du site">
          <a href="/#apropos">À propos</a>
          <a href="/#services">Services</a>
          <a href="/#budget">Simulateur budget</a>
          <a href="/#galerie">Galerie</a>
          <a href="/#avis">Avis</a>
          <a href="/#contact">Contact</a>
        </nav>

        <div className="footer__contact">
          <a href="mailto:bonjour@everafterevents.bj">bonjour@everafterevents.bj</a>
          <a href="tel:+22901900000">+229 01 90 00 00 00</a>
          <span>Cotonou &amp; partout au Bénin</span>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>&copy; {year} Ever After Events. Tous droits réservés.</p>
        <p>Projet réalisé dans le cadre d&apos;un challenge de développement en 24h.</p>
      </div>
    </footer>
  )
}
