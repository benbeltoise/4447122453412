// import global app context
import { ApplicationContext } from "@/app/_layout";
// import db
import { db } from "@/db/client";
// import applications table from db
import { applications } from "@/db/schema";
// import where condition for helpwith db queries
import { eq } from "drizzle-orm";
// import navigation
import { useRouter } from "expo-router";
// import react hooks
import { useContext, useEffect, useState } from "react";
// react native ui components
import { Button, ScrollView, Text, TextInput, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter(); // navigation
  const context = useContext(ApplicationContext); //access global app state

  // search input state
  const [searchQuery, setSearchQuery] = useState("");
  // select status filter
  const [selectedStatus, setSelectedStatus] = useState("All");

  // check auth when loading
  useEffect(() => {
    if (!context) return;
    if (!context.isReady) return;

    // redirect to login if no user is logged in
    if (!context.currentUser) {
      router.replace("/login" as any);
    }
  }, [context, router]);

  // loading state while context is loading
  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // delete an application from db, then refresh context data
  async function handleDeleteApplication(id: number) {
    await db.delete(applications).where(eq(applications.id, id));
    await context.refreshUserData(context.currentUser.id);
  }

  // get the user's weekly targets
  const applicationsTarget = context.targets.find(
  (t: any) =>
    t.userId === context.currentUser.id &&
    t.periodType === "weekly" &&
    t.metricType === "applications"
  );

  const effortTarget = context.targets.find(
    (t: any) =>
      t.userId === context.currentUser.id &&
      t.periodType === "weekly" &&
      t.metricType === "effortMinutes"
  );

  // get today's date and the date 1 week ago
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  // keep only applications from the last 7 days
  const weeklyApplications = context.applications.filter((app: any) => {
    const date = new Date(app.dateApplied);
    return date >= oneWeekAgo;
  });

  // count applications this week
  const applicationsCount = weeklyApplications.length;

  // count effort minutes from this week
  const effortMinutes = weeklyApplications.reduce(
    (sum: number, app: any) => sum + app.effortMinutes,
    0
  );

  // status filter options
  const statuses = ["All", "applied", "interviewing", "rejected"];

  // filter applications by search words and status
  const filteredApplications = context.applications.filter((item: any) => {
    const matchesSearch =
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" || item.currentStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });


  // html and css to render
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Applications</Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Applications this week: {applicationsCount} /{" "}
        {applicationsTarget ? applicationsTarget.targetCount : "-"}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Effort this week: {effortMinutes} mins /{" "}
        {effortTarget ? effortTarget.targetCount : "-"}
      </Text>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by company, role or notes"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        {statuses.map((status) => (
          <View key={status} style={{ marginRight: 10, marginBottom: 10 }}>
            <Button
              title={status}
              onPress={() => setSelectedStatus(status)}
            />
          </View>
        ))}
      </View>

      <Button
        title="Add Application"
        onPress={() => router.push("/add" as any)}
      />

      <View style={{ height: 20 }} />

      {filteredApplications.length === 0 ? (
        <Text>No applications match your filters</Text>
      ) : (
        filteredApplications.map((item: any) => {
          const category = context.categories.find(
            (cat: any) => cat.id === item.categoryId
          );

          return (
            <View
              key={item.id}
              style={{
                borderWidth: 1,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text>Company: {item.company}</Text>
              <Text>Role: {item.role}</Text>
              <Text>Date Applied: {item.dateApplied}</Text>
              <Text>Status: {item.currentStatus}</Text>
              <Text>Effort Minutes: {item.effortMinutes}</Text>
              <Text>Salary Expectation: {item.salaryExpectation}</Text>
              <Text>Category: {category ? category.name : "Unknown"}</Text>
              <Text>Notes: {item.notes}</Text>

              <View style={{ height: 10 }} />

              <Button
                title="View"
                onPress={() => router.push(`/application/${item.id}` as any)}
              />

              <View style={{ height: 10 }} />

              <Button
                title="Delete"
                onPress={() => handleDeleteApplication(item.id)}
              />
            </View>
          );
        })
      )}
    </ScrollView>
  );
}