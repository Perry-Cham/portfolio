import { z } from "zod";

const envSchema = z.object({
  GITHUB: z.string().min(1, "GITHUB is required"),
  EMAIL: z.email("EMAIL must be a valid email"),
  PHONE: z.string().min(1, "PHONE is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Parses process.env. If any variable is missing or invalid, 
// parse() will immediately throw an error and stop the build.
export const env = envSchema.parse({
  GITHUB: process.env.GITHUB,
  EMAIL: process.env.EMAIL,
  PHONE: process.env.PHONE,
  NODE_ENV: process.env.NODE_ENV,
})