import { Hono } from 'hono';
import { z } from 'zod';
import { Bindings } from '../index';

export const bookingFlowRouter = new Hono<{ Bindings: Bindings }>();

const PromiseSchema = z.object({
  id: z.string(),
  lead_id: z.string(),
  lead_name: z.string().optional(),
  operator_name: z.string().optional(),
  promise: z.string(),
  next_step: z.string().optional(),
  deadline: z.string().optional(),
});

// POST /api/booking-flow/promise — upsert a closing promise for a lead
bookingFlowRouter.post('/promise', async (c) => {
  try {
    const rawBody = await c.req.json();
    const body = PromiseSchema.parse(rawBody);
    await c.env.DB.prepare(
      `INSERT INTO booking_closing_promises
         (id, lead_id, lead_name, operator_name, promise, next_step, deadline, updated_at)
       VALUES (?,?,?,?,?,?,?,datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         promise = excluded.promise,
         next_step = excluded.next_step,
         deadline = excluded.deadline,
         updated_at = datetime('now')`
    )
      .bind(
        body.id,
        body.lead_id,
        body.lead_name ?? null,
        body.operator_name ?? null,
        body.promise,
        body.next_step ?? null,
        body.deadline ?? null
      )
      .run();
    return c.json({ ok: true });
  } catch (err: any) {
    console.error('[booking-flow promise POST]', err);
    return c.json({ ok: false, error: String(err) }, 400);
  }
});

// PATCH /api/booking-flow/promise/:id/copied — mark copied to WhatsApp
bookingFlowRouter.patch('/promise/:id/copied', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(
      `UPDATE booking_closing_promises SET copied_at = datetime('now') WHERE id = ?`
    )
      .bind(id)
      .run();
    return c.json({ ok: true });
  } catch (err: any) {
    console.error('[booking-flow promise PATCH]', err);
    return c.json({ ok: false, error: String(err) }, 500);
  }
});

// GET /api/booking-flow/promises — all open promises (admin view)
bookingFlowRouter.get('/promises', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM booking_closing_promises ORDER BY updated_at DESC LIMIT 100`
    ).all();
    return c.json({ ok: true, promises: results });
  } catch (err: any) {
    console.error('[booking-flow promises GET]', err);
    return c.json({ ok: false, error: String(err) }, 500);
  }
});
