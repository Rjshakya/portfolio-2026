import { motion, useReducedMotion } from "motion/react"

import { RightPixelTrail } from "@/components/patterns/RightPixelTrail"
import { TopPixelCluster } from "@/components/patterns/TopPixelCluster"

export function HeroDecor() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute top-0 left-0"
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: reduceMotion ? 0 : 4.5,
          ease: "easeOut",
        }}
      >
        <TopPixelCluster fetchPriority="high" className="h-auto " />
      </motion.div>
      <motion.div
        className="absolute top-0 right-0 hidden md:block"
        initial={reduceMotion ? false : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.6,
          delay: reduceMotion ? 0 : 5,
          ease: "easeOut",
        }}
      >
        <RightPixelTrail fetchPriority="high" className="h-auto  " />
      </motion.div>
    </div>
  )
}
