import { useReveal } from '../hooks/useReveal'
import './FloralDivider.css'

// A five-petal bloom made of rotated ellipses around a small center dot —
// stroke-only line art, no fill, in the spirit of an engraved cherry-blossom
// sprig. Original artwork (not traced from any reference image).
function Bloom({ transform }) {
  return (
    <g transform={transform}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse key={angle} cx="0" cy="-3.4" rx="1.7" ry="2.9" transform={`rotate(${angle})`} />
      ))}
      <circle r="0.9" className="floral-divider__dot" />
    </g>
  )
}

export default function FloralDivider() {
  const revealRef = useReveal()

  return (
    <div className="floral-divider reveal" ref={revealRef} aria-hidden="true">
      <span className="floral-divider__line floral-divider__line--left" />
      <svg className="floral-divider__art" viewBox="0 0 220 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <path
            className="floral-divider__branch"
            d="M14,30 C40,14 62,42 88,26 C108,14 132,38 152,24 C168,14 184,26 204,20"
            pathLength="1"
          />
          <g className="floral-divider__bloom" style={{ '--bloom-delay': '0.55s' }}>
            <Bloom transform="translate(64, 22)" />
          </g>
          <g className="floral-divider__bloom" style={{ '--bloom-delay': '0.75s' }}>
            <Bloom transform="translate(126, 30) scale(0.85)" />
          </g>
          <g className="floral-divider__bloom" style={{ '--bloom-delay': '0.95s' }}>
            <g transform="translate(184, 18) rotate(-18)">
              <line x1="0" y1="0" x2="0" y2="9" />
              <ellipse cx="0" cy="-2.4" rx="2.1" ry="3.6" />
            </g>
          </g>
        </g>
      </svg>
      <span className="floral-divider__line floral-divider__line--right" />
    </div>
  )
}
