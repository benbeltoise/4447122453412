import { ApplicationContext } from "@/app/_layout";
import { db } from "@/db/client";
import { targets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const context = useContext(ApplicationContext);

  const [applicationsTarget, setApplicationsTarget] = useState("");
  const [effortTarget, setEffortTarget] = useState("");

  const [currentApplicationsTarget, setCurrentApplicationsTarget] = useState<any>(null);
  const [currentEffortTarget, setCurrentEffortTarget] = useState<any>(null);

  useEffect(() => {
    if (!context) return;
    if (!context.isReady) return;

    if (!context.currentUser) {
      router.replace("/login" as any);
      return;
    }

    const existingApplicationsTarget = context.targets.find(
      (item: any) =>
        item.userId === context.currentUser.id &&
        item.periodType === "weekly" &&
        item.metricType === "applications"
    );

    const existingEffortTarget = context.targets.find(
      (item: any) =>
        item.userId === context.currentUser.id &&
        item.periodType === "weekly" &&
        item.metricType === "effortMinutes"
    );

    if (existingApplicationsTarget) {
      setCurrentApplicationsTarget(existingApplicationsTarget);
      setApplicationsTarget(String(existingApplicationsTarget.targetCount));
    }

    if (existingEffortTarget) {
      setCurrentEffortTarget(existingEffortTarget);
      setEffortTarget(String(existingEffortTarget.targetCount));
    }
  }, [context, router]);

  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  async function handleSaveTargets() {
    if (applicationsTarget) {
      if (currentApplicationsTarget) {
        await db
          .update(targets)
          .set({
            periodType: "weekly",
            metricType: "applications",
            targetCount: Number(applicationsTarget),
          })
          .where(eq(targets.id, currentApplicationsTarget.id));
      } else {
        await db.insert(targets).values({
          userId: context.currentUser.id,
          periodType: "weekly",
          metricType: "applications",
          targetCount: Number(applicationsTarget),
          categoryId: null,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (effortTarget) {
      if (currentEffortTarget) {
        await db
          .update(targets)
          .set({
            periodType: "weekly",
            metricType: "effortMinutes",
            targetCount: Number(effortTarget),
          })
          .where(eq(targets.id, currentEffortTarget.id));
      } else {
        await db.insert(targets).values({
          userId: context.currentUser.id,
          periodType: "weekly",
          metricType: "effortMinutes",
          targetCount: Number(effortTarget),
          categoryId: null,
          createdAt: new Date().toISOString(),
        });
      }
    }

    await context.refreshUserData(context.currentUser.id);
  }

  async function handleDeleteProfile() {
    await context.deleteProfile();
    router.replace("/login" as any);
  }

  function handleLogout() {
    context.logout();
    router.replace("/login" as any);
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Profile</Text>
      <Text>Name: {context.currentUser.name}</Text>
      <Text style={{ marginBottom: 20 }}>
        Email: {context.currentUser.email}
      </Text>

      <Text>Weekly Applications Target</Text>
      <TextInput
        value={applicationsTarget}
        onChangeText={setApplicationsTarget}
        keyboardType="numeric"
        placeholder="Enter applications target"
        style={{ borderWidth: 1, padding: 10, marginTop: 10, marginBottom: 10 }}
      />

      <Text style={{ marginBottom: 20 }}>
        Current Applications Target:{" "}
        {currentApplicationsTarget
          ? currentApplicationsTarget.targetCount
          : "Not set"}
      </Text>

      <Text>Weekly Effort Target (minutes)</Text>
      <TextInput
        value={effortTarget}
        onChangeText={setEffortTarget}
        keyboardType="numeric"
        placeholder="Enter effort target"
        style={{ borderWidth: 1, padding: 10, marginTop: 10, marginBottom: 10 }}
      />

      <Text style={{ marginBottom: 20 }}>
        Current Effort Target:{" "}
        {currentEffortTarget ? currentEffortTarget.targetCount : "Not set"}
      </Text>

      <Button title="Save Targets" onPress={handleSaveTargets} />
      <View style={{ height: 10 }} />

      <Button title="Logout" onPress={handleLogout} />
      <View style={{ height: 10 }} />
      <Button title="Delete Profile" onPress={handleDeleteProfile} />
    </View>
  );
}