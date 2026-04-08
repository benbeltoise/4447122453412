import { ApplicationContext } from "@/app/_layout";
import { db } from "@/db/client";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { Button, ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const context = useContext(ApplicationContext);

  useEffect(() => {
    if (!context) return;
    if (!context.isReady) return;

    if (!context.currentUser) {
      router.replace("/login" as any);
    }
  }, [context, router]);

  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  async function handleDeleteApplication(id: number) {
    await db.delete(applications).where(eq(applications.id, id));
    await context.refreshUserData(context.currentUser.id);
  }

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

  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const weeklyApplications = context.applications.filter((app: any) => {
    const date = new Date(app.dateApplied);
    return date >= oneWeekAgo;
  });

  const applicationsCount = weeklyApplications.length;

  const effortMinutes = weeklyApplications.reduce(
    (sum: number, app: any) => sum + app.effortMinutes,
    0
  );


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

      <Button
        title="Add Application"
        onPress={() => router.push("/add" as any)}
      />

      <View style={{ height: 20 }} />

      {context.applications.length === 0 ? (
        <Text>No applications yet</Text>
      ) : (
        context.applications.map((item: any) => {
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