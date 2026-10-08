const REF = 72

export const BRAND_COLORS = [
  "#FC5EAD",
  "#F799FF",
  "#B5C9FF",
  "#366AF9",
] as const

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function insetGlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  blur: number,
  alpha: number,
  offset: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.clip()
  ctx.shadowColor = `rgba(255,255,255,${alpha})`
  ctx.shadowBlur = blur
  ctx.shadowOffsetX = offset
  ctx.shadowOffsetY = offset
  ctx.fillStyle = "#000" // outside the clip, never visible
  ctx.beginPath()
  ctx.rect(-w * 2, -h * 2, w * 5, h * 5)
  ctx.rect(0, 0, w, h)
  ctx.fill("evenodd")
  ctx.restore()
}

export function makeTileSprite(
  color: string,
  w: number,
  h: number,
  seed = 1,
) {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(w))
  canvas.height = Math.max(1, Math.round(h))
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas
  const s = Math.min(w, h) / REF

  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  insetGlow(ctx, w, h, 2 * 5.268 * s, 0.6, 0)
  insetGlow(ctx, w, h, 2 * 4.789 * s, 0.45, 0.479 * s)

  const src = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const out = ctx.createImageData(canvas.width, canvas.height)
  const rand = mulberry32(seed)
  const amp = 3.83 * s
  const W = canvas.width
  const H = canvas.height
  const cx = (v: number) => Math.min(W - 1, Math.max(0, v))
  const cy = (v: number) => Math.min(H - 1, Math.max(0, v))

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const si =
        (cy(y + Math.round((rand() - 0.5) * amp)) * W +
          cx(x + Math.round((rand() - 0.5) * amp))) *
        4
      const di = (y * W + x) * 4
      let r = src.data[si]
      let g = src.data[si + 1]
      let b = src.data[si + 2]
      if (rand() < 0.51) {
        r += (255 - r) * 0.25
        g += (255 - g) * 0.25
        b += (255 - b) * 0.25
      }
      out.data[di] = r
      out.data[di + 1] = g
      out.data[di + 2] = b
      out.data[di + 3] = 255
    }
  }
  ctx.putImageData(out, 0, 0)
  return canvas
}
