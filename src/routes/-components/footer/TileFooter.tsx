import { useEffect, useRef } from "react"

import { BRAND_COLORS, makeTileSprite } from "./tileSprites"

export interface TileFooterProps {
  children?: React.ReactNode
  cols?: number
}

const MOBILE_BREAKPOINT = 640
const MOBILE_COLS = 8

// Seeded hash of (col, row) so colors never flicker between frames.
function hashColor(col: number, row: number): number {
  let h = (col * 374761393 + row * 668265263) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return Math.abs(h) % BRAND_COLORS.length
}

export function TileFooter({ children, cols = 16 }: TileFooterProps) {
  const measureRef = useRef<HTMLDivElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const measure = measureRef.current
    const wrap = wrapRef.current
    if (!canvas || !measure || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let tileW = 0
    let max = 0
    let vh = 0
    let effCols = cols
    let effRows = 0
    let colors = new Uint8Array(0)
    let sprites: Array<HTMLCanvasElement> = []

    const bake = () => {
      const cw = measure.clientWidth || window.innerWidth
      vh = window.innerHeight
      effCols = cw < MOBILE_BREAKPOINT ? MOBILE_COLS : cols
      tileW = cw / effCols
      // Full-screen spread: rows fill the viewport, tiles stay square.
      effRows = Math.max(1, Math.round(vh / tileW))
      max = vh / effRows

      colors = new Uint8Array(effCols * effRows)
      for (let r = 0; r < effRows; r++) {
        for (let c = 0; c < effCols; c++) {
          colors[r * effCols + c] = hashColor(c, r)
        }
      }

      const tw = Math.max(1, Math.round(tileW * dpr))
      sprites = BRAND_COLORS.map((color, i) =>
        makeTileSprite(color, tw, Math.max(1, Math.round(max * dpr)), i + 1),
      )

      canvas.width = Math.max(1, Math.round(cw * dpr))
      canvas.height = Math.max(1, Math.round(vh * dpr))
      canvas.style.height = `${vh}px`
      wrap.style.height = `${vh}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const render = () => {
      const cssW = tileW * effCols
      ctx.clearRect(0, 0, cssW, vh)
      for (let r = 0; r < effRows; r++) {
        // Bottom-up; 0.5px bleed hides fractional-width seams.
        const y = vh - (r + 1) * max - 0.25
        for (let c = 0; c < effCols; c++) {
          const sprite = sprites[colors[r * effCols + c]]
          ctx.drawImage(
            sprite,
            0,
            0,
            sprite.width,
            sprite.height,
            c * tileW,
            y,
            tileW + 0.5,
            max + 0.5,
          )
        }
      }
    }

    bake()
    render()

    let debounce = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(debounce)
      debounce = window.setTimeout(() => {
        bake()
        render()
      }, 150)
    })
    ro.observe(measure)

    return () => {
      ro.disconnect()
      window.clearTimeout(debounce)
    }
  }, [cols])

  return (
    <footer className="fixed inset-x-0 bottom-0 z-0 h-screen">
      <div ref={measureRef} className="relative h-full overflow-hidden">
        {children}
        <div ref={wrapRef} aria-hidden="true" className="relative w-full">
          <canvas
            ref={canvasRef}
            className="absolute bottom-0 left-0 block w-full"
          />
        </div>
      </div>
    </footer>
  )
}
