import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import {
  parseSettings,
  settingsSchema,
} from '@/zodSchemas/settingsSchema'

const SETTINGS_KEY = 'app'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const row = await db.settings.findUnique({ where: { key: SETTINGS_KEY } })

  return NextResponse.json({ settings: parseSettings(row?.settings) })
}

export async function PUT(req: NextRequest) {
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

  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  await db.settings.upsert({
    where: { key: SETTINGS_KEY },
    update: { settings: parsed.data },
    create: { key: SETTINGS_KEY, settings: parsed.data },
  })

  return NextResponse.json({ settings: parsed.data })
}

export async function POST(req: NextRequest) {
  return PUT(req)
}
