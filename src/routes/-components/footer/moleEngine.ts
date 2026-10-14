export type MolePhase =
  | "emerging"
  | "holding"
  | "retreating"
  | "bonked"

export interface ActiveMole {
  tile: number
  col: number
  row: number
  phase: MolePhase
  phaseStart: number
  holdMs: number
  blinkStart: number
  seed: number
}

export const EMERGE_MS = 380
export const RETREAT_MS = 260
export const BONK_MS = 550
export const HOLD_MIN_MS = 650
export const HOLD_MAX_MS = 1500
export const SPAWN_MIN_MS = 350
export const SPAWN_MAX_MS = 1100
export const BLINK_MS = 130

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1))
}

/** Overshooting ease — mole pops slightly past its rest pose then settles. */
export function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  const u = clamp01(t) - 1
  return 1 + c3 * u * u * u + c1 * u * u
}

export function easeInQuad(t: number): number {
  const u = clamp01(t)
  return u * u
}

export function easeOutQuad(t: number): number {
  const u = clamp01(t)
  return 1 - (1 - u) * (1 - u)
}

/**
 * Emergence amount for a mole at time `now`.
 * Returns ~0 when buried, ~1 when fully up.
 * Emerging overshoots above 1 briefly for a springy pop.
 */
export function emergenceP(mole: ActiveMole, now: number): number {
  const elapsed = now - mole.phaseStart
  switch (mole.phase) {
    case "emerging":
      return easeOutBack(elapsed / EMERGE_MS)
    case "holding":
      return 1
    case "retreating":
      return 1 - easeInQuad(elapsed / RETREAT_MS)
    case "bonked": {
      const HOLD_STILL = 130
      if (elapsed < HOLD_STILL) return 1
      return Math.max(
        0,
        1 - easeInQuad((elapsed - HOLD_STILL) / (BONK_MS - HOLD_STILL)),
      )
    }
  }
}

/** Advance a mole to its next phase when its timer expires. Returns true if it died. */
export function advanceMole(mole: ActiveMole, now: number): boolean {
  const elapsed = now - mole.phaseStart
  switch (mole.phase) {
    case "emerging":
      if (elapsed >= EMERGE_MS) {
        mole.phase = "holding"
        mole.phaseStart = now
      }
      return false
    case "holding":
      if (elapsed >= mole.holdMs) {
        mole.phase = "retreating"
        mole.phaseStart = now
      } else if (now > mole.blinkStart + BLINK_MS && Math.random() < 0.008) {
        mole.blinkStart = now
      }
      return false
    case "retreating":
      return elapsed >= RETREAT_MS
    case "bonked":
      return elapsed >= BONK_MS
  }
}

export function makeMole(
  tile: number,
  col: number,
  row: number,
  now: number,
): ActiveMole {
  return {
    tile,
    col,
    row,
    phase: "emerging",
    phaseStart: now,
    holdMs: rand(HOLD_MIN_MS, HOLD_MAX_MS),
    blinkStart: now + rand(350, 950),
    seed: Math.random() * 1000,
  }
}
