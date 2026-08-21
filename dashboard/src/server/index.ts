import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import { auth } from "./lib/auth";
import { requireAuth } from "./middleware/auth";
import subcontractorRoutes from "./routes/subcontractors";
import statsRoutes from "./routes/stats";
import filtersRoutes from "./routes/filters";

const app = new Hono();

app.use(logger());
app.use(
  "/api/*",
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use("/api/*", requireAuth);
app.route("/api/subcontractors", subcontractorRoutes);
app.route("/api/stats", statsRoutes);
app.route("/api/filters", filtersRoutes);

app.use("/*", serveStatic({ root: "./dist/client" }));
app.get("/*", serveStatic({ path: "./dist/client/index.html" }));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      { error: { message: err.message, code: err.status } },
      err.status
    );
  }
  console.error("Unhandled error:", err);
  return c.json(
    { error: { message: "Internal server error", code: 500 } },
    500
  );
});

app.notFound((c) => {
  return c.json({ error: { message: "Not found", code: 404 } }, 404);
});

const port = Number(process.env.PORT) || 3000;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
