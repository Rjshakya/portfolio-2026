import { createFileRoute } from "@tanstack/react-router"
import { useLayoutEffect, useState } from "react"
import { AnimatePresence, useReducedMotion } from "motion/react"

import { PixelLoader } from "@/components/loader/PixelLoader"
import { HeroSection } from "./-components/hero/HeroSection"
import { HeroDecor } from "./-components/hero/HeroDecor"
import { ProjectsSection } from "./-components/projects/ProjectsSection"
import { InterestsSection } from "./-components/interests/InterestsSection"
import { TileFooter } from "./-components/footer/TileFooter"
import { FullBleedRule } from "@/components/loader/FullBleedRuler"

export const Route = createFileRoute("/")({ component: HomePage })

function HomePage() {
  const [loading, setLoading] = useState(true)
  const reduceMotion = useReducedMotion()

  useLayoutEffect(() => {
    const duration = reduceMotion ? 200 : 2300
    const timer = window.setTimeout(() => setLoading(false), duration)
    return () => window.clearTimeout(timer)
  }, [reduceMotion])


  return (
    <>
      <AnimatePresence>
        {loading && <PixelLoader key="pixel-loader" />}
      </AnimatePresence>
      <main className="relative z-10 overflow-x-clip bg-background  px-8 md:px-10">
        <HeroDecor />

        <div className="mx-auto max-w-2xl border-x outline-1 outline-offset-18 outline-border md:outline-offset-22">
          <HeroSection />
          <div className="w-screen h-50" />
          <ProjectsSection />
          <div className="w-screen h-50" />
          <InterestsSection />
          <div className="w-screen h-50" />
          <FullBleedRule className="mb-5" />
          <FullBleedRule className="" />
        </div>
      </main>
      {/* Scroll room so the fixed footer is uncovered at the end. */}
      <div aria-hidden="true" className="relative z-10 h-screen" />
      <TileFooter />
    </>
  )
}
