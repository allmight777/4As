// Particle outline of a heart, sampled from the classic parametric heart curve
// (same "sample a shape into a point cloud" technique as the figure silhouettes).
//
// Colors are NOT baked in here: each particle only gets a `blend` value (0..1),
// its position along whichever light->deep gradient is currently active. The
// component resolves the actual RGB live, every frame, from the active
// palette (rose / gold / silver) — that's what lets the heart crossfade
// smoothly between the three scenarios without rebuilding the geometry.

export function buildHeartOutline({ count = 1200, width = 3, height = 3, bandWidth = 0.05 } = {}) {
  const positions = new Float32Array(count * 3)
  const blend = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2
    const hx = 16 * Math.pow(Math.sin(t), 3)
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    const nx = hx / 16
    const ny = hy / 16
    const jitterX = (Math.random() - 0.5) * bandWidth
    const jitterY = (Math.random() - 0.5) * bandWidth
    const jitterZ = (Math.random() - 0.5) * bandWidth * 1.6

    positions[i * 3] = nx * (width / 2) + jitterX
    positions[i * 3 + 1] = ny * (height / 2) + jitterY
    positions[i * 3 + 2] = jitterZ

    blend[i] = Math.random()
  }

  return { positions, blend, count }
}
