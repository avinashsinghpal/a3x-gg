// Cloudflare D1 HTTP REST client.
// D1 is only natively accessible inside Cloudflare Workers, but its
// REST API (https://developers.cloudflare.com/d1/platform/rest-api/)
// works from any HTTP client — including our Render-hosted Express server.
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID ?? "";
const CF_D1_DATABASE_ID = process.env.CF_D1_DATABASE_ID ?? "";
const CF_API_TOKEN = process.env.CF_API_TOKEN ?? "";

const D1_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`;

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { changed_db: boolean; rows_read: number; rows_written: number };
}

export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = [],
): Promise<D1Result<T>> {
  const res = await fetch(D1_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`D1 HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { result: D1Result<T>[]; success: boolean; errors: { message: string }[] };
  if (!json.success) throw new Error(json.errors.map((e) => e.message).join(", "));
  // D1 REST returns an array of results (one per statement)
  return json.result[0]!;
}

export async function d1Run(
  sql: string,
  params: (string | number | boolean | null)[] = [],
): Promise<{ success: boolean; rows_written: number }> {
  const r = await d1Query(sql, params);
  return { success: r.success, rows_written: r.meta.rows_written };
}
