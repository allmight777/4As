import DividerFrame from './DividerFrame'
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

function Bud({ transform }) {
  return (
    <g transform={transform}>
      <ellipse cx="0" cy="-2.2" rx="2" ry="3.3" />
      <ellipse cx="0" cy="-2.2" rx="2" ry="3.3" transform="rotate(34)" />
      <circle r="0.8" className="floral-divider__dot" />
    </g>
  )
}

// Three overlapping stems (instead of one) feeding a cluster of seven blooms —
// deliberately fuller than a single sprig so the divider reads as an actual
// floral centerpiece rather than a faint accent.
const BLOOMS = [
  { Cmp: Bloom, transform: 'translate(58, 34) scale(0.8)', delay: 1.3 },
  { Cmp: Bloom, transform: 'translate(105, 15) scale(0.95)', delay: 1.42 },
  { Cmp: Bloom, transform: 'translate(150, 34) scale(1.2)', delay: 1.54 },
  { Cmp: Bloom, transform: 'translate(170, 14) scale(0.85)', delay: 1.66 },
  { Cmp: Bloom, transform: 'translate(196, 34) scale(0.95)', delay: 1.78 },
  { Cmp: Bud, transform: 'translate(133, 58) rotate(-12) scale(0.9)', delay: 1.9 },
  { Cmp: Bud, transform: 'translate(224, 30) rotate(16) scale(0.75)', delay: 2.02 },
]

const ART = (
  <svg className="floral-divider__art" viewBox="0 0 300 76" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="0.85" strokeLinecap="round">
      <path
        className="floral-divider__branch"
        d="M8,40 C50,16 90,52 150,34 C210,16 250,50 292,26"
        pathLength="1"
      />
      <path
        className="floral-divider__branch floral-divider__branch--2"
        d="M92,36 C104,16 132,6 168,16"
        pathLength="1"
      />
      <path
        className="floral-divider__branch floral-divider__branch--3"
        d="M118,38 C132,58 158,64 200,50"
        pathLength="1"
      />

      {BLOOMS.map(({ Cmp, transform, delay }, i) => (
        <g key={i} className="floral-divider__bloom" style={{ '--bloom-delay': `${delay}s` }}>
          <Cmp transform={transform} />
        </g>
      ))}
    </g>
  </svg>
)

export default function FloralDivider() {
  return <DividerFrame art={ART} className="floral-divider" />
}
