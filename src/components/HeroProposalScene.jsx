import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { buildStandingFigure, buildScatterCloud } from '../three/proposalParticles'
import './HeroProposalScene.css'

const GOLD = '#b8935f'
const GOLD_SOFT = '#d4b483'

// Y is deliberately low: R3F's <Canvas> wrapper clips to its own box (overflow:hidden),
// so the figures sit low in the camera frame to leave headroom for the speech bubbles
// above their heads — anchoring a bubble near the frustum's top edge gets silently clipped.
const GROOM_START = [-1.05, -0.85, 0]
const BRIDE_START = [1.05, -0.85, 0]
const BRIDE_HUG = [0.3, -0.85, 0.08]
const FIGURE_HEIGHT = 1.85
const HEAD_LOCAL_Y = 0.96 * FIGURE_HEIGHT + 0.22
const ASSEMBLE_DURATION = 2.4

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function easeOutBack(t) {
  const c1 = 1.7
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}
function lerp(a, b, t) {
  return a + (b - a) * t
}
function lerpVec(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

const PHASES = [
  { name: 'idle', duration: 2.2 },
  { name: 'kneel', duration: 1.4 },
  { name: 'ask', duration: 2.6 },
  { name: 'hesitate', duration: 1.4 },
  { name: 'yes', duration: 2.2 },
  { name: 'hug', duration: 2.0 },
  { name: 'return', duration: 1.4 },
]
const PHASE_STARTS = (() => {
  let acc = 0
  return PHASES.map((p) => {
    const start = acc
    acc += p.duration
    return start
  })
})()
const TOTAL_DURATION = PHASE_STARTS[PHASE_STARTS.length - 1] + PHASES[PHASES.length - 1].duration

function phaseAt(t) {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (t >= PHASE_STARTS[i]) {
      return { index: i, name: PHASES[i].name, local: clamp01((t - PHASE_STARTS[i]) / PHASES[i].duration) }
    }
  }
  return { index: 0, name: PHASES[0].name, local: 0 }
}

// Nudges the bubble back inside its clipping ancestor if the projected anchor sits near
// an edge. R3F's <Canvas> wraps everything in an overflow:hidden box the same size as
// .hero__model, so that box (not just the viewport) is the real clip boundary to clamp to.
function EdgeAwareBubble({ text, variant }) {
  const ref = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const bounds = el.closest('.hero__model')?.getBoundingClientRect()
    const margin = 10
    const left = Math.max(margin, bounds ? bounds.left + margin : margin)
    const right = Math.min(window.innerWidth - margin, bounds ? bounds.right - margin : window.innerWidth - margin)
    const top = Math.max(margin, bounds ? bounds.top + margin : margin)
    let dx = 0
    let dy = 0
    if (rect.left < left) dx = left - rect.left
    else if (rect.right > right) dx = right - rect.right
    if (rect.top < top) dy = top - rect.top
    setOffset({ x: dx, y: dy })
  }, [text])

  return (
    <div
      ref={ref}
      className={`hero-speech-bubble ${variant ? `hero-speech-bubble--${variant}` : ''}`}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {text}
    </div>
  )
}

function ParticleFigure({ cloudData, emphasisGetter, reducedMotion, bubbleText, bubbleVariant }) {
  const pointsRef = useRef(null)
  const assembleStart = useRef(null)
  const positions = useMemo(() => cloudData.scatter.slice(), [cloudData])

  useFrame((state) => {
    const geometry = pointsRef.current?.geometry
    if (!geometry) return
    const posAttr = geometry.attributes.position
    const { target, scatter, emphasis, count } = cloudData

    if (reducedMotion) {
      if (!geometry.userData.settled) {
        posAttr.array.set(target)
        posAttr.needsUpdate = true
        geometry.userData.settled = true
      }
      return
    }

    if (assembleStart.current === null) assembleStart.current = state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - assembleStart.current
    const assemble = easeOutCubic(clamp01(elapsed / ASSEMBLE_DURATION))
    const t = state.clock.elapsedTime
    const emphasisAmount = emphasisGetter ? emphasisGetter() : 0

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      const tx = target[idx]
      const ty = target[idx + 1]
      const tz = target[idx + 2]
      const sx = scatter[idx]
      const sy = scatter[idx + 1]
      const sz = scatter[idx + 2]
      const w = emphasis[i]
      const wobble = 0.012 + w * emphasisAmount * 0.055
      const breatheX = Math.sin(t * 0.7 + i * 0.31) * wobble * assemble
      const breatheY = Math.cos(t * 0.55 + i * 0.19) * (wobble * 0.85) * assemble
      posAttr.array[idx] = sx + (tx - sx) * assemble + breatheX
      posAttr.array[idx + 1] = sy + (ty - sy) * assemble + breatheY
      posAttr.array[idx + 2] = sz + (tz - sz) * assemble
    }
    posAttr.needsUpdate = true
  })

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[cloudData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.026} vertexColors sizeAttenuation transparent opacity={0.92} depthWrite={false} />
      </points>
      {bubbleText && (
        <Html position={[0, HEAD_LOCAL_Y, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
          <EdgeAwareBubble text={bubbleText} variant={bubbleVariant} />
        </Html>
      )}
    </>
  )
}

