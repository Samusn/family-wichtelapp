import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sessionsRelations = relations(sessions, ({ many }) => ({
  participants: many(participants),
  draws: many(draws),
}));

export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => sessions.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  urlToken: varchar("url_token", { length: 32 }).unique().notNull(),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const participantsRelations = relations(
  participants,
  ({ one, many }) => ({
    session: one(sessions, {
      fields: [participants.sessionId],
      references: [sessions.id],
    }),
    categoryChoices: many(categoryChoices),
    givenDraws: many(draws, { relationName: "giver" }),
    receivedDraws: many(draws, { relationName: "receiver" }),
  }),
);

export const categoryChoices = pgTable(
  "category_choices",
  {
    participantId: uuid("participant_id")
      .references(() => participants.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: varchar("category_id", { length: 50 }).notNull(),
    sentiment: varchar("sentiment", { length: 10 })
      .$type<"like" | "dislike">()
      .notNull(),
    tags: text("tags").array().default(sql`'{}'::text[]`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.participantId, table.categoryId] })],
);

export const categoryChoicesRelations = relations(
  categoryChoices,
  ({ one }) => ({
    participant: one(participants, {
      fields: [categoryChoices.participantId],
      references: [participants.id],
    }),
  }),
);

export const draws = pgTable("draws", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => sessions.id, { onDelete: "cascade" })
    .notNull(),
  giverId: uuid("giver_id")
    .references(() => participants.id, { onDelete: "cascade" })
    .notNull(),
  receiverId: uuid("receiver_id")
    .references(() => participants.id, { onDelete: "cascade" })
    .notNull(),
  revealedAt: timestamp("revealed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: varchar("token", { length: 64 }).unique().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const loginAttempts = pgTable("login_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: varchar("identifier", { length: 64 }).unique().notNull(),
  attemptCount: integer("attempt_count").default(0).notNull(),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const drawsRelations = relations(draws, ({ one }) => ({
  session: one(sessions, {
    fields: [draws.sessionId],
    references: [sessions.id],
  }),
  giver: one(participants, {
    fields: [draws.giverId],
    references: [participants.id],
    relationName: "giver",
  }),
  receiver: one(participants, {
    fields: [draws.receiverId],
    references: [participants.id],
    relationName: "receiver",
  }),
}));
