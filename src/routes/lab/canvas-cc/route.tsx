import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/lab/canvas-cc')({
  component: RouteComponent,
})

function RouteComponent() {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const mouse = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })
  const paticles = useRef<Particle[]>([])

  class Particle {

    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    ctx: CanvasRenderingContext2D
    constructor(x: number, y: number, ctx: CanvasRenderingContext2D) {
      this.x = x
      this.y = y
      this.size = Math.random() * 5 + 1
      this.speedX = Math.random() * 3 - 1.5
      this.speedY = Math.random() * 3 - 1.5

      this.ctx = ctx

    }

    update(width: number, height: number) {
      this.x += this.speedX
      this.y += this.speedY

      this.size -= 0.1

      if (this.x < 0 || this.x > width) this.speedX *= -1
      if (this.y < 0 || this.y > height) this.speedY *= -1
    }

    draw() {

      const ctx = this.ctx
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()


    }

  }


  // function init(x: number, y: number, ctx: CanvasRenderingContext2D) {
  //   const arr = paticles.current
  //   for (let i = 0; i < 100; i++) {
  //     arr.push(new Particle(x, y, ctx))
  //   }
  // }

  function handleParticles(width: number, height: number) {

    const arr = paticles.current

    for (let i = 0; i < arr.length; i++) {
      arr[i].update(width, height)
      arr[i].draw()

      if (arr[i].size <= 0.3) {
        arr.splice(i, 1)
        i--
      }
    }

  }

  function handleOnMouseClick(e: PointerEvent, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (let i = 0; i < 10; i++) {
      paticles.current.push(new Particle(x, y, ctx))
    }
  }

  const onMove = (e: MouseEvent, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const rect = canvas.getBoundingClientRect()
    mouse.current.x = e.clientX - rect.left
    mouse.current.y = e.clientY - rect.top

    for (let i = 0; i < 10; i++) {
      paticles.current.push(new Particle(mouse.current.x, mouse.current.y, ctx))
    }
  }



  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return
    const canvas: HTMLCanvasElement = canvasRef.current
    if (!canvas) return


    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resize()
    window.addEventListener('resize', resize)

    const ctx = canvas.getContext("2d")
    if (!ctx) return;


    const handleMove = (e: MouseEvent) => onMove(e, canvas, ctx)
    const handleClick = (e: PointerEvent) => handleOnMouseClick(e, canvas, ctx)

    canvas.addEventListener('mousemove', handleMove)
    canvas.addEventListener('click', handleClick)
    // init(Math.random() * canvas.width, Math.random() * canvas.height, ctx)



    let id: number
    const animate = () => {
      // ctx.clearRect(0, 0, canvas.width, canvas.height)
      //

      ctx.fillStyle = 'rgb(0,0,0,0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      handleParticles(canvas.width, canvas.height)
      id = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('click', handleClick)
    }

  }, [])

  return <div className='w-full grid gap-2 py-4'>
    <p>Canvas</p>
    <canvas className='w-full border h-125 ' ref={canvasRef} />
  </div>
}
