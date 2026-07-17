// Procedural point-cloud silhouettes for the hero proposal scene.
// Same technique as the site's original couple-particle hero: a
// height-based radius profile (torso/dress) plus explicit arm/head
// keypoints, sampled into a flat particle cloud. No external assets.

const IVORY = [0.969, 0.953, 0.925]
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

const SUIT_KEYS = [
  [0, 0.045],
  [0.15, 0.078],
  [0.3, 0.055],
  [0.46, 0.11],
  [0.5, 0.145],
  [0.62, 0.085],
  [0.78, 0.16],
  [0.86, 0.075],
  [1, 0.02],
]

const DRESS_KEYS = [
  [0, 0.26],
  [0.1, 0.28],
  [0.2, 0.18],
  [0.32, 0.1],
  [0.46, 0.08],
  [0.5, 0.085],
  [0.62, 0.09],
  [0.78, 0.155],
  [0.86, 0.075],
  [1, 0.02],
]

function bodyRadius(t, isDress) {
  return lerpKeys(isDress ? DRESS_KEYS : SUIT_KEYS, t)
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
  return [x + Math.cos(a) * r, y, z + Math.sin(a) * r * 0.6, s]
}

// colorBias closer to 0 skews the gradient toward ivory, closer to 1 toward gold —
// used to make the suit read denser/darker than the dress without leaving the palette.
export function buildStandingFigure({ isDress, count, colorBias = 0.5, height = 1.85 }) {
  const positions = []
  const colors = []
  const emphasis = []

  const shoulderT = 0.86
  const shoulderR = bodyRadius(shoulderT, isDress) * 0.75
  const shoulderL = [-shoulderR, shoulderT, 0]
  const shoulderRt = [shoulderR, shoulderT, 0]
  const elbowL = addVec(shoulderL, [-0.035, -0.17, 0.045])
  const handL = addVec(elbowL, [0.005, -0.16, 0.05])
  const elbowR = addVec(shoulderRt, [0.035, -0.17, 0.045])
  const handR = addVec(elbowR, [-0.005, -0.16, 0.05])

  const headShare = 0.13
  const armShare = 0.17
  const bodyShare = 1 - headShare - armShare
  const bodyCount = Math.floor(count * bodyShare)
  const headCount = Math.floor(count * headShare)
  const armCount = count - bodyCount - headCount

  function push(x, y, z, colorT, emphasisValue) {
    positions.push(x * height, y * height, z * height)
    const color = lerpColor(IVORY, GOLD, Math.min(1, colorT * 0.55 + colorBias * 0.55))
    colors.push(color[0], color[1], color[2])
    emphasis.push(emphasisValue)
  }

  for (let i = 0; i < bodyCount; i++) {
    const t = Math.random()
    const r = bodyRadius(t, isDress)
    const a = Math.random() * Math.PI * 2
    const rr = r * Math.sqrt(Math.random())
    push(Math.cos(a) * rr, t, Math.sin(a) * rr * 0.55, t, 0)
  }

  const headCenter = [0, shoulderT + 0.1, 0.01]
  const headRadius = 0.1
  for (let i = 0; i < headCount; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = u * Math.PI * 2
    const phi = Math.acos(2 * v - 1)
    const r = headRadius * Math.cbrt(Math.random())
    push(
      headCenter[0] + Math.sin(phi) * Math.cos(theta) * r,
      headCenter[1] + Math.cos(phi) * r * 1.05,
      headCenter[2] + Math.sin(phi) * Math.sin(theta) * r * 0.85,
      1,
      0.6,
    )
  }

  for (let i = 0; i < armCount; i++) {
    const useLeft = Math.random() < 0.5
    const useUpper = Math.random() < 0.5
    const [p0, p1, r0, r1] = useLeft
      ? useUpper
        ? [shoulderL, elbowL, 0.05, 0.04]
        : [elbowL, handL, 0.04, 0.028]
      : useUpper
        ? [shoulderRt, elbowR, 0.05, 0.04]
        : [elbowR, handR, 0.04, 0.028]
    const [px, py, pz, s] = sampleTube(p0, p1, r0, r1)
    push(px, py, pz, 0.8, useUpper ? 0.3 : 0.85 + s * 0.15)
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    emphasis: new Float32Array(emphasis),
    count: positions.length / 3,
  }
}

// Seated pose, built by folding a standing dress figure at the hip rather than
// sampling a whole new shape: everything below the hip fraction compresses
// vertically (knees) and pushes forward slightly, everything above shifts
// down as a rigid block to sit on top. Takes the SAME standing figure result
// the caller already built (not a fresh independent sample) so positions stay
// index-aligned and colors stay byte-identical — a ParticleFigure can morph
// directly between the two poses with no visual jump at the transition.
const SEATED_HIP = 0.5
const SEATED_COMPRESS = 0.48

export function seatFigure(standing, height = 1.85) {
  const positions = standing.positions.slice()
  const shiftDown = SEATED_HIP * (1 - SEATED_COMPRESS) * height

  for (let i = 0; i < positions.length; i += 3) {
    const yFrac = positions[i + 1] / height
    if (yFrac < SEATED_HIP) {
      positions[i + 1] *= SEATED_COMPRESS
      positions[i + 2] += (SEATED_HIP - yFrac) * height * 0.3
    } else {
      positions[i + 1] -= shiftDown
    }
  }

  return {
    positions,
    colors: standing.colors,
    emphasis: standing.emphasis,
    count: standing.count,
    headOffsetY: -shiftDown,
  }
}

export function buildScatterCloud(count, radius = 3.4) {
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
