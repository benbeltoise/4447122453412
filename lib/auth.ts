import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    return { user: null, error: "Fill in all fields" };
  }

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, trimmedEmail));

  if (existingUsers.length > 0) {
    return { user: null, error: "Email already exists" };
  }

  const insertedUsers = await db
    .insert(users)
    .values({
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: trimmedPassword,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return {
    user: insertedUsers[0] || null,
    error: null,
  };
}

export async function loginUser(email: string, password: string) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { user: null, error: "Enter email and password" };
  }

  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, trimmedEmail));

  const user = foundUsers[0];

  if (!user) {
    return { user: null, error: "User not found" };
  }

  if (user.passwordHash !== trimmedPassword) {
    return { user: null, error: "Wrong password" };
  }

  return { user, error: null };
}