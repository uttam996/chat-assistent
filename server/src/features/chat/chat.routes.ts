import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { postMessageSchema } from './chat.schema';
import { sendChatMessage } from './chat.service';

const chat = new Hono();

chat.post(
  '/message',
  zValidator('json', postMessageSchema, (result, c) => {
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? 'Invalid request';
      return c.json({ error: message }, 400);
    }
  }),
  async (c) => {
    const body = c.req.valid('json');
    const result = await sendChatMessage(body);
    return c.json(result);
  },
);

export default chat;
