import { useReveal } from '../hooks/useReveal'
import './DividerFrame.css'

// Shared frame for the site's scroll-reveal section dividers: two fading
// lines flanking a central SVG motif. FloralDivider and HeartDivider both
// use this — only the `art` (the SVG motif itself) and its own trace/bloom
// animation differ between variants.
export default function DividerFrame({ art, className = '' }) {
  const revealRef = useReveal()

  return (
    <div className={`divider-frame reveal ${className}`} ref={revealRef} aria-hidden="true">
      <span className="divider-frame__line divider-frame__line--left" />
      {art}
      <span className="divider-frame__line divider-frame__line--right" />
    </div>
  )
}
