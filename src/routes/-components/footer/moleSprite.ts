export type MoleVariant = "normal" | "bonked" | "blink"

const BODY = "#6b4a30"
const BODY_DARK = "#2e1d10"
const BODY_LIGHT = "#8a6847"
const SNOUT = "#f2a9b8"
const NOSE = "#d94f6b"

/**
 * Bakes a cartoon mole into an offscreen canvas once.
 * The mole faces forward with its bottom edge at the canvas bottom,
 * so the game loop can slide it up out of a tile hole.
 */
export function makeMoleSprite(
  size = 256,
  variant: MoleVariant = "normal",
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas
  const u = size / 256

  ctx.lineJoin = "round"
  ctx.lineCap = "round"

  const cx = 128 * u

  // Paws (behind body)
  ctx.fillStyle = "#5a3b26"
  ctx.strokeStyle = BODY_DARK
  ctx.lineWidth = 5 * u
  for (const px of [46 * u, 210 * u]) {
    ctx.beginPath()
    ctx.ellipse(px, 208 * u, 20 * u, 15 * u, px < cx ? -0.5 : 0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  // Body dome
  const bodyGrad = ctx.createLinearGradient(0, 50 * u, 0, 240 * u)
  bodyGrad.addColorStop(0, BODY_LIGHT)
  bodyGrad.addColorStop(0.45, BODY)
  bodyGrad.addColorStop(1, "#4e3420")
  ctx.fillStyle = bodyGrad
  ctx.strokeStyle = BODY_DARK
  ctx.lineWidth = 7 * u
  ctx.beginPath()
  ctx.ellipse(cx, 152 * u, 82 * u, 92 * u, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Gloss highlight (top-left of head)
  ctx.fillStyle = "rgba(255,255,255,0.14)"
  ctx.beginPath()
  ctx.ellipse(92 * u, 92 * u, 26 * u, 38 * u, -0.5, 0, Math.PI * 2)
  ctx.fill()

  // Hair tuft
  ctx.strokeStyle = BODY_DARK
  ctx.lineWidth = 4 * u
  for (const [dx, h] of [
    [-10, 22],
    [0, 28],
    [10, 22],
  ] as Array<[number, number]>) {
    ctx.beginPath()
    ctx.moveTo(cx + dx * u, 62 * u)
    ctx.quadraticCurveTo(
      cx + dx * 1.6 * u,
      (62 - h) * u,
      cx + dx * 2.1 * u,
      (62 - h + 6) * u,
    )
    ctx.stroke()
  }

  // Snout
  ctx.fillStyle = SNOUT
  ctx.strokeStyle = BODY_DARK
  ctx.lineWidth = 5 * u
  ctx.beginPath()
  ctx.ellipse(cx, 170 * u, 34 * u, 26 * u, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Nose
  ctx.fillStyle = NOSE
  ctx.beginPath()
  ctx.ellipse(cx, 160 * u, 12 * u, 9 * u, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "rgba(255,255,255,0.65)"
  ctx.beginPath()
  ctx.arc(cx - 4 * u, 157 * u, 2.6 * u, 0, Math.PI * 2)
  ctx.fill()
  // Nostrils
  ctx.fillStyle = "#7c1f33"
  ctx.beginPath()
  ctx.arc(cx - 6 * u, 161 * u, 1.8 * u, 0, Math.PI * 2)
  ctx.arc(cx + 6 * u, 161 * u, 1.8 * u, 0, Math.PI * 2)
  ctx.fill()

  if (variant === "normal" || variant === "blink") {
    // Eyes (or closed lids for blink)
    if (variant === "blink") {
      ctx.strokeStyle = "#1a1210"
      ctx.lineWidth = 5 * u
      for (const ex of [96 * u, 160 * u]) {
        ctx.beginPath()
        ctx.moveTo(ex - 9 * u, 120 * u)
        ctx.quadraticCurveTo(ex, (124) * u, ex + 9 * u, 120 * u)
        ctx.stroke()
      }
    } else {
      for (const ex of [96 * u, 160 * u]) {
        ctx.fillStyle = "#1a1210"
        ctx.beginPath()
        ctx.arc(ex, 120 * u, 11 * u, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.arc(ex + 3.5 * u, 116.5 * u, 3.4 * u, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // Teeth
    ctx.fillStyle = "#fff"
    ctx.strokeStyle = BODY_DARK
    ctx.lineWidth = 3 * u
    ctx.beginPath()
    ctx.roundRect(cx - 9 * u, 190 * u, 18 * u, 14 * u, 3 * u)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, 190 * u)
    ctx.lineTo(cx, 204 * u)
    ctx.stroke()
  } else {
    // X eyes (bonked)
    ctx.strokeStyle = "#1a1210"
    ctx.lineWidth = 6 * u
    for (const ex of [96 * u, 160 * u]) {
      const r = 9 * u
      ctx.beginPath()
      ctx.moveTo(ex - r, 120 * u - r)
      ctx.lineTo(ex + r, 120 * u + r)
      ctx.moveTo(ex + r, 120 * u - r)
      ctx.lineTo(ex - r, 120 * u + r)
      ctx.stroke()
    }
    // Dizzy mouth (small "o")
    ctx.strokeStyle = BODY_DARK
    ctx.lineWidth = 4 * u
    ctx.beginPath()
    ctx.arc(cx, 196 * u, 7 * u, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Whiskers
  ctx.strokeStyle = "rgba(46,29,16,0.55)"
  ctx.lineWidth = 2 * u
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y = (166 + i * 8) * u
      ctx.beginPath()
      ctx.moveTo(cx + side * 28 * u, y)
      ctx.lineTo(cx + side * 52 * u, y + (i - 1) * 4 * u)
      ctx.stroke()
    }
  }

  return canvas
}

/** Draws orbiting stars above a bonked mole. `t` is ms since bonk. */
export function drawBonkStars(
  ctx: CanvasRenderingContext2D,
  headX: number,
  headY: number,
  radius: number,
  t: number,
) {
  const n = 3
  for (let i = 0; i < n; i++) {
    const a = t * 0.011 + (i * Math.PI * 2) / n
    const x = headX + Math.cos(a) * radius
    const y = headY + Math.sin(a) * radius * 0.45 - radius * 0.35
    drawStar(ctx, x, y, radius * 0.28, "#ffd83d", "#7a4d00")
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
  stroke: string,
) {
  ctx.save()
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const aOuter = -Math.PI / 2 + (i * Math.PI * 2) / 5
    const aInner = aOuter + Math.PI / 5
    const ox = x + Math.cos(aOuter) * r
    const oy = y + Math.sin(aOuter) * r
    const ix = x + Math.cos(aInner) * r * 0.45
    const iy = y + Math.sin(aInner) * r * 0.45
    if (i === 0) ctx.moveTo(ox, oy)
    else ctx.lineTo(ox, oy)
    ctx.lineTo(ix, iy)
  }
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = Math.max(1, r * 0.18)
  ctx.strokeStyle = stroke
  ctx.stroke()
  ctx.restore()
}
