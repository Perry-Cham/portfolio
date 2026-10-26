import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const tokenSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  token: z.string().min(1, 'Token is required'),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokens = await db.token.findMany({
    orderBy: { type: 'asc' },
  });

  return NextResponse.json({ tokens });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = tokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const token = await db.token.upsert({
    where: { type: data.type },
    update: { token: data.token, userId: session.user.id },
    create: { type: data.type, token: data.token, userId: session.user.id },
  });

  return NextResponse.json({ token }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  if (!type) {
    return NextResponse.json(
      { error: 'type query param required' },
      { status: 400 }
    );
  }

  await db.token.delete({ where: { type } });

  return NextResponse.json({ success: true });
}
