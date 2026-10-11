import { Code, Database, Layout, Server, Wrench, Zap } from 'lucide-react'

type SkillGroup = {
  icon: React.ReactNode
  title: string
  blurb: string
  items: string[]
}

const groups: SkillGroup[] = [
  {
    icon: <Layout className="h-5 w-5" />,
    title: 'Frontend',
    blurb: 'Building accessible, responsive UIs with modern tooling.',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
  },
  {
    icon: <Server className="h-5 w-5" />,
    title: 'Backend',
    blurb: 'APIs, auth, and server logic that scale cleanly.',
    items: ['Node.js', 'Bun', 'tRPC', 'REST', 'Better-Auth'],
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: 'Data',
    blurb: 'Modeling, querying, and managing state at any layer.',
    items: ['PostgreSQL', 'Prisma', 'SQLite', 'Redis', 'Drizzle'],
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Realtime',
    blurb: 'Live experiences for collab and dashboards.',
    items: ['WebSockets', 'Socket.io', 'Server-Sent Events'],
  },
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'Tooling',
    blurb: 'DX and pipelines that keep teams unblocked.',
    items: ['Vite', 'ESLint', 'Vitest', 'Playwright', 'GitHub Actions'],
  },
  {
    icon: <Code className="h-5 w-5" />,
    title: 'Languages',
    blurb: 'Comfortable across the stack and the REPL.',
    items: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL'],
  },
]

export function SkillsSection() {
  return (
    <section id="skills" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
            What I work with
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Skills & tools
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            I&rsquo;ve spent the last several years shipping production web
            software end-to-end. These are the technologies I reach for daily —
            picked because they make me faster, the code clearer, and the
            product better, not because they happen to be trendy this week.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.title}
              className="rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-border hover:shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {group.icon}
                </span>
                <h3 className="text-lg font-semibold">{group.title}</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                {group.blurb}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
