import { Hono } from 'hono';
import { getConversationWithMessages } from './conversation.repository';
import { notFound } from '../../middleware/error-handler';

const conversation = new Hono();

conversation.get('/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  const result = await getConversationWithMessages(sessionId);

  if (!result) {
    notFound('Conversation not found');
  }

  return c.json(result);
});

export default conversation;
