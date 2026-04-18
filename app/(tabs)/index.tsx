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

//CLAUDE.AI SECTION 1. LINK TO CHAT: https://claude.ai/share/bc07d173-4d9d-42c0-a957-cc5156f3c698
// Used to refine UI & UX by making user iteractions simpler and easier. No adaptions were made from the generated code

// icons from expo vector icons
import { MaterialCommunityIcons } from "@expo/vector-icons";

// map a saved icon string to a MaterialCommunityIcons name, with a fallback
function getCategoryIcon(icon: string): React.ComponentProps<typeof MaterialCommunityIcons>["name"] {
  const knownIcons: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
    briefcase: "briefcase",
    home: "home",
    car: "car",
    food: "food",
    heart: "heart",
    star: "star",
    school: "school",
    shopping: "shopping",
    gym: "dumbbell",
    travel: "airplane",
    money: "cash",
    phone: "phone",
  };
  // return the matching icon or a fallback tag icon
  return knownIcons[icon.toLowerCase()] ?? "tag";
}

// END OF CLAUDE.AI SECTION 1

export default function HomeScreen() {
  const router = useRouter(); // navigation
  const context = useContext(ApplicationContext); //access global app state

  // search input state
  const [searchQuery, setSearchQuery] = useState("");
  // select status filter
  const [selectedStatus, setSelectedStatus] = useState("All");

  // date filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  // helper to format minutes into hours and minutes
  function formatMinutes(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  }

  // helper to get progress width
  function getProgressWidth(actual: number, target: number) {
    if (target <= 0) return 0;
    return Math.min((actual / target) * 100, 100);
  }

  // helper to get progress colour
  function getProgressColor(actual: number, target: number) {
    if (target <= 0) return "gray";
    if (actual < target) return "orange";
    if (actual === target) return "green";
    return "blue";
  }

  // status filter options
  const statuses = ["All", "applied", "interviewing", "rejected"];

  // filter applications by search, status, and date range
  const filteredApplications = context.applications.filter((item: any) => {
    const matchesSearch =
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" || item.currentStatus === selectedStatus;

    // simple date filtering using string comparison
    const matchesFromDate =
      !fromDate || item.dateApplied >= fromDate;

    const matchesToDate =
      !toDate || item.dateApplied <= toDate;

    return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
  });

  // html and css to render
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Applications</Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Applications this week: {applicationsCount} /{" "}
        {applicationsTarget ? applicationsTarget.targetCount : "-"}
      </Text>

      {applicationsTarget ? (
        <View
          style={{
            height: 20,
            backgroundColor: "#ddd",
            marginTop: 4,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              height: 20,
              width: `${getProgressWidth(
                applicationsCount,
                applicationsTarget.targetCount
              )}%`,
              backgroundColor: getProgressColor(
                applicationsCount,
                applicationsTarget.targetCount
              ),
            }}
          />
        </View>
      ) : null}

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Effort this week: {formatMinutes(effortMinutes)} /{" "}
        {effortTarget ? formatMinutes(effortTarget.targetCount) : "-"}
      </Text>

      {effortTarget ? (
        <View
          style={{
            height: 20,
            backgroundColor: "#ddd",
            marginTop: 4,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              height: 20,
              width: `${getProgressWidth(
                effortMinutes,
                effortTarget.targetCount
              )}%`,
              backgroundColor: getProgressColor(
                effortMinutes,
                effortTarget.targetCount
              ),
            }}
          />
        </View>
      ) : null}

      <TextInput
        accessibilityLabel="Search applications"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by company, role or notes"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
        }}
      />

      {/* date filters */}
      <Text>From Date</Text>
      <TextInput
        accessibilityLabel="Filter from date"
        value={fromDate}
        onChangeText={setFromDate}
        placeholder="YYYY-MM-DD"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Text>To Date</Text>
      <TextInput
        accessibilityLabel="Filter to date"
        value={toDate}
        onChangeText={setToDate}
        placeholder="YYYY-MM-DD"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        {statuses.map((status) => (
          <View key={status} style={{ marginRight: 10, marginBottom: 10 }}>
            <Button
              accessibilityLabel={
                status === "All"
                  ? "Filter by all statuses"
                  : `Filter by ${status}`
              }
              title={status}
              onPress={() => setSelectedStatus(status)}
            />
          </View>
        ))}
      </View>

      <Button
        accessibilityLabel="Add new application"
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
                borderLeftWidth: 6,
                borderLeftColor: category ? category.color : "#cccccc",
                padding: 12,
                marginBottom: 12,
              }}
            >
              {category && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: category.color,
                      borderRadius: 6,
                      padding: 5,
                      marginRight: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={getCategoryIcon(category.icon)}
                      size={16}
                      color="white"
                      accessibilityLabel={`${category.icon} icon`}
                    />
                  </View>
                  <Text style={{ fontWeight: "bold" }}>{category.name}</Text>
                </View>
              )}

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
                accessibilityLabel={`View application for ${item.company}`}
                title="View"
                onPress={() => router.push(`/application/${item.id}` as any)}
              />

              <View style={{ height: 10 }} />

              <Button
                accessibilityLabel={`Delete application for ${item.company}`}
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