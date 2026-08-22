import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
});
