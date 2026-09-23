import { LEADS } from "./src/lib/mock-data";

async function run() {
  console.log(`Inserting ${LEADS.length} mock leads...`);
  
  for (const lead of LEADS) {
    // Generate a quick random ULID equivalent since we just need it for mock data
    const ulid = "01" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const res = await fetch("http://localhost:8787/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, ulid }),
    });
    
    if (res.ok) {
      console.log(`Inserted: ${lead.name}`);
    } else {
      console.error(`Failed to insert ${lead.name}:`, await res.text());
    }
  }
  
  console.log("Done!");
}

run();
