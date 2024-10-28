import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().default('3333'),
  DATABASE_URL: z.string(),
  API_BASE_URL: z.string(),
  AUTH_REDIRECT_URL: z.string(),
  JWT_SECRET: z.string().default('banana'),
})

export const env = envSchema.parse(process.env)
