import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectsList } from '@/components/projects-list'

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-12 max-w-2xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
          Portfolio
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          All projects
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Everything I've shipped recently — open-source experiments,
          client work I'm allowed to talk about, and the occasional
          weekend project.
        </p>
      </div>

      <ProjectsList />

      <div className="mt-12 text-center">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back home
          </Link>
        </Button>
      </div>
    </div>
  )
}
