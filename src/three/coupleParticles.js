// Procedural point-cloud data for the "couple dancing" hero silhouette.
// Two humanoid silhouettes are built from a height-based radius profile
// (torso/legs) plus explicit arm keypoints for a raised-hands dance pose,
// then sampled into a flat particle cloud. No external 3D assets involved.

const IVORY = [0.969, 0.953, 0.925]
const GOLD_SOFT = [0.831, 0.706, 0.514]
const GOLD = [0.722, 0.576, 0.373]

function lerpColor(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function lerpKeys(keys, t) {
  const clamped = Math.min(1, Math.max(0, t))
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, r0] = keys[i]
    const [t1, r1] = keys[i + 1]
    if (clamped >= t0 && clamped <= t1) {
      const f = t1 === t0 ? 0 : (clamped - t0) / (t1 - t0)
      return r0 + (r1 - r0) * f
    }
  }
  return keys[keys.length - 1][1]
}

const BODY_KEYS = [
  [0, 0.045],
  [0.15, 0.078],
  [0.3, 0.055],
  [0.46, 0.11],
  [0.5, 0.145],
  [0.62, 0.085],
  [0.78, 0.16],
  [0.87, 0.055],
  [0.93, 0.085],
  [1, 0],
]

const SKIRT_KEYS = [
  [0, 0.26],
  [0.1, 0.28],
  [0.2, 0.18],
  [0.32, 0.1],
  [0.46, 0.08],
  [0.5, 0.085],
  [0.62, 0.09],
  [0.78, 0.155],
  [0.87, 0.055],
  [0.93, 0.085],
  [1, 0],
]

function bodyRadius(t, skirt) {
  return lerpKeys(skirt ? SKIRT_KEYS : BODY_KEYS, t)
}

function addVec(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function sampleTube(p0, p1, r0, r1) {
  const s = Math.random()
  const x = p0[0] + (p1[0] - p0[0]) * s
  const y = p0[1] + (p1[1] - p0[1]) * s
  const z = p0[2] + (p1[2] - p0[2]) * s
  const r = (r0 + (r1 - r0) * s) * Math.sqrt(Math.random())
  const a = Math.random() * Math.PI * 2
  return [x + Math.cos(a) * r, y, z + Math.sin(a) * r * 0.6]
}

function buildFigure({ xOffset, side, skirt, height, count }) {
  const points = []

  // "near" = the bridging arm reaching toward the dance partner at chest height,
  // "far" = the outer arm resting down at the figure's own side.
  const shoulderT = 0.76
  const shoulderR = bodyRadius(shoulderT, skirt) * 0.85
  const shoulderNear = [side * shoulderR, shoulderT, 0]
  const shoulderFar = [-side * shoulderR, shoulderT, 0]

  const elbowNear = addVec(shoulderNear, [side * 0.14, -0.03, 0.06])
  const handNear = addVec(elbowNear, [side * 0.2, -0.06, 0.02])

  const elbowFar = addVec(shoulderFar, [-side * 0.03, -0.17, 0.05])
  const handFar = addVec(elbowFar, [-side * 0.02, -0.15, 0.05])

  const bodyShare = 0.85
  const bodyCount = Math.floor(count * bodyShare)
  const armCount = count - bodyCount

  for (let i = 0; i < bodyCount; i++) {
    const t = Math.random()
    const r = bodyRadius(t, skirt)
    const a = Math.random() * Math.PI * 2
    const rr = r * Math.sqrt(Math.random())
    const x = xOffset + Math.cos(a) * rr
    const y = t
    const z = Math.sin(a) * rr * 0.55
    const colorT = Math.min(1, t + Math.random() * 0.15)
    const color = lerpColor(IVORY, GOLD_SOFT, colorT)
    points.push({ x: x * height, y: y * height, z: z * height, color })
  }

  for (let i = 0; i < armCount; i++) {
    const useNear = Math.random() < 0.55
    const [p0, p1, r0, r1] = useNear
      ? Math.random() < 0.5
        ? [shoulderNear, elbowNear, 0.055, 0.045]
        : [elbowNear, handNear, 0.045, 0.032]
      : Math.random() < 0.5
        ? [shoulderFar, elbowFar, 0.052, 0.042]
        : [elbowFar, handFar, 0.042, 0.03]
    const [px, py, pz] = sampleTube(p0, p1, r0, r1)
    const color = lerpColor(GOLD_SOFT, GOLD, Math.random())
    points.push({
      x: (xOffset + px) * height,
      y: py * height,
      z: pz * height,
      color,
    })
  }

  return points
}

export function buildCoupleSilhouette(count = 3600) {
  const height = 2.05
  const perFigure = Math.floor(count / 2)

  const figureA = buildFigure({
    xOffset: -0.28,
    side: 1,
    skirt: false,
    height,
    count: perFigure,
  })
  const figureB = buildFigure({
    xOffset: 0.28,
    side: -1,
    skirt: true,
    height,
    count: count - perFigure,
  })

  const all = figureA.concat(figureB)
  const yOffset = height * 0.5

  const positions = new Float32Array(all.length * 3)
  const colors = new Float32Array(all.length * 3)

  for (let i = 0; i < all.length; i++) {
    const p = all[i]
    positions[i * 3] = p.x
    positions[i * 3 + 1] = p.y - yOffset
    positions[i * 3 + 2] = p.z
    colors[i * 3] = p.color[0]
    colors[i * 3 + 1] = p.color[1]
    colors[i * 3 + 2] = p.color[2]
  }

  return { positions, colors, count: all.length }
}

export function buildScatterCloud(count, radius = 4.2) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = radius * (0.4 + 0.6 * Math.random())
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.6
  }
  return positions
}

export function buildSparkles(count = 220, spread = 2.6) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() * 2 - 1) * spread
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * spread * 1.1
    positions[i * 3 + 2] = (Math.random() * 2 - 1) * 1.4
    const color = lerpColor(GOLD_SOFT, IVORY, Math.random())
    colors[i * 3] = color[0]
    colors[i * 3 + 1] = color[1]
    colors[i * 3 + 2] = color[2]
    phases[i] = Math.random() * Math.PI * 2
  }
  return { positions, colors, phases }
}
