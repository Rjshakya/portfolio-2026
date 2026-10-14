import { useEffect, useRef, useState } from "react"

import { BRAND_COLORS, makeTileSprite } from "./tileSprites"
import {
  BLINK_MS,
  EMERGE_MS,
  SPAWN_MAX_MS,
  SPAWN_MIN_MS,
  advanceMole,
  emergenceP,
  makeMole,
  rand,
  type ActiveMole,
} from "./moleEngine"
import { drawBonkStars, makeMoleSprite } from "./moleSprite"

export interface TileFooterProps {
  children?: React.ReactNode
  cols?: number
}

const MOBILE_BREAKPOINT = 640
const MOBILE_COLS = 8

interface Floater {
  x: number
  y: number
  t0: number
  text: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  t0: number
  life: number
  size: number
  color: string
}

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
  const hammerRef = useRef<HTMLDivElement | null>(null)

  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [muted, setMuted] = useState(false)
  const [reduced, setReduced] = useState(false)
  const mutedRef = useRef(false)
  const scoreRef = useRef(0)
  const resetRef = useRef(false)

  const toggleMute = () => {
    mutedRef.current = !mutedRef.current
    setMuted(mutedRef.current)
  }

  const resetGame = () => {
    scoreRef.current = 0
    setScore(0)
    resetRef.current = true
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const measure = measureRef.current
    const wrap = wrapRef.current
    if (!canvas || !measure || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const finePointer = window.matchMedia("(pointer: fine)").matches
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    setReduced(prefersReduced)

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let tileW = 0
    let tileH = 0
    let vh = 0
    let effCols = cols
    let effRows = 0
    let colors = new Uint8Array(0)
    let sprites: Array<HTMLCanvasElement> = []

    // Moles are baked once at high res; scaling down stays crisp.
    const moleNormal = makeMoleSprite(256, "normal")
    const moleBlink = makeMoleSprite(256, "blink")
    const moleBonked = makeMoleSprite(256, "bonked")

    let moles: Array<ActiveMole> = []
    let floaters: Array<Floater> = []
    let particles: Array<Particle> = []
    let nextSpawnAt = performance.now() + 600
    let bestScore = Number(window.localStorage.getItem("tile-moles-best") ?? "0")
    if (!Number.isFinite(bestScore) || bestScore < 0) bestScore = 0
    if (bestScore > 0) setBest(bestScore)

    let audioCtx: AudioContext | null = null
    const ensureAudio = (): AudioContext | null => {
      try {
        if (!audioCtx) {
          const w = window as unknown as {
            AudioContext?: typeof AudioContext
            webkitAudioContext?: typeof AudioContext
          }
          const AC = w.AudioContext ?? w.webkitAudioContext
          if (AC === undefined) return null
          audioCtx = new AC()
        }
        if (audioCtx.state === "suspended") void audioCtx.resume()
        return audioCtx
      } catch {
        return null
      }
    }
    const tone = (
      from: number,
      to: number,
      dur: number,
      type: OscillatorType,
      gain: number,
    ) => {
      if (mutedRef.current) return
      const ac = ensureAudio()
      if (!ac) return
      const t = ac.currentTime
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(from, t)
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur)
      g.gain.setValueAtTime(gain, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      osc.connect(g)
      g.connect(ac.destination)
      osc.start(t)
      osc.stop(t + dur + 0.02)
    }
    const popSound = () => tone(300, 640, 0.09, "triangle", 0.1)
    const thudSound = () => tone(210, 65, 0.14, "sine", 0.22)

    const bake = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cw = measure.clientWidth || window.innerWidth
      vh = window.innerHeight
      effCols = cw < MOBILE_BREAKPOINT ? MOBILE_COLS : cols
      tileW = cw / effCols
      // Full-screen spread: rows fill the viewport, tiles stay square.
      effRows = Math.max(1, Math.round(vh / tileW))
      tileH = vh / effRows

      colors = new Uint8Array(effCols * effRows)
      for (let r = 0; r < effRows; r++) {
        for (let c = 0; c < effCols; c++) {
          colors[r * effCols + c] = hashColor(c, r)
        }
      }

      const tw = Math.max(1, Math.round(tileW * dpr))
      sprites = BRAND_COLORS.map((color, i) =>
        makeTileSprite(color, tw, Math.max(1, Math.round(tileH * dpr)), i + 1),
      )

      canvas.width = Math.max(1, Math.round(cw * dpr))
      canvas.height = Math.max(1, Math.round(vh * dpr))
      canvas.style.height = `${vh}px`
      wrap.style.height = `${vh}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const maxMoles = () => (effCols <= MOBILE_COLS ? 1 : effCols * effRows > 150 ? 3 : 2)

    const burst = (
      x: number,
      y: number,
      now: number,
      n: number,
      colorset: Array<string>,
      speed: number,
    ) => {
      for (let i = 0; i < n; i++) {
        if (particles.length > 140) return
        const a = Math.random() * Math.PI * 2
        const v = speed * (0.4 + Math.random() * 0.9)
        particles.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - speed * 0.55,
          t0: now,
          life: 450 + Math.random() * 350,
          size: 2 + Math.random() * 3.5,
          color: colorset[i % colorset.length] ?? "#fff",
        })
      }
    }

    const trySpawn = (now: number) => {
      if (now < nextSpawnAt) return
      nextSpawnAt = now + rand(SPAWN_MIN_MS, SPAWN_MAX_MS)
      const alive = moles.length
      if (alive >= maxMoles()) return
      const total = effCols * effRows
      if (total <= 0) return
      const occupied = new Set(moles.map((m) => m.tile))
      // Keep the game fair on small screens: never reuse the last tile twice.
      for (let attempt = 0; attempt < 8; attempt++) {
        const tile = Math.floor(Math.random() * total)
        if (occupied.has(tile)) continue
        const col = tile % effCols
        const row = Math.floor(tile / effCols)
        moles.push(makeMole(tile, col, row, now))
        const hx = col * tileW + tileW / 2
        const hy = vh - (row + 1) * tileH - 0.25 + tileH * 0.74
        burst(hx, hy, now, 5, ["#2e1d10", "#4e3420", "#8a6847"], 120)
        popSound()
        return
      }
    }

    const tileXY = (col: number, row: number) => ({
      x: col * tileW,
      y: vh - (row + 1) * tileH - 0.25,
    })

    /** Geometry shared by draw + hit test so whacks land where the mole is. */
    const moleFrame = (m: ActiveMole, now: number) => {
      const { x: tx, y: ty } = tileXY(m.col, m.row)
      const cx = tx + tileW / 2
      const holeY = ty + tileH * 0.74
      const holeW = tileW * 0.84
      const holeH = Math.max(6, tileH * 0.2)
      const moleW = tileW * 0.72
      const moleH = tileH * 0.92
      const p = emergenceP(m, now)
      const pc = Math.max(0, p)
      const yBottom = holeY + moleH * (0.18 + (1 - Math.min(pc, 1.15)) * 0.82)

      let sx = 1
      let sy = 1
      let rot = 0
      const elapsed = now - m.phaseStart
      if (m.phase === "emerging") {
        const t = Math.min(1, elapsed / EMERGE_MS)
        const stretch = Math.sin(t * Math.PI) * 0.13
        sy = 1 + stretch
        sx = 1 - stretch * 0.7
        // Anticipation squash in the first frames.
        if (t < 0.25) {
          const k = 1 - t / 0.25
          sx += k * 0.1
          sy -= k * 0.12
        }
      } else if (m.phase === "holding") {
        const breathe = Math.sin((elapsed + m.seed) / 380) * 0.022
        sy = 1 + breathe
        sx = 1 - breathe
        rot = Math.sin((elapsed + m.seed * 2) / 520) * 0.035
      } else if (m.phase === "retreating") {
        sx = 1.08
        sy = 0.92
      } else {
        sx = 1.35
        sy = 0.55
        rot = Math.sin(elapsed * 0.05 + m.seed) * 0.04
      }
      return { tx, ty, cx, holeY, holeW, holeH, moleW, moleH, p, yBottom, sx, sy, rot, elapsed }
    }

    const drawMole = (m: ActiveMole, now: number) => {
      const f = moleFrame(m, now)
      if (f.p <= 0.02) return

      // Hole back (dark pit the mole climbs out of).
      ctx.fillStyle = "rgba(0,0,0,0.28)"
      ctx.beginPath()
      ctx.ellipse(f.cx, f.holeY, f.holeW / 2 + 3, f.holeH / 2 + 3, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "#1c0f07"
      ctx.beginPath()
      ctx.ellipse(f.cx, f.holeY, f.holeW / 2, f.holeH / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Mole body, clipped to its tile so it slides out from under the surface.
      const blinking =
        m.phase === "holding" &&
        now - m.blinkStart >= 0 &&
        now - m.blinkStart <= BLINK_MS
      const sprite =
        m.phase === "bonked" ? moleBonked : blinking ? moleBlink : moleNormal

      ctx.save()
      ctx.beginPath()
      ctx.rect(f.tx, f.ty, tileW + 0.5, tileH + 0.5)
      ctx.clip()
      // Contact shadow that grows as the mole rises.
      ctx.fillStyle = `rgba(0,0,0,${0.18 + 0.16 * Math.min(1, Math.max(0, f.p))})`
      ctx.beginPath()
      ctx.ellipse(f.cx, f.holeY, f.holeW * 0.32, f.holeH * 0.3, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.translate(f.cx, f.yBottom)
      ctx.rotate(f.rot)
      ctx.scale(f.sx, f.sy)
      const dw = f.moleW
      const dh = f.moleH
      ctx.drawImage(sprite, -dw / 2, -dh, dw, dh)
      ctx.restore()

      // Front lip of the hole drawn OVER the mole base — this sells the depth.
      ctx.save()
      ctx.beginPath()
      ctx.rect(f.tx, f.holeY, tileW + 0.5, f.ty + tileH + 0.5 - f.holeY)
      ctx.clip()
      ctx.fillStyle = "#2a1a0d"
      ctx.beginPath()
      ctx.ellipse(f.cx, f.holeY + 1, f.holeW / 2 + 2, f.holeH * 0.52, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "rgba(255,255,255,0.3)"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(
        f.cx,
        f.holeY + 1,
        f.holeW / 2 + 2,
        f.holeH * 0.52,
        0,
        Math.PI * 0.12,
        Math.PI * 0.88,
      )
      ctx.stroke()
      // Dirt specks around the rim (deterministic per mole).
      ctx.fillStyle = "rgba(0,0,0,0.35)"
      for (let i = 0; i < 5; i++) {
        const a = (m.seed * (i + 3) * 2.39 + i * 1.7) % (Math.PI * 2)
        const rx = f.holeW / 2 + 4 + ((m.seed + i * 7) % 5)
        const sxp = f.cx + Math.cos(a) * rx
        const syp = f.holeY + Math.sin(a) * (f.holeH / 2 + 2)
        ctx.beginPath()
        ctx.arc(sxp, syp, 1.4 + ((m.seed + i) % 1.6), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      if (m.phase === "bonked") {
        const headY = f.yBottom - f.moleH * f.sy - 4
        drawBonkStars(ctx, f.cx, headY, f.moleW * 0.42, f.elapsed)
      }
    }

    const render = (now: number) => {
      const cssW = tileW * effCols
      ctx.clearRect(0, 0, cssW, vh)
      for (let r = 0; r < effRows; r++) {
        // Bottom-up; 0.5px bleed hides fractional-width seams.
        const y = vh - (r + 1) * tileH - 0.25
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
            tileH + 0.5,
          )
        }
      }

      for (const m of moles) drawMole(m, now)

      // Particles (dirt + stars).
      const dt = 1 / 60
      particles = particles.filter((pt) => now - pt.t0 < pt.life)
      for (const pt of particles) {
        const age = (now - pt.t0) / pt.life
        pt.vy += 620 * dt
        pt.x += pt.vx * dt
        pt.y += pt.vy * dt
        ctx.globalAlpha = 1 - age
        ctx.fillStyle = pt.color
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size)
      }
      ctx.globalAlpha = 1

      // Floating "+1" texts.
      floaters = floaters.filter((fl) => now - fl.t0 < 800)
      for (const fl of floaters) {
        const t = (now - fl.t0) / 800
        const y = fl.y - t * 42
        ctx.globalAlpha = 1 - t * t
        ctx.font = `800 ${Math.round(Math.max(13, tileW * 0.24))}px "Geist Variable", system-ui, sans-serif`
        ctx.textAlign = "center"
        ctx.lineWidth = 3
        ctx.strokeStyle = "rgba(0,0,0,0.7)"
        ctx.strokeText(fl.text, fl.x, y)
        ctx.fillStyle = "#fff"
        ctx.fillText(fl.text, fl.x, y)
      }
      ctx.globalAlpha = 1
    }

    const addScore = (n: number, x: number, y: number, now: number) => {
      scoreRef.current += n
      setScore(scoreRef.current)
      if (scoreRef.current > bestScore) {
        bestScore = scoreRef.current
        setBest(bestScore)
        try {
          window.localStorage.setItem("tile-moles-best", String(bestScore))
        } catch {
          /* storage unavailable */
        }
      }
      floaters.push({ x, y, t0: now, text: `+${n}` })
    }

    // --- Hammer cursor (fine pointers only) ---
    const hammerPos = { x: 0, y: 0, visible: false, smashUntil: 0 }
    const paintHammer = (now: number) => {
      const el = hammerRef.current
      if (!el) return
      if (!finePointer || !hammerPos.visible) {
        el.style.opacity = "0"
        return
      }
      el.style.opacity = "1"
      const smashing = now < hammerPos.smashUntil
      const angle = smashing ? -38 : -12
      el.style.transform = `translate3d(${hammerPos.x - 26}px, ${hammerPos.y - 30}px, 0) rotate(${angle}deg) scale(${smashing ? 1.12 : 1})`
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      hammerPos.x = e.clientX - rect.left
      hammerPos.y = e.clientY - rect.top
      hammerPos.visible = inside
      paintHammer(performance.now())
    }

    const onLeave = () => {
      hammerPos.visible = false
      paintHammer(performance.now())
    }

    const onDown = (e: PointerEvent) => {
      ensureAudio()
      const now = performance.now()
      hammerPos.smashUntil = now + 140
      const rect = canvas.getBoundingClientRect()
      hammerPos.x = e.clientX - rect.left
      hammerPos.y = e.clientY - rect.top
      hammerPos.visible = true
      paintHammer(now)

      const x = hammerPos.x
      const y = hammerPos.y
      for (let i = moles.length - 1; i >= 0; i--) {
        const m = moles[i]
        if (m.phase !== "emerging" && m.phase !== "holding") continue
        const f = moleFrame(m, now)
        if (f.p < 0.25) continue
        const mcx = f.cx
        const mcy = f.yBottom - f.moleH * f.sy * 0.5
        const rx = f.moleW * f.sx * 0.62
        const ry = f.moleH * f.sy * 0.58
        const dx = (x - mcx) / rx
        const dy = (y - mcy) / ry
        if (dx * dx + dy * dy <= 1) {
          m.phase = "bonked"
          m.phaseStart = now
          const headY = f.yBottom - f.moleH * f.sy - 4
          addScore(1, f.cx, headY, now)
          burst(f.cx, headY + 10, now, 9, ["#ffd83d", "#fff", "#fc5ead"], 170)
          thudSound()
          break
        }
      }
    }

    bake()

    if (prefersReduced) {
      render(performance.now())
      let debounce = 0
      const ro = new ResizeObserver(() => {
        window.clearTimeout(debounce)
        debounce = window.setTimeout(() => {
          bake()
          render(performance.now())
        }, 150)
      })
      ro.observe(measure)
      return () => {
        ro.disconnect()
        window.clearTimeout(debounce)
      }
    }

    let raf = 0
    let running = true
    let visible = true

    const loop = (now: number) => {
      if (!running) return
      if (resetRef.current) {
        resetRef.current = false
        moles = []
        particles = []
        floaters = []
        nextSpawnAt = now + 400
      }
      if (visible && !document.hidden) {
        trySpawn(now)
        for (let i = moles.length - 1; i >= 0; i--) {
          const m = moles[i]
          if (advanceMole(m, now)) moles.splice(i, 1)
        }
        // Reschedule HOLD length scatter so waves feel organic.
        render(now)
      }
      raf = requestAnimationFrame(loop)
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((en) => en.isIntersecting)
      },
      { threshold: 0.05 },
    )
    io.observe(measure)

    let debounce = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(debounce)
      debounce = window.setTimeout(() => {
        bake()
        moles = []
        particles = []
        floaters = []
      }, 150)
    })
    ro.observe(measure)

    canvas.addEventListener("pointerdown", onDown)
    measure.addEventListener("pointermove", onMove)
    measure.addEventListener("pointerleave", onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.clearTimeout(debounce)
      canvas.removeEventListener("pointerdown", onDown)
      measure.removeEventListener("pointermove", onMove)
      measure.removeEventListener("pointerleave", onLeave)
      if (audioCtx) void audioCtx.close().catch(() => undefined)
    }
  }, [cols])

  return (
    <footer className="fixed inset-x-0 bottom-0 z-0 h-screen">
      <div
        ref={measureRef}
        className="relative h-full overflow-hidden select-none"
      >
        {children}
        <div ref={wrapRef} className="relative w-full">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Whack-a-mole game. Moles pop out of tiles. Activate a mole to whack it."
            className="absolute bottom-0 left-0 block w-full [@media(pointer:fine)]:cursor-none"
            style={{ touchAction: "pan-y" }}
          />
          {/* Hammer cursor */}
          <div
            ref={hammerRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-20 opacity-0 transition-[opacity] duration-150"
            style={{ willChange: "transform" }}
          >
            <svg
              width="52"
              height="52"
              viewBox="0 0 52 52"
              fill="none"
              className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)]"
            >
              <rect
                x="22"
                y="14"
                width="7"
                height="28"
                rx="3.5"
                fill="#8a6847"
                stroke="#2e1d10"
                strokeWidth="2"
              />
              <rect
                x="10"
                y="4"
                width="32"
                height="16"
                rx="4"
                fill="#3d3d3d"
                stroke="#111"
                strokeWidth="2"
              />
              <rect x="10" y="4" width="10" height="16" rx="4" fill="#fc5ead" />
            </svg>
          </div>
          {/* Score HUD */}
          <div className="pointer-events-none absolute inset-x-0 top-5 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/25 bg-black/55 py-2 pr-2 pl-4 text-white shadow-lg backdrop-blur-md">
              <span className="text-xs font-bold tracking-[0.18em] uppercase opacity-70">
                Moles
              </span>
              <span
                aria-live="polite"
                className="min-w-8 text-center text-lg font-extrabold tabular-nums"
              >
                {score}
              </span>
              {best > 0 && (
                <span className="text-xs font-semibold opacity-60 tabular-nums">
                  Best {best}
                </span>
              )}
              <span className="hidden text-xs opacity-60 sm:inline">
                {reduced ? "Motion off — static tiles" : "Click a mole to whack it"}
              </span>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute game sounds" : "Mute game sounds"}
                className="rounded-full p-2 transition hover:bg-white/15"
              >
                {muted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <line x1="22" x2="16" y1="9" y2="15" />
                    <line x1="16" x2="22" y1="9" y2="15" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={resetGame}
                aria-label="Reset score"
                className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
