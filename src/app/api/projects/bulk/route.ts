import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { z } from 'zod'
import { getProjectSchema } from '@/zodSchemas/projectSchema'
import { formatBulkIssues } from '@/zodSchemas/formatIssues'
import { parseSettings } from '@/zodSchemas/settingsSchema'

const SETTINGS_KEY = 'app'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Expected an array of projects' }, { status: 400 })
  }

  // The "strict descriptions" setting decides which schema is used. When it is
  // on the loose schema is used and descriptions become optional.
  const settingsRow = await db.settings.findUnique({ where: { key: SETTINGS_KEY } })
  const settings = parseSettings(settingsRow?.settings)
  const schema = getProjectSchema(settings.strictDescriptions)

  const parsed = z.array(schema).safeParse(body)
  if (!parsed.success) {
    const issues = formatBulkIssues(parsed.error)
    return NextResponse.json(
      {
        error: 'Validation failed',
        count: issues.reduce((total, issue) => total + issue.count, 0),
        issues,
      },
      { status: 422 },
    )
  }

  const result = await db.project.createMany({
    data: parsed.data.map((item) => ({
      title: item.title,
      description: item.description ?? '',
      githubUrl: item.githubUrl || null,
      tags: item.tags ?? '',
      featured: false,
    })),
  })

  return NextResponse.json({ count: result.count }, { status: 201 })
}
