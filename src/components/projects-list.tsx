'use client'

import { useQuery } from '@tanstack/react-query'
import { ProjectCard } from '@/components/project-card'
import { Skeleton } from '@/components/ui/skeleton'

type Project = React.ComponentProps<typeof ProjectCard>['project']

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load projects')
  const data = await res.json()
  return data.projects as Project[]
}

export function ProjectsList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border/60"
          >
            <Skeleton className="aspect-[16/9] w-full rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
        <p className="text-sm text-destructive">
          {(error as Error).message || 'Failed to load projects.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No projects published yet. Check back soon.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  )
}
