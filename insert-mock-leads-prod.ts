import { randomUUID } from "node:crypto";

const PROD_API = "https://tanstack-start-app.avinashpal24013.workers.dev";

const mockLeads = [
  {
    name: "Ananya Sharma",
    phone: "+91 98765 43210",
    stage: "booked",
    intent: "warm",
    budget: 15000,
    move_in_date: "2026-10-01",
    preferred_area: "Koramangala",
    assignee_id: "tcm-1",
  },
  {
    name: "Rahul Singh",
    phone: "+91 87654 32109",
    stage: "new",
    intent: "cold",
    budget: 12000,
    move_in_date: "2026-09-28",
    preferred_area: "Indiranagar",
    assignee_id: "tcm-2",
  },
  {
    name: "Priya Nair",
    phone: "+91 76543 21098",
    stage: "new",
    intent: "warm",
    budget: 14000,
    move_in_date: "2026-10-15",
    preferred_area: "HSR Layout",
    assignee_id: "tcm-3",
  },
  {
    name: "Vikram Gupta",
    phone: "+91 65432 10987",
    stage: "new",
    intent: "hot",
    budget: 10000,
    move_in_date: "2026-09-30",
    preferred_area: "Whitefield",
    assignee_id: "tcm-4",
  },
  {
    name: "Neha Patil",
    phone: "+91 91234 56780",
    stage: "new",
    intent: "warm",
    budget: 18000,
    move_in_date: "2026-10-05",
    preferred_area: "Koramangala",
    assignee_id: "tcm-1",
  }
];

async function insertMockLeads() {
  for (let i = 0; i < mockLeads.length; i++) {
    const lead = {
      id: "l-mock-" + (i+1),
      ulid: randomUUID(),
      ...mockLeads[i],
    };
    const res = await fetch(PROD_API + "/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead)
    });
    console.log("Inserted " + lead.name + ":", await res.text());

    const mRes = await fetch(PROD_API + "/api/crm/movement/" + lead.ulid, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movement_state: "{}", intent: lead.intent, last_touched: new Date().toISOString() })
    });
    console.log("Initialized movement state for " + lead.name + ":", await mRes.text());
  }
}

insertMockLeads().catch(console.error);
