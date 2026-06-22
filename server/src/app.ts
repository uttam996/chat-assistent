import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler';
import chatRouter from './features/chat';
import conversationRouter from './features/conversation';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
);

app.onError(errorHandler);

app.get('/', (c) => c.text('AI Live Chat Agent Backend is running!'));

app.route('/chat', chatRouter);
app.route('/conversation', conversationRouter);

export default app;
