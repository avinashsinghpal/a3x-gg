import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const callRecords = sqliteTable("call_records", {
  id: text("id").primaryKey(),
  calledAt: text("called_at").notNull(),
  operatorId: text("operator_id"),
  operatorName: text("operator_name"),
  leadUlid: text("lead_ulid").notNull(),
  canonicalId: text("canonical_id"),
  customerName: text("customer_name"),
  agenda: text("agenda").notNull(),
  agendaSource: text("agenda_source"),
  outcome: text("outcome").notNull(),
  durationSec: integer("duration_sec"),
  capture: text("capture"), // JSON
  movement: text("movement"),
  messageNow: text("message_now"),
  messageSent: integer("message_sent").default(0),
  followUp: text("follow_up"), // JSON
  followUpState: text("follow_up_state").default("armed"),
  nextStep: text("next_step"), // JSON
  stageAfter: text("stage_after"),
  waste: text("waste"), // JSON
  createdAt: text("created_at"),
});

export const movementCareLog = sqliteTable("movement_care_log", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  kind: text("kind").notNull(),
  operatorId: text("operator_id"),
  operatorName: text("operator_name"),
  role: text("role"),
  goal: text("goal"),
  commitCount: integer("commit_count"),
  actual: integer("actual"),
  round: text("round"),
  moved: text("moved"),
  stuck: text("stuck"),
  need: text("need"),
  supportNeeded: text("support_needed"),
  payload: text("payload"), // JSON
  createdAt: text("created_at"),
});

export const bookingClosingPromises = sqliteTable("booking_closing_promises", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull(),
  leadName: text("lead_name"),
  operatorName: text("operator_name"),
  promise: text("promise").notNull(),
  nextStep: text("next_step"),
  deadline: text("deadline"),
  copiedAt: text("copied_at"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  ulid: text("ulid").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  stage: text("stage").default("new"),
  intent: text("intent").default("neutral"),
  budget: integer("budget"),
  moveInDate: text("move_in_date"),
  preferredArea: text("preferred_area"),
  assigneeId: text("assignee_id"),
  assigneeName: text("assignee_name"),
  tags: text("tags"), // JSON array
  dossier: text("dossier"), // JSON object
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const tours = sqliteTable("tours", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull(),
  propertyId: text("property_id").notNull(),
  tcmId: text("tcm_id").notNull(),
  scheduledAt: text("scheduled_at").notNull(),
  status: text("status").default("scheduled"),
  decision: text("decision"),
  postTourFeedback: text("post_tour_feedback"),
  createdAt: text("created_at"),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull(),
  type: text("type").notNull(),
  text: text("text").notNull(),
  actorId: text("actor_id"),
  actorName: text("actor_name"),
  ts: text("ts"),
});

export const followUps = sqliteTable("follow_ups", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull(),
  dueAt: text("due_at").notNull(),
  priority: text("priority").default("normal"),
  text: text("text").notNull(),
  done: integer("done").default(0),
  createdAt: text("created_at"),
});

export const handoffs = sqliteTable("handoffs", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull(),
  fromRole: text("from_role").notNull(),
  fromId: text("from_id").notNull(),
  text: text("text").notNull(),
  priority: text("priority").default("normal"),
  read: integer("read").default(0),
  createdAt: text("created_at"),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull(),
  propertyId: text("property_id").notNull(),
  tcmId: text("tcm_id").notNull(),
  amount: integer("amount").notNull(),
  createdAt: text("created_at"),
});

export const movementStates = sqliteTable("movement_states", {
  ulid: text("ulid").primaryKey(),
  waAccount: text("wa_account"),
  workState: text("work_state").default("available"),
  stage: text("stage").default("lead"),
  movement: text("movement").default("none"),
  nextAction: text("next_action"), // JSON
  draftingBatch: text("drafting_batch"),
  payload: text("payload"), // Full JSON
  updatedAt: text("updated_at"),
});
