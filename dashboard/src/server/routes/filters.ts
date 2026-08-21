import { Hono } from "hono";
import { db } from "../db";
import { subcontractors } from "../db/schema";
import { sql } from "drizzle-orm";

const app = new Hono().get("/options", async (c) => {
  const [citiesResult, companyTypesResult, tradesResult] = await Promise.all([
    db
      .selectDistinct({ city: subcontractors.city })
      .from(subcontractors)
      .orderBy(subcontractors.city),
    db
      .selectDistinct({ companyType: subcontractors.companyType })
      .from(subcontractors)
      .orderBy(subcontractors.companyType),
    db.execute<{ trade: string }>(
      sql`SELECT DISTINCT t AS trade
          FROM subcontractors, jsonb_array_elements_text(trades) AS t
          ORDER BY t`
    ),
  ]);

  return c.json({
    data: {
      cities: citiesResult
        .map((r) => r.city)
        .filter(Boolean) as string[],
      companyTypes: companyTypesResult
        .map((r) => r.companyType)
        .filter(Boolean) as string[],
      trades: tradesResult.rows.map((r) => r.trade),
    },
  });
});

export default app;
