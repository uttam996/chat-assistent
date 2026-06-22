const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export type ChatMessage = {
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
};

export type PostMessageResponse = {
  reply: string;
  sessionId: string;
  warning?: string;
};

export type ConversationResponse = {
  sessionId: string;
  messages: ChatMessage[];
};

export async function postMessage(message: string, sessionId?: string | null) {
  const response = await fetch(`${API_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId: sessionId ?? undefined }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to send message');
  }

  return data as PostMessageResponse;
}

export async function getConversation(sessionId: string) {
  const response = await fetch(`${API_URL}/conversation/${sessionId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to load conversation');
  }

  return data as ConversationResponse;
}
