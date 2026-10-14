import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Raj Shakya — Product Engineer",
      },
      {
        name: "description",
        content:
          "Raj Shakya, Product Engineer from Delhi, India. I design and build fast, playful web experiences.",
      },
      {
        name: "author",
        content: "Raj Shakya",
      },
      {
        name: "theme-color",
        content: "#151515",
      },
      {
        name: "color-scheme",
        content: "dark",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "Raj Shakya — Product Engineer",
      },
      {
        property: "og:title",
        content: "Raj Shakya — Product Engineer",
      },
      {
        property: "og:description",
        content:
          "Raj Shakya, Product Engineer from Delhi, India. I design and build fast, playful web experiences.",
      },
      {
        property: "og:url",
        content: "https://rajshakya.dev/",
      },
      {
        property: "og:image",
        content: "https://rajshakya.dev/og.png",
      },
      {
        property: "og:image:width",
        content: "2400",
      },
      {
        property: "og:image:height",
        content: "1260",
      },
      {
        property: "og:image:alt",
        content: "Raj's Portfolio — 2026",
      },
      {
        property: "og:image:type",
        content: "image/png",
      },
      {
        property: "og:locale",
        content: "en_IN",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Raj Shakya — Product Engineer",
      },
      {
        name: "twitter:description",
        content:
          "Raj Shakya, Product Engineer from Delhi, India. I design and build fast, playful web experiences.",
      },
      {
        name: "twitter:image",
        content: "https://rajshakya.dev/og.png",
      },
      {
        name: "twitter:image:alt",
        content: "Raj's Portfolio — 2026",
      },
      {
        name: "twitter:site",
        content: "@RajShak96083714",
      },
      {
        name: "twitter:creator",
        content: "@RajShak96083714",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://rajshakya.dev/",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/icon.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/icon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preload",
        href: "/AwesomeSerif-MediumRegular.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/AwesomeSerif-Regular.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
