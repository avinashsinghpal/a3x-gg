// Thin fetch wrapper that points to the Render-hosted Express backend.
// All 3 modules use this instead of calling Supabase directly,
// so their writes appear in Cloudflare D1 and are visible to admin.

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

async function post<T = unknown>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { ok: boolean; error?: string } & Record<string, unknown>;
    if (!json.ok) return { ok: false, error: (json.error as string) ?? "Server error" };
    return { ok: true, data: json as T };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function patch<T = unknown>(path: string, body?: unknown): Promise<{ ok: boolean; error?: string; data?: T }> {
  try {
    const res = await fetch(`${BASE}${path}`, { 
      method: "PATCH",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    return await res.json() as { ok: boolean; error?: string; data?: T };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function get<T = unknown>(path: string): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${BASE}${path}`);
    const json = await res.json() as { ok: boolean; error?: string } & Record<string, unknown>;
    if (!json.ok) return { ok: false, error: (json.error as string) ?? "Server error" };
    return { ok: true, data: json as T };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── Call Records ───────────────────────────────────────────────────────────
export const api = {
  callRecords: {
    save: (record: unknown) => post("/api/call-records", record),
    forLead: (ulid: string) => get(`/api/call-records/${ulid}`),
    today: () => get("/api/call-records"),
  },

  // ── Movement CARE ─────────────────────────────────────────────────────
  movementCare: {
    saveCommitment: (data: unknown) => post("/api/movement-care/commitment", data),
    saveReport: (data: unknown) => post("/api/movement-care/report", data),
    forDate: (date: string) => get(`/api/movement-care?date=${date}`),
  },

  // ── Booking Flow ──────────────────────────────────────────────────────
  bookingFlow: {
    savePromise: (data: unknown) => post("/api/booking-flow/promise", data),
    markCopied: (id: string) => patch(`/api/booking-flow/promise/${id}/copied`),
    allPromises: () => get("/api/booking-flow/promises"),
  },

  // ── CRM (D1 Unified Store) ──────────────────────────────────────────
  crm: {
    getLeads: () => get("/api/crm/leads"),
    saveLead: (data: unknown) => post("/api/crm/leads", data),
    updateLead: (id: string, data: unknown) => patch(`/api/crm/leads/${id}`, data),
    
    getTours: () => get("/api/crm/tours"),
    saveTour: (data: unknown) => post("/api/crm/tours", data),
    updateTour: (id: string, data: unknown) => patch(`/api/crm/tours/${id}`, data),

    getActivities: () => get("/api/crm/activities"),
    saveActivity: (data: unknown) => post("/api/crm/activities", data),

    getMovementStates: () => get("/api/crm/movement"),
    updateMovementState: (ulid: string, data: unknown) => patch(`/api/crm/movement/${ulid}`, data),
  },
};
