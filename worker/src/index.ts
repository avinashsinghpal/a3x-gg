import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { crmRouter } from './routes/crm';
import { callRecordsRouter } from './routes/call-records';
import { movementCareRouter } from './routes/movement-care';
import { bookingFlowRouter } from './routes/booking-flow';

export type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Use Hono CORS middleware
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'https://a3x-gg-7ago.vercel.app'],
    credentials: true,
  })
);

app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));
app.get('/', (c) => c.text("CRM Backend API is running! 🚀"));

// Mount sub-routers
app.route('/api/crm', crmRouter);
app.route('/api/call-records', callRecordsRouter);
app.route('/api/movement-care', movementCareRouter);
app.route('/api/booking-flow', bookingFlowRouter);

export default app;
