import { z } from 'zod';

/**
 * Settings for the admin dashboard.
 *
 * This schema is shared between the frontend (settings dialog / admin
 * dashboard) and the backend (api routes) so both sides validate the same
 * payload with the same rules.
 */
export const settingsSchema = z.object({
  /**
   * "Strict descriptions" switch from the admin settings menu.
   *
   * Turning the switch on negates the strict validation flow: the looser
   * project schema is used instead and descriptions become optional.
   * With the switch off (the default) descriptions are required and any
   * repository that fails validation is flagged in the import review modal.
   */
  strictDescriptions: z.boolean().default(false),
});

export type AppSettings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: AppSettings = {
  strictDescriptions: false,
};

/**
 * Parses an unknown value into settings, falling back to the defaults when the
 * stored value is missing or malformed.
 */
export function parseSettings(value: unknown): AppSettings {
  const parsed = settingsSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}
