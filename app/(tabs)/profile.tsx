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
import { Button, Text, TextInput, View } from "react-native";


export default function ProfileScreen() {
  const router = useRouter(); // nav
  const context = useContext(ApplicationContext); // global app state

  // input state for weekly application targets
  const [applicationsTarget, setApplicationsTarget] = useState("");
  // input state for weekly effort targets
  const [effortTarget, setEffortTarget] = useState("");

  // store exisiting target rows from db/context
  const [currentApplicationsTarget, setCurrentApplicationsTarget] = useState<any>(null);
  const [currentEffortTarget, setCurrentEffortTarget] = useState<any>(null);

  // run when screen loads or context changes
  useEffect(() => {
    if (!context) return;
    if (!context.isReady) return;

    // redirect user if not logged in
    if (!context.currentUser) {
      router.replace("/login" as any);
      return;
    }

    // get exisiting weekly targets
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

    // if targets exist, load them into state
    if (existingApplicationsTarget) {
      setCurrentApplicationsTarget(existingApplicationsTarget);
      setApplicationsTarget(String(existingApplicationsTarget.targetCount));
    }

    if (existingEffortTarget) {
      setCurrentEffortTarget(existingEffortTarget);
      setEffortTarget(String(existingEffortTarget.targetCount));
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

  // save both ragets to db
  async function handleSaveTargets() {
    // save or update applications target if the input has a value
    if (applicationsTarget) {
      if (currentApplicationsTarget) {
        // update exisitng target
        await db
          .update(targets)
          .set({
            periodType: "weekly",
            metricType: "applications",
            targetCount: Number(applicationsTarget),
          })
          .where(eq(targets.id, currentApplicationsTarget.id));
      } else {
        // insert new target
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

    // same as above but for effort target
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

    // reload latest user data from DB into context
    await context.refreshUserData(context.currentUser.id);
  }

  // delete logg-in user's profile
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