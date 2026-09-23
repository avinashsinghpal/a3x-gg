import { Hono } from 'hono';
import { Bindings } from '../index';

export const crmRouter = new Hono<{ Bindings: Bindings }>();

// --- LEADS ---
crmRouter.get('/leads', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM leads ORDER BY updated_at DESC').all();
    return c.json({ ok: true, leads: results });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

crmRouter.post('/leads', async (c) => {
  try {
    const l = await c.req.json();
    await c.env.DB.prepare(
      `INSERT INTO leads (id, ulid, name, phone, email, stage, intent, budget, move_in_date, preferred_area, assignee_id, assignee_name, tags, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    )
      .bind(
        l.id ?? null, 
        l.ulid ?? null, 
        l.name ?? null, 
        l.phone ?? null, 
        l.email ?? null, 
        l.stage ?? null, 
        l.intent ?? null, 
        l.budget ?? null, 
        l.moveInDate ?? null, 
        l.preferredArea ?? null, 
        l.assignedTcmId ?? null, 
        l.assigneeName ?? null, 
        JSON.stringify(l.tags ?? [])
      )
      .run();
    return c.json({ ok: true });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

crmRouter.patch('/leads/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const setClauses: string[] = [];
    const params: any[] = [];
    
    for (const [k, v] of Object.entries(updates)) {
      setClauses.push(`${k} = ?`);
      params.push(typeof v === 'object' ? JSON.stringify(v) : v);
    }
    setClauses.push(`updated_at = datetime('now')`);
    params.push(id);
    
    await c.env.DB.prepare(`UPDATE leads SET ${setClauses.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();
    
    return c.json({ ok: true });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// --- ACTIVITIES ---
crmRouter.get('/activities', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM activities ORDER BY ts DESC LIMIT 200').all();
    return c.json({ ok: true, activities: results });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

crmRouter.post('/activities', async (c) => {
  try {
    const a = await c.req.json();
    await c.env.DB.prepare(
      `INSERT INTO activities (id, lead_id, type, text, actor_id, actor_name, ts) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(a.id, a.lead_id, a.type, a.text, a.actor_id, a.actor_name, a.ts || new Date().toISOString())
      .run();
    return c.json({ ok: true });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// --- TOURS ---
crmRouter.get('/tours', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM tours ORDER BY scheduled_at DESC').all();
    return c.json({ ok: true, tours: results });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

crmRouter.post('/tours', async (c) => {
  try {
    const t = await c.req.json();
    await c.env.DB.prepare(
      `INSERT INTO tours (id, lead_id, property_id, tcm_id, scheduled_at, status, decision, post_tour_feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(t.id, t.lead_id, t.property_id, t.tcm_id, t.scheduled_at, t.status || 'scheduled', t.decision, t.post_tour_feedback)
      .run();
    return c.json({ ok: true });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

crmRouter.patch('/tours/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const setClauses: string[] = [];
    const params: any[] = [];
    for (const [k, v] of Object.entries(updates)) {
      setClauses.push(`${k} = ?`);
      params.push(v);
    }
    params.push(id);
    
    await c.env.DB.prepare(`UPDATE tours SET ${setClauses.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();
      
    return c.json({ ok: true });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// --- MOVEMENT OS ---
crmRouter.get('/movement', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM movement_states').all();
    return c.json({ ok: true, states: results });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

crmRouter.patch('/movement/:ulid', async (c) => {
  try {
    const ulid = c.req.param('ulid');
    const updates = await c.req.json();
    
    const check = await c.env.DB.prepare('SELECT ulid FROM movement_states WHERE ulid = ?').bind(ulid).all();
    
    if (check.results.length === 0) {
      await c.env.DB.prepare(
        `INSERT INTO movement_states (ulid, wa_account, work_state, stage, movement, next_action, drafting_batch, payload, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
        .bind(
          ulid, updates.wa_account, updates.work_state, updates.stage, updates.movement, JSON.stringify(updates.next_action), updates.drafting_batch, JSON.stringify(updates.payload || {})
        )
        .run();
    } else {
      const setClauses: string[] = [];
      const params: any[] = [];
      for (const [k, v] of Object.entries(updates)) {
        if (k === 'ulid') continue;
        setClauses.push(`${k} = ?`);
        params.push(typeof v === 'object' ? JSON.stringify(v) : v);
      }
      setClauses.push(`updated_at = datetime('now')`);
      params.push(ulid);
      
      await c.env.DB.prepare(`UPDATE movement_states SET ${setClauses.join(', ')} WHERE ulid = ?`)
        .bind(...params)
        .run();
    }
    return c.json({ ok: true });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});
