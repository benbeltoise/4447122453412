import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  createdAt: text("created_at").notNull(),
});

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  dateApplied: text("date_applied").notNull(),
  effortMinutes: integer("effort_minutes").notNull(),
  salaryExpectation: integer("salary_expectation").notNull(),
  categoryId: integer("category_id").notNull(),
  currentStatus: text("current_status").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const applicationStatusLogs = sqliteTable("application_status_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: integer("application_id").notNull(),
  status: text("status").notNull(),
  changedAt: text("changed_at").notNull(),
});

export const targets = sqliteTable("targets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  periodType: text("period_type").notNull(),
  metricType: text("metric_type").notNull(),
  targetCount: integer("target_count").notNull(),
  categoryId: integer("category_id"),
  createdAt: text("created_at").notNull(),
});