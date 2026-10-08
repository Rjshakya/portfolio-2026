interface RightPixelTrailProps {
  className?: string
  fetchPriority?: "high" | "low" | "auto"
}

export function RightPixelTrail({
  className,
  fetchPriority = "auto",
}: RightPixelTrailProps) {
  return (
    <img
      src="/patterns/right-pixel-trail.png"
      width={151}
      height={600}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
    />
  )
}
