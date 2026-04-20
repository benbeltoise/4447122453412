
// updated on 20/04/26

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

  const demoPassword = "demouser";

  const insertedUsers = await db
    .insert(users)
    .values({
      name: "Demo User",
      email: "demo@student.com",
      passwordHash: demoPassword,
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
      {
        userId: user.id,
        name: "Frontend",
        color: "purple",
        icon: "desktop",
        createdAt: now,
      },
      {
        userId: user.id,
        name: "Backend",
        color: "orange",
        icon: "server",
        createdAt: now,
      },
    ])
    .returning();

  const graduateCategory = insertedCategories[0];
  const internshipCategory = insertedCategories[1];
  const frontendCategory = insertedCategories[2];
  const backendCategory = insertedCategories[3];

  const insertedApplications = await db
    .insert(applications)
    .values([
      {
        userId: user.id,
        company: "Google",
        role: "Associate Product Engineer",
        dateApplied: "2026-01-28",
        effortMinutes: 140,
        salaryExpectation: 52000,
        categoryId: frontendCategory.id,
        currentStatus: "rejected",
        notes: "Older application outside monthly range",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "Amazon",
        role: "Software Development Engineer",
        dateApplied: "2026-02-12",
        effortMinutes: 130,
        salaryExpectation: 50000,
        categoryId: backendCategory.id,
        currentStatus: "rejected",
        notes: "Older application outside monthly range",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "Example Company",
        role: "Software Developer",
        dateApplied: "2026-03-25",
        effortMinutes: 50,
        salaryExpectation: 40000,
        categoryId: graduateCategory.id,
        currentStatus: "applied",
        notes: "Good example graduate application",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "Jacobs",
        role: "Cost Engineer",
        dateApplied: "2026-04-02",
        effortMinutes: 35,
        salaryExpectation: 28000,
        categoryId: internshipCategory.id,
        currentStatus: "interviewing",
        notes: "Internship process moved forward",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "Microsoft",
        role: "Junior Frontend Developer",
        dateApplied: "2026-04-05",
        effortMinutes: 75,
        salaryExpectation: 38000,
        categoryId: frontendCategory.id,
        currentStatus: "rejected",
        notes: "Rejected after CV review",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "EY",
        role: "Graduate IT Consultant",
        dateApplied: "2026-04-11",
        effortMinutes: 90,
        salaryExpectation: 42000,
        categoryId: backendCategory.id,
        currentStatus: "interviewing",
        notes: "Technical test scheduled",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "Gas Networks Ireland",
        role: "Quality Assurance",
        dateApplied: "2026-04-13",
        effortMinutes: 60,
        salaryExpectation: 39000,
        categoryId: frontendCategory.id,
        currentStatus: "applied",
        notes: "Tailored CV and cover letter",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "Lenovo",
        role: "Backend Developer",
        dateApplied: "2026-04-14",
        effortMinutes: 95,
        salaryExpectation: 43000,
        categoryId: backendCategory.id,
        currentStatus: "interviewing",
        notes: "Phone screen completed",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "Mercedes-Benz",
        role: "Graduate Software Engineer",
        dateApplied: "2026-04-16",
        effortMinutes: 40,
        salaryExpectation: 37000,
        categoryId: graduateCategory.id,
        currentStatus: "applied",
        notes: "Broad graduate role",
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: user.id,
        company: "Workday",
        role: "Software Development Intern",
        dateApplied: "2026-04-18",
        effortMinutes: 70,
        salaryExpectation: 30000,
        categoryId: internshipCategory.id,
        currentStatus: "applied",
        notes: "Good internship option",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning();

  await db.insert(applicationStatusLogs).values([
    {
      applicationId: insertedApplications[0].id,
      status: "applied",
      changedAt: "2026-01-28T13:00:00.000Z",
    },
    {
      applicationId: insertedApplications[0].id,
      status: "rejected",
      changedAt: "2026-02-05T10:00:00.000Z",
    },
    {
      applicationId: insertedApplications[1].id,
      status: "applied",
      changedAt: "2026-02-12T09:00:00.000Z",
    },
    {
      applicationId: insertedApplications[1].id,
      status: "rejected",
      changedAt: "2026-02-20T16:00:00.000Z",
    },
    {
      applicationId: insertedApplications[2].id,
      status: "applied",
      changedAt: "2026-03-25T09:00:00.000Z",
    },
    {
      applicationId: insertedApplications[3].id,
      status: "applied",
      changedAt: "2026-04-02T10:00:00.000Z",
    },
    {
      applicationId: insertedApplications[3].id,
      status: "interviewing",
      changedAt: "2026-04-07T15:00:00.000Z",
    },
    {
      applicationId: insertedApplications[4].id,
      status: "applied",
      changedAt: "2026-04-05T11:00:00.000Z",
    },
    {
      applicationId: insertedApplications[4].id,
      status: "rejected",
      changedAt: "2026-04-09T14:00:00.000Z",
    },
    {
      applicationId: insertedApplications[5].id,
      status: "applied",
      changedAt: "2026-04-11T09:30:00.000Z",
    },
    {
      applicationId: insertedApplications[5].id,
      status: "interviewing",
      changedAt: "2026-04-15T16:00:00.000Z",
    },
    {
      applicationId: insertedApplications[6].id,
      status: "applied",
      changedAt: "2026-04-13T12:00:00.000Z",
    },
    {
      applicationId: insertedApplications[7].id,
      status: "applied",
      changedAt: "2026-04-14T10:15:00.000Z",
    },
    {
      applicationId: insertedApplications[7].id,
      status: "interviewing",
      changedAt: "2026-04-18T09:45:00.000Z",
    },
    {
      applicationId: insertedApplications[8].id,
      status: "applied",
      changedAt: "2026-04-16T08:45:00.000Z",
    },
    {
      applicationId: insertedApplications[9].id,
      status: "applied",
      changedAt: "2026-04-18T12:15:00.000Z",
    },
  ]);

  await db.insert(targets).values([
    {
      userId: user.id,
      periodType: "weekly",
      metricType: "applications",
      targetCount: 5,
      categoryId: null,
      createdAt: now,
    },
    {
      userId: user.id,
      periodType: "weekly",
      metricType: "effortMinutes",
      targetCount: 300,
      categoryId: null,
      createdAt: now,
    },
    {
      userId: user.id,
      periodType: "monthly",
      metricType: "applications",
      targetCount: 8,
      categoryId: null,
      createdAt: now,
    },
    {
      userId: user.id,
      periodType: "monthly",
      metricType: "effortMinutes",
      targetCount: 500,
      categoryId: null,
      createdAt: now,
    },
  ]);
}