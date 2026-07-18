import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { CanvasTexture } from 'three'
import { buildStandingFigure, seatFigure, buildScatterCloud } from '../three/proposalParticles'
import { buildHeartOutline } from '../three/heartShape'
import { buildMirror, buildArch } from '../three/propShapes'
import { buildAngel } from '../three/angelParticles'
import './HeroProposalScene.css'

const GOLD = '#b8935f'
const GOLD_SOFT = '#d4b483'
const VELVET = '#3a3550'
const ROSE = '#e8b4c8'

// Heart particle palettes, one per scenario. Each is a light->deep gradient;
// the component resolves live per-particle colors from these every frame
// (see GiantHeart) so it can crossfade smoothly between scenarios.
const HEART_PALETTES = {
  rose: { light: [0.949, 0.663, 0.769], deep: [0.91, 0.498, 0.667] }, // #f2a9c4 -> #e87faa
  gold: { light: [0.831, 0.706, 0.514], deep: [0.722, 0.576, 0.373] }, // gold-soft -> gold
  silver: { light: [0.933, 0.941, 0.953], deep: [0.851, 0.867, 0.89] }, // near-white -> #d9dde3
}

// Y is deliberately low: R3F's <Canvas> wrapper clips to its own box (overflow:hidden),
// so the figures sit low in the camera frame to leave headroom for the speech bubbles
// above their heads — anchoring a bubble near the frustum's top edge gets silently clipped.
const FIGURE_HEIGHT = 1.85
const HEAD_LOCAL_Y = 0.96 * FIGURE_HEIGHT + 0.22
const ASSEMBLE_DURATION = 2.4
const MORPH_DURATION = 1.8 // disperse-then-reform duration for an inter-scenario pose swap
const TRANSITION_DURATION = 1.8
const PALETTE_FADE_DURATION = 2.0

// Root/world slots for each actor across the three scenarios. Feet stay on
// the same y = -0.85 floor line so figures share one consistent scale.
// Kept fairly close together (not spread wide) so the couple's combined
// silhouette is closer to as tall as it is wide — a wide silhouette forces a
// wide heart, which then can't fill a tall container without wasting space
// above/below (the fit-scale is bottlenecked by whichever axis is tighter).
const SLOTS = {
  groomAsk: [-0.7, -0.85, 0],
  brideAsk: [0.7, -0.85, 0],
  brideHug: [0.2, -0.85, 0.08],
  maquilleuse: [0.4, -0.85, 0.2],
  brideMirror: [-0.45, -0.85, 0.1],
  groomCeremony: [-0.4, -0.85, 0],
  brideCeremony: [0.4, -0.85, 0],
}
const MIRROR_POS = [-1.15, -0.85, -0.55]
const ARCH_POS = [0, -0.85, -0.45]

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
function lerpColor(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

// Bubbles must stay readable: floor of 3.5s, roughly 80ms per character, capped
// so a very long line doesn't overstay its welcome.
function holdTime(text) {
  return Math.max(3.5, Math.min(6, text.length * 0.08))
}

// Three scenarios, looping. `who: 'A'` is always the standing "groom/helper"
// particle figure, `who: 'B'` is always the bride figure (whichever pose she's
// currently in) — bubble anchoring is generic across scenarios this way.
const SCENARIOS = [
  {
    key: 'proposal',
    heartPalette: 'rose',
    phases: [
      { name: 'p0-idle', duration: 1.6 },
      {
        name: 'p0-line1',
        bubble: { who: 'A', text: 'Depuis le jour où je t’ai rencontrée, chaque matin a un goût de promesse...' },
      },
      { name: 'p0-line2', bubble: { who: 'A', text: 'Tu es la personne avec qui je veux construire, rire, et vieillir.' } },
      { name: 'p0-ask', bubble: { who: 'A', text: 'Veux-tu m’épouser ?' } },
      { name: 'p0-hesitate', bubble: { who: 'B', text: '…' }, minDuration: 2 },
      { name: 'p0-yes', bubble: { who: 'B', text: 'Oui... mille fois oui !' }, minDuration: 2.4 },
      { name: 'p0-hug', duration: 2.0 },
    ],
  },
  {
    key: 'prep',
    heartPalette: 'gold',
    phases: [
      { name: 'p1-idle', duration: 1.4 },
      { name: 'p1-line1', bubble: { who: 'A', text: 'Regardez vers le haut, je termine votre regard...' } },
      { name: 'p1-line2', bubble: { who: 'B', text: 'J’ai attendu ce jour toute ma vie, et maintenant j’ai le trac.' } },
      { name: 'p1-line3', bubble: { who: 'A', text: 'C’est le plus beau des tracs. Respirez, tout est prêt.' } },
      { name: 'p1-line4', bubble: { who: 'B', text: 'C’est vraiment moi ?' } },
      { name: 'p1-line5', bubble: { who: 'A', text: 'C’est vous. Rayonnante.' } },
      { name: 'p1-hold', duration: 1.0 },
    ],
  },
  {
    key: 'ceremony',
    heartPalette: 'silver',
    phases: [
      { name: 'p2-idle', duration: 1.4 },
      {
        name: 'p2-officiant-intro',
        bubble: { who: 'C', text: 'Nous sommes réunis pour célébrer l’union de deux histoires devenues une seule.' },
      },
      { name: 'p2-vow-a', bubble: { who: 'A', text: 'Je promets de t’aimer dans la joie comme dans les tempêtes.' } },
      { name: 'p2-vow-b', bubble: { who: 'B', text: 'Je promets d’être ton refuge et ta complice, chaque jour.' } },
      { name: 'p2-officiant-outro', bubble: { who: 'C', text: 'Vous pouvez vous embrasser.' } },
      { name: 'p2-hold', duration: 1.6 },
    ],
  },
]

// Resolve each phase's real duration once at module load: bubble-carrying
// phases get the reading-comfort hold time, others keep their fixed beat.
SCENARIOS.forEach((scenario) => {
  scenario.phases.forEach((phase) => {
    if (phase.bubble) phase.duration = Math.max(phase.minDuration || 0, holdTime(phase.bubble.text))
  })
  let acc = 0
  scenario.starts = scenario.phases.map((p) => {
    const start = acc
    acc += p.duration
    return start
  })
  scenario.totalDuration = acc
})

function phaseAt(scenario, t) {
  const { phases, starts } = scenario
  for (let i = phases.length - 1; i >= 0; i--) {
    if (t >= starts[i]) {
      return { index: i, name: phases[i].name, local: clamp01((t - starts[i]) / phases[i].duration), bubble: phases[i].bubble || null }
    }
  }
  return { index: 0, name: phases[0].name, local: 0, bubble: phases[0].bubble || null }
}

// Whether a scenario-locked prop (mirror = scenario 1, arch = scenario 2) is
// visible right now, with a soft crossfade during inter-scenario transitions.
function propOpacityFor(targetIdx, mode, activeIdx, nextIdx, tau) {
  if (mode === 'scene') return activeIdx === targetIdx ? 1 : 0
  if (activeIdx === targetIdx) return 1 - tau
  if (nextIdx === targetIdx) return tau
  return 0
}

const EDGE_MARGIN = 12

// Nudges the bubble back inside the HERO CANVAS's own box (12px minimum
// margin) if the projected anchor sits near an edge, and shifts the little
// pointer arrow back the other way so it keeps aiming at the character
// instead of drifting off-center with the bubble. Clamping against the full
// browser window (as this used to) was too loose on desktop, where the
// canvas is only one column of the hero grid — a bubble could sit inside
// the window yet still bleed past the canvas's own right/bottom edge into
// the text column or below the fold.
function EdgeAwareBubble({ text, variant }) {
  const ref = useRef(null)
  const appliedOffset = useRef({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [tailShift, setTailShift] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const container = el.closest('.hero__model')

    let rafId
    appliedOffset.current = { x: 0, y: 0 }
    setOffset({ x: 0, y: 0 })
    setTailShift(0)

    // drei's Html recomputes its canvas-relative transform every R3F frame (its own
    // rAF loop, decoupled from this effect), and the anchor itself can keep moving
    // (breathing, the "jump into arms" beat) — so correct continuously rather than
    // measuring once, subtracting back out whatever we last applied via the CSS
    // transform below to recover drei's "natural" position each time.
    function tick() {
      const rect = el.getBoundingClientRect()
      const bounds = container ? container.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
      const naturalLeft = rect.left - appliedOffset.current.x
      const naturalRight = rect.right - appliedOffset.current.x
      const naturalTop = rect.top - appliedOffset.current.y
      const naturalBottom = rect.bottom - appliedOffset.current.y
      const left = bounds.left + EDGE_MARGIN
      const right = bounds.right - EDGE_MARGIN
      const top = bounds.top + EDGE_MARGIN
      const bottom = bounds.bottom - EDGE_MARGIN
      let dx = 0
      let dy = 0
      if (naturalLeft < left) dx = left - naturalLeft
      else if (naturalRight > right) dx = right - naturalRight
      if (naturalTop < top) dy = top - naturalTop
      else if (naturalBottom > bottom) dy = bottom - naturalBottom
      if (dx !== appliedOffset.current.x || dy !== appliedOffset.current.y) {
        appliedOffset.current = { x: dx, y: dy }
        setOffset({ x: dx, y: dy })
        const halfWidth = rect.width / 2
        setTailShift(Math.max(-halfWidth + 14, Math.min(halfWidth - 14, -dx)))
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [text])

  return (
    <div
      ref={ref}
      className={`hero-speech-bubble ${variant ? `hero-speech-bubble--${variant}` : ''}`}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, '--tail-shift': `${tailShift}px` }}
    >
      {text}
    </div>
  )
}

// Renders one actor's particle cloud. `cloudData` can be swapped for a
// different pose (e.g. bride standing <-> seated) — swapping the `target`
// reference triggers a disperse-then-reform morph instead of an instant snap,
// reusing the same scatter cloud as the initial assemble-on-mount animation.
function ParticleFigure({ cloudData, emphasisGetter, reducedMotion, bubbleText, bubbleVariant, headOffsetY = 0 }) {
  const pointsRef = useRef(null)
  const assembleStart = useRef(null)
  const prevTargetRef = useRef(cloudData.target)
  const morphFromRef = useRef(null)
  const morphStartRef = useRef(null)
  const positions = useMemo(() => cloudData.scatter.slice(), []) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state) => {
    const geometry = pointsRef.current?.geometry
    if (!geometry) return
    const posAttr = geometry.attributes.position
    const { target, scatter, emphasis, count } = cloudData

    if (reducedMotion) {
      if (prevTargetRef.current !== target || !geometry.userData.settled) {
        posAttr.array.set(target)
        posAttr.needsUpdate = true
        geometry.userData.settled = true
        prevTargetRef.current = target
      }
      return
    }

    const t = state.clock.elapsedTime
    const emphasisAmount = emphasisGetter ? emphasisGetter() : 0

    if (prevTargetRef.current !== target) {
      morphFromRef.current = Float32Array.from(posAttr.array)
      morphStartRef.current = t
      prevTargetRef.current = target
    }

    if (morphStartRef.current !== null) {
      const tau = clamp01((t - morphStartRef.current) / MORPH_DURATION)
      for (let i = 0; i < count; i++) {
        const idx = i * 3
        let px
        let py
        let pz
        if (tau < 0.35) {
          const b = easeOutCubic(tau / 0.35)
          px = lerp(morphFromRef.current[idx], scatter[idx], b)
          py = lerp(morphFromRef.current[idx + 1], scatter[idx + 1], b)
          pz = lerp(morphFromRef.current[idx + 2], scatter[idx + 2], b)
        } else {
          const b = easeOutCubic((tau - 0.35) / 0.65)
          px = lerp(scatter[idx], target[idx], b)
          py = lerp(scatter[idx + 1], target[idx + 1], b)
          pz = lerp(scatter[idx + 2], target[idx + 2], b)
        }
        posAttr.array[idx] = px
        posAttr.array[idx + 1] = py
        posAttr.array[idx + 2] = pz
      }
      posAttr.needsUpdate = true
      if (tau >= 1) morphStartRef.current = null
      return
    }

    if (assembleStart.current === null) assembleStart.current = t
    const elapsed = t - assembleStart.current
    const assemble = easeOutCubic(clamp01(elapsed / ASSEMBLE_DURATION))

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
        <Html position={[0, HEAD_LOCAL_Y + headOffsetY, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
          <EdgeAwareBubble key={bubbleText} text={bubbleText} variant={bubbleVariant} />
        </Html>
      )}
    </>
  )
}

function Confetti({ activeGetter, anchorGetter }) {
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
    const anchor = anchorGetter()
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
        anchor[0] + Math.cos(p.angle) * radius,
        anchor[1] + 1.15 + p.rise * spread - fall,
        anchor[2] + Math.sin(p.angle) * radius * 0.6,
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

function paletteColorAt(paletteKey, blend) {
  const p = HEART_PALETTES[paletteKey]
  return lerpColor(p.light, p.deep, blend)
}

// Permanent, continuous, and color-crossfading between scenarios. Each
// particle scintillates independently (per-particle brightness twinkle,
// desynced phase/speed) and the whole heart pulses briefly at emotional
// peaks (proposal acceptance, "pour toujours").
function GiantHeart({ pulseGetter, paletteGetter, reducedMotion, heartCloud, heartCenter }) {
  const groupRef = useRef(null)
  const materialRef = useRef(null)
  const colorAttrRef = useRef(null)
  const liveColors = useMemo(() => new Float32Array(heartCloud.count * 3), [heartCloud])
  const sparkle = useMemo(
    () => Array.from({ length: heartCloud.count }, () => ({ phase: Math.random() * Math.PI * 2, speed: 1.2 + Math.random() * 2.2 })),
    [heartCloud],
  )

  useFrame((state) => {
    if (!groupRef.current || !materialRef.current || !colorAttrRef.current) return
    const t = state.clock.elapsedTime
    const { from, to, mix } = paletteGetter ? paletteGetter() : { from: 'rose', to: 'rose', mix: 0 }

    for (let i = 0; i < heartCloud.count; i++) {
      const b = heartCloud.blend[i]
      const c1 = paletteColorAt(from, b)
      const c2 = paletteColorAt(to, b)
      // Tight twinkle range (0.78-1.0, not down to near-black): small point
      // sprites already lose saturation to edge antialiasing against the dark
      // background, so a deep dim would read as gray rather than "sparkle".
      const tw = reducedMotion ? 1 : 0.78 + 0.22 * Math.sin(t * sparkle[i].speed + sparkle[i].phase)
      const idx = i * 3
      liveColors[idx] = lerp(c1[0], c2[0], mix) * tw
      liveColors[idx + 1] = lerp(c1[1], c2[1], mix) * tw
      liveColors[idx + 2] = lerp(c1[2], c2[2], mix) * tw
    }
    colorAttrRef.current.needsUpdate = true

    if (reducedMotion) {
      groupRef.current.scale.setScalar(1)
      materialRef.current.opacity = 0.96
      return
    }

    materialRef.current.opacity = 0.96
    const pulseT = pulseGetter ? pulseGetter() : null
    let pulseScale = 1
    if (pulseT !== null && pulseT < 1.2) {
      const p = pulseT < 0.6 ? easeOutCubic(pulseT / 0.6) : 1 - easeOutCubic((pulseT - 0.6) / 0.6)
      pulseScale = 1 + p * 0.05
    }
    groupRef.current.scale.setScalar(pulseScale)
  })

  return (
    <group ref={groupRef} position={heartCenter}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[heartCloud.positions, 3]} />
          <bufferAttribute ref={colorAttrRef} attach="attributes-color" args={[liveColors, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={materialRef} size={0.05} vertexColors sizeAttenuation transparent opacity={0.96} depthWrite={false} />
      </points>
    </group>
  )
}

// One of the two cherubs flanking the heart. Wing particles (flagged via
// cloud.wingMask, tagged with cloud.wingT = distance from shoulder) get a
// soft looping flap; everything else stays put. Position/scale are resolved
// by the caller from the heart's own bounding box (see angel layout below),
// so the cherubs scale and recenter together with the heart instead of
// drifting independently.
function AngelFigure({ cloud, position, scale, reducedMotion, flutterPhase }) {
  const pointsRef = useRef(null)
  const basePositions = useMemo(() => cloud.positions.slice(), [cloud])
  const renderPositions = useMemo(() => cloud.positions.slice(), [cloud])

  useFrame((state) => {
    const geometry = pointsRef.current?.geometry
    if (!geometry) return
    const posAttr = geometry.attributes.position

    if (reducedMotion) {
      if (!geometry.userData.settled) {
        posAttr.array.set(basePositions)
        posAttr.needsUpdate = true
        geometry.userData.settled = true
      }
      return
    }

    const t = state.clock.elapsedTime
    const flap = Math.sin(t * 1.6 + flutterPhase)
    for (let i = 0; i < cloud.count; i++) {
      const idx = i * 3
      if (cloud.wingMask[i] > 0) {
        const lift = flap * cloud.wingT[i] * 0.07
        const pull = -Math.abs(flap) * cloud.wingT[i] * 0.04
        posAttr.array[idx] = basePositions[idx]
        posAttr.array[idx + 1] = basePositions[idx + 1] + lift
        posAttr.array[idx + 2] = basePositions[idx + 2] + pull
      } else {
        posAttr.array[idx] = basePositions[idx]
        posAttr.array[idx + 1] = basePositions[idx + 1]
        posAttr.array[idx + 2] = basePositions[idx + 2]
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <group position={position} scale={scale}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[renderPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[cloud.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} vertexColors sizeAttenuation transparent opacity={0.95} depthWrite={false} />
      </points>
    </group>
  )
}

function useHeartTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = ROSE
    ctx.beginPath()
    ctx.moveTo(32, 56)
    ctx.bezierCurveTo(32, 56, 8, 36, 8, 20)
    ctx.bezierCurveTo(8, 8, 24, 4, 32, 18)
    ctx.bezierCurveTo(40, 4, 56, 8, 56, 20)
    ctx.bezierCurveTo(56, 36, 32, 56, 32, 56)
    ctx.closePath()
    ctx.fill()
    const texture = new CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])
}

function HeartRain({ activeGetter, anchorGetter }) {
  const count = 34
  const texture = useHeartTexture()
  const spriteRefs = useRef([])
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        delay: (i % 12) * 0.12,
        xOff: (((i * 53) % 100) / 100 - 0.5) * 1.1,
        zOff: (((i * 29) % 100) / 100 - 0.5) * 0.3,
        speed: 0.4 + (((i * 41) % 100) / 100) * 0.35,
        swaySpeed: 0.6 + (((i * 17) % 100) / 100) * 0.8,
        swayAmp: 0.05 + (((i * 71) % 100) / 100) * 0.08,
        scale: 0.05 + (((i * 31) % 100) / 100) * 0.035,
        spin: ((((i * 61) % 100) / 100) - 0.5) * 1.2,
      })),
    [count],
  )

  useFrame(() => {
    const t = activeGetter()
    const globalActive = t !== null && t < 4.0
    const anchor = anchorGetter()
    particles.forEach((p, i) => {
      const sprite = spriteRefs.current[i]
      if (!sprite) return
      const local = globalActive ? t - p.delay : -1
      if (local < 0 || local > 2.6) {
        sprite.visible = false
        return
      }
      sprite.visible = true
      const rise = local * p.speed
      const sway = Math.sin(local * p.swaySpeed * Math.PI) * p.swayAmp
      sprite.position.set(anchor[0] + 0.15 + p.xOff + sway, anchor[1] + 0.9 + rise, anchor[2] + p.zOff)
      const fade = 1 - clamp01(local / 2.6)
      sprite.material.opacity = fade * 0.9
      sprite.material.rotation = local * p.spin
      const s = p.scale * (0.7 + 0.3 * fade)
      sprite.scale.set(s, s, s)
    })
  })

  return (
    <group>
      {particles.map((_, i) => (
        <sprite key={i} ref={(el) => (spriteRefs.current[i] = el)} visible={false}>
          <spriteMaterial map={texture} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

// A static particle prop (mirror or arch) that fades in/out via `opacityGetter`
// instead of hard-cutting between scenarios.
function FadingProp({ cloud, position, opacityGetter, pointSize = 0.03 }) {
  const groupRef = useRef(null)
  const materialRef = useRef(null)

  useFrame(() => {
    const o = opacityGetter()
    if (groupRef.current) groupRef.current.visible = o > 0.01
    if (materialRef.current) materialRef.current.opacity = o * 0.9
  })

  return (
    <group ref={groupRef} position={position} visible={false}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[cloud.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={materialRef} size={pointSize} vertexColors sizeAttenuation transparent opacity={0} depthWrite={false} />
      </points>
    </group>
  )
}

function unionBounds(entries) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const { positions, offset } of entries) {
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i] + offset[0]
      const y = positions[i + 1] + offset[1]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  return { minX, maxX, minY, maxY }
}

function mergeBounds(boxes) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const b of boxes) {
    if (b.minX < minX) minX = b.minX
    if (b.maxX > maxX) maxX = b.maxX
    if (b.minY < minY) minY = b.minY
    if (b.maxY > maxY) maxY = b.maxY
  }
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  }
}

// The parametric heart curve's own unit half-extents, measured once (see
// heartShape.js's curve) rather than assumed:
//   - HEART_Y_TOP_RATIO: the outer top of the two lobes (the curve's highest point)
//   - HEART_Y_BOTTOM_RATIO: the bottom tip
//   - HEART_Y_NOTCH_RATIO: the bottom of the center V-notch between the lobes —
//     this is much lower than the lobe top, and it's what a centered figure
//     actually collides with, not the lobe top. Sizing clearance off the lobe
//     top (as this used to do) left the notch free to dip straight through a
//     head placed near the horizontal center.
const HEART_Y_TOP_RATIO = 0.745
const HEART_Y_BOTTOM_RATIO = 1.0625
// (the notch itself sits at ~0.3125 of the same ratio scale — well above the
// ellipse top solved below, which is the actual clearance guarantee)
const HEART_TRUE_HEIGHT_RATIO = (HEART_Y_TOP_RATIO + HEART_Y_BOTTOM_RATIO) / 2

// The heart's real "safe zone" — the region below the notch and between the
// lobes' inner walls — isn't a rectangle, it's roughly an ellipse sitting in
// the lower-center of the shape. These ratios (of the heart's true width/
// height) and the fill factor below are a deliberately generous approximation:
// tight enough that the couple reads as filling the heart, loose enough that
// no particle of the outline can clip a head, an accessory top, or a bubble.
const HEART_ELLIPSE_CENTER_RATIO = 0.45 // from the bottom tip, along true height
const HEART_ELLIPSE_WIDTH_RATIO = 0.5
const HEART_ELLIPSE_HEIGHT_RATIO = 0.35
const HEART_ELLIPSE_FILL = 0.92 // how much of the ellipse the cast (at natural size) is allowed to occupy

// Solves heart width/height so that the cast's bounding box — at its natural,
// unscaled size — fits inside the notch-safe ellipse, then places the heart's
// center so that ellipse lines up with the cast's own bbox center. The couple
// never gets resized; the heart is grown around them instead, which is also
// what lets it fill the available canvas (a bigger heart is required to keep
// the same-size couple clear of the notch, not a smaller couple).
function computeHeartDims(bbox, accessoryMaxY) {
  const figureWidth = bbox.maxX - bbox.minX
  const figureCenterX = (bbox.maxX + bbox.minX) / 2
  const figureCenterY = (bbox.maxY + bbox.minY) / 2
  const figureHeight = Math.max(bbox.maxY, accessoryMaxY) - bbox.minY

  const width = figureWidth / (HEART_ELLIPSE_WIDTH_RATIO * HEART_ELLIPSE_FILL)
  const trueHeight = figureHeight / (HEART_ELLIPSE_HEIGHT_RATIO * HEART_ELLIPSE_FILL)
  const height = trueHeight / HEART_TRUE_HEIGHT_RATIO

  const bottomTipOffset = -HEART_Y_BOTTOM_RATIO * (height / 2)
  const ellipseCenterOffset = bottomTipOffset + HEART_ELLIPSE_CENTER_RATIO * trueHeight
  const centerY = figureCenterY - ellipseCenterOffset

  return { width, height, center: [figureCenterX, centerY, -0.2] }
}

function ProposalGroup({ reducedMotion }) {
  const sceneElapsed = useRef(0)
  const transitionElapsed = useRef(0)
  const modeRef = useRef('scene') // 'scene' | 'transition'
  const activeScenarioRef = useRef(0)
  const phaseRef = useRef(-1)
  const celebrationStartRef = useRef(null)
  const celebrationAnchorRef = useRef(SLOTS.brideHug)
  const groomEmphasisRef = useRef(0)
  const brideEmphasisRef = useRef(0)

  const paletteFromRef = useRef(SCENARIOS[0].heartPalette)
  const paletteToRef = useRef(SCENARIOS[0].heartPalette)
  const paletteMixRef = useRef(0)

  const groomRoot = useRef(null)
  const boxRef = useRef(null)
  const lidRef = useRef(null)
  const brideRoot = useRef(null)
  const sceneRef = useRef(null)

  const [bubble, setBubble] = useState(null)
  const [brideIsSeated, setBrideIsSeated] = useState(false)

  const groomCloud = useMemo(() => {
    const figure = buildStandingFigure({ isDress: false, count: 1300, colorBias: 0.62, height: FIGURE_HEIGHT })
    return { target: figure.positions, colors: figure.colors, emphasis: figure.emphasis, count: figure.count, scatter: buildScatterCloud(figure.count) }
  }, [])
  const brideStandingFigure = useMemo(
    () => buildStandingFigure({ isDress: true, count: 1300, colorBias: 0.22, height: FIGURE_HEIGHT }),
    [],
  )
  const brideStandingCloud = useMemo(() => {
    const figure = brideStandingFigure
    return { target: figure.positions, colors: figure.colors, emphasis: figure.emphasis, count: figure.count, scatter: buildScatterCloud(figure.count) }
  }, [brideStandingFigure])
  const brideSeatedCloud = useMemo(() => {
    const figure = seatFigure(brideStandingFigure, FIGURE_HEIGHT)
    return {
      target: figure.positions,
      colors: figure.colors,
      emphasis: figure.emphasis,
      count: figure.count,
      scatter: brideStandingCloud.scatter,
      headOffsetY: figure.headOffsetY,
    }
  }, [brideStandingFigure, brideStandingCloud])

  const brideCloudData = brideIsSeated ? brideSeatedCloud : brideStandingCloud
  const brideHeadOffset = brideIsSeated ? brideCloudData.headOffsetY : 0

  // Figure-only bounding box (every scenario slot, both bride poses) — this
  // drives the heart's width and horizontal center. Accessory tops (mirror,
  // arch) are tracked separately below: their X position isn't allowed to
  // widen/re-center the heart (they're background set-dressing, off to the
  // side), but their height still has to clear the notch, same as a head.
  const figureBBox = useMemo(
    () =>
      unionBounds([
        { positions: groomCloud.target, offset: SLOTS.groomAsk },
        { positions: groomCloud.target, offset: SLOTS.maquilleuse },
        { positions: groomCloud.target, offset: SLOTS.groomCeremony },
        { positions: brideStandingCloud.target, offset: SLOTS.brideAsk },
        { positions: brideStandingCloud.target, offset: SLOTS.brideHug },
        { positions: brideStandingCloud.target, offset: SLOTS.brideCeremony },
        { positions: brideSeatedCloud.target, offset: SLOTS.brideMirror },
      ]),
    [groomCloud, brideStandingCloud, brideSeatedCloud],
  )

  const mirrorCloud = useMemo(() => buildMirror({ count: 260, width: 0.9, height: 1.3 }), [])
  const archCloud = useMemo(() => buildArch({ count: 420, width: 2.0, height: 1.9 }), [])

  const accessoryMaxY = useMemo(() => {
    const mirrorBounds = unionBounds([{ positions: mirrorCloud.positions, offset: MIRROR_POS }])
    const archBounds = unionBounds([{ positions: archCloud.positions, offset: ARCH_POS }])
    return Math.max(mirrorBounds.maxY, archBounds.maxY)
  }, [mirrorCloud, archCloud])

  const heartDims = useMemo(() => computeHeartDims(figureBBox, accessoryMaxY), [figureBBox, accessoryMaxY])
  const heartCloud = useMemo(
    () => buildHeartOutline({ count: 1300, width: heartDims.width, height: heartDims.height, bandWidth: 0.05 }),
    [heartDims],
  )
  // Full bounds (not just width/height): the heart curve's own top/bottom
  // ratios are asymmetric (see HEART_Y_TOP_RATIO/HEART_Y_BOTTOM_RATIO above),
  // so its true midpoint isn't heartDims.center — sizing the fit-to-view off
  // width/height alone while recentering on heartDims.center left more
  // margin at the bottom than the top, clipping the lobes. Keeping the real
  // min/max lets the fit logic recenter on the shape's actual midpoint.
  const heartBBox = useMemo(
    () => mergeBounds([unionBounds([{ positions: heartCloud.positions, offset: heartDims.center }])]),
    [heartCloud, heartDims],
  )

  // Two cherubs flanking the heart at lobe height, sized relative to the
  // heart's own true height so they scale together with it.
  const angelCloud = useMemo(() => buildAngel({ count: 420 }), [])
  const angelLocalBounds = useMemo(
    () => unionBounds([{ positions: angelCloud.positions, offset: [0, 0, 0] }]),
    [angelCloud],
  )
  const angelLayout = useMemo(() => {
    const heartWidth = heartBBox.maxX - heartBBox.minX
    const heartHeight = heartBBox.maxY - heartBBox.minY
    const localHeight = angelLocalBounds.maxY - angelLocalBounds.minY
    const localWidth = angelLocalBounds.maxX - angelLocalBounds.minX
    const localCenterX = (angelLocalBounds.minX + angelLocalBounds.maxX) / 2
    const localCenterY = (angelLocalBounds.minY + angelLocalBounds.maxY) / 2

    const scale = heartHeight / 3 / localHeight
    const halfWidthWorld = scale * (localWidth / 2)
    const centerY = heartBBox.maxY - (heartHeight / 3) * 0.58
    const offsetX = heartWidth / 2 + halfWidthWorld * 0.72

    const left = {
      center: [heartBBox.centerX - offsetX, centerY, heartDims.center[2] + 0.05],
      scale,
    }
    const right = {
      center: [heartBBox.centerX + offsetX, centerY, heartDims.center[2] + 0.05],
      scale,
    }

    const bboxFor = (a) => ({
      minX: a.center[0] - halfWidthWorld,
      maxX: a.center[0] + halfWidthWorld,
      minY: centerY - heartHeight / 3 / 2,
      maxY: centerY + heartHeight / 3 / 2,
    })

    return {
      left: { position: [left.center[0] - scale * localCenterX, left.center[1] - scale * localCenterY, left.center[2]], scale },
      right: { position: [right.center[0] - scale * localCenterX, right.center[1] - scale * localCenterY, right.center[2]], scale },
      bounds: [bboxFor(left), bboxFor(right)],
    }
  }, [heartBBox, angelLocalBounds, heartDims])

  // What the fit-to-view logic actually has to keep on screen: the heart
  // plus both cherubs. Sizing/recentering off this union (instead of the
  // heart alone) is what keeps the angels from poking outside the canvas.
  const sceneBBox = useMemo(
    () => mergeBounds([heartBBox, ...angelLayout.bounds]),
    [heartBBox, angelLayout],
  )

  const groomEmphasisGetter = () => groomEmphasisRef.current
  const brideEmphasisGetter = () => brideEmphasisRef.current
  const celebrationActiveGetter = () => {
    if (celebrationStartRef.current === null) return null
    return sceneElapsed.current - celebrationStartRef.current
  }
  const celebrationAnchorGetter = () => celebrationAnchorRef.current
  const heartPaletteGetter = () => ({ from: paletteFromRef.current, to: paletteToRef.current, mix: paletteMixRef.current })
  const mirrorOpacityGetter = () =>
    propOpacityFor(1, modeRef.current, activeScenarioRef.current, (activeScenarioRef.current + 1) % 3, clamp01(transitionElapsed.current / TRANSITION_DURATION))
  const archOpacityGetter = () =>
    propOpacityFor(2, modeRef.current, activeScenarioRef.current, (activeScenarioRef.current + 1) % 3, clamp01(transitionElapsed.current / TRANSITION_DURATION))

  // Always runs, even under reduced motion, so the heart (and its cherubs)
  // are guaranteed to fit the canvas at every screen size and container
  // aspect ratio — the scene shrinks/grows to fit instead of ever clipping.
  // Sizing off sceneBBox.width/height alone isn't enough on its own: sceneRef
  // scales around its own local origin (world [0,0,0], i.e. the viewport's
  // center), and sceneBBox's *center* isn't generally at that origin — the
  // couple sit low (see the SLOTS comment) and the cherubs flank the heart
  // asymmetrically, so without an explicit recenter the content can be the
  // right SIZE but still shifted enough to clip an edge. Translating by
  // -center*fitScale re-centers the true bounding box on screen every frame.
  useFrame((state) => {
    if (!sceneRef.current) return
    const { viewport } = state
    const fitScale = Math.min((viewport.width * 0.9) / sceneBBox.width, (viewport.height * 0.9) / sceneBBox.height)
    sceneRef.current.scale.setScalar(fitScale)
    sceneRef.current.position.set(-sceneBBox.centerX * fitScale, -sceneBBox.centerY * fitScale, 0)
  })

  useFrame((_, delta) => {
    if (reducedMotion) return

    const activeScenario = activeScenarioRef.current
    const scenario = SCENARIOS[activeScenario]

    if (modeRef.current === 'scene') {
      sceneElapsed.current += delta
      if (sceneElapsed.current >= scenario.totalDuration) {
        modeRef.current = 'transition'
        transitionElapsed.current = 0
        phaseRef.current = -1
        setBubble(null)
        // sceneElapsed resets to 0 for the next scenario below, so a
        // leftover celebrationStartRef from this scenario would otherwise
        // produce a negative (falsely "active") delta once the next scene's
        // clock restarts — clear it so confetti/heart-rain/pulse stay off
        // until something in the new scenario explicitly retriggers them.
        celebrationStartRef.current = null
        const nextScenario = (activeScenario + 1) % 3
        paletteToRef.current = SCENARIOS[nextScenario].heartPalette
        paletteMixRef.current = 0
        if (nextScenario === 1) setBrideIsSeated(true)
        else if (activeScenario === 1) setBrideIsSeated(false)
      } else {
        const phase = phaseAt(scenario, sceneElapsed.current)
        if (phase.index !== phaseRef.current) {
          phaseRef.current = phase.index
          setBubble(phase.bubble)
          if (phase.name === 'p0-yes') {
            celebrationStartRef.current = sceneElapsed.current
            celebrationAnchorRef.current = SLOTS.brideHug
          } else if (phase.name === 'p2-officiant-outro') {
            celebrationStartRef.current = sceneElapsed.current
            celebrationAnchorRef.current = [
              (SLOTS.groomCeremony[0] + SLOTS.brideCeremony[0]) / 2,
              SLOTS.brideCeremony[1],
              (SLOTS.groomCeremony[2] + SLOTS.brideCeremony[2]) / 2,
            ]
          }
        }
        applyScenePose(activeScenario, phase, sceneElapsed.current)
      }
    } else {
      transitionElapsed.current += delta
      const tau = clamp01(transitionElapsed.current / TRANSITION_DURATION)
      paletteMixRef.current = clamp01(transitionElapsed.current / PALETTE_FADE_DURATION)
      applyTransitionPose(activeScenario, (activeScenario + 1) % 3, tau)
      if (boxRef.current) boxRef.current.scale.setScalar(0.001)
      if (tau >= 1) {
        modeRef.current = 'scene'
        sceneElapsed.current = 0
        phaseRef.current = -1
        paletteFromRef.current = paletteToRef.current
        paletteMixRef.current = 0
        activeScenarioRef.current = (activeScenario + 1) % 3
      }
    }

    if (sceneRef.current) sceneRef.current.rotation.y = Math.sin((sceneElapsed.current + transitionElapsed.current) * 0.25) * 0.06
  })

  function applyScenePose(scenarioIdx, phase, elapsedTime) {
    if (scenarioIdx === 0) {
      let boxScale = 0
      if (phase.name === 'p0-ask') boxScale = easeOutCubic(clamp01(phase.local / 0.35))
      else if (phase.name === 'p0-hesitate') boxScale = 1
      else if (phase.name === 'p0-yes') boxScale = 1 - clamp01(phase.local / 0.3)
      if (boxRef.current) {
        boxRef.current.scale.setScalar(Math.max(boxScale, 0.001))
        boxRef.current.position.y = lerp(0.8, 0.85, boxScale)
      }
      if (lidRef.current) lidRef.current.rotation.x = lerp(0, -1.9, boxScale)

      groomEmphasisRef.current = phase.name === 'p0-ask' ? 1 : phase.name === 'p0-hesitate' ? 0.35 : 0
      brideEmphasisRef.current = phase.name === 'p0-hesitate' ? 0.6 : phase.name === 'p0-yes' || phase.name === 'p0-hug' ? 1 : 0

      if (groomRoot.current) {
        const bob = Math.sin(elapsedTime * 1.6) * 0.015
        groomRoot.current.position.set(SLOTS.groomAsk[0], SLOTS.groomAsk[1] + bob, SLOTS.groomAsk[2])
      }

      let bridePos = SLOTS.brideAsk
      if (phase.name === 'p0-yes') bridePos = lerpVec(SLOTS.brideAsk, SLOTS.brideHug, easeOutBack(clamp01(phase.local / 0.6)))
      else if (phase.name === 'p0-hug') bridePos = SLOTS.brideHug
      if (brideRoot.current) {
        const bob =
          phase.name === 'p0-idle' ||
          phase.name === 'p0-line1' ||
          phase.name === 'p0-line2' ||
          phase.name === 'p0-ask' ||
          phase.name === 'p0-hesitate'
            ? Math.sin(elapsedTime * 1.7 + 1) * 0.015
            : 0
        brideRoot.current.position.set(bridePos[0], bridePos[1] + bob, bridePos[2])
      }
    } else if (scenarioIdx === 1) {
      if (boxRef.current) boxRef.current.scale.setScalar(0.001)
      // Maquilleuse: a slow, continuous brushing-arm gesture via the same
      // emphasis-driven wobble the proposal scene uses for tension.
      groomEmphasisRef.current = 0.5 + Math.sin(elapsedTime * 3.2) * 0.5
      brideEmphasisRef.current = 0.3

      if (groomRoot.current) groomRoot.current.position.set(SLOTS.maquilleuse[0], SLOTS.maquilleuse[1], SLOTS.maquilleuse[2])
      if (brideRoot.current) {
        const bob = Math.sin(elapsedTime * 1.4) * 0.01
        brideRoot.current.position.set(SLOTS.brideMirror[0], SLOTS.brideMirror[1] + bob, SLOTS.brideMirror[2])
      }
    } else {
      if (boxRef.current) boxRef.current.scale.setScalar(0.001)
      groomEmphasisRef.current = 0.2
      brideEmphasisRef.current = 0.2

      if (groomRoot.current) {
        const bob = Math.sin(elapsedTime * 1.5) * 0.012
        groomRoot.current.position.set(SLOTS.groomCeremony[0], SLOTS.groomCeremony[1] + bob, SLOTS.groomCeremony[2])
      }
      if (brideRoot.current) {
        const bob = Math.sin(elapsedTime * 1.5 + 0.6) * 0.012
        brideRoot.current.position.set(SLOTS.brideCeremony[0], SLOTS.brideCeremony[1] + bob, SLOTS.brideCeremony[2])
      }
    }
  }

  function slotFor(scenarioIdx, who) {
    if (scenarioIdx === 0) return who === 'A' ? SLOTS.groomAsk : SLOTS.brideAsk
    if (scenarioIdx === 1) return who === 'A' ? SLOTS.maquilleuse : SLOTS.brideMirror
    return who === 'A' ? SLOTS.groomCeremony : SLOTS.brideCeremony
  }

  function applyTransitionPose(fromIdx, toIdx, tau) {
    const easedTau = easeInOutCubic(tau)
    groomEmphasisRef.current = 0
    brideEmphasisRef.current = 0
    const groomFrom = slotFor(fromIdx, 'A')
    const groomTo = slotFor(toIdx, 'A')
    const brideFrom = slotFor(fromIdx, 'B')
    const brideTo = slotFor(toIdx, 'B')
    if (groomRoot.current) groomRoot.current.position.set(...lerpVec(groomFrom, groomTo, easedTau))
    if (brideRoot.current) brideRoot.current.position.set(...lerpVec(brideFrom, brideTo, easedTau))
  }

  return (
    <group ref={sceneRef}>
      <group ref={groomRoot} position={SLOTS.groomAsk}>
        <ParticleFigure
          cloudData={groomCloud}
          emphasisGetter={groomEmphasisGetter}
          reducedMotion={reducedMotion}
          bubbleText={!reducedMotion && bubble?.who === 'A' ? bubble.text : null}
        />
        <group ref={boxRef} position={[0.22, 0.75, 0.38]} scale={0.001}>
          <pointLight position={[0, 0.16, 0.05]} intensity={1.8} distance={0.6} color="#ffe4b0" />
          <RoundedBox args={[0.1, 0.055, 0.085]} radius={0.008} smoothness={2}>
            <meshStandardMaterial color={VELVET} roughness={0.9} metalness={0} />
          </RoundedBox>
          <mesh position={[0, 0.033, 0.012]}>
            <torusGeometry args={[0.014, 0.0035, 12, 24]} />
            <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.041, 0.012]}>
            <sphereGeometry args={[0.0075, 12, 12]} />
            <meshStandardMaterial color="#ffffff" emissive="#fff8ec" emissiveIntensity={0.6} roughness={0.05} metalness={0.1} />
          </mesh>
          <group ref={lidRef} position={[0, 0.0275, -0.0425]}>
            <RoundedBox args={[0.1, 0.018, 0.085]} radius={0.008} smoothness={2} position={[0, 0.009, 0.0425]}>
              <meshStandardMaterial color={VELVET} roughness={0.9} metalness={0} />
            </RoundedBox>
          </group>
        </group>
        <mesh position={[0, 0.015, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.42, 24]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.14} />
        </mesh>
      </group>

      <group ref={brideRoot} position={SLOTS.brideAsk}>
        <ParticleFigure
          cloudData={brideCloudData}
          emphasisGetter={brideEmphasisGetter}
          reducedMotion={reducedMotion}
          bubbleText={!reducedMotion && bubble?.who === 'B' ? bubble.text : null}
          bubbleVariant="bride"
          headOffsetY={brideHeadOffset}
        />
        <mesh position={[0, 0.015, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.46, 24]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.14} />
        </mesh>
      </group>

      <FadingProp cloud={mirrorCloud} position={MIRROR_POS} opacityGetter={mirrorOpacityGetter} pointSize={0.026} />
      <FadingProp cloud={archCloud} position={ARCH_POS} opacityGetter={archOpacityGetter} pointSize={0.03} />

      <AngelFigure
        cloud={angelCloud}
        position={angelLayout.left.position}
        scale={angelLayout.left.scale}
        reducedMotion={reducedMotion}
        flutterPhase={0}
      />
      <AngelFigure
        cloud={angelCloud}
        position={angelLayout.right.position}
        scale={angelLayout.right.scale}
        reducedMotion={reducedMotion}
        flutterPhase={Math.PI * 0.4}
      />

      {!reducedMotion && <Confetti activeGetter={celebrationActiveGetter} anchorGetter={celebrationAnchorGetter} />}
      <GiantHeart pulseGetter={celebrationActiveGetter} paletteGetter={heartPaletteGetter} reducedMotion={reducedMotion} heartCloud={heartCloud} heartCenter={heartDims.center} />
      {!reducedMotion && <HeartRain activeGetter={celebrationActiveGetter} anchorGetter={celebrationAnchorGetter} />}
      {!reducedMotion && bubble?.who === 'C' && (
        <Html
          position={[heartDims.center[0], heartDims.center[1] + HEART_Y_TOP_RATIO * (heartDims.height / 2) + 0.32, 0]}
          center
          pointerEvents="none"
          zIndexRange={[20, 0]}
        >
          <EdgeAwareBubble key={bubble.text} text={bubble.text} variant="officiant" />
        </Html>
      )}
    </group>
  )
}

export default function HeroProposalScene({ reducedMotion }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.05, 3.7], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none', overflow: 'visible' }}
    >
      <ambientLight intensity={0.6} color="#f7f3ec" />
      <pointLight position={[2.5, 3, 3]} intensity={45} color="#ffd9a0" />
      <pointLight position={[-3, -2, -2]} intensity={12} color="#5c6f5e" />
      <ProposalGroup reducedMotion={reducedMotion} />
    </Canvas>
  )
}
