import { ProjectCard } from "./ProjectCard"
import { projects } from "./projects"
import { FullBleedRule } from "@/components/loader/FullBleedRuler"


export function ProjectsSection() {
  return (
    <section className="relative text-foreground">
      <FullBleedRule className="mb-5" />
      <FullBleedRule />
      <div className="relative px-1 py-2 ">
        <h2 className="text-h2">Projects</h2>
      </div>
      {projects.map((project) => (
        <div key={project.name} className="relative">
          <FullBleedRule className="mb-5" />
          <FullBleedRule />
          <ProjectCard project={project} />
        </div>
      ))}
      <FullBleedRule className="mb-5" />
      <FullBleedRule />
    </section>
  )
}
