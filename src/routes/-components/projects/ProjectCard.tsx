import { Button } from "@/components/ui/button"

import type { Project } from "./projects"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className=" bg-card grid md:grid-cols-[2fr_4fr] tracking-tighter">
      <div className="flex min-h-72 flex-col justify-between px-4 py-10 md:min-h-80 ">
        <div className="">
          <h3 className="pl-1">{project.name}</h3>
          <div className="mt-4">
            <Button
              variant="secondary"
              className="rounded-none"
              render={<a target="_blank" href={project.webHref ?? "#"} />}
            >
              Web
            </Button>
            <Button
              variant="secondary"
              className="rounded-none"
              render={<a target="_blank" href={project.githubHref ?? "#"} />}
            >
              Github
            </Button>
          </div>
        </div>
        <p className="mt-8 pl-1 text-small whitespace-pre-line text-foreground md:mt-0">
          {project.description}
        </p>
      </div>
      <div className="relative min-h-64 overflow-hidden border-t border-white/8 md:min-h-80 md:border-t-0 md:border-l">
        <img
          src={project.image}
          alt={project.imageAlt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </article>
  )
}
