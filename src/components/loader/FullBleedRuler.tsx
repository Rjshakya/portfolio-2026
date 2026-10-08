import { cn } from "cn";

export function FullBleedRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative left-1/2 h-px w-screen -translate-x-1/2 bg-white/8", className)}
    />
  )
}

