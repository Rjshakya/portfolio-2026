import { RightPixelTrail } from "@/components/patterns/RightPixelTrail"
import { motion, useReducedMotion } from "motion/react"

export function ProjectsDecor() {
  const reduceMotion = useReducedMotion()



  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute top-100  left-0 hidden md:block"
        initial={reduceMotion ? false : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.6,
          delay: reduceMotion ? 0 : 2.3,
          ease: "easeOut",
        }}
      >
        <RightPixelTrail fetchPriority="high" className="h-auto  " />
      </motion.div>
    </div>
  )
}
