import { Hono } from "hono";
import { db } from "../db";
import { subcontractors } from "../db/schema";
import { sql, count, countDistinct } from "drizzle-orm";

const app = new Hono()
  .get("/overview", async (c) => {
    const [result] = await db
      .select({
        totalSubcontractors: count(),
        uniqueCities: countDistinct(subcontractors.city),
        uniqueCompanyTypes: countDistinct(subcontractors.companyType),
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
  })
  .get("/trades", async (c) => {
    const rows = await db.execute<{ trade: string; count: string }>(
      sql`SELECT t AS trade, COUNT(*) as count
          FROM subcontractors, jsonb_array_elements_text(trades) AS t
          GROUP BY t
          ORDER BY count DESC
          LIMIT 15`
    );

    return c.json({
      data: rows.rows.map((r) => ({ trade: r.trade, count: Number(r.count) })),
    });
  })
  .get("/cities", async (c) => {
    const rows = await db
      .select({
        city: subcontractors.city,
        count: count(),
      })
      .from(subcontractors)
      .groupBy(subcontractors.city)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    return c.json({ data: rows });
  })
  .get("/company-types", async (c) => {
    const rows = await db
      .select({
        companyType: subcontractors.companyType,
        count: count(),
      })
      .from(subcontractors)
      .groupBy(subcontractors.companyType)
      .orderBy(sql`count(*) DESC`);

    return c.json({ data: rows });
  });

export default app;
