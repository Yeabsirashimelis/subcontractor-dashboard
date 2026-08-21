import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { subcontractors } from "../db/schema";
import { eq, ilike, sql, and, asc, desc, count } from "drizzle-orm";

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  trade: z.string().optional(),
  city: z.string().optional(),
  companyType: z.string().optional(),
  sortBy: z
    .enum(["name", "city", "companyType", "createdAt"])
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

const sortColumns = {
  name: subcontractors.name,
  city: subcontractors.city,
  companyType: subcontractors.companyType,
  createdAt: subcontractors.createdAt,
} as const;

function buildWhereConditions(query: z.infer<typeof listSchema>) {
  const conditions = [];

  if (query.search) {
    const term = `%${query.search}%`;
    conditions.push(
      sql`(${ilike(subcontractors.name, term)} OR ${ilike(subcontractors.city, term)} OR ${subcontractors.trades}::text ILIKE ${term})`
    );
  }

  if (query.trade) {
    conditions.push(
      sql`${subcontractors.trades}::jsonb @> ${JSON.stringify([query.trade])}::jsonb`
    );
  }

  if (query.city) {
    conditions.push(eq(subcontractors.city, query.city));
  }

  if (query.companyType) {
    conditions.push(eq(subcontractors.companyType, query.companyType));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

const app = new Hono()
  .get("/", zValidator("query", listSchema), async (c) => {
    const query = c.req.valid("query");
    const where = buildWhereConditions(query);
    const offset = (query.page - 1) * query.limit;
    const sortCol = sortColumns[query.sortBy];
    const sortFn = query.sortOrder === "desc" ? desc : asc;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(subcontractors)
        .where(where)
        .orderBy(sortFn(sortCol))
        .limit(query.limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(subcontractors)
        .where(where),
    ]);

    return c.json({
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      return c.json({ error: { message: "Invalid ID", code: 400 } }, 400);
    }

    const [row] = await db
      .select()
      .from(subcontractors)
      .where(eq(subcontractors.id, id))
      .limit(1);

    if (!row) {
      return c.json(
        { error: { message: "Subcontractor not found", code: 404 } },
        404
      );
    }

    return c.json({ data: row });
  });

export default app;
