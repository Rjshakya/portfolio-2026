interface TopPixelClusterProps {
  className?: string
  fetchPriority?: "high" | "low" | "auto"
}

export function TopPixelCluster({
  className,
  fetchPriority = "auto",
}: TopPixelClusterProps) {
  return (
    <img
      src="/patterns/top-pixel-cluster.png"
      width={557}
      height={105}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
    />
  )
}
