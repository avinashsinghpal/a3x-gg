import crypto from "crypto";

async function run() {
  console.log("Inserting 5 mock leads...");
  
  const leads = [
    { name: "Rahul Sharma", phone: "9876543210", email: "rahul@example.com", stage: "new", intent: "high", budget: 15000, preferredArea: "Indiranagar", assigneeName: "Agent A" },
    { name: "Priya Singh", phone: "9876543211", email: "priya@example.com", stage: "contacted", intent: "medium", budget: 20000, preferredArea: "Koramangala", assigneeName: "Agent B" },
    { name: "Amit Kumar", phone: "9876543212", email: "amit@example.com", stage: "matched", intent: "high", budget: 12000, preferredArea: "HSR Layout", assigneeName: "Agent A" },
    { name: "Neha Gupta", phone: "9876543213", email: "neha@example.com", stage: "tour-scheduled", intent: "high", budget: 18000, preferredArea: "BTM Layout", assigneeName: "Agent C" },
    { name: "Vikram Patel", phone: "9876543214", email: "vikram@example.com", stage: "negotiation", intent: "high", budget: 25000, preferredArea: "Whitefield", assigneeName: "Agent B" }
  ];

  for (const lead of leads) {
    const id = crypto.randomUUID();
    const leadData = {
      ...lead,
      id: id,
      ulid: id,
    };
    
    // Insert into leads
    const res = await fetch("http://localhost:8787/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });
    
    if (res.ok) {
      console.log(`Inserted lead: ${leadData.name}`);
      
      // Initialize movement state
      const mvRes = await fetch(`http://localhost:8787/api/crm/movement/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wa_account: "system",
          work_state: "armed",
          stage: leadData.stage,
          movement: "data",
          next_action: { kind: "call", label: "Initial call", dueAt: new Date(Date.now() + 3600000).toISOString() },
          drafting_batch: null,
          payload: { q: { location: leadData.preferredArea, budget: leadData.budget } }
        }),
      });
      if (mvRes.ok) {
        console.log(`Initialized movement state for: ${leadData.name}`);
      } else {
        console.error(`Failed to init movement state for ${leadData.name}:`, await mvRes.text());
      }

    } else {
      console.error(`Failed to insert lead ${leadData.name}:`, await res.text());
    }
  }
  
  console.log("Done!");
}

run();
