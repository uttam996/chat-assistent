import { desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { conversations, messages } from "../../db/schema";

export async function findConversation(id: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);

  return conversation ?? null;
}

export async function createConversation() {
  const [conversation] = await db.insert(conversations).values({}).returning();
  return conversation;
}

export async function saveMessage(
  conversationId: string,
  sender: "user" | "ai",
  text: string,
) {
  const [message] = await db
    .insert(messages)
    .values({ conversationId, sender, text })
    .returning();

  return message;
}

export async function getRecentMessages(conversationId: string, limit = 20) {
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.timestamp))
    .limit(limit);

  return rows.reverse();
}
