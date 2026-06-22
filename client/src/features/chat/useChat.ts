import { useCallback, useEffect, useState } from 'react';
import { getConversation, postMessage, type ChatMessage } from './chatApi';

const SESSION_KEY = 'sessionId';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem(SESSION_KEY);
    if (!storedSessionId) return;

    setSessionId(storedSessionId);

    getConversation(storedSessionId)
      .then((data) => setMessages(data.messages))
      .catch(() => localStorage.removeItem(SESSION_KEY));
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setError(null);
    setWarning(null);
    setInput('');
    setIsLoading(true);

    setMessages((prev) => [...prev, { sender: 'user', text }]);

    try {
      const result = await postMessage(text, sessionId);

      setSessionId(result.sessionId);
      localStorage.setItem(SESSION_KEY, result.sessionId);
      setMessages((prev) => [...prev, { sender: 'ai', text: result.reply }]);

      if (result.warning) {
        setWarning(result.warning);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      setMessages((prev) => [...prev.slice(0, -1), { sender: 'ai', text: message }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    warning,
    error,
    sendMessage,
  };
}
