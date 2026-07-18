import DividerFrame from './DividerFrame'
import './HeartDivider.css'

// Simple stroke-only heart outline, closed with two mirrored cubic curves —
// original artwork, not traced from any reference. `pathLength="1"` lets the
// CSS trace animation use 0..1 regardless of the path's actual geometry.
function HeartOutline({ transform, className = '' }) {
  return (
    <path
      className={`heart-divider__heart-path ${className}`}
      transform={transform}
      d="M0,7 C-6,0 -10,-6 -5,-10 C-1,-13 0,-9 0,-7 C0,-9 1,-13 5,-10 C10,-6 6,0 0,7 Z"
      pathLength="1"
    />
  )
}

// Four hearts of varying size/rotation, deliberately off-grid (not aligned
// on a straight row) so the cluster reads as a small loose composition
// rather than a repeated stamp. Alternates gold/rose for variety against
// the all-gold floral divider.
const HEARTS = [
  { transform: 'translate(115, 42) scale(1.3)', tone: 'gold', traceDelay: 0.2 },
  { transform: 'translate(150, 24) scale(0.85) rotate(-10)', tone: 'rose', traceDelay: 0.45 },
  { transform: 'translate(182, 46) scale(1.05) rotate(8)', tone: 'gold', traceDelay: 0.7 },
  { transform: 'translate(206, 26) scale(0.65) rotate(-16)', tone: 'rose', traceDelay: 0.95 },
]

const TRACE_DURATION = 0.9

const ART = (
  <svg className="heart-divider__art" viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {HEARTS.map(({ transform, tone, traceDelay }, i) => (
      <g
        key={i}
        className="heart-divider__heart"
        style={{
          '--heart-delay': `${traceDelay}s`,
          '--pulse-delay': `${traceDelay + TRACE_DURATION}s`,
        }}
      >
        <HeartOutline transform={transform} className={`heart-divider__heart-path--${tone}`} />
      </g>
    ))}
  </svg>
)

export default function HeartDivider() {
  return <DividerFrame art={ART} className="heart-divider" />
}
