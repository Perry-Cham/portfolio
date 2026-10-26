import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const projectUpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(280).optional(),
  longDescription: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  liveUrl: z.string().url().optional().nullable().or(z.literal('')),
  githubUrl: z.string().url().optional().nullable().or(z.literal('')),
  tags: z.string().max(200).optional(),
  featured: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data };
  // empty strings -> null for URL fields
  for (const key of [
    'imageUrl',
    'liveUrl',
    'githubUrl',
    'longDescription',
  ] as const) {
    if (key in updateData && updateData[key] === '') {
      updateData[key] = null;
    }
  }

  const project = await db.project.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  await db.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
