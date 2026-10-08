const brandSwatches = [
  { name: "pink", hex: "#FC5EAD", className: "bg-brand-pink" },
  { name: "green", hex: "#02C002", className: "bg-brand-green" },
  { name: "blue", hex: "#0044FF", className: "bg-brand-blue" },
  { name: "orange", hex: "#FF6200", className: "bg-brand-orange" },
] as const

export function BrandSwatchesSection() {
  return (
    <section className="flex max-w-3xl min-w-0 flex-col gap-4 border-t border-border pt-10">
      <p className="text-small text-muted-foreground uppercase">
        Brand colors — dark mode
      </p>
      <div className="flex flex-wrap gap-4">
        {brandSwatches.map((swatch) => (
          <div key={swatch.name} className="flex flex-col gap-2">
            <div className={`h-16 w-16 rounded-lg ${swatch.className}`} />
            <p className="text-small">
              {swatch.name} · {swatch.hex}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-16 w-full rounded-lg bg-background outline outline-border" />
        <p className="text-small">background · #151515</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-16 w-full rounded-lg bg-card outline outline-border" />
        <p className="text-small">card · #000000</p>
      </div>
    </section>
  )
}
