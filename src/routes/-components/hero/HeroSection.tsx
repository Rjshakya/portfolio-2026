import { useEffect } from "react"
import { color, motion, useAnimate, useReducedMotion } from "motion/react"

import { GrainLinkButton } from "./GrainLinkButton"
import type { GrainLinkTone } from "./GrainLinkButton"

interface HeroLink {
  label: string
  tone: GrainLinkTone
  href: string
}

// TODO: replace placeholder hrefs with real profile links.
const heroLinks: ReadonlyArray<HeroLink> = [
  { label: "Github", tone: "orange", href: "https://github.com/Rjshakya/" },
  { label: "Linkedin", tone: "blue", href: "https://www.linkedin.com/in/raj-shakya-2334321bb" },
  { label: "Email", tone: "green", href: "mailto:rajshakya631@gmail.com" },
  { label: "Resume", tone: "pink", href: "https://drive.google.com/file/d/1wnHF__2veGgUFRQWUSzOX3IWRLHXGau7/view?usp=sharing" },
]

// coupling animation knobs
const START_DELAY = 1.5 // wait before first car rolls in
const TRAVEL = 0.45 // roll-in time per car
const GAP = 0.2 // pause between cars
const IMPACT = 3// px the nearest coupled car gets shoved left
const DECAY = 0.55 // each car further down gets this fraction
const RIPPLE_DELAY = 0.05 // delay per car down the chain
const RECOIL = 3 // px the arriving car bounces back right

const wait = (s: number) => new Promise<void>((r) => setTimeout(r, s * 1000))

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const [scope, animate] = useAnimate<HTMLDivElement>()

  useEffect(() => {
    if (reduceMotion || !scope.current) return
    const items = Array.from(scope.current.children) as HTMLElement[]
    let cancelled = false

    // quick shove, then underdamped spring back to 0
    const bump = async (el: HTMLElement, dx: number, delay: number) => {
      await wait(delay)
      if (cancelled) return
      await animate(el, { x: dx }, { duration: 0.05, ease: "easeOut" })
      if (cancelled) return
      animate(el, { x: 0 }, { type: "spring", stiffness: 450, damping: 9 })
    }

      ; (async () => {
        await wait(START_DELAY)

        for (let i = 0; i < items.length; i++) {
          if (cancelled) return

          // 1. roll in at speed (easeIn = fastest at contact)
          await animate(
            items[i],
            {
              x: [300, 0],
              opacity: [0, 1],
              filter: ["blur(4px)", "blur(0px)"],
            },
            { duration: TRAVEL, ease: "easeIn" }
          )
          if (cancelled) return

          // 2. arriving car recoils
          bump(items[i], RECOIL, 0)

          // 3. ripple down the cars already coupled
          for (let j = i - 1; j >= 0; j--) {
            const dist = i - 1 - j
            bump(items[j], -IMPACT * DECAY ** dist, dist * RIPPLE_DELAY)
          }

          await wait(GAP)
        }
      })()

    return () => {
      cancelled = true
    }
  }, [reduceMotion, animate, scope])

  return (
    <section className="text-foreground">
      <div className="flex w-full flex-col">
        <div className="h-32 md:h-44" />

        <div>
          <div
            aria-hidden="true"
            className="relative left-1/2 h-px w-screen -translate-x-1/2 bg-white/8"
          />
          <motion.p
            initial={reduceMotion ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="px-1 py-1 font-heading text-h1"
          >
            Hi there
          </motion.p>
        </div>

        <div className="cursor-pointer">
          <div
            aria-hidden="true"
            className="relative left-1/2 h-px w-screen -translate-x-1/2 bg-white/8"
          />
          <motion.h1
            initial={reduceMotion ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="px-1 py-6 text-h1 md:py-14"
          >
            I&apos;m <motion.span
              className=" bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, var(--color-brand-pink) 35%, #fff 50%, var(--color-brand-pink) 65%)",
                backgroundSize: "250% 100%",
              }}
              initial={{
                backgroundPosition: "100% 0",
              }}
              transition={{ duration: 0 }}
              whileHover={{
                backgroundPosition: ["100% 0", "0% 0"],
                transition: {
                  backgroundPosition: {
                    duration: 1.2,
                    ease: "easeInOut",
                  },
                  filter: { duration: 0.3 },
                },
              }}>
              raj
            </motion.span>,
            <br />
            <motion.span className=" bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, var(--color-brand-pink) 35%, #fff 50%, var(--color-brand-pink) 65%)",
                backgroundSize: "250% 100%",
              }}
              initial={{
                backgroundPosition: "100% 0",
              }}
              transition={{ duration: 0 }}

              whileHover={{
                backgroundPosition: ["100% 0", "0% 0"],
                transition: {
                  backgroundPosition: {
                    duration: 1.2,
                    ease: "easeInOut",
                  },
                  filter: { duration: 0.3 },
                },
              }}>Product Engineer</motion.span>
            <br />
            From Delhi, India.
          </motion.h1>
        </div>

        <div>
          <div
            aria-hidden="true"
            className="relative left-1/2 h-px w-screen -translate-x-1/2 bg-white/8"
          />
          <div ref={scope} className="flex max-w-full px-1 py-1">
            {heroLinks.map((link, i) => (
              <span
                key={link.label}
                style={{
                  zIndex: i + 1,
                  // start hidden + offscreen; useAnimate takes over
                  ...(reduceMotion
                    ? {}
                    : { opacity: 0, transform: "translateX(300px)" }),
                }}
                className="relative inline-block first:ml-0 -ml-0.5"
              >
                <GrainLinkButton
                  href={link.href}
                  label={link.label}
                  tone={link.tone}
                />
              </span>
            ))}
          </div>
        </div>

        <div className="h-px4">
          <div
            aria-hidden="true"
            className="relative left-1/2 h-px w-screen -translate-x-1/2 bg-white/8"
          />
        </div>
      </div>
    </section >
  )
}
