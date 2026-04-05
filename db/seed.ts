import { db } from "./client";
import {
  applications,
  applicationStatusLogs,
  categories,
  targets,
  users,
} from "./schema";

export async function seedDatabaseIfEmpty() {
  const existingUsers = await db.select().from(users);

  if (existingUsers.length > 0) return;

  const now = new Date().toISOString();

  const insertedUsers = await db
    .insert(users)
    .values({
      name: "Demo User",
      email: "demo@student.com",
      passwordHash: "demo-password",
      createdAt: now,
    })
    .returning();

  const user = insertedUsers[0];

  const insertedCategories = await db
    .insert(categories)
    .values([
      {
        userId: user.id,
        name: "Graduate",
        color: "blue",
        icon: "briefcase",
        createdAt: now,
      },
      {
        userId: user.id,
        name: "Internship",
        color: "green",
        icon: "folder",
        createdAt: now,
      },
    ])
    .returning();

  const firstCategory = insertedCategories[0];
  const secondCategory = insertedCategories[1];

  const insertedApplications = await db
    .insert(applications)
    .values([
      {
        userId: user.id,
        company: "Example Company",
        role: "Software Developer",
        dateApplied: "2026-03-01",
        effortMinutes: 45,
        salaryExpectation: 40000,
        categoryId: firstCategory.id,
        currentStatus: "applied",
        notes: "First demo application",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "Tech Intern Ltd",
        role: "Software Intern",
        dateApplied: "2026-03-10",
        effortMinutes: 30,
        salaryExpectation: 28000,
        categoryId: secondCategory.id,
        currentStatus: "interviewing",
        notes: "Internship application",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning();

  await db.insert(applicationStatusLogs).values([
    {
      applicationId: insertedApplications[0].id,
      status: "applied",
      changedAt: "2026-03-01T09:00:00.000Z",
    },
    {
      applicationId: insertedApplications[1].id,
      status: "applied",
      changedAt: "2026-03-10T10:00:00.000Z",
    },
    {
      applicationId: insertedApplications[1].id,
      status: "interviewing",
      changedAt: "2026-03-15T15:00:00.000Z",
    },
  ]);

  await db.insert(targets).values([
    {
      userId: user.id,
      periodType: "weekly",
      targetCount: 5,
      categoryId: null,
      createdAt: now,
    },
    {
      userId: user.id,
      periodType: "monthly",
      targetCount: 20,
      categoryId: firstCategory.id,
      createdAt: now,
    },
  ]);
}