import Link from 'next/link'
import { db } from '@/lib/db'
import { ArrowRight, Download, Github, Linkedin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkillsSection } from '@/components/skills-section'
import { ProjectCard } from '@/components/project-card'

async function getLatestProjects() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
  return projects
}

export default async function HomePage() {
  const latest = await getLatestProjects()

  return (
    <>
      {/* Hero / Greeting */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 via-background to-background"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Available for freelance work
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Hi, I&rsquo;m Alex —{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  full-stack developer
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                I design and build web applications end-to-end — from the
                database schema to the last pixel of the UI. For the past
                seven years I&rsquo;ve shipped products used by tens of
                thousands of people, and I care obsessively about clean
                abstractions, accessibility, and shipping things that actually
                work in production, not just in demos.
              </p>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                Right now I&rsquo;m focused on the Next.js + TypeScript +
                Prisma stack, building tools that help small teams move fast
                without accumulating technical debt. When I&rsquo;m not at a
                keyboard you&rsquo;ll find me contributing to open source,
                mentoring junior devs, or chasing good coffee.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/projects">
                    View my work <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">
                    Get in touch <Mail className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href="https://github.com"
                    aria-label="GitHub"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href="https://linkedin.com"
                    aria-label="LinkedIn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-muted to-background p-8">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">
                      ~/portfolio
                    </span>
                    <div className="flex gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                    </div>
                  </div>
                  <pre className="overflow-hidden font-mono text-xs leading-relaxed text-muted-foreground">
                    <code>{`const alex = {
  role: "Full-Stack Dev",
  stack: ["Next.js", "TS",
          "Prisma", "Node"],
  shipping: true,
  coffee: Infinity,
  openToWork: true,
}`}</code>
                  </pre>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>● online</span>
                    <span>v2.0.26</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About blurb */}
      <section className="border-b border-border/60 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
              About me
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From database to design system.
            </h2>
          </div>
          <div className="space-y-4 text-base text-muted-foreground lg:col-span-2">
            <p>
              I&rsquo;m a self-taught developer who fell into this world
              building custom themes for forum software back in 2013. What
              started as a hobby turned into a career: I&rsquo;ve since worked
              at seed-stage startups, a 200-person fintech, and as a freelance
              consultant. The through-line has always been the same — I love the
              whole stack, from picking the right index for a slow query to
              tweaking the focus ring on a button.
            </p>
            <p>
              I believe the best software comes from a tight feedback loop
              between the person writing the code and the person using the
              product. I prefer small teams, clear interfaces, and shipping
              something real on Friday rather than something perfect on
              never. I write tests when they pay for themselves, refactor when
              the cost of NOT doing it crosses the cost of doing it, and
              document the why, not the what.
            </p>
          </div>
        </div>
      </section>

      {/* Skills */}
      <SkillsSection />

      {/* Latest projects */}
      <section id="latest-projects" className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
                Recent work
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Latest projects
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                A few things I&rsquo;ve shipped recently. The full list lives
                on the projects page — these are just the three most recent.
              </p>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href="/projects">
                See all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {latest.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No projects yet. Add some from the{' '}
                <Link
                  href="/admin"
                  className="font-medium text-primary hover:underline"
                >
                  admin panel
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Have a project in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Whether it&rsquo;s a greenfield idea, a legacy codebase that needs
            taming, or an extra pair of hands for a sprint — I&rsquo;d love to
            hear about it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/contact">
                Start a conversation <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href="/resume.pdf"
                download
                aria-label="Download resume PDF"
              >
                <Download className="h-4 w-4" /> Download CV
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
