import { createFileRoute } from "@tanstack/react-router"

import { BrandSwatchesSection } from "./-components/BrandSwatchesSection"
import { PatternsSection } from "./-components/PatternsSection"
import { TypeScaleSection } from "./-components/TypeScaleSection"

export const Route = createFileRoute("/style-guide/")({
  component: StyleGuidePage,
})

function StyleGuidePage() {
  return (
    <>
      <TypeScaleSection />
      <BrandSwatchesSection />
      <PatternsSection />
    </>
  )
}
