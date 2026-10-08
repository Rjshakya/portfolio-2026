import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/style-guide")({
  component: StyleGuideLayout,
})

function StyleGuideLayout() {
  return (
    <div className="flex min-h-svh flex-col gap-12 p-6 md:p-10">
      <header className="flex max-w-3xl min-w-0 flex-col gap-2">
        <p className="text-small text-muted-foreground uppercase">Portfolio</p>
        <h1>Style Guide</h1>
      </header>
      <Outlet />
    </div>
  )
}
