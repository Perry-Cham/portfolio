'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProjectCard } from '@/components/project-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_PROJECT_SORT,
  FilterMenu,
  ProjectFilters,
  ProjectSort,
} from './projects_page/filter-menu'

type Project = React.ComponentProps<typeof ProjectCard>['project']

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load projects')
  const data = await res.json()
  return data.projects as Project[]
}

function getProjectTags(project: Project): string[] {
  if (!project.tags) return []
  return project.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function sortProjects(projects: Project[], sort: ProjectSort): Project[] {
  const sorted = [...projects]

  switch (sort) {
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'name-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'date-asc':
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case 'date-desc':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    case 'featured':
      // Featured projects first, everything else by name descending.
      return sorted.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || b.title.localeCompare(a.title)
      )
  }

  return sorted
}

export function ProjectsList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const [filters, setFilters] = useState<ProjectFilters>({
    sort: DEFAULT_PROJECT_SORT,
    tags: [],
  })

  const { sort, tags: selectedTags } = filters

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    for (const project of data ?? []) {
      for (const tag of getProjectTags(project)) {
        tags.add(tag)
      }
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b))
  }, [data])

  const projects = useMemo(() => {
    if (!data) return []
    const sorted = sortProjects(data, sort)
    if (selectedTags.length === 0) return sorted
    return sorted.filter((project) =>
      selectedTags.some((tag) => getProjectTags(project).includes(tag))
    )
  }, [data, sort, selectedTags])

  const isFiltering = sort !== DEFAULT_PROJECT_SORT || selectedTags.length > 0

  function handleClearFilters() {
    setFilters({ sort: DEFAULT_PROJECT_SORT, tags: [] })
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border/60"
          >
            <Skeleton className="aspect-video w-full rounded-none" />
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
    <section>
      <div className="flex w-full items-center justify-end gap-3 py-4">
        {isFiltering && (
          <p className="mr-auto text-sm text-muted-foreground">
            {projects.length} of {data.length} projects
          </p>
        )}
        <FilterMenu
          sort={sort}
          onSortChange={(nextSort) =>
            setFilters((prev) => ({ ...prev, sort: nextSort }))
          }
          availableTags={availableTags}
          selectedTags={selectedTags}
          onSelectedTagsChange={(tags) =>
            setFilters((prev) => ({ ...prev, tags }))
          }
        />
      </div>
      {projects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No projects match the current filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleClearFilters}
          >
            Clear filters
          </Button>
        </div>
      )}
    </section>
  )
}
