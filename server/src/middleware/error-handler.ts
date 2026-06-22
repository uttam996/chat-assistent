import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  if (err instanceof ZodError) {
    const message = err.errors[0]?.message ?? 'Invalid request';
    return c.json({ error: message }, 400);
  }

  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
}

export function badRequest(message: string): never {
  throw new HTTPException(400, { message });
}

export function notFound(message: string): never {
  throw new HTTPException(404, { message });
}

export function jsonError(c: Context, message: string, status: ContentfulStatusCode) {
  return c.json({ error: message }, status);
}
