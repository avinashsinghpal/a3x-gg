import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { callRecordsRouter } from "./routes/call-records.js";
import { movementCareRouter } from "./routes/movement-care.js";
import { bookingFlowRouter } from "./routes/booking-flow.js";
import { crmRouter } from "./routes/crm.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// Allow the Vercel frontend + local dev to call this API
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:8080,http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server (no origin) or listed origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

// Health check — Render uses this to verify the server is up
app.get("/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// API routes
app.use("/api/call-records", callRecordsRouter);
app.use("/api/movement-care", movementCareRouter);
app.use("/api/booking-flow", bookingFlowRouter);
app.use("/api/crm", crmRouter);

// Generic error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server error]", err.message);
  res.status(500).json({ ok: false, error: err.message });
});

app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
});
