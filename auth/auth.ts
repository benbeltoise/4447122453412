// Import db
import { db } from "@/db/client";

// Import users table schema
import { users } from "@/db/schema";

// Import where condition for db qries
import { eq } from "drizzle-orm";

// Register a new user
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  // Clean inputs (remove spaces, normalise email)
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  // Basic validation
  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    return { user: null, error: "Fill in all fields" };
  }

  // Check if email already exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, trimmedEmail));

  if (existingUsers.length > 0) {
    return { user: null, error: "Email already exists" };
  }

  // Insert new user into database
  const insertedUsers = await db
    .insert(users)
    .values({
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: trimmedPassword,
      createdAt: new Date().toISOString(),
    })
    .returning();

  // Return the newly created user
  return {
    user: insertedUsers[0] || null,
    error: null,
  };
}

// Login an existing user
export async function loginUser(email: string, password: string) {
  // Clean inputs
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  // Basic validation
  if (!trimmedEmail || !trimmedPassword) {
    return { user: null, error: "Enter email and password" };
  }

  // Find user by email
  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, trimmedEmail));

  const user = foundUsers[0];

  // If user does not exist
  if (!user) {
    return { user: null, error: "User not found" };
  }

  // Check password match
  if (user.passwordHash !== trimmedPassword) {
    return { user: null, error: "Wrong password" };
  }

  // Successful login
  return { user, error: null };
}