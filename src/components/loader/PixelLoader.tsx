import { useLayoutEffect, useRef } from "react"
import { motion, useReducedMotion } from "motion/react"

// 20px tiles: tiny dense mosaic (~5k tiles at 1080p), still a single canvas.
const CELL = 16

const DISSOLVE_DURATION = 0.35

const BRAND_COLORS = ["#ff6200", "#0044ff", "#02c002", "#fc5ead"] as const

interface Tile {
  sprite: number
  delay: number
  x: number
  y: number
}


function makeTileSprite(color: string, size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  ctx.fillStyle = color
  ctx.fillRect(0, 0, size, size)

  // Inset glow: clip to tile, draw a frame with a hole, let the shadow bleed in.
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, size, size)
  ctx.clip()
  ctx.shadowColor = "rgba(255, 255, 255, 0.85)"
  ctx.shadowBlur = size * 0.28
  ctx.fillStyle = "#000" // never visible, it's outside the clip
  ctx.beginPath()
  ctx.rect(-size, -size, size * 3, size * 3) // outer
  ctx.rect(0, 0, size, size) // hole
  ctx.fill("evenodd")
  ctx.restore()

  // Grain (a bit stronger so it reads at 64px)
  const dots = Math.floor((size * size) / 10)
  for (let i = 0; i < dots; i++) {
    const alpha = Math.random() * 0.2
    ctx.fillStyle =
      Math.random() < 0.5
        ? `rgba(255, 255, 255, ${alpha})`
        : `rgba(0, 0, 0, ${alpha})`
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1)
  }

  return canvas
}

export function PixelLoader() {
  const reduceMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useLayoutEffect(() => {
    if (reduceMotion) return
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = window.innerWidth
    const cssH = window.innerHeight
    canvas.width = Math.ceil(cssW * dpr)
    canvas.height = Math.ceil(cssH * dpr)

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const cols = Math.ceil(cssW / CELL)
    const rows = Math.ceil(cssH / CELL)

    const sprites = BRAND_COLORS.map((color) => makeTileSprite(color, 128))

    const tiles: Array<Tile> = Array.from({ length: cols * rows }, (_, i) => ({
      sprite: Math.floor(Math.random() * sprites.length),
      delay: 0.15 + Math.random() * 1.4,
      x: (i % cols) * CELL,
      y: Math.floor(i / cols) * CELL,
    }))

    let raf = 0
    const start = performance.now()

    const draw = (now: number) => {
      const t = (now - start) / 1000
      // No base fill: cleared pixels stay transparent so each dissolved
      // tile reveals the website directly, piece by piece.
      ctx.clearRect(0, 0, cssW, cssH)

      let alive = false
      for (const tile of tiles) {
        const p = (t - tile.delay) / DISSOLVE_DURATION
        if (p < 0) {
          ctx.drawImage(sprites[tile.sprite], tile.x, tile.y, CELL, CELL)
          alive = true
        } else if (p < 1) {
          const scale = 1 - p * p
          const size = Math.max(0.01, CELL * scale)
          const dx = tile.x + (CELL - size) / 2
          const dy = tile.y + (CELL - size) / 2
          ctx.globalAlpha = 1 - p
          ctx.drawImage(sprites[tile.sprite], dx, dy, size, size)
          ctx.globalAlpha = 1
          alive = true
        }
      }

      if (alive || t < 5) {
        raf = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, cssW, cssH)
      }
    }

    // Paint the full sheet synchronously before first paint so the hero
    // never flashes through, then hand over to the rAF loop.
    draw(start)
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [reduceMotion])

  if (reduceMotion) return null

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-100"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </motion.div>
  )
}
