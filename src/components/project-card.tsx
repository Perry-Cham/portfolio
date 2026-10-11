import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Github } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export type Project = {
  id: string
  title: string
  description: string
  longDescription: string | null
  imageUrl: string | null
  liveUrl: string | null
  githubUrl: string | null
  tags: string
  featured: boolean
  createdAt: string
  updatedAt: string
}

export function ProjectCard({ project }: { project: Project }) {
  const tagList = project.tags
    ? project.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const date = new Date(project.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  })

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all hover:shadow-lg">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
            <span className="text-sm text-muted-foreground">No preview</span>
          </div>
        )}
        {project.featured && (
          <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            Featured
          </span>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight">
            {project.title}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {project.description}
        </p>
        {tagList.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tagList.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        {project.liveUrl && (
          <Link
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> Live
          </Link>
        )}
        {project.githubUrl && (
          <Link
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            <Github className="h-4 w-4" /> Code
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
