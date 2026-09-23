import { Router } from "express";
import { z } from "zod";
import { d1Run, d1Query } from "../db.js";

export const movementCareRouter = Router();

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
movementCareRouter.post("/commitment", async (req, res) => {
  try {
    const body = CommitmentSchema.parse(req.body);
    await d1Run(
      `INSERT OR REPLACE INTO movement_care_log
        (id, date, kind, operator_id, operator_name, role, goal, commit_count, support_needed, payload)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        body.id,
        body.date,
        "commitment",
        body.operator_id ?? null,
        body.operator_name ?? null,
        body.role,
        body.goal,
        body.commit_count,
        body.support_needed ?? null,
        JSON.stringify(body.payload ?? {}),
      ],
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("[movement-care commitment POST]", err);
    res.status(400).json({ ok: false, error: String(err) });
  }
});

// POST /api/movement-care/report
movementCareRouter.post("/report", async (req, res) => {
  try {
    const body = ReportSchema.parse(req.body);
    await d1Run(
      `INSERT OR REPLACE INTO movement_care_log
        (id, date, kind, operator_id, operator_name, role, goal, round, actual, commit_count, moved, stuck, need, payload)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        body.id,
        body.date,
        "report",
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
        JSON.stringify(body.payload ?? {}),
      ],
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("[movement-care report POST]", err);
    res.status(400).json({ ok: false, error: String(err) });
  }
});

// GET /api/movement-care?date=YYYY-MM-DD — admin: what was committed and delivered
movementCareRouter.get("/", async (req, res) => {
  try {
    const date = (req.query["date"] as string) ?? new Date().toISOString().slice(0, 10);
    const result = await d1Query(
      `SELECT * FROM movement_care_log WHERE date = ? ORDER BY created_at DESC`,
      [date],
    );
    res.json({ ok: true, logs: result.results });
  } catch (err) {
    console.error("[movement-care GET]", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});
