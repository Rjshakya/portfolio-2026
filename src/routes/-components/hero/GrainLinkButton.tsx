import { cn } from "cn"

import { Button } from "@/components/ui/button"

export type GrainLinkTone = "orange" | "blue" | "green" | "pink"

const toneClasses: Record<GrainLinkTone, string> = {
  orange: "bg-brand-orange",
  blue: "bg-brand-blue",
  green: "bg-brand-green",
  pink: "bg-brand-pink",
}

interface GrainLinkButtonProps {
  href: string
  label: string
  tone: GrainLinkTone
}

export function GrainLinkButton({ href, label, tone }: GrainLinkButtonProps) {
  return (
    <Button
      variant="secondary"
      size="lg"
      render={<a target="_blank" href={href} />}
      className={cn(
        "link-grain",
        toneClasses[tone],
        "h-auto gap-0 rounded-none px-3 py-2 md:text-lg tracking-[-5%] border-none text-white  hover:link-grain hover:brightness-110 md:px-4",
        `hover:${toneClasses[tone]}`
      )}
    >
      {label}
    </Button>
  )
}
