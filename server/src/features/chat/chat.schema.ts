import { z } from 'zod';

function normalizeMessage(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

export const postMessageSchema = z.object({
  message: z.preprocess(
    normalizeMessage,
    z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
  ),
  sessionId: z.string().uuid().optional(),
});

export type PostMessageInput = z.infer<typeof postMessageSchema>;
