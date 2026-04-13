// import global app context
import { ApplicationContext } from "@/app/_layout";
// import db
import { db } from "@/db/client";
// import targets table from db
import { targets } from "@/db/schema";
// import where condition for helpwith db queries
import { eq } from "drizzle-orm";
// import navigation
import { useRouter } from "expo-router";
// import react hooks
import { useContext, useEffect, useState } from "react";
// react native ui components
import { Button, ScrollView, Text, TextInput, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter(); // nav
  const context = useContext(ApplicationContext); // global app state

  // weekly input states
  const [weeklyApplicationsTarget, setWeeklyApplicationsTarget] = useState("");
  const [weeklyEffortTarget, setWeeklyEffortTarget] = useState("");

  // monthly input states
  const [monthlyApplicationsTarget, setMonthlyApplicationsTarget] = useState("");
  const [monthlyEffortTarget, setMonthlyEffortTarget] = useState("");

  // current saved target rows
  const [currentWeeklyApplicationsTarget, setCurrentWeeklyApplicationsTarget] =
    useState<any>(null);
  const [currentWeeklyEffortTarget, setCurrentWeeklyEffortTarget] =
    useState<any>(null);
  const [currentMonthlyApplicationsTarget, setCurrentMonthlyApplicationsTarget] =
    useState<any>(null);
  const [currentMonthlyEffortTarget, setCurrentMonthlyEffortTarget] =
    useState<any>(null);

  // run when screen loads or context changes
  useEffect(() => {
    if (!context) return;
    if (!context.isReady) return;

    // redirect user if not logged in
    if (!context.currentUser) {
      router.replace("/login" as any);
      return;
    }

    // get existing weekly application target
    const existingWeeklyApplicationsTarget = context.targets.find(
      (item: any) =>
        item.userId === context.currentUser.id &&
        item.periodType === "weekly" &&
        item.metricType === "applications"
    );

    // get existing weekly effort target
    const existingWeeklyEffortTarget = context.targets.find(
      (item: any) =>
        item.userId === context.currentUser.id &&
        item.periodType === "weekly" &&
        item.metricType === "effortMinutes"
    );

    // get existing monthly application target
    const existingMonthlyApplicationsTarget = context.targets.find(
      (item: any) =>
        item.userId === context.currentUser.id &&
        item.periodType === "monthly" &&
        item.metricType === "applications"
    );

    // get existing monthly effort target
    const existingMonthlyEffortTarget = context.targets.find(
      (item: any) =>
        item.userId === context.currentUser.id &&
        item.periodType === "monthly" &&
        item.metricType === "effortMinutes"
    );

    // load into state if found
    if (existingWeeklyApplicationsTarget) {
      setCurrentWeeklyApplicationsTarget(existingWeeklyApplicationsTarget);
      setWeeklyApplicationsTarget(
        String(existingWeeklyApplicationsTarget.targetCount)
      );
    }

    if (existingWeeklyEffortTarget) {
      setCurrentWeeklyEffortTarget(existingWeeklyEffortTarget);
      setWeeklyEffortTarget(String(existingWeeklyEffortTarget.targetCount));
    }

    if (existingMonthlyApplicationsTarget) {
      setCurrentMonthlyApplicationsTarget(existingMonthlyApplicationsTarget);
      setMonthlyApplicationsTarget(
        String(existingMonthlyApplicationsTarget.targetCount)
      );
    }

    if (existingMonthlyEffortTarget) {
      setCurrentMonthlyEffortTarget(existingMonthlyEffortTarget);
      setMonthlyEffortTarget(String(existingMonthlyEffortTarget.targetCount));
    }
  }, [context, router]);

  // loading state
  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // helper to save one target
  async function saveSingleTarget(
    periodType: string,
    metricType: string,
    value: string,
    currentTarget: any
  ) {
    if (!value) return;

    if (currentTarget) {
      await db
        .update(targets)
        .set({
          periodType: periodType,
          metricType: metricType,
          targetCount: Number(value),
        })
        .where(eq(targets.id, currentTarget.id));
    } else {
      await db.insert(targets).values({
        userId: context.currentUser.id,
        periodType: periodType,
        metricType: metricType,
        targetCount: Number(value),
        categoryId: null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // save all targets
  async function handleSaveTargets() {
    await saveSingleTarget(
      "weekly",
      "applications",
      weeklyApplicationsTarget,
      currentWeeklyApplicationsTarget
    );

    await saveSingleTarget(
      "weekly",
      "effortMinutes",
      weeklyEffortTarget,
      currentWeeklyEffortTarget
    );

    await saveSingleTarget(
      "monthly",
      "applications",
      monthlyApplicationsTarget,
      currentMonthlyApplicationsTarget
    );

    await saveSingleTarget(
      "monthly",
      "effortMinutes",
      monthlyEffortTarget,
      currentMonthlyEffortTarget
    );

    // reload latest user data from DB into context
    await context.refreshUserData(context.currentUser.id);
  }

  // delete logged-in user's profile
  async function handleDeleteProfile() {
    await context.deleteProfile();
    router.replace("/login" as any);
  }

  // log user out
  function handleLogout() {
    context.logout();
    router.replace("/login" as any);
  }

  // html/css to render
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Profile</Text>
      <Text>Name: {context.currentUser.name}</Text>
      <Text style={{ marginBottom: 20 }}>
        Email: {context.currentUser.email}
      </Text>

      <Text style={{ fontSize: 20, marginBottom: 10 }}>Weekly Targets</Text>

      <Text>Weekly Applications Target</Text>
      <TextInput
        value={weeklyApplicationsTarget}
        onChangeText={setWeeklyApplicationsTarget}
        keyboardType="numeric"
        placeholder="Enter weekly applications target"
        style={{ borderWidth: 1, padding: 10, marginTop: 10, marginBottom: 10 }}
      />

      <Text style={{ marginBottom: 20 }}>
        Current Weekly Applications Target:{" "}
        {currentWeeklyApplicationsTarget
          ? currentWeeklyApplicationsTarget.targetCount
          : "Not set"}
      </Text>

      <Text>Weekly Effort Target (minutes)</Text>
      <TextInput
        value={weeklyEffortTarget}
        onChangeText={setWeeklyEffortTarget}
        keyboardType="numeric"
        placeholder="Enter weekly effort target"
        style={{ borderWidth: 1, padding: 10, marginTop: 10, marginBottom: 10 }}
      />

      <Text style={{ marginBottom: 20 }}>
        Current Weekly Effort Target:{" "}
        {currentWeeklyEffortTarget
          ? currentWeeklyEffortTarget.targetCount
          : "Not set"}
      </Text>

      <Text style={{ fontSize: 20, marginBottom: 10 }}>Monthly Targets</Text>

      <Text>Monthly Applications Target</Text>
      <TextInput
        value={monthlyApplicationsTarget}
        onChangeText={setMonthlyApplicationsTarget}
        keyboardType="numeric"
        placeholder="Enter monthly applications target"
        style={{ borderWidth: 1, padding: 10, marginTop: 10, marginBottom: 10 }}
      />

      <Text style={{ marginBottom: 20 }}>
        Current Monthly Applications Target:{" "}
        {currentMonthlyApplicationsTarget
          ? currentMonthlyApplicationsTarget.targetCount
          : "Not set"}
      </Text>

      <Text>Monthly Effort Target (minutes)</Text>
      <TextInput
        value={monthlyEffortTarget}
        onChangeText={setMonthlyEffortTarget}
        keyboardType="numeric"
        placeholder="Enter monthly effort target"
        style={{ borderWidth: 1, padding: 10, marginTop: 10, marginBottom: 10 }}
      />

      <Text style={{ marginBottom: 20 }}>
        Current Monthly Effort Target:{" "}
        {currentMonthlyEffortTarget
          ? currentMonthlyEffortTarget.targetCount
          : "Not set"}
      </Text>

      <Button title="Save Targets" onPress={handleSaveTargets} />
      <View style={{ height: 10 }} />

      <Button title="Logout" onPress={handleLogout} />
      <View style={{ height: 10 }} />
      <Button title="Delete Profile" onPress={handleDeleteProfile} />
    </ScrollView>
  );
}