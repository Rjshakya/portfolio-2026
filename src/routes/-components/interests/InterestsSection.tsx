
import { interests, reads } from "./interests"
import { FullBleedRule } from "@/components/loader/FullBleedRuler"


function NumberedList({ items }: { items: ReadonlyArray<string> }) {
  return (
    <ol className="space-y-1 px-1 py-4 text-small">
      {items.map((item, index) => (
        <li key={item}>
          <span aria-hidden="true" className="tabular-nums">
            {index + 1} -{" "}
          </span>
          {item}
        </li>
      ))}
    </ol>
  )
}

export function InterestsSection() {
  return (
    <section className="relative text-foreground">
      <div className="relative">
        <FullBleedRule className="mb-5" />
        <FullBleedRule />
        <div className="relative px-1 py-2">
          <h2 className="text-h2">Keenly Interested in:</h2>
        </div>
        <FullBleedRule />
        <NumberedList items={interests} />
      </div>
      <div className="relative">
        <FullBleedRule className="mb-5" />
        <FullBleedRule />
        <div className="relative px-1 py-2">
          <h2 className="text-h2">Reads:</h2>
        </div>
        <FullBleedRule />
        <NumberedList items={reads} />
      </div>
      <FullBleedRule />
    </section>
  )
}
