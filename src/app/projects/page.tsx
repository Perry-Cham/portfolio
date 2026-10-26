import { ProjectsList } from '@/components/projects/projects-list';

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
          Everything I've shipped recently — experiments, hobby projects and
          learning experiences. Take a look and feel free to ask questions about
          any of them.
        </p>
      </div>

      <ProjectsList />
    </div>
  );
}
