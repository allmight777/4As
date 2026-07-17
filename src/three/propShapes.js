// Small procedural point-cloud props for the "prep" and "ceremony" scenes —
// a standing oval mirror and a wedding arch. Same parametric-sampling
// technique as heartShape.js / proposalParticles.js, no external assets.

const SILVER = [0.851, 0.867, 0.89]
const SILVER_LIGHT = [0.95, 0.96, 0.97]
const GOLD = [0.722, 0.576, 0.373]
const GOLD_SOFT = [0.831, 0.706, 0.514]
const ROSE = [0.91, 0.62, 0.75]

// Oval standing mirror: a gold ring (frame) around a paler oval "glass" fill,
// on a short stand — mounted with its base at local y = 0.
export function buildMirror({ count = 260, width = 0.9, height = 1.3 } = {}) {
  const ringCount = Math.floor(count * 0.6)
  const glassCount = Math.floor(count * 0.3)
  const standCount = count - ringCount - glassCount
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  let p = 0

  function push(x, y, z, color) {
    const idx = p * 3
    positions[idx] = x
    positions[idx + 1] = y
    positions[idx + 2] = z
    colors[idx] = color[0]
    colors[idx + 1] = color[1]
    colors[idx + 2] = color[2]
    p++
  }

  const rx = width / 2
  const ry = height / 2
  const centerY = ry + 0.18 // leaves room for the stand below

  for (let i = 0; i < ringCount; i++) {
    const a = (i / ringCount) * Math.PI * 2
    const jitter = (Math.random() - 0.5) * 0.03
    push(Math.cos(a) * (rx + jitter), centerY + Math.sin(a) * (ry + jitter), (Math.random() - 0.5) * 0.03, GOLD_SOFT)
  }
  for (let i = 0; i < glassCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random())
    push(Math.cos(a) * rx * 0.82 * r, centerY + Math.sin(a) * ry * 0.82 * r, -0.01, i % 5 === 0 ? SILVER_LIGHT : SILVER)
  }
  for (let i = 0; i < standCount; i++) {
    const t = Math.random()
    push((Math.random() - 0.5) * 0.05, centerY - ry - t * 0.16, (Math.random() - 0.5) * 0.05, GOLD)
  }

  return { positions, colors, count }
}

// Wedding arch: two vertical posts joined by a curved top, with a scatter of
// rose "floral" accents along the arc. Base at local y = 0.
export function buildArch({ count = 420, width = 2.0, height = 1.9, postSpan = 0.06 } = {}) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const rx = width / 2
  const archTop = height * 0.68
  const postCount = Math.floor(count * 0.45)
  const arcCount = Math.floor(count * 0.4)
  const floralCount = count - postCount - arcCount
  let p = 0

  function push(x, y, z, color) {
    const idx = p * 3
    positions[idx] = x
    positions[idx + 1] = y
    positions[idx + 2] = z
    colors[idx] = color[0]
    colors[idx + 1] = color[1]
    colors[idx + 2] = color[2]
    p++
  }

  for (let i = 0; i < postCount; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const t = Math.random()
    const jitter = (Math.random() - 0.5) * postSpan
    push(side * rx + jitter, t * archTop, (Math.random() - 0.5) * postSpan, GOLD_SOFT)
  }
  for (let i = 0; i < arcCount; i++) {
    const a = Math.PI * (i / arcCount)
    const jitter = (Math.random() - 0.5) * 0.04
    push(Math.cos(a) * rx, archTop + Math.sin(a) * (height - archTop) + jitter, (Math.random() - 0.5) * 0.04, GOLD_SOFT)
  }
  for (let i = 0; i < floralCount; i++) {
    const a = Math.PI * Math.random()
    const rr = rx * (0.85 + Math.random() * 0.25)
    push(Math.cos(a) * rr, archTop + Math.sin(a) * (height - archTop) * (0.85 + Math.random() * 0.3), (Math.random() - 0.5) * 0.08, ROSE)
  }

  return { positions, colors, count }
}
