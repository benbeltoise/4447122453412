// import db instance
import { db } from "@/db/client";
// import these tables from the db
import {
  applications,
  applicationStatusLogs,
  categories,
  targets,
  users,
} from "@/db/schema";
// import seed function to initialise the db
import { seedDatabaseIfEmpty } from "@/db/seed";
// import where contition helper
import { eq } from "drizzle-orm";
// import navigation stack
import { Stack } from "expo-router";
// import react hooks
import { createContext, useEffect, useState } from "react";

// global context to share data across the app
export const ApplicationContext = createContext<any>(null);

export default function RootLayout() {
  // current logged-in user
  const [currentUser, setCurrentUser] = useState<any>(null);
  // store applics for user
  const [applicationsState, setApplications] = useState<any[]>([]);
  // store status history logs
  const [statusLogsState, setStatusLogs] = useState<any[]>([]);
  // store categories
  const [categoriesState, setCategories] = useState<any[]>([]);
  // store targets
  const [targetsState, setTargets] = useState<any[]>([]);
  // used to check is db and seed are ready
  const [isReady, setIsReady] = useState(false);

  // load all user-related data from db
  async function refreshUserData(userId: number) {
    // get user's applics
    const apps = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));

    // get user's categories
    const cats = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));

      // get users targets
    const tars = await db
      .select()
      .from(targets)
      .where(eq(targets.userId, userId));

      // get all status logs
    const logs = await db.select().from(applicationStatusLogs);

    setApplications(apps);
    setCategories(cats);
    setTargets(tars);
    setStatusLogs(logs);
  }

  // logout user and clear all stored data
  function logout() {
    setCurrentUser(null);
    setApplications([]);
    setStatusLogs([]);
    setCategories([]);
    setTargets([]);
  }

  // delete current user profile from db
  async function deleteProfile() {
    if (!currentUser) return;

    // delete user from db
    await db.delete(users).where(eq(users.id, currentUser.id));

    // clear app state
    logout();
  }

  // run once when app starts
  useEffect(() => {
    async function setup() {
      // seed db if it is empty
      await seedDatabaseIfEmpty();

      // mark app as ready
      setIsReady(true);
    }

    setup();
  }, []);

  return (
    // provide global data and functions to all screens
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
        <Stack.Screen name="application/[id]" />
        <Stack.Screen name="edit/[id]" />
      </Stack>
    </ApplicationContext.Provider>
  );
}