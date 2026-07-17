import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildCoupleSilhouette, buildScatterCloud, buildSparkles } from '../three/coupleParticles'

const ASSEMBLE_DURATION = 2.6

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function CoupleParticles({ scrollRef, reducedMotion }) {
  const pointsRef = useRef(null)
  const groupRef = useRef(null)
  const startTime = useRef(null)
  const rotationTarget = useRef({ x: 0, y: 0 })
  const rotationCurrent = useRef({ x: 0, y: 0 })
  const orientationActive = useRef(false)

  const { target, scatter, colors, count } = useMemo(() => {
    const silhouette = buildCoupleSilhouette(3600)
    const scatterCloud = buildScatterCloud(silhouette.count)
    return {
      target: silhouette.positions,
      scatter: scatterCloud,
      colors: silhouette.colors,
      count: silhouette.count,
    }
  }, [])

  const positions = useMemo(() => scatter.slice(), [scatter])

  useMemo(() => {
    if (typeof window === 'undefined') return
    const handleOrientation = (event) => {
      if (event.gamma === null || event.beta === null) return
      orientationActive.current = true
      rotationTarget.current.y = THREE.MathUtils.clamp(event.gamma / 45, -1, 1) * 0.18
      rotationTarget.current.x = THREE.MathUtils.clamp((event.beta - 45) / 45, -1, 1) * 0.12
    }
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation)
      return () => window.removeEventListener('deviceorientation', handleOrientation)
    }
    return undefined
  }, [])

  useFrame((state, delta) => {
    if (startTime.current === null) startTime.current = state.clock.elapsedTime

    const geometry = pointsRef.current?.geometry
    if (!geometry) return
    const posAttr = geometry.attributes.position

    if (reducedMotion) {
      if (!geometry.userData.settled) {
        for (let i = 0; i < count * 3; i++) posAttr.array[i] = target[i]
        posAttr.needsUpdate = true
        geometry.userData.settled = true
      }
      return
    }

    const elapsed = state.clock.elapsedTime - startTime.current
    const assemble = easeOutCubic(Math.min(1, elapsed / ASSEMBLE_DURATION))
    const scrollDispersion = scrollRef?.current ?? 0
    const effective = assemble * (1 - scrollDispersion * 0.9)
    const t = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      const tx = target[idx]
      const ty = target[idx + 1]
      const tz = target[idx + 2]
      const sx = scatter[idx]
      const sy = scatter[idx + 1]
      const sz = scatter[idx + 2]

      const breathe = Math.sin(t * 0.6 + i * 0.37) * 0.015 * effective

      posAttr.array[idx] = sx + (tx - sx) * effective + breathe
      posAttr.array[idx + 1] = sy + (ty - sy) * effective + Math.cos(t * 0.5 + i * 0.21) * 0.012 * effective
      posAttr.array[idx + 2] = sz + (tz - sz) * effective
    }
    posAttr.needsUpdate = true

    if (!orientationActive.current) {
      rotationTarget.current.x = -state.pointer.y * 0.12
      rotationTarget.current.y = state.pointer.x * 0.2
    }

    rotationCurrent.current.x += (rotationTarget.current.x - rotationCurrent.current.x) * Math.min(1, delta * 2.2)
    rotationCurrent.current.y += (rotationTarget.current.y - rotationCurrent.current.y) * Math.min(1, delta * 2.2)

    if (groupRef.current) {
      groupRef.current.rotation.x = rotationCurrent.current.x
      groupRef.current.rotation.y = rotationCurrent.current.y + Math.sin(t * 0.05) * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.024}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

function Sparkles({ reducedMotion }) {
  const pointsRef = useRef(null)
  const { positions, colors, phases, count } = useMemo(() => {
    const s = buildSparkles(200)
    return { ...s, count: 200 }
  }, [])
  const basePositions = useMemo(() => positions.slice(), [positions])

  useFrame((state) => {
    if (reducedMotion) return
    const geometry = pointsRef.current?.geometry
    if (!geometry) return
    const posAttr = geometry.attributes.position
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const idx = i * 3
      const phase = phases[i]
      posAttr.array[idx] = basePositions[idx] + Math.sin(t * 0.4 + phase) * 0.18
      posAttr.array[idx + 1] = basePositions[idx + 1] + Math.cos(t * 0.35 + phase) * 0.18
      posAttr.array[idx + 2] = basePositions[idx + 2] + Math.sin(t * 0.3 + phase * 1.3) * 0.12
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function HeroScene({ scrollRef }) {
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.1, 4.6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <CoupleParticles scrollRef={scrollRef} reducedMotion={reducedMotion} />
      <Sparkles reducedMotion={reducedMotion} />
    </Canvas>
  )
}