function Confetti({ activeGetter }) {
  const count = 14
  const meshRefs = useRef([])
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + (i % 2 === 0 ? 0.15 : -0.15),
        speed: 0.9 + ((i * 37) % 10) / 10,
        rise: 0.6 + ((i * 53) % 10) / 12,
        color: i % 2 === 0 ? GOLD : GOLD_SOFT,
      })),
    [count],
  )

  useFrame(() => {
    const t = activeGetter()
    const active = t !== null && t < 1.6
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      if (!active) {
        mesh.visible = false
        return
      }
      mesh.visible = true
      const p = particles[i]
      const spread = easeOutCubic(clamp01(t / 0.5))
      const fall = t > 0.5 ? (t - 0.5) * (t - 0.5) * 0.9 : 0
      const fade = 1 - clamp01((t - 0.9) / 0.7)
      const radius = p.speed * 0.9 * spread
      mesh.position.set(
        BRIDE_HUG[0] + Math.cos(p.angle) * radius,
        BRIDE_HUG[1] + 1.15 + p.rise * spread - fall,
        BRIDE_HUG[2] + Math.sin(p.angle) * radius * 0.6,
      )
      const s = 0.045 * fade
      mesh.scale.set(s, s, s)
    })
  })

  return (
    <group>
      {particles.map((p, i) => (
        <mesh key={i} ref={(el) => (meshRefs.current[i] = el)} visible={false}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={p.color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function ProposalGroup({ reducedMotion }) {
  const elapsed = useRef(0)
  const phaseRef = useRef(-1)
  const yesStartRef = useRef(null)
  const groomEmphasisRef = useRef(0)
  const brideEmphasisRef = useRef(0)

  const groomRoot = useRef(null)
  const groomPivot = useRef(null)
  const boxRef = useRef(null)
  const brideRoot = useRef(null)
  const bridePivot = useRef(null)
  const sceneRef = useRef(null)

  const [bubble, setBubble] = useState(null)

  const groomCloud = useMemo(() => {
    const figure = buildStandingFigure({ isDress: false, count: 1300, colorBias: 0.62, height: FIGURE_HEIGHT })
    return { target: figure.positions, colors: figure.colors, emphasis: figure.emphasis, count: figure.count, scatter: buildScatterCloud(figure.count) }
  }, [])
  const brideCloud = useMemo(() => {
    const figure = buildStandingFigure({ isDress: true, count: 1300, colorBias: 0.22, height: FIGURE_HEIGHT })
    return { target: figure.positions, colors: figure.colors, emphasis: figure.emphasis, count: figure.count, scatter: buildScatterCloud(figure.count) }
  }, [])

  const groomEmphasisGetter = () => groomEmphasisRef.current
  const brideEmphasisGetter = () => brideEmphasisRef.current
  const confettiActiveGetter = () => {
    if (yesStartRef.current === null) return null
    return elapsed.current - yesStartRef.current
  }

  useFrame((_, delta) => {
    if (reducedMotion) return
    elapsed.current += delta
    const t = elapsed.current % TOTAL_DURATION
    const phase = phaseAt(t)

    if (phase.index !== phaseRef.current) {
      const wrapped = phase.index < phaseRef.current
      phaseRef.current = phase.index
      if (phase.name === 'ask') setBubble({ who: 'groom', text: 'Veux-tu passer ta vie avec moi ?' })
      else if (phase.name === 'hesitate') setBubble({ who: 'bride', text: '…' })
      else if (phase.name === 'yes') {
        setBubble({ who: 'bride', text: 'Je veux !' })
        yesStartRef.current = elapsed.current
      } else if (phase.name === 'return' || phase.name === 'idle') setBubble(null)
      if (wrapped) yesStartRef.current = null
    }

    groomEmphasisRef.current = phase.name === 'kneel' || phase.name === 'ask' ? 1 : phase.name === 'hesitate' ? 0.35 : 0
    brideEmphasisRef.current =
      phase.name === 'hesitate' ? 0.6 : phase.name === 'yes' || phase.name === 'hug' ? 1 : 0

    let kneelAmount = 0
    let boxScale = 0
    if (phase.name === 'kneel') {
      kneelAmount = easeOutCubic(phase.local)
      boxScale = easeOutCubic(phase.local)
    } else if (phase.name === 'ask' || phase.name === 'hesitate') {
      kneelAmount = 1
      boxScale = 1
    } else if (phase.name === 'yes') {
      const standT = clamp01(phase.local / 0.4)
      kneelAmount = 1 - easeInOutCubic(standT)
      boxScale = 1 - clamp01(phase.local / 0.3)
    }

    if (groomPivot.current) groomPivot.current.rotation.x = lerp(0, 0.5, kneelAmount)
    if (groomRoot.current) {
      const bob = Math.sin(elapsed.current * 1.6) * 0.015
      groomRoot.current.position.y = lerp(GROOM_START[1], GROOM_START[1] - 0.16, kneelAmount) + bob
    }
    if (boxRef.current) {
      const s = Math.max(boxScale, 0.001)
      boxRef.current.scale.setScalar(s)
      boxRef.current.position.y = lerp(0.05, 0.5, kneelAmount)
    }

    let bridePos = BRIDE_START
    if (phase.name === 'yes') {
      const jumpT = clamp01(phase.local / 0.6)
      bridePos = lerpVec(BRIDE_START, BRIDE_HUG, easeOutBack(jumpT))
    } else if (phase.name === 'hug') {
      bridePos = BRIDE_HUG
    } else if (phase.name === 'return') {
      bridePos = lerpVec(BRIDE_HUG, BRIDE_START, easeInOutCubic(phase.local))
    }
    if (brideRoot.current) {
      const bob = phase.name === 'idle' || phase.name === 'ask' || phase.name === 'hesitate' ? Math.sin(elapsed.current * 1.7 + 1) * 0.015 : 0
      brideRoot.current.position.set(bridePos[0], bridePos[1] + bob, bridePos[2])
    }

    if (sceneRef.current) sceneRef.current.rotation.y = Math.sin(elapsed.current * 0.25) * 0.06
  })

  return (
    <group ref={sceneRef}>
      <group ref={groomRoot} position={reducedMotion ? [BRIDE_HUG[0] - 0.55, GROOM_START[1], 0] : GROOM_START}>
        <group ref={groomPivot}>
          <ParticleFigure
            cloudData={groomCloud}
            emphasisGetter={groomEmphasisGetter}
            reducedMotion={reducedMotion}
            bubbleText={!reducedMotion && bubble?.who === 'groom' ? bubble.text : null}
          />
          <group ref={boxRef} position={[0.16, 0.05, 0.32]} scale={0.001}>
            <mesh>
              <boxGeometry args={[0.16, 0.1, 0.14]} />
              <meshStandardMaterial color={GOLD_SOFT} roughness={0.4} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.045, 0.012, 12, 24]} />
              <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
        <mesh position={[0, 0.015, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.42, 24]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.14} />
        </mesh>
      </group>

      <group ref={brideRoot} position={reducedMotion ? BRIDE_HUG : BRIDE_START}>
        <group ref={bridePivot}>
          <ParticleFigure
            cloudData={brideCloud}
            emphasisGetter={brideEmphasisGetter}
            reducedMotion={reducedMotion}
            bubbleText={!reducedMotion && bubble?.who === 'bride' ? bubble.text : null}
            bubbleVariant="bride"
          />
        </group>
        <mesh position={[0, 0.015, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.46, 24]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.14} />
        </mesh>
      </group>

      {!reducedMotion && <Confetti activeGetter={confettiActiveGetter} />}
    </group>
  )
}

export default function HeroProposalScene({ reducedMotion }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.05, 3.7], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none' }}
    >
      <ambientLight intensity={0.6} color="#f7f3ec" />
      <pointLight position={[2.5, 3, 3]} intensity={45} color="#ffd9a0" />
      <pointLight position={[-3, -2, -2]} intensity={12} color="#5c6f5e" />
      <ProposalGroup reducedMotion={reducedMotion} />
    </Canvas>
  )
}
