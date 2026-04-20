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
  // get full hours from total minutes
  const hours = Math.floor(totalMinutes / 60);
  // get remaining minutes after hours
  const minutes = totalMinutes % 60;
  // return both values as an object
  return { hours, minutes };
}

// convert hours and minutes to total minutes
function hoursMinutesToMinutes(hours: string, minutes: string) {
  // convert input strings into one total minutes value
  return Number(hours || 0) * 60 + Number(minutes || 0);
}

export default function ProfileScreen() {
  // get router for screen navigation
  const router = useRouter(); // nav
  // get access to global app state
  const context = useContext(ApplicationContext); // global app state

  // weekly input states
  // store weekly applications target input
  const [weeklyApplicationsTarget, setWeeklyApplicationsTarget] = useState("");
  // store weekly effort hours input
  const [weeklyHours, setWeeklyHours] = useState("");
  // store weekly effort minutes input
  const [weeklyMinutes, setWeeklyMinutes] = useState("");

  // monthly input states
  // store monthly applications target input
  const [monthlyApplicationsTarget, setMonthlyApplicationsTarget] = useState("");
  // store monthly effort hours input
  const [monthlyHours, setMonthlyHours] = useState("");
  // store monthly effort minutes input
  const [monthlyMinutes, setMonthlyMinutes] = useState("");

  // current saved target rows
  // store saved weekly applications target row
  const [currentWeeklyApplicationsTarget, setCurrentWeeklyApplicationsTarget] =
    useState<any>(null);
  // store saved weekly effort target row
  const [currentWeeklyEffortTarget, setCurrentWeeklyEffortTarget] =
    useState<any>(null);
  // store saved monthly applications target row
  const [currentMonthlyApplicationsTarget, setCurrentMonthlyApplicationsTarget] =
    useState<any>(null);
  // store saved monthly effort target row
  const [currentMonthlyEffortTarget, setCurrentMonthlyEffortTarget] =
    useState<any>(null);

  // app colours
  // page background colour
  const backgroundColor = "#F7F9FC";
  // card background colour
  const cardColor = "#FFFFFF";
  // main brand colour
  const primaryColor = "#2F6FED";
  // main text colour
  const textColor = "#1F2937";
  // muted text colour
  const mutedTextColor = "#6B7280";
  // border colour for cards and inputs
  const borderColor = "#D1D5DB";

  // run when screen loads or context changes
  useEffect(() => {
    // stop if context is not ready yet
    if (!context) return;
    // stop if app data is still loading
    if (!context.isReady) return;

    // redirect user if not logged in
    if (!context.currentUser) {
      router.replace("/login" as any);
      return;
    }

    // get existing weekly application target
    const existingWeeklyApplicationsTarget = context.targets.find(
      (item: any) =>
        // target must belong to current user
        item.userId === context.currentUser.id &&
        // target must be weekly
        item.periodType === "weekly" &&
        // target must be for applications count
        item.metricType === "applications"
    );

    // get existing weekly effort target
    const existingWeeklyEffortTarget = context.targets.find(
      (item: any) =>
        // target must belong to current user
        item.userId === context.currentUser.id &&
        // target must be weekly
        item.periodType === "weekly" &&
        // target must be for effort minutes
        item.metricType === "effortMinutes"
    );

    // get existing monthly application target
    const existingMonthlyApplicationsTarget = context.targets.find(
      (item: any) =>
        // target must belong to current user
        item.userId === context.currentUser.id &&
        // target must be monthly
        item.periodType === "monthly" &&
        // target must be for applications count
        item.metricType === "applications"
    );

    // get existing monthly effort target
    const existingMonthlyEffortTarget = context.targets.find(
      (item: any) =>
        // target must belong to current user
        item.userId === context.currentUser.id &&
        // target must be monthly
        item.periodType === "monthly" &&
        // target must be for effort minutes
        item.metricType === "effortMinutes"
    );

    // load into state if found
    if (existingWeeklyApplicationsTarget) {
      // store current weekly applications target row
      setCurrentWeeklyApplicationsTarget(existingWeeklyApplicationsTarget);
      // prefill weekly applications input
      setWeeklyApplicationsTarget(
        String(existingWeeklyApplicationsTarget.targetCount)
      );
    }

    if (existingWeeklyEffortTarget) {
      // store current weekly effort target row
      setCurrentWeeklyEffortTarget(existingWeeklyEffortTarget);
      // convert stored minutes into hours and minutes inputs
      const { hours, minutes } = minutesToHoursMinutes(
        existingWeeklyEffortTarget.targetCount
      );
      // prefill weekly hours input
      setWeeklyHours(String(hours));
      // prefill weekly minutes input
      setWeeklyMinutes(String(minutes));
    }

    if (existingMonthlyApplicationsTarget) {
      // store current monthly applications target row
      setCurrentMonthlyApplicationsTarget(existingMonthlyApplicationsTarget);
      // prefill monthly applications input
      setMonthlyApplicationsTarget(
        String(existingMonthlyApplicationsTarget.targetCount)
      );
    }

    if (existingMonthlyEffortTarget) {
      // store current monthly effort target row
      setCurrentMonthlyEffortTarget(existingMonthlyEffortTarget);
      // convert stored minutes into hours and minutes inputs
      const { hours, minutes } = minutesToHoursMinutes(
        existingMonthlyEffortTarget.targetCount
      );
      // prefill monthly hours input
      setMonthlyHours(String(hours));
      // prefill monthly minutes input
      setMonthlyMinutes(String(minutes));
    }
  }, [context, router]);

  // loading state
  if (!context || !context.currentUser) {
    return (
      // loading container
      <View style={{ padding: 20, backgroundColor, flex: 1 }}>
        {/* loading text */}
        <Text style={{ color: textColor }}>Loading...</Text>
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
    // do nothing if no value was entered
    if (!value) return;

    // update existing target if it already exists
    if (currentTarget) {
      await db
        .update(targets)
        .set({
          // save period type
          periodType: periodType,
          // save metric type
          metricType: metricType,
          // save numeric target value
          targetCount: Number(value),
        })
        // update the matching target row only
        .where(eq(targets.id, currentTarget.id));
    } else {
      // otherwise create a new target row
      await db.insert(targets).values({
        // link target to current user
        userId: context.currentUser.id,
        // save period type
        periodType: periodType,
        // save metric type
        metricType: metricType,
        // save numeric target value
        targetCount: Number(value),
        // no category-specific target
        categoryId: null,
        // store creation date
        createdAt: new Date().toISOString(),
      });
    }
  }

  // save all targets
  async function handleSaveTargets() {
    // save weekly applications target
    await saveSingleTarget(
      "weekly",
      "applications",
      weeklyApplicationsTarget,
      currentWeeklyApplicationsTarget
    );

    // save weekly effort target in minutes
    await saveSingleTarget(
      "weekly",
      "effortMinutes",
      String(hoursMinutesToMinutes(weeklyHours, weeklyMinutes)),
      currentWeeklyEffortTarget
    );

    // save monthly applications target
    await saveSingleTarget(
      "monthly",
      "applications",
      monthlyApplicationsTarget,
      currentMonthlyApplicationsTarget
    );

    // save monthly effort target in minutes
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
    // delete current user profile and related data
    await context.deleteProfile();
    // go back to login screen
    router.replace("/login" as any);
  }

  // log user out
  function handleLogout() {
    // clear current session from context
    context.logout();
    // go back to login screen
    router.replace("/login" as any);
  }

  // html/css to render
  return (
    // main scrollable page container
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor }}>
      {/* app brand title */}
      <Text
        style={{
          // title size
          fontSize: 30,
          // small spacing below title
          marginBottom: 4,
          // brand colour
          color: primaryColor,
          // bold title text
          fontWeight: "bold",
        }}
      >
        Appli
      </Text>

      {/* app subtitle */}
      <Text
        style={{
          // subtitle size
          fontSize: 16,
          // spacing below subtitle
          marginBottom: 20,
          // muted text colour
          color: mutedTextColor,
        }}
      >
        Job Application Tracker
      </Text>

      {/* page heading */}
      <Text style={{ fontSize: 24, marginBottom: 20, color: textColor }}>
        Profile
      </Text>

      {/* user details card */}
      <View
        style={{
          // card background colour
          backgroundColor: cardColor,
          // thin card border
          borderWidth: 1,
          // border colour
          borderColor: borderColor,
          // rounded corners
          borderRadius: 10,
          // inner spacing
          padding: 14,
          // spacing below card
          marginBottom: 20,
        }}
      >
        {/* current user's name */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Name: {context.currentUser.name}
        </Text>
        {/* current user's email */}
        <Text style={{ color: textColor }}>
          Email: {context.currentUser.email}
        </Text>
      </View>

      {/* weekly targets card */}
      <View
        style={{
          // card background colour
          backgroundColor: cardColor,
          // thin card border
          borderWidth: 1,
          // border colour
          borderColor: borderColor,
          // rounded corners
          borderRadius: 10,
          // inner spacing
          padding: 14,
          // spacing below card
          marginBottom: 20,
        }}
      >
        {/* section heading */}
        <Text style={{ fontSize: 20, marginBottom: 10, color: textColor }}>
          Weekly
        </Text>

        {/* label for weekly applications input */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Weekly Applications Target
        </Text>
        <TextInput
          accessibilityLabel="Weekly Applications Target"
          value={weeklyApplicationsTarget}
          onChangeText={setWeeklyApplicationsTarget}
          keyboardType="numeric"
          placeholder="Enter weekly applications target"
          placeholderTextColor={mutedTextColor}
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // small space above input
            marginTop: 10,
            // space below input
            marginBottom: 10,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* show current saved weekly applications target */}
        <Text style={{ marginBottom: 20, color: textColor }}>
          Current Weekly Applications Target:{" "}
          {currentWeeklyApplicationsTarget
            ? currentWeeklyApplicationsTarget.targetCount
            : "Not set"}
        </Text>

        {/* label for weekly effort target */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Weekly Effort Target
        </Text>

        {/* weekly effort hours and minutes inputs */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <TextInput
            accessibilityLabel="Weekly effort hours"
            value={weeklyHours}
            onChangeText={setWeeklyHours}
            keyboardType="numeric"
            placeholder="Hours"
            placeholderTextColor={mutedTextColor}
            style={{
              // take half of the row
              flex: 1,
              // thin input border
              borderWidth: 1,
              // border colour
              borderColor: borderColor,
              // inner spacing
              padding: 10,
              // rounded corners
              borderRadius: 8,
              // white background
              backgroundColor: "#FFFFFF",
              // text colour
              color: textColor,
            }}
          />

          <TextInput
            accessibilityLabel="Weekly effort minutes"
            value={weeklyMinutes}
            onChangeText={setWeeklyMinutes}
            keyboardType="numeric"
            placeholder="Minutes"
            placeholderTextColor={mutedTextColor}
            style={{
              // take half of the row
              flex: 1,
              // thin input border
              borderWidth: 1,
              // border colour
              borderColor: borderColor,
              // inner spacing
              padding: 10,
              // rounded corners
              borderRadius: 8,
              // white background
              backgroundColor: "#FFFFFF",
              // text colour
              color: textColor,
            }}
          />
        </View>

        {/* show current saved weekly effort target */}
        <Text style={{ marginBottom: 20, color: textColor }}>
          {currentWeeklyEffortTarget
            ? (() => {
                // convert saved minutes into hours and minutes for display
                const { hours, minutes } = minutesToHoursMinutes(
                  currentWeeklyEffortTarget.targetCount
                );
                return `Current Weekly Effort Target: ${hours}h ${minutes}m`;
              })()
            : "Not set"}
        </Text>
      </View>

      {/* monthly targets card */}
      <View
        style={{
          // card background colour
          backgroundColor: cardColor,
          // thin card border
          borderWidth: 1,
          // border colour
          borderColor: borderColor,
          // rounded corners
          borderRadius: 10,
          // inner spacing
          padding: 14,
          // spacing below card
          marginBottom: 20,
        }}
      >
        {/* section heading */}
        <Text style={{ fontSize: 20, marginBottom: 10, color: textColor }}>
          Monthly
        </Text>

        {/* label for monthly applications input */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Monthly Applications Target
        </Text>
        <TextInput
          accessibilityLabel="Monthly Applications Target"
          value={monthlyApplicationsTarget}
          onChangeText={setMonthlyApplicationsTarget}
          keyboardType="numeric"
          placeholder="Enter monthly applications target"
          placeholderTextColor={mutedTextColor}
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // small space above input
            marginTop: 10,
            // space below input
            marginBottom: 10,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* show current saved monthly applications target */}
        <Text style={{ marginBottom: 20, color: textColor }}>
          Current Monthly Applications Target:{" "}
          {currentMonthlyApplicationsTarget
            ? currentMonthlyApplicationsTarget.targetCount
            : "Not set"}
        </Text>

        {/* label for monthly effort target */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Monthly Effort Target
        </Text>

        {/* monthly effort hours and minutes inputs */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <TextInput
            accessibilityLabel="Monthly effort hours"
            value={monthlyHours}
            onChangeText={setMonthlyHours}
            keyboardType="numeric"
            placeholder="Hours"
            placeholderTextColor={mutedTextColor}
            style={{
              // take half of the row
              flex: 1,
              // thin input border
              borderWidth: 1,
              // border colour
              borderColor: borderColor,
              // inner spacing
              padding: 10,
              // rounded corners
              borderRadius: 8,
              // white background
              backgroundColor: "#FFFFFF",
              // text colour
              color: textColor,
            }}
          />

          <TextInput
            accessibilityLabel="Monthly effort minutes"
            value={monthlyMinutes}
            onChangeText={setMonthlyMinutes}
            keyboardType="numeric"
            placeholder="Minutes"
            placeholderTextColor={mutedTextColor}
            style={{
              // take half of the row
              flex: 1,
              // thin input border
              borderWidth: 1,
              // border colour
              borderColor: borderColor,
              // inner spacing
              padding: 10,
              // rounded corners
              borderRadius: 8,
              // white background
              backgroundColor: "#FFFFFF",
              // text colour
              color: textColor,
            }}
          />
        </View>

        {/* show current saved monthly effort target */}
        <Text style={{ marginBottom: 20, color: textColor }}>
          {currentMonthlyEffortTarget
            ? (() => {
                // convert saved minutes into hours and minutes for display
                const { hours, minutes } = minutesToHoursMinutes(
                  currentMonthlyEffortTarget.targetCount
                );
                return `Current Monthly Effort Target: ${hours}h ${minutes}m`;
              })()
            : "Not set"}
        </Text>
      </View>

      <Button
        // accessibility label for save button
        accessibilityLabel="Save targets"
        // button text
        title="Save Targets"
        // save all target values
        onPress={handleSaveTargets}
        // use primary brand colour
        color={primaryColor}
      />
      {/* spacing between buttons */}
      <View style={{ height: 10 }} />

      <Button
        // accessibility label for logout button

        accessibilityLabel="Log out"
        // button text
        title="Logout"
        // log the user out
        onPress={handleLogout}
        // use primary brand colour
        color={primaryColor}
      />
      {/* spacing between buttons */}
      <View style={{ height: 10 }} />
      <Button
        // accessibility label for delete profile button
        accessibilityLabel="Delete profile"
        // button text
        title="Delete Profile"
        // delete the current profile
        onPress={handleDeleteProfile}
        // use primary brand colour
        color={primaryColor}
      />
    </ScrollView>
  );
}