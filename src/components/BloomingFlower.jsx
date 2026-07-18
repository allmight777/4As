import './BloomingFlower.css'

// A single large flower, line-art in the same spirit as FloralDivider/HeartDivider.
// Unlike those (scroll-revealed), this one plays its bloom-in animation on mount —
// the mobile nav panel only renders this component while open, so mounting IS the
// "menu just opened" moment.
const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

function Petal({ angle, delay }) {
  return (
    <g transform={`rotate(${angle})`}>
      <g className="blooming-flower__petal" style={{ '--petal-delay': `${delay}s` }}>
        <ellipse cx="0" cy="-26" rx="9" ry="20" />
      </g>
    </g>
  )
}

export default function BloomingFlower({ className = '' }) {
  return (
    <svg
      className={`blooming-flower ${className}`.trim()}
      viewBox="0 0 140 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path className="blooming-flower__stem" d="M70,216 C67,168 73,132 70,98" pathLength="1" />
      <path className="blooming-flower__leaf" d="M70,158 C56,154 47,160 43,173 C57,175 68,168 70,158 Z" />
      <path
        className="blooming-flower__leaf blooming-flower__leaf--right"
        d="M70,178 C84,172 93,178 97,191 C83,194 72,187 70,178 Z"
      />
      <g className="blooming-flower__bloom" transform="translate(70,84)">
        {PETAL_ANGLES.map((angle, i) => (
          <Petal key={angle} angle={angle} delay={0.045 * i} />
        ))}
        <circle r="9" className="blooming-flower__center" />
      </g>
    </svg>
  )
}
