import { Hono } from 'hono';
import { z } from 'zod';
import { Bindings } from '../index';

export const movementCareRouter = new Hono<{ Bindings: Bindings }>();

const CommitmentSchema = z.object({
  id: z.string(),
  date: z.string(),
  operator_id: z.string().nullable().optional(),
  operator_name: z.string().nullable().optional(),
  role: z.string(),
  goal: z.string(),
  commit_count: z.number(),
  support_needed: z.string().optional(),
  payload: z.unknown().optional(),
});

const ReportSchema = z.object({
  id: z.string(),
  date: z.string(),
  operator_id: z.string().nullable().optional(),
  operator_name: z.string().nullable().optional(),
  role: z.string(),
  goal: z.string(),
  round: z.string(),
  actual: z.number(),
  commit_count: z.number(),
  moved: z.string().optional(),
  stuck: z.string().optional(),
  need: z.string().optional(),
  payload: z.unknown().optional(),
});

// POST /api/movement-care/commitment
movementCareRouter.post('/commitment', async (c) => {
  try {
    const rawBody = await c.req.json();
    const body = CommitmentSchema.parse(rawBody);
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO movement_care_log
        (id, date, kind, operator_id, operator_name, role, goal, commit_count, support_needed, payload)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    )
      .bind(
        body.id,
        body.date,
        'commitment',
        body.operator_id ?? null,
        body.operator_name ?? null,
        body.role,
        body.goal,
        body.commit_count,
        body.support_needed ?? null,
        JSON.stringify(body.payload ?? {})
      )
      .run();
    return c.json({ ok: true });
  } catch (err: any) {
    console.error('[movement-care commitment POST]', err);
    return c.json({ ok: false, error: String(err) }, 400);
  }
});

// POST /api/movement-care/report
movementCareRouter.post('/report', async (c) => {
  try {
    const rawBody = await c.req.json();
    const body = ReportSchema.parse(rawBody);
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO movement_care_log
        (id, date, kind, operator_id, operator_name, role, goal, round, actual, commit_count, moved, stuck, need, payload)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
      .bind(
        body.id,
        body.date,
        'report',
        body.operator_id ?? null,
        body.operator_name ?? null,
        body.role,
        body.goal,
        body.round,
        body.actual,
        body.commit_count,
        body.moved ?? null,
        body.stuck ?? null,
        body.need ?? null,
        JSON.stringify(body.payload ?? {})
      )
      .run();
    return c.json({ ok: true });
  } catch (err: any) {
    console.error('[movement-care report POST]', err);
    return c.json({ ok: false, error: String(err) }, 400);
  }
});

// GET /api/movement-care?date=YYYY-MM-DD
movementCareRouter.get('/', async (c) => {
  try {
    const date = c.req.query('date') ?? new Date().toISOString().slice(0, 10);
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM movement_care_log WHERE date = ? ORDER BY created_at DESC`
    )
      .bind(date)
      .all();
    return c.json({ ok: true, logs: results });
  } catch (err: any) {
    console.error('[movement-care GET]', err);
    return c.json({ ok: false, error: String(err) }, 500);
  }
});
