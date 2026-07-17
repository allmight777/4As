import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

const PETAL_COLORS = ['#d4b483', '#b8935f', '#5c6f5e', '#f7f3ec']
const PETAL_COUNT = 26

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function Petals({ reducedMotion }) {
  const groupRef = useRef(null)
  const petals = useMemo(
    () =>
      Array.from({ length: PETAL_COUNT }, () => ({
        x: randomBetween(-1.3, 1.3),
        y: randomBetween(-1.6, 1.8),
        z: randomBetween(-0.6, 0.6),
        speed: randomBetween(0.12, 0.28),
        sway: randomBetween(0.4, 1.1),
        phase: randomBetween(0, Math.PI * 2),
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        scale: randomBetween(0.05, 0.09),
      })),
    [],
  )

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.children.forEach((mesh, i) => {
      const p = petals[i]
      mesh.position.y -= p.speed * delta
      mesh.position.x = p.x + Math.sin(t * p.sway + p.phase) * 0.25
      mesh.rotation.z = t * p.sway + p.phase
      if (mesh.position.y < -1.8) mesh.position.y = 1.8
    })
  })

  return (
    <group ref={groupRef}>
      {petals.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={[p.scale, p.scale * 0.6, p.scale]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={p.color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function AngelFigure({ reducedMotion }) {
  const angelRef = useRef(null)
  const wingLeftRef = useRef(null)
  const wingRightRef = useRef(null)

  useFrame((state) => {
    if (reducedMotion) return
    const t = state.clock.elapsedTime
    if (angelRef.current) angelRef.current.rotation.y = Math.sin(t * 0.25) * 0.35
    if (wingLeftRef.current) wingLeftRef.current.rotation.z = 0.55 + Math.sin(t * 1.6) * 0.12
    if (wingRightRef.current) wingRightRef.current.rotation.z = -0.55 - Math.sin(t * 1.6) * 0.12
  })

  return (
    <group ref={angelRef} position={[0, -0.2, 0]}>
      <mesh position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color="#f7f3ec" roughness={0.5} />
      </mesh>

      <mesh position={[0, 1.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.19, 0.025, 16, 48]} />
        <meshStandardMaterial color="#d4b483" emissive="#b8935f" emissiveIntensity={0.6} metalness={0.4} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.35, 0]}>
        <coneGeometry args={[0.55, 1.3, 32]} />
        <meshStandardMaterial color="#fffdf9" roughness={0.55} />
      </mesh>

      <mesh ref={wingLeftRef} position={[-0.42, 0.85, -0.1]} rotation={[0.1, 0.3, 0.55]}>
        <coneGeometry args={[0.22, 0.9, 4, 1, true]} />
        <meshStandardMaterial color="#5c6f5e" roughness={0.7} side={2} transparent opacity={0.85} />
      </mesh>
      <mesh ref={wingRightRef} position={[0.42, 0.85, -0.1]} rotation={[0.1, -0.3, -0.55]}>
        <coneGeometry args={[0.22, 0.9, 4, 1, true]} />
        <meshStandardMaterial color="#5c6f5e" roughness={0.7} side={2} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

export default function ServicesAngel({ reducedMotion = false }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.2, 4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.7} color="#f7f3ec" />
      <pointLight position={[2, 3, 2]} intensity={30} color="#ffe3b0" />
      <pointLight position={[-2, -1, -2]} intensity={8} color="#5c6f5e" />
      <AngelFigure reducedMotion={reducedMotion} />
      <Petals reducedMotion={reducedMotion} />
    </Canvas>
  )
}
