import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/lab/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className=''> <Button render={<Link to='/lab/canvas-cc' />}>Canvas CC</Button> </div>
}
