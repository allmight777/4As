import './AnimatedTitle.css'

function SparkleIcon(props) {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" className="animated-title__spark" {...props}>
      <path
        d="M16 0c1.1 7.8 3.2 9.9 11 11-7.8 1.1-9.9 3.2-11 11-1.1-7.8-3.2-9.9-11-11 7.8-1.1 9.9-3.2 11-11Z"
        fill="var(--gold-soft)"
      />
    </svg>
  )
}

export default function AnimatedTitle({ text, as: Tag = 'h1', className = '' }) {
  const words = text.split(' ')

  return (
    <Tag className={`animated-title ${className}`}>
      <SparkleIcon />
      {words.map((word, index) => (
        // The trailing space is a sibling OUTSIDE the overflow:hidden word
        // span on purpose: that span establishes its own formatting context,
        // which silently trims a space placed inside it, collapsing words
        // together ("mérite" + "son" -> "mériteson").
        <span key={`${word}-${index}`}>
          <span className="animated-title__word">
            <span
              className="animated-title__word-inner"
              style={{ animationDelay: `${0.25 + index * 0.09}s` }}
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
