import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  boolean,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const subcontractors = pgTable(
  "subcontractors",
  {
    id: serial("id").primaryKey(),
    procoreSlug: varchar("procore_slug", { length: 500 }).unique(),
    name: varchar("name", { length: 500 }).notNull(),

    address: text("address"),
    city: varchar("city", { length: 255 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 10 }),

    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 500 }),

    companyType: varchar("company_type", { length: 255 }),
    description: text("description"),
    employeeCount: varchar("employee_count", { length: 100 }),
    avgContractSize: varchar("avg_contract_size", { length: 100 }),
    logoUrl: varchar("logo_url", { length: 500 }),

    trades: jsonb("trades").$type<string[]>().default([]),
    marketSectors: jsonb("market_sectors").$type<string[]>().default([]),
    businessClassifications: jsonb("business_classifications")
      .$type<string[]>()
      .default([]),
    serviceAreas: jsonb("service_areas").$type<string[]>().default([]),

    totalProjects: integer("total_projects"),
    activeProjects: integer("active_projects"),
    procoreUsers: integer("procore_users"),
    joinedAt: timestamp("joined_at"),
    claimed: boolean("claimed"),

    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),

    samUei: varchar("sam_uei", { length: 20 }),
    samStatus: varchar("sam_status", { length: 50 }),
    federalAwardsTotal: integer("federal_awards_total"),
    usaspendingRecipientId: varchar("usaspending_recipient_id", { length: 100 }),
    govtContractsCount: integer("govt_contracts_count"),

    sourceUrl: varchar("source_url", { length: 500 }),
    scrapedAt: timestamp("scraped_at").defaultNow(),
    enrichedAt: timestamp("enriched_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_subcontractors_city").on(table.city),
    index("idx_subcontractors_company_type").on(table.companyType),
    index("idx_subcontractors_name").on(table.name),
  ]
);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
