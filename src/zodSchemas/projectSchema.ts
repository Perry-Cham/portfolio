import z from 'zod';

//This schema is for project data being created by the admin form from repo data and sent tothe api. Shared between the backend and frontend
export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  githubUrl: z.url('Must be a valid URL').nullable().optional(),
  tags: z.string().optional(),
});

//Looser variant used when the "strict descriptions" switch is enabled. Descriptions are optional so repositories without one can be imported.
export const looseProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  githubUrl: z.url('Must be a valid URL').nullable().optional(),
  tags: z.string().optional(),
});

/**
 * Picks the schema used to validate imported repositories.
 *
 * The "strict descriptions" switch negates the strict validation flow: when it
 * is on we fall back to the loose schema (descriptions optional), otherwise
 * the strict schema is used and failures are reported back to the admin.
 */
export function getProjectSchema(strictDescriptions: boolean) {
  return strictDescriptions ? looseProjectSchema : projectSchema;
}
