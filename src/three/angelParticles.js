// Procedural point-cloud angel silhouettes that flank the hero heart — same
// "sample a shape into particles" technique as proposalParticles/propShapes.
// Original composition (simple robe + two fanned wings + a halo ring), only
// loosely inspired by the classic "cherub either side of a heart" motif, not
// copied from any reference image.
//
// Base pose is built at local height = 1 (feet at y = 0), so callers can
// scale it to whatever world size they need. `wingMask`/`wingSide`/`wingT`
// are parallel per-particle arrays used to animate a wing-flutter: only
// wing particles move, and they swing more the farther they are from the
// shoulder (wingT close to 1 = near the tip).

const IVORY_BRIGHT = [1, 0.98, 0.93]
const GOLD_BRIGHT = [0.96, 0.85, 0.64]

function lerpColor(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

export function buildAngel({ count = 420 } = {}) {
  const bodyShare = 0.32
  const headShare = 0.12
  const wingShare = 0.44
  // Halo gets whatever's left (no explicit share) so the four counts always sum to `count`.

  const bodyCount = Math.floor(count * bodyShare)
  const headCount = Math.floor(count * headShare)
  const wingCount = Math.floor(count * wingShare)
  const haloCount = count - bodyCount - headCount - wingCount

  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const wingMask = new Float32Array(count)
  const wingSide = new Float32Array(count)
  const wingT = new Float32Array(count)
  let p = 0

  function push(x, y, z, color, isWing = false, side = 0, t = 0) {
    const idx = p * 3
    positions[idx] = x
    positions[idx + 1] = y
    positions[idx + 2] = z
    colors[idx] = color[0]
    colors[idx + 1] = color[1]
    colors[idx + 2] = color[2]
    wingMask[p] = isWing ? 1 : 0
    wingSide[p] = side
    wingT[p] = t
    p++
  }

  // Robe: narrow shoulders, flares out toward the feet.
  const shoulderY = 0.62
  for (let i = 0; i < bodyCount; i++) {
    const t = Math.random()
    const radius = 0.07 + (1 - t) * 0.16
    const a = Math.random() * Math.PI * 2
    const rr = radius * Math.sqrt(Math.random())
    push(Math.cos(a) * rr, t * shoulderY, Math.sin(a) * rr * 0.7, lerpColor(IVORY_BRIGHT, GOLD_BRIGHT, 0.15))
  }

  // Head: small sphere sitting on the shoulders.
  const headCenter = [0, shoulderY + 0.1, 0]
  const headRadius = 0.1
  for (let i = 0; i < headCount; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = u * Math.PI * 2
    const phi = Math.acos(2 * v - 1)
    const r = headRadius * Math.cbrt(Math.random())
    push(
      headCenter[0] + Math.sin(phi) * Math.cos(theta) * r,
      headCenter[1] + Math.cos(phi) * r,
      headCenter[2] + Math.sin(phi) * Math.sin(theta) * r * 0.85,
      IVORY_BRIGHT,
    )
  }

  // Wings: fanned arcs of feathers rooted at the shoulders, curving up and
  // back. wingT (0 at root -> 1 at tip) drives the flutter amplitude.
  for (let i = 0; i < wingCount; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const t = Math.random()
    const feather = Math.random()
    const spread = 0.35 + feather * 0.28
    const lift = Math.sin(t * Math.PI * 0.55) * 0.5
    const x = side * (0.06 + t * spread)
    const y = shoulderY - 0.05 + t * 0.4 + lift * 0.18
    const z = -0.03 - t * 0.22 + (Math.random() - 0.5) * 0.03
    push(x, y, z, lerpColor(IVORY_BRIGHT, GOLD_BRIGHT, 0.3 + t * 0.5), true, side, t)
  }

  // Halo: thin ring floating above the head.
  const haloY = shoulderY + 0.32
  const haloR = 0.13
  for (let i = 0; i < haloCount; i++) {
    const a = (i / haloCount) * Math.PI * 2
    const jitter = (Math.random() - 0.5) * 0.012
    push(Math.cos(a) * (haloR + jitter), haloY, Math.sin(a) * (haloR + jitter) * 0.55, GOLD_BRIGHT)
  }

  return { positions, colors, wingMask, wingSide, wingT, count }
}
