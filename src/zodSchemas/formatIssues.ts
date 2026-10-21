import { z } from 'zod'

export type FieldIssue = {
  /** Dotted path of the offending field, e.g. "description" */
  path: string
  /** Human readable description of what is wrong with the field */
  message: string
}

export type FormattedIssues = {
  /** Every offending field with its message */
  errors: FieldIssue[]
  /** Number of errors found */
  count: number
}

export type BulkIssue = {
  /** Index of the offending item inside the validated array */
  index: number
  /** Every offending field of that item */
  errors: FieldIssue[]
  /** Number of errors found for that item */
  count: number
}

type RawIssue = {
  segments: string[]
  message: string
}

/**
 * Walks the object returned by `z.formatError` and collects every message
 * together with the path it belongs to.
 */
function collectRaw(formatted: unknown, segments: string[], out: RawIssue[]) {
  if (!formatted || typeof formatted !== 'object') return

  for (const [key, value] of Object.entries(formatted as Record<string, unknown>)) {
    if (key === '_errors') {
      const messages = Array.isArray(value) ? value : []
      for (const message of messages) {
        out.push({ segments, message: String(message) })
      }
      continue
    }
    collectRaw(value, [...segments, key], out)
  }
}

/**
 * Flattens a ZodError into the offending fields.
 *
 * `z.formatError` groups the issues per field, we walk that structure to end
 * up with a flat array of errors, so the number of errors is simply the length
 * of that array.
 */
export function formatIssues(error: z.ZodError): FormattedIssues {
  const raw: RawIssue[] = []
  collectRaw(z.formatError(error), [], raw)

  const errors: FieldIssue[] = raw.map((issue) => ({
    path: issue.segments.join('.') || 'value',
    message: issue.message,
  }))

  return { errors, count: errors.length }
}

/**
 * Same as {@link formatIssues} but for an array of items: the issues are
 * grouped per item using the index they were found at.
 */
export function formatBulkIssues(error: z.ZodError): BulkIssue[] {
  const raw: RawIssue[] = []
  collectRaw(z.formatError(error), [], raw)

  const grouped = new Map<number, FieldIssue[]>()

  for (const issue of raw) {
    const [head, ...rest] = issue.segments
    const index = Number(head)
    if (!Number.isInteger(index)) continue

    const list = grouped.get(index) ?? []
    list.push({ path: rest.join('.') || 'value', message: issue.message })
    grouped.set(index, list)
  }

  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, errors]) => ({ index, errors, count: errors.length }))
}
