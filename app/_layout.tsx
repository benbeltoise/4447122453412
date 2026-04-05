import { db } from "@/db/client";
import {
  applications,
  applicationStatusLogs,
  categories,
  targets,
  users,
} from "@/db/schema";
import { seedDatabaseIfEmpty } from "@/db/seed";
import { eq } from "drizzle-orm";
import { Stack } from "expo-router";
import { createContext, useEffect, useState } from "react";

export const ApplicationContext = createContext<any>(null);

export default function RootLayout() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [applicationsState, setApplications] = useState<any[]>([]);
  const [statusLogsState, setStatusLogs] = useState<any[]>([]);
  const [categoriesState, setCategories] = useState<any[]>([]);
  const [targetsState, setTargets] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  async function refreshUserData(userId: number) {
    const apps = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));

    const cats = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));

    const tars = await db
      .select()
      .from(targets)
      .where(eq(targets.userId, userId));

    const logs = await db.select().from(applicationStatusLogs);

    setApplications(apps);
    setCategories(cats);
    setTargets(tars);
    setStatusLogs(logs);
  }

  function logout() {
    setCurrentUser(null);
    setApplications([]);
    setStatusLogs([]);
    setCategories([]);
    setTargets([]);
  }

  async function deleteProfile() {
    if (!currentUser) return;

    await db.delete(users).where(eq(users.id, currentUser.id));
    logout();
  }

  useEffect(() => {
    async function setup() {
      await seedDatabaseIfEmpty();
      setIsReady(true);
    }

    setup();
  }, []);

  return (
    <ApplicationContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        applications: applicationsState,
        statusLogs: statusLogsState,
        categories: categoriesState,
        targets: targetsState,
        refreshUserData,
        logout,
        deleteProfile,
        isReady,
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="add" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ApplicationContext.Provider>
  );
}