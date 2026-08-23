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
  })
  .get("/enrichment", async (c) => {
    const samRows = await db
      .select({
        status: subcontractors.samStatus,
        count: count(),
      })
      .from(subcontractors)
      .where(sql`${subcontractors.samUei} IS NOT NULL`)
      .groupBy(subcontractors.samStatus)
      .orderBy(sql`count(*) DESC`);

    const awardsRows = await db.execute<{
      range: string;
      count: string;
      total: string;
    }>(
      sql`SELECT
            CASE
              WHEN federal_awards_total < 100000 THEN 'Under $100K'
              WHEN federal_awards_total < 1000000 THEN '$100K–$1M'
              WHEN federal_awards_total < 10000000 THEN '$1M–$10M'
              WHEN federal_awards_total < 100000000 THEN '$10M–$100M'
              ELSE 'Over $100M'
            END AS range,
            COUNT(*) AS count,
            SUM(federal_awards_total) AS total
          FROM subcontractors
          WHERE federal_awards_total > 0
          GROUP BY range
          ORDER BY MIN(federal_awards_total)`
    );

    const enrichmentCounts = await db.execute<{
      sam_registered: string;
      has_federal_awards: string;
      has_sf_contracts: string;
      total: string;
    }>(
      sql`SELECT
            COUNT(sam_uei) AS sam_registered,
            COUNT(CASE WHEN federal_awards_total > 0 THEN 1 END) AS has_federal_awards,
            COUNT(CASE WHEN govt_contracts_count > 0 THEN 1 END) AS has_sf_contracts,
            COUNT(*) AS total
          FROM subcontractors`
    );

    return c.json({
      data: {
        samStatus: samRows.map((r) => ({
          status: r.status ?? "Unknown",
          count: Number(r.count),
        })),
        awardRanges: awardsRows.rows.map((r) => ({
          range: r.range,
          count: Number(r.count),
          total: Number(r.total),
        })),
        coverage: {
          samRegistered: Number(enrichmentCounts.rows[0]?.sam_registered ?? 0),
          hasFederalAwards: Number(
            enrichmentCounts.rows[0]?.has_federal_awards ?? 0
          ),
          hasSfContracts: Number(
            enrichmentCounts.rows[0]?.has_sf_contracts ?? 0
          ),
          total: Number(enrichmentCounts.rows[0]?.total ?? 0),
        },
      },
    });
  })
  .get("/trades-by-city", async (c) => {
    const city = c.req.query("city");
    const trade = c.req.query("trade");

    if (city) {
      const rows = await db.execute<{ trade: string; count: string }>(
        sql`SELECT t AS trade, COUNT(*) AS count
            FROM subcontractors, jsonb_array_elements_text(trades) AS t
            WHERE city = ${city}
            GROUP BY t
            ORDER BY count DESC
            LIMIT 10`
      );
      return c.json({
        data: rows.rows.map((r) => ({ name: r.trade, count: Number(r.count) })),
      });
    }

    if (trade) {
      const rows = await db.execute<{ city: string; count: string }>(
        sql`SELECT city, COUNT(*) AS count
            FROM subcontractors, jsonb_array_elements_text(trades) AS t
            WHERE t = ${trade}
            GROUP BY city
            ORDER BY count DESC
            LIMIT 10`
      );
      return c.json({
        data: rows.rows.map((r) => ({ name: r.city, count: Number(r.count) })),
      });
    }

    return c.json({ data: [] });
  });

export default app;
