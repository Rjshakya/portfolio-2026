export interface Project {
  name: string
  eyebrow?: string
  description: string
  image: string
  imageAlt: string
  webHref: string
  githubHref: string
}

// TODO: replace placeholder hrefs with real project links.
export const projects: ReadonlyArray<Project> = [
  {
    name: "Reviewprapp",
    eyebrow: "AI - code reviewer",
    description: "Ship Code \nNot Bugs",
    image: "/patterns/tiles.png",
    imageAlt: "Pink and blue gradient tiles for Reviewprapp",
    webHref: "https://reviewpr.app",
    githubHref: "https://github.com/Rjshakya/sentinal",
  },
  {
    name: "Nastro",
    description: "Turn your notion \npages into beautiful websites",
    image: "/patterns/tiles-2.png",
    imageAlt: "Purple checker tiles for Nastro",
    webHref: "https://nastro.xyz",
    githubHref: "https://github.com/Rjshakya/nastro",
  },
  {
    name: "Planetform",
    description: "Get form responses \nin your inbox, Slack, Notion.",
    image: "/patterns/tiles-3.png",
    imageAlt: "Orange and purple gradient tiles for Planetform",
    webHref: "https://planetform.xyz",
    githubHref: "https://github.com/Rjshakya/planetform",
  },
]
