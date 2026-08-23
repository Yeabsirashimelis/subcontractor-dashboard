import { Hono } from "hono";
import { db } from "../db";
import { subcontractors } from "../db/schema";
import { sql, count, countDistinct } from "drizzle-orm";

const app = new Hono().get("/stats", async (c) => {
  const [result] = await db
    .select({
      totalSubcontractors: count(),
      uniqueCities: countDistinct(subcontractors.city),
    })
    .from(subcontractors);

  const tradesResult = await db.execute<{ count: string }>(
    sql`SELECT COUNT(DISTINCT t) as count FROM subcontractors, jsonb_array_elements_text(trades) AS t`
  );

  return c.json({
    data: {
      ...result,
      uniqueTrades: Number(tradesResult.rows[0]?.count ?? 0),
    },
  });
});

export default app;
