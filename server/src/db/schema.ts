import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id),
    sender: text('sender', { enum: ['user', 'ai'] }).notNull(),
    text: text('text').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (table) => [index('msg_conv_ts_idx').on(table.conversationId, table.timestamp)],
);

export type Message = typeof messages.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
