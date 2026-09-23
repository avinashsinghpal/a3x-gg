// Every M-POWER CALL is written to the database as well as the local store,
// so the operator and the admin see the same record from any device.
// Primary: Supabase (existing). Secondary: Express/D1 on Render (new).
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { api } from "@/lib/api";
import type { CallRecord } from "./types";

export async function pushCallRecord(r: CallRecord): Promise<{ ok: boolean; error?: string }> {
  const { data: auth } = await supabase.auth.getUser();
  const row = {
    called_at: r.ts,
    operator_id: auth.user?.id ?? null,
    operator_name: r.operatorName ?? null,
    lead_ulid: r.ulid ?? null,
    canonical_id: r.canonicalId ?? null,
    customer_name: r.name ?? null,
    agenda: r.agenda,
    agenda_source: r.agendaSource ?? null,
    outcome: r.outcome,
    duration_sec: r.durationSec ?? null,
    capture: r.capture as unknown as Json,
    movement: r.movement ?? null,
    message_now: r.messageNow ?? null,
    message_sent: !!r.messageSent,
    follow_up: r.followUp as unknown as Json,
    follow_up_state: r.followUpState ?? null,
    next_step: r.nextStep as unknown as Json,
    stage_after: r.stageAfter ?? null,
    waste: (r.waste ?? []) as unknown as Json,
    client_id: r.id,
  };
  const { error } = await supabase.from("call_records").insert(row);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Calls stored centrally — used by the admin view and by the operator's own history. */
export async function fetchCallRecords(limit = 200) {
  const { data, error } = await supabase
    .from("call_records")
    .select("*")
    .order("called_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Secondary write to the Render/D1 backend — runs in parallel with Supabase. */
export async function pushCallRecordToApi(r: CallRecord): Promise<{ ok: boolean; error?: string }> {
  const result = await api.callRecords.save({
    id: r.id,
    called_at: r.ts,
    operator_name: r.operatorName ?? null,
    lead_ulid: r.ulid,
    canonical_id: r.canonicalId ?? null,
    customer_name: r.name ?? null,
    agenda: r.agenda,
    agenda_source: r.agendaSource ?? null,
    outcome: r.outcome,
    duration_sec: r.durationSec ?? null,
    capture: r.capture,
    movement: r.movement ?? null,
    message_now: r.messageNow ?? null,
    message_sent: !!r.messageSent,
    follow_up: r.followUp,
    follow_up_state: r.followUpState ?? "armed",
    next_step: r.nextStep,
    stage_after: r.stageAfter ?? null,
    waste: r.waste ?? [],
  });
  return result;
}

/** Fetch last N call records for one lead from the D1 backend (used for inline history). */
export async function fetchLeadCallHistory(ulid: string): Promise<{ id: string; called_at: string; agenda: string; outcome: string; movement: string | null; message_now: string | null }[]> {
  const result = await api.callRecords.forLead(ulid);
  if (!result.ok) return [];
  const data = result.data as { records: { id: string; called_at: string; agenda: string; outcome: string; movement: string | null; message_now: string | null }[] };
  return data.records ?? [];
}
