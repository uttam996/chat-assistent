import type { Message } from '../../db/schema';
import { env } from '../../config/env';
import { STORE_KNOWLEDGE } from './store-knowledge';

const MAX_HISTORY = 20;
const FALLBACK_REPLY =
  'Sorry, I am having trouble responding right now. Please try again in a moment.';

type OpenRouterMessage = {
  content?: string | { type?: string; text?: string }[] | null;
};

function extractText(message: OpenRouterMessage | undefined): string {
  const content = message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part.text ?? ''))
      .join('')
      .trim();
  }

  return '';
}

// Some free models leak internal safety checks into the reply
function cleanReply(text: string): string {
  return text
    .replace(/\n?User Safety:\s*\w+\n?/gi, '')
    .replace(/\n?Response Safety:\s*\w+\n?/gi, '')
    .trim();
}

async function callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL,
      max_tokens: 256,
      reasoning: { exclude: true },
      messages,
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: OpenRouterMessage }[];
  };

  const text = cleanReply(extractText(data.choices?.[0]?.message));
  if (!text) {
    throw new Error('OpenRouter returned an empty response');
  }

  return text;
}

export async function generateReply(history: Message[], userMessage: string): Promise<string> {
  if (!userMessage.trim()) {
    throw new Error('Message cannot be empty');
  }

  try {
    const messages = [
      { role: 'system' as const, content: STORE_KNOWLEDGE },
      ...history.slice(-MAX_HISTORY).map((message) => ({
        role: message.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: message.text,
      })),
    ];

    const last = history[history.length - 1];
    if (!(last?.sender === 'user' && last.text === userMessage)) {
      messages.push({ role: 'user' as const, content: userMessage });
    }

    try {
      return await callOpenRouter(messages);
    } catch (error) {
      if (!(error instanceof Error && error.message.includes('empty response'))) {
        throw error;
      }
      return await callOpenRouter(messages);
    }
  } catch (error) {
    console.error('LLM error:', error);
    return FALLBACK_REPLY;
  }
}
