import { useReveal } from '../hooks/useReveal'
import './RevealHeading.css'

export default function RevealHeading({ text, as: Tag = 'h2', className = '' }) {
  const ref = useReveal()
  const words = text.split(' ')

  return (
    <Tag ref={ref} className={`reveal-heading ${className}`}>
      {words.map((word, index) => (
        // Space kept OUTSIDE the overflow:hidden word span — see AnimatedTitle
        // for why a space placed inside it gets silently trimmed.
        <span key={`${word}-${index}`}>
          <span className="reveal-heading__word">
            <span
              className="reveal-heading__word-inner"
              style={{ transitionDelay: `${index * 0.07}s` }}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
