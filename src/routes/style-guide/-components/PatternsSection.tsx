import { RightPixelTrail } from "@/components/patterns/RightPixelTrail"
import { TopPixelCluster } from "@/components/patterns/TopPixelCluster"

export function PatternsSection() {
  return (
    <section className="flex min-w-0 flex-col gap-4 border-t border-border pt-10">
      <p className="text-small text-muted-foreground uppercase">
        Patterns — pixel grain (exact Figma assets)
      </p>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <TopPixelCluster className="h-auto w-full max-w-xl" />
          <p className="text-small">TopPixelCluster · 557 × 105</p>
        </div>
        <div className="flex flex-col gap-2">
          <RightPixelTrail className="h-96 w-auto self-start" />
          <p className="text-small">RightPixelTrail · 151 × 901</p>
        </div>
      </div>
    </section>
  )
}
