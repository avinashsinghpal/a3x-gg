import { Router } from "express";
import { z } from "zod";
import { d1Run, d1Query } from "../db.js";

export const callRecordsRouter = Router();

const CallRecordSchema = z.object({
  id: z.string(),
  called_at: z.string(),
  operator_id: z.string().nullable().optional(),
  operator_name: z.string().nullable().optional(),
  lead_ulid: z.string(),
  canonical_id: z.string().nullable().optional(),
  customer_name: z.string().nullable().optional(),
  agenda: z.string(),
  agenda_source: z.string().nullable().optional(),
  outcome: z.string(),
  duration_sec: z.number().nullable().optional(),
  capture: z.unknown().optional(),
  movement: z.string().nullable().optional(),
  message_now: z.string().nullable().optional(),
  message_sent: z.boolean().optional(),
  follow_up: z.unknown().optional(),
  follow_up_state: z.string().optional(),
  next_step: z.unknown().optional(),
  stage_after: z.string().nullable().optional(),
  waste: z.array(z.string()).optional(),
});

// POST /api/call-records — save one call record
callRecordsRouter.post("/", async (req, res) => {
  try {
    const body = CallRecordSchema.parse(req.body);
    await d1Run(
      `INSERT OR REPLACE INTO call_records
        (id, called_at, operator_id, operator_name, lead_ulid, canonical_id, customer_name,
         agenda, agenda_source, outcome, duration_sec, capture, movement, message_now,
         message_sent, follow_up, follow_up_state, next_step, stage_after, waste)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        body.id,
        body.called_at,
        body.operator_id ?? null,
        body.operator_name ?? null,
        body.lead_ulid,
        body.canonical_id ?? null,
        body.customer_name ?? null,
        body.agenda,
        body.agenda_source ?? null,
        body.outcome,
        body.duration_sec ?? null,
        JSON.stringify(body.capture ?? {}),
        body.movement ?? null,
        body.message_now ?? null,
        body.message_sent ? 1 : 0,
        JSON.stringify(body.follow_up ?? {}),
        body.follow_up_state ?? "armed",
        JSON.stringify(body.next_step ?? {}),
        body.stage_after ?? null,
        JSON.stringify(body.waste ?? []),
      ],
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("[call-records POST]", err);
    res.status(400).json({ ok: false, error: String(err) });
  }
});

// GET /api/call-records/:ulid — last 20 calls for a lead
callRecordsRouter.get("/:ulid", async (req, res) => {
  try {
    const { ulid } = req.params;
    const result = await d1Query(
      `SELECT * FROM call_records WHERE lead_ulid = ? ORDER BY called_at DESC LIMIT 20`,
      [ulid],
    );
    res.json({ ok: true, records: result.results });
  } catch (err) {
    console.error("[call-records GET]", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// GET /api/call-records — today's calls (admin view)
callRecordsRouter.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await d1Query(
      `SELECT id, called_at, operator_name, customer_name, agenda, outcome, movement, stage_after
       FROM call_records WHERE called_at >= ? ORDER BY called_at DESC LIMIT 200`,
      [today],
    );
    res.json({ ok: true, records: result.results });
  } catch (err) {
    console.error("[call-records GET /]", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});
