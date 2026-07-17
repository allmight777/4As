import { useRef } from 'react'

export default function TiltCard({ as: Tag = 'div', className = '', children }) {
  const ref = useRef(null)

  function handlePointerMove(event) {
    const node = ref.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = node.getBoundingClientRect()
    const px = (event.clientX - bounds.left) / bounds.width - 0.5
    const py = (event.clientY - bounds.top) / bounds.height - 0.5
    node.style.transform = `perspective(700px) rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg) translateY(-4px)`
  }

  function handlePointerLeave() {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <Tag
      ref={ref}
      className={`tilt-card ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </Tag>
  )
}
