import {
  createConversation,
  findConversation,
  getRecentMessages,
  saveMessage,
} from './chat.repository';
import { generateReply } from '../llm/llm.service';
import { badRequest } from '../../middleware/error-handler';
import type { PostMessageInput } from './chat.schema';

const MAX_MESSAGE_LENGTH = 2000;

export async function sendChatMessage(input: PostMessageInput) {
  let message = input.message.trim();
  let warning: string | undefined;

  if (!message) {
    badRequest('Message cannot be empty');
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    message = message.slice(0, MAX_MESSAGE_LENGTH);
    warning = `Your message was trimmed to ${MAX_MESSAGE_LENGTH} characters.`;
  }

  if (!message) {
    badRequest('Message cannot be empty');
  }

  let conversation = input.sessionId ? await findConversation(input.sessionId) : null;

  if (!conversation) {
    conversation = await createConversation();
  }

  await saveMessage(conversation.id, 'user', message);

  const history = await getRecentMessages(conversation.id);
  const reply = await generateReply(history, message);

  await saveMessage(conversation.id, 'ai', reply);

  return {
    reply,
    sessionId: conversation.id,
    ...(warning ? { warning } : {}),
  };
}
