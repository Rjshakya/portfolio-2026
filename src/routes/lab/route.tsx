import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"

export const Route = createFileRoute("/lab")({
  component: LabLayout,
})

function LabLayout() {
  const pathname = useLocation({ select: (loc) => loc.pathname })
  return (
    <div className="flex min-h-svh flex-col gap-12 md:py-1 md:px-1 p-1 ">
      <header className="flex flex-col pb-1 border-b ">
        <p>{pathname}</p>
      </header>
      <div className="max-w-4xl mx-auto w-full h-full">
        <Outlet />
      </div>
    </div>
  )
}

