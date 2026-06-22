import { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useChat } from './useChat';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, setInput, isLoading, warning, sendMessage } = useChat();
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        aria-label="Open chat support"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col shadow-2xl">
      <Card className="flex max-h-[min(560px,calc(100vh-3rem))] flex-col overflow-hidden border-2">
        <CardHeader className="shrink-0 space-y-1 bg-primary py-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle className="text-base">AI Support Agent</CardTitle>
            <span className="flex items-center gap-1.5 text-xs font-normal opacity-90">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Online
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="ml-auto h-8 w-8 shrink-0 p-0"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs opacity-90">SwiftCart — ask about shipping, returns, or support hours</p>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
          <div
            ref={messagesRef}
            className="flex h-[360px] flex-col gap-3 overflow-y-auto bg-muted/30 px-4 py-4"
          >
            {messages.length === 0 && (
              <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm shadow-sm">
                Hi! I&apos;m the SwiftCart support agent. How can I help you today?
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.sender}-${index}-${message.text.slice(0, 16)}`}
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
                  message.sender === 'user'
                    ? 'ml-auto rounded-br-sm bg-blue-600 text-white'
                    : 'mr-auto rounded-bl-sm bg-white text-foreground',
                )}
              >
                {message.sender === 'ai' && (
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Support Agent
                  </p>
                )}
                {message.text}
              </div>
            ))}

            {isLoading && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Agent is typing…
              </div>
            )}
          </div>
        </CardContent>

        {warning && (
          <p className="shrink-0 border-t bg-amber-50 px-4 py-2 text-xs text-amber-700">{warning}</p>
        )}

        <CardFooter className="shrink-0 border-t bg-background p-3">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              disabled={isLoading}
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="shrink-0">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
