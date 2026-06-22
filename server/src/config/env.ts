import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_MODEL: z.string().default('openrouter/free'),
  PORT: z.coerce.number().default(3001),
});

export const env = envSchema.parse(process.env);

console.log(`OpenRouter model: ${env.OPENROUTER_MODEL}`);
