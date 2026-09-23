import { Router } from "express";
import { z } from "zod";
import { d1Run, d1Query } from "../db.js";

export const bookingFlowRouter = Router();

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
bookingFlowRouter.post("/promise", async (req, res) => {
  try {
    const body = PromiseSchema.parse(req.body);
    await d1Run(
      `INSERT INTO booking_closing_promises
         (id, lead_id, lead_name, operator_name, promise, next_step, deadline, updated_at)
       VALUES (?,?,?,?,?,?,?,datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         promise = excluded.promise,
         next_step = excluded.next_step,
         deadline = excluded.deadline,
         updated_at = datetime('now')`,
      [
        body.id,
        body.lead_id,
        body.lead_name ?? null,
        body.operator_name ?? null,
        body.promise,
        body.next_step ?? null,
        body.deadline ?? null,
      ],
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("[booking-flow promise POST]", err);
    res.status(400).json({ ok: false, error: String(err) });
  }
});

// PATCH /api/booking-flow/promise/:id/copied — mark copied to WhatsApp
bookingFlowRouter.patch("/promise/:id/copied", async (req, res) => {
  try {
    const { id } = req.params;
    await d1Run(
      `UPDATE booking_closing_promises SET copied_at = datetime('now') WHERE id = ?`,
      [id],
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("[booking-flow promise PATCH]", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// GET /api/booking-flow/promises — all open promises (admin view)
bookingFlowRouter.get("/promises", async (req, res) => {
  try {
    const result = await d1Query(
      `SELECT * FROM booking_closing_promises ORDER BY updated_at DESC LIMIT 100`,
    );
    res.json({ ok: true, promises: result.results });
  } catch (err) {
    console.error("[booking-flow promises GET]", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});
