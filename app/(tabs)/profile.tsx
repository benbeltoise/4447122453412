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

// convert minutes to hours and minutes
function minutesToHoursMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}

// convert hours and minutes to total minutes
function hoursMinutesToMinutes(hours: string, minutes: string) {
  return Number(hours || 0) * 60 + Number(minutes || 0);
}

export default function ProfileScreen() {
  const router = useRouter(); // nav
  const context = useContext(ApplicationContext); // global app state

  // weekly input states
  const [weeklyApplicationsTarget, setWeeklyApplicationsTarget] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [weeklyMinutes, setWeeklyMinutes] = useState("");

  // monthly input states
  const [monthlyApplicationsTarget, setMonthlyApplicationsTarget] = useState("");
  const [monthlyHours, setMonthlyHours] = useState("");
  const [monthlyMinutes, setMonthlyMinutes] = useState("");

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
      const { hours, minutes } = minutesToHoursMinutes(
        existingWeeklyEffortTarget.targetCount
      );
      setWeeklyHours(String(hours));
      setWeeklyMinutes(String(minutes));
    }

    if (existingMonthlyApplicationsTarget) {
      setCurrentMonthlyApplicationsTarget(existingMonthlyApplicationsTarget);
      setMonthlyApplicationsTarget(
        String(existingMonthlyApplicationsTarget.targetCount)
      );
    }

    if (existingMonthlyEffortTarget) {
      setCurrentMonthlyEffortTarget(existingMonthlyEffortTarget);
      const { hours, minutes } = minutesToHoursMinutes(
        existingMonthlyEffortTarget.targetCount
      );
      setMonthlyHours(String(hours));
      setMonthlyMinutes(String(minutes));
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
      String(hoursMinutesToMinutes(weeklyHours, weeklyMinutes)),
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
      String(hoursMinutesToMinutes(monthlyHours, monthlyMinutes)),
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
        accessibilityLabel="Weekly Applications Target"
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

      <Text>Weekly Effort Target</Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <TextInput
          accessibilityLabel="Weekly effort hours"
          value={weeklyHours}
          onChangeText={setWeeklyHours}
          keyboardType="numeric"
          placeholder="Hours"
          style={{ flex: 1, borderWidth: 1, padding: 10 }}
        />

        <TextInput
          accessibilityLabel="Weekly effort minutes"
          value={weeklyMinutes}
          onChangeText={setWeeklyMinutes}
          keyboardType="numeric"
          placeholder="Minutes"
          style={{ flex: 1, borderWidth: 1, padding: 10 }}
        />
      </View>

      <Text style={{ marginBottom: 20 }}>
        {currentWeeklyEffortTarget
          ? (() => {
              const { hours, minutes } = minutesToHoursMinutes(
                currentWeeklyEffortTarget.targetCount
              );
              return `Current Weekly Effort Target: ${hours}h ${minutes}m`;
            })()
          : "Not set"}
      </Text>

      <Text style={{ fontSize: 20, marginBottom: 10 }}>Monthly Targets</Text>

      <Text>Monthly Applications Target</Text>
      <TextInput
        accessibilityLabel="Monthly Applications Target"
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

      <Text>Monthly Effort Target</Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <TextInput
          accessibilityLabel="Monthly effort hours"
          value={monthlyHours}
          onChangeText={setMonthlyHours}
          keyboardType="numeric"
          placeholder="Hours"
          style={{ flex: 1, borderWidth: 1, padding: 10 }}
        />

        <TextInput
          accessibilityLabel="Monthly effort minutes"
          value={monthlyMinutes}
          onChangeText={setMonthlyMinutes}
          keyboardType="numeric"
          placeholder="Minutes"
          style={{ flex: 1, borderWidth: 1, padding: 10 }}
        />
      </View>

      <Text style={{ marginBottom: 20 }}>
        {currentMonthlyEffortTarget
          ? (() => {
              const { hours, minutes } = minutesToHoursMinutes(
                currentMonthlyEffortTarget.targetCount
              );
              return `Current Monthly Effort Target: ${hours}h ${minutes}m`;
            })()
          : "Not set"}
      </Text>

      <Button
        accessibilityLabel="Save targets"
        title="Save Targets"
        onPress={handleSaveTargets}
      />
      <View style={{ height: 10 }} />

      <Button
        accessibilityLabel="Log out"
        title="Logout"
        onPress={handleLogout}
      />
      <View style={{ height: 10 }} />
      <Button
        accessibilityLabel="Delete profile"
        title="Delete Profile"
        onPress={handleDeleteProfile}
      />
    </ScrollView>
  );
}