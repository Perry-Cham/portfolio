import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const projectCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().min(1, 'Description is required').max(280),
  longDescription: z.string().max(2000).optional().nullable().optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')).optional(),
  liveUrl: z.string().url().optional().nullable().or(z.literal('')).optional(),
  githubUrl: z.string().url().optional().nullable().or(z.literal('')),
  tags: z.string().max(200).optional(),
  featured: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') ?? '0', 10);
  const featuredOnly = searchParams.get('featured') === 'true';

  const projects = await db.project.findMany({
    orderBy: { createdAt: 'desc' },
    ...(limit > 0 ? { take: limit } : {}),
    ...(featuredOnly ? { where: { featured: true } } : {}),
  });

  return NextResponse.json({ projects });
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

  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) {
    console.log(typeof body, body);
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const project = await db.project.create({
    data: {
      title: data.title,
      description: data.description,
      longDescription: data.longDescription || null,
      imageUrl: data.imageUrl || null,
      liveUrl: data.liveUrl || null,
      githubUrl: data.githubUrl || null,
      tags: data.tags ?? '',
      featured: data.featured ?? false,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
