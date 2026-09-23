import { Router } from "express";
import { d1Query, d1Run } from "../db.js";

export const crmRouter = Router();

// --- LEADS ---
crmRouter.get("/leads", async (req, res) => {
  try {
    const data = await d1Query("SELECT * FROM leads ORDER BY updated_at DESC");
    res.json({ ok: true, leads: data.results });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

crmRouter.post("/leads", async (req, res) => {
  try {
    const l = req.body;
    await d1Run(
      `INSERT INTO leads (id, ulid, name, phone, email, stage, intent, budget, move_in_date, preferred_area, assignee_id, assignee_name, tags, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [l.id, l.ulid, l.name, l.phone, l.email, l.stage, l.intent, l.budget, l.move_in_date, l.preferred_area, l.assignee_id, l.assignee_name, JSON.stringify(l.tags)]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

crmRouter.patch("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClauses: string[] = [];
    const params: any[] = [];
    
    for (const [k, v] of Object.entries(updates)) {
      setClauses.push(`${k} = ?`);
      params.push(typeof v === "object" ? JSON.stringify(v) : v);
    }
    setClauses.push(`updated_at = datetime('now')`);
    params.push(id);
    
    await d1Run(`UPDATE leads SET ${setClauses.join(", ")} WHERE id = ?`, params);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- ACTIVITIES ---
crmRouter.get("/activities", async (req, res) => {
  try {
    const data = await d1Query("SELECT * FROM activities ORDER BY ts DESC LIMIT 200");
    res.json({ ok: true, activities: data.results });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

crmRouter.post("/activities", async (req, res) => {
  try {
    const a = req.body;
    await d1Run(
      `INSERT INTO activities (id, lead_id, type, text, actor_id, actor_name, ts) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.lead_id, a.type, a.text, a.actor_id, a.actor_name, a.ts || new Date().toISOString()]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- TOURS ---
crmRouter.get("/tours", async (req, res) => {
  try {
    const data = await d1Query("SELECT * FROM tours ORDER BY scheduled_at DESC");
    res.json({ ok: true, tours: data.results });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

crmRouter.post("/tours", async (req, res) => {
  try {
    const t = req.body;
    await d1Run(
      `INSERT INTO tours (id, lead_id, property_id, tcm_id, scheduled_at, status, decision, post_tour_feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.lead_id, t.property_id, t.tcm_id, t.scheduled_at, t.status || 'scheduled', t.decision, t.post_tour_feedback]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

crmRouter.patch("/tours/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const setClauses = [];
    const params = [];
    for (const [k, v] of Object.entries(updates)) {
      setClauses.push(`${k} = ?`);
      params.push(v);
    }
    params.push(id);
    await d1Run(`UPDATE tours SET ${setClauses.join(", ")} WHERE id = ?`, params);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- MOVEMENT OS ---
crmRouter.get("/movement", async (req, res) => {
  try {
    const data = await d1Query("SELECT * FROM movement_states");
    res.json({ ok: true, states: data.results });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

crmRouter.patch("/movement/:ulid", async (req, res) => {
  try {
    const { ulid } = req.params;
    const updates = req.body;
    
    // Check if it exists
    const check = await d1Query("SELECT ulid FROM movement_states WHERE ulid = ?", [ulid]);
    
    if (check.results.length === 0) {
      await d1Run(
        `INSERT INTO movement_states (ulid, wa_account, work_state, stage, movement, next_action, drafting_batch, payload, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [ulid, updates.wa_account, updates.work_state, updates.stage, updates.movement, JSON.stringify(updates.next_action), updates.drafting_batch, JSON.stringify(updates.payload || {})]
      );
    } else {
      const setClauses = [];
      const params = [];
      for (const [k, v] of Object.entries(updates)) {
        if (k === 'ulid') continue;
        setClauses.push(`${k} = ?`);
        params.push(typeof v === "object" ? JSON.stringify(v) : v);
      }
      setClauses.push(`updated_at = datetime('now')`);
      params.push(ulid);
      await d1Run(`UPDATE movement_states SET ${setClauses.join(", ")} WHERE ulid = ?`, params);
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
