import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  email: z.string().email('A valid email is required').max(120),
  subject: z.string().min(1, 'Subject is required').max(150),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  // Route this to an email provider so that itgoes to my gmail address
  const { name, email, subject, message } = parsed.data;

  const saved = await db.contactMessage.create({
    data: { name, email, subject, message },
  });

  return NextResponse.json({ success: true, id: saved.id }, { status: 201 });
}
