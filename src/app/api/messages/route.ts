import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ messages })
}

export async function PATCH(req: NextRequest) {
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

  const { id, read } = body as { id?: string; read?: boolean }
  if (!id || typeof read !== 'boolean') {
    return NextResponse.json(
      { error: 'id and read (boolean) are required' },
      { status: 400 }
    )
  }

  const updated = await db.contactMessage.update({
    where: { id },
    data: { read },
  })
  return NextResponse.json({ message: updated })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id query param required' }, { status: 400 })
  }

  await db.contactMessage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
