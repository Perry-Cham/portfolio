/**
 * Seed script.
 *  1. Creates an admin user via better-auth's signUp API.
 *  2. Inserts sample projects (only if none exist).
 *
 * Usage:
 *   bun run scripts/seed.ts
 */

import { db } from '../src/lib/db'
import { auth } from '../src/lib/auth'

const ADMIN = {
  name: 'Alex Carter',
  email: 'admin@alexcarter.dev',
  password: 'admin123',
}

const SAMPLE_PROJECTS = [
  {
    title: 'Pulse — Realtime Team Dashboard',
    description:
      'A real-time analytics dashboard for product teams, with live charts, presence, and Slack notifications.',
    longDescription:
      'Pulse is a real-time analytics dashboard designed for fast-moving product teams. It pulls data from multiple sources (Postgres, Stripe, Mixpanel) into one live view, with presence indicators so you can see who else is looking. Built on Next.js, tRPC, Postgres, and WebSockets.',
    imageUrl: 'https://picsum.photos/seed/pulse/800/450',
    liveUrl: 'https://example.com/pulse',
    githubUrl: 'https://github.com/alexcarter/pulse',
    tags: 'Next.js, tRPC, Postgres, WebSockets, Tailwind',
    featured: true,
  },
  {
    title: 'Slate — Markdown Note App',
    description:
      'A local-first markdown note-taking app with bi-directional links and a focus mode. Works offline.',
    longDescription:
      'Slate is a local-first markdown editor with bi-directional links, a clean writing mode, and full-text search. Notes sync via a tiny CRDT layer when you are online, but everything works offline. Built with React, Yjs, IndexedDB, and a Bun server.',
    imageUrl: 'https://picsum.photos/seed/slate/800/450',
    liveUrl: 'https://example.com/slate',
    githubUrl: 'https://github.com/alexcarter/slate',
    tags: 'React, Yjs, IndexedDB, Bun',
    featured: true,
  },
  {
    title: 'Cadence — Email Sequence Builder',
    description:
      'A drag-and-drop email sequence builder for sales teams, with a visual flow editor and per-step analytics.',
    longDescription:
      'Cadence is a visual email sequence builder for outbound sales teams. You drag steps onto a canvas, branch on opens and replies, and watch per-step conversion in real time. Powered by Next.js, dnd-kit, Prisma, and a Postgres-backed queue.',
    imageUrl: 'https://picsum.photos/seed/cadence/800/450',
    liveUrl: 'https://example.com/cadence',
    githubUrl: 'https://github.com/alexcarter/cadence',
    tags: 'Next.js, dnd-kit, Prisma, Postgres',
    featured: false,
  },
  {
    title: 'Atlas — Design Token Pipeline',
    description:
      'A CLI that ingests Figma tokens and emits typed Tailwind, CSS, and iOS/Android variables in one command.',
    longDescription:
      'Atlas is a CLI tool that pulls design tokens from Figma and emits typed Tailwind config, CSS custom properties, and iOS/Android resource files in a single command. Designed for multi-platform design systems teams who are tired of hand-syncing values.',
    imageUrl: 'https://picsum.photos/seed/atlas/800/450',
    liveUrl: null,
    githubUrl: 'https://github.com/alexcarter/atlas',
    tags: 'TypeScript, Node, CLI, Figma API',
    featured: false,
  },
  {
    title: 'Lumen — Static Site Generator',
    description:
      'A tiny, fast static site generator built on Bun, with file-based routing and MDX support out of the box.',
    longDescription:
      'Lumen is a single-binary static site generator built on Bun. It gives you file-based routing, MDX, syntax highlighting, RSS, and sitemaps out of the box, and compiles a 500-page site in under a second. Designed as a fast, opinionated alternative to Astro for personal sites.',
    imageUrl: 'https://picsum.photos/seed/lumen/800/450',
    liveUrl: 'https://example.com/lumen',
    githubUrl: 'https://github.com/alexcarter/lumen',
    tags: 'Bun, MDX, SSG',
    featured: false,
  },
  {
    title: 'Trellis — Open-Source CRM',
    description:
      'A self-hostable CRM for small consultancies — contacts, deals, pipeline, and a Kanban in under 5k lines.',
    longDescription:
      'Trellis is a self-hostable CRM aimed at small consultancies. It has contacts, deals, a pipeline board, basic automations, and CSV import, all in under 5,000 lines of TypeScript. Designed to be hackable rather than locked-down.',
    imageUrl: 'https://picsum.photos/seed/trellis/800/450',
    liveUrl: 'https://example.com/trellis',
    githubUrl: 'https://github.com/alexcarter/trellis',
    tags: 'Next.js, Prisma, Postgres, shadcn/ui',
    featured: false,
  },
]

async function seedAdmin() {
  const existing = await db.user.findUnique({ where: { email: ADMIN.email } })
  if (existing) {
    console.log(`[admin] already exists: ${ADMIN.email}`)
    return
  }

  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: ADMIN.email,
        password: ADMIN.password,
        name: ADMIN.name,
      },
    })
    console.log('[admin] created:', res?.user?.email)
  } catch (err) {
    // better-auth signUp may throw a Response object on failure
    if (err instanceof Response) {
      const text = await err.text()
      console.error('[admin] signUp failed:', err.status, text)
    } else {
      console.error('[admin] signUp failed:', err)
    }
    throw err
  }
}

async function seedProjects() {
  const count = await db.project.count()
  if (count > 0) {
    console.log(`[projects] already seeded (${count} rows) — skipping`)
    return
  }

  for (const p of SAMPLE_PROJECTS) {
    await db.project.create({
      data: {
        ...p,
        imageUrl: p.imageUrl ?? null,
        liveUrl: p.liveUrl ?? null,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)
        ),
      },
    })
    console.log(`[projects] created: ${p.title}`)
  }
}

async function main() {
  console.log('--- Seeding database ---')
  await seedAdmin()
  await seedProjects()
  console.log('--- Done ---')
  await db.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
