# Spur AI Live Chat Agent

A mini AI support agent for a live chat widget. Customers ask questions about a fictional store (SwiftCart); an AI agent answers using OpenRouter, with full conversation persistence in PostgreSQL.

## Project Structure

```
chat-agent/
├── server/          # Bun + Hono API, Drizzle ORM, OpenRouter LLM
├── client/          # React + Vite + shadcn/ui chat widget
└── docker-compose.yml
```

## Prerequisites

- [Bun](https://bun.sh) v1.2+
- [Docker](https://docs.docker.com/get-docker/) (for local PostgreSQL) or a local Postgres install

## How to Run Locally

### 1. Start PostgreSQL

**Option A — Docker (recommended):**

```bash
docker compose up -d
```

**Option B — Local PostgreSQL:** create the database manually:

```bash
psql -U postgres -c "CREATE USER spur WITH PASSWORD 'spur';"
psql -U postgres -c "CREATE DATABASE spur_chat OWNER spur;"
```

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY

bun install
bun run db:migrate
bun run dev
```

Server runs at **[http://localhost:3001](http://localhost:3001)**

### 3. Frontend

```bash
cd client
cp .env.example .env
bun install
bun run dev
```

Client runs at **[http://localhost:5173](http://localhost:5173)**

Open **[http://localhost:5173](http://localhost:5173)** and use the chat widget in the bottom-right corner.

## Environment Variables

### Server (`server/.env`)


| Variable             | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`       | PostgreSQL connection string                                             |
| `OPENROUTER_API_KEY` | OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys) |
| `OPENROUTER_MODEL`   | Model slug (default: `openrouter/free`)                                  |
| `PORT`               | Server port (default: 3001)                                              |


Example:

```
DATABASE_URL=postgres://spur:spur@localhost:5432/spur_chat
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=openrouter/free
PORT=3001
```

### Client (`client/.env`)


| Variable       | Description                                    |
| -------------- | ---------------------------------------------- |
| `VITE_API_URL` | Backend URL (default: `http://localhost:3001`) |


## Database Setup

```bash
cd server
bun run db:migrate
```

Schema: `server/src/db/schema.ts`  
Migrations: `server/src/db/migrations/`

Tables: `conversations`, `messages`

## API

### `POST /chat/message`

Request:

```json
{ "message": "What is your return policy?", "sessionId": "optional-uuid" }
```

Response:

```json
{ "reply": "...", "sessionId": "uuid", "warning": "optional" }
```

- `sessionId` is the conversation UUID — the client stores it in `localStorage` and sends it on follow-up messages.
- `warning` is returned when a message exceeds 2000 characters and is trimmed.

### `GET /conversation/:sessionId`

Response:

```json
{
  "sessionId": "uuid",
  "messages": [{ "sender": "user", "text": "...", "timestamp": "..." }]
}
```

## Architecture Overview

### Backend (feature-modular)


| Module                   | Responsibility                                              |
| ------------------------ | ----------------------------------------------------------- |
| `features/chat/`         | `POST /chat/message` — validate, persist, call LLM, respond |
| `features/conversation/` | `GET /conversation/:id` — load chat history                 |
| `features/llm/`          | `generateReply()` — OpenRouter + static store FAQ           |
| `db/`                    | Drizzle schema + Postgres client                            |
| `middleware/`            | Global error handler + CORS                                 |


Each feature has: `*.routes.ts` (HTTP), `*.service.ts` (logic), `*.repository.ts` (DB queries).

### Frontend


| File                           | Role                                      |
| ------------------------------ | ----------------------------------------- |
| `features/chat/ChatWidget.tsx` | shadcn/ui chat panel                      |
| `features/chat/useChat.ts`     | State, session restore via `localStorage` |
| `features/chat/chatApi.ts`     | API calls                                 |


### Request flow

```
User message → POST /chat/message → save to DB → generateReply() → OpenRouter → save reply → respond
```

Session continuity: the client keeps `sessionId` in `localStorage` (`"sessionId"` key). On page load it calls `GET /conversation/:sessionId` to restore history.

## LLM Notes

- **Provider:** [OpenRouter](https://openrouter.ai) only
- **Default model:** `openrouter/free` (random free model per request)
- **Prompt:** SwiftCart store policies injected as system context in `store-knowledge.ts`
- **History:** Last 20 messages sent for context
- **Token cap:** `max_tokens: 256`
- **Timeout:** 45 seconds
- **Reasoning:** `reasoning: { exclude: true }` — required for `openrouter/free` so internal thinking tokens are not returned to the user
- **Retries:** One automatic retry if OpenRouter returns an empty `content` field
- **Errors:** Returns a friendly fallback message on failure

### Changing the model

Set `OPENROUTER_MODEL` in `server/.env` to any OpenRouter model slug, e.g.:

```
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

Free models may be rate-limited. Check [openrouter.ai/models](https://openrouter.ai/models) for availability.

## Troubleshooting

### "Sorry, I am having trouble responding right now"

- Check `OPENROUTER_API_KEY` is set in `server/.env`
- Free models hit daily rate limits — wait and retry, or switch `OPENROUTER_MODEL`
- Check server logs for `OpenRouter 429` or timeout errors

### Weird replies like `User Safety: safe`

This can happen if a bad reply was saved to an old conversation. Start a fresh chat:

```js
localStorage.removeItem('sessionId')
```

Then refresh the page. The server strips these patterns from new replies, but old messages stay in the DB until you start a new session.

### Slow responses

`openrouter/free` can take 10–30+ seconds depending on which model is selected. This is normal for free-tier routing.



