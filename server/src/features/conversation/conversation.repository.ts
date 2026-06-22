import { eq, asc } from 'drizzle-orm';
import { db } from '../../db';
import { conversations, messages } from '../../db/schema';

export async function getConversationWithMessages(sessionId: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, sessionId))
    .limit(1);

  if (!conversation) {
    return null;
  }

  const rows = await db
    .select({
      sender: messages.sender,
      text: messages.text,
      timestamp: messages.timestamp,
    })
    .from(messages)
    .where(eq(messages.conversationId, sessionId))
    .orderBy(asc(messages.timestamp));

  return {
    sessionId: conversation.id,
    messages: rows,
  };
}
