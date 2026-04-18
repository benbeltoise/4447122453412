// Import global application context
import { ApplicationContext } from "@/app/_layout";

// Import React hooks
import { useContext, useState } from "react";

// Import React Native UI components
import { Button, ScrollView, Text, View } from "react-native";

export default function InsightsScreen() {
  const context = useContext(ApplicationContext); // access global state

  // chosen time range (weekly / monthly)
  const [selectedRange, setSelectedRange] = useState("weekly");

  // selected category (null means all)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Loading state if context not ready
  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const now = new Date(); // current date

  // helper to format minutes into hours and minutes
  function formatMinutes(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  }

  // simple status colour mapping
  function getStatusColor(status: string) {
    const s = status.toLowerCase();
    if (s.includes("applied")) return "blue";
    if (s.includes("interview")) return "green";
    if (s.includes("rejected")) return "red";
    return "gray";
  }

  // get progress width as a percentage
  function getProgressWidth(actual: number, target: number) {
    if (target <= 0) return 0;
    return Math.min((actual / target) * 100, 100);
  }

  // simple colour mapping for target progress
  function getProgressColor(status: string) {
    if (status === "Unmet") return "orange";
    if (status === "Met") return "green";
    if (status === "Exceeded") return "blue";
    return "gray";
  }

  // Filter applications based on selected time range
  const filteredApplications = context.applications
    .filter((app: any) => {
      const appDate = new Date(app.dateApplied);

      // Weekly
      if (selectedRange === "weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return appDate >= oneWeekAgo;
      }

      // Monthly
      if (selectedRange === "monthly") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return appDate >= oneMonthAgo;
      }

      return true;
    })
    .filter((app: any) => {
      // apply category filter if selected
      if (!selectedCategoryId) return true;
      return app.categoryId === selectedCategoryId;
    });

  // Total number of applications in selected range
  const applicationsCount = filteredApplications.length;

  // Total effort minutes in selected range
  const effortMinutes = filteredApplications.reduce(
    (sum: number, app: any) => sum + app.effortMinutes,
    0
  );

  // Count how many applications involve interviews
  // by checking if the status contains the word "interview"
  const interviewCount = filteredApplications.filter((app: any) =>
    String(app.currentStatus).toLowerCase().includes("interview")
  ).length;

  // Calculate effort per interview (avoiding dividing by 0)
  const effortPerInterview =
    interviewCount > 0 ? Math.round(effortMinutes / interviewCount) : 0;

  // get the correct application target for the selected range
  const applicationsTarget = context.targets.find(
    (item: any) =>
      item.userId === context.currentUser.id &&
      item.periodType === selectedRange &&
      item.metricType === "applications"
  );

  // get the correct effort target for the selected range
  const effortTarget = context.targets.find(
    (item: any) =>
      item.userId === context.currentUser.id &&
      item.periodType === selectedRange &&
      item.metricType === "effortMinutes"
  );

  // actual target values
  const applicationsTargetValue = applicationsTarget
    ? applicationsTarget.targetCount
    : 0;

  const effortTargetValue = effortTarget ? effortTarget.targetCount : 0;

  // remaining amounts
  const applicationsRemaining = applicationsTargetValue - applicationsCount;
  const effortRemaining = effortTargetValue - effortMinutes;

  // application target status
  let applicationsTargetStatus = "Not set";

  if (applicationsTargetValue > 0) {
    if (applicationsCount < applicationsTargetValue) {
      applicationsTargetStatus = "Unmet";
    } else if (applicationsCount === applicationsTargetValue) {
      applicationsTargetStatus = "Met";
    } else {
      applicationsTargetStatus = "Exceeded";
    }
  }

  // effort target status
  let effortTargetStatus = "Not set";

  if (effortTargetValue > 0) {
    if (effortMinutes < effortTargetValue) {
      effortTargetStatus = "Unmet";
    } else if (effortMinutes === effortTargetValue) {
      effortTargetStatus = "Met";
    } else {
      effortTargetStatus = "Exceeded";
    }
  }

  // Get all statuses from filtered applications
  const allStatuses = filteredApplications.map(
    (app: any) => app.currentStatus || "unknown"
  );

  // build a unique status list manually
  const uniqueStatuses: string[] = [];

  allStatuses.forEach((status: string) => {
    if (!uniqueStatuses.includes(status)) {
      uniqueStatuses.push(status);
    }
  });

  // Count how many applications belong to each status
  const statusData = uniqueStatuses.map((status: string) => {
    const count = filteredApplications.filter(
      (app: any) => (app.currentStatus || "unknown") === status
    ).length;

    return {
      status,
      count,
    };
  });

  // Find the highest status count for scaling the main bar chart
  let maxStatusCount = 1;

  statusData.forEach((item: any) => {
    if (item.count > maxStatusCount) {
      maxStatusCount = item.count;
    }
  });

  // convert count to percentage width for the main bar chart
  function getBarWidth(count: number) {
    return (count / maxStatusCount) * 100;
  }

  // html & css to render
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {/* Screen title */}
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Insights</Text>

      {/* Time range selector buttons */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        <View style={{ marginRight: 10, marginBottom: 10 }}>
          <Button
            accessibilityLabel="Show weekly insights"
            title="Weekly"
            onPress={() => setSelectedRange("weekly")}
          />
        </View>

        <View style={{ marginRight: 10, marginBottom: 10 }}>
          <Button
            accessibilityLabel="Show monthly insights"
            title="Monthly"
            onPress={() => setSelectedRange("monthly")}
          />
        </View>
      </View>

      {/* Category filter buttons */}
      <Text style={{ marginBottom: 10 }}>Filter by Category</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        <View style={{ marginRight: 10, marginBottom: 10 }}>
          <Button
            accessibilityLabel="Show all categories"
            title="All"
            onPress={() => setSelectedCategoryId(null)}
          />
        </View>

        {context.categories.map((cat: any) => (
          <View key={cat.id} style={{ marginRight: 10, marginBottom: 10 }}>
            <Button
              accessibilityLabel={`Filter by ${cat.name}`}
              title={cat.name}
              onPress={() => setSelectedCategoryId(cat.id)}
            />
          </View>
        ))}
      </View>

      {/* Show selected range and category */}
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Selected Range: {selectedRange}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Category:{" "}
        {selectedCategoryId
          ? context.categories.find((c: any) => c.id === selectedCategoryId)?.name
          : "All"}
      </Text>

      {/* Summary metrics */}
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Applications: {applicationsCount}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Effort: {formatMinutes(effortMinutes)}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Interviews: {interviewCount}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Effort per Interview:{" "}
        {interviewCount > 0
          ? formatMinutes(effortPerInterview)
          : "No interviews yet"}
      </Text>

      <Text style={{ fontSize: 20, marginBottom: 10 }}>Target Progress</Text>

      <Text style={{ fontSize: 16, marginBottom: 6 }}>
        Applications Target:{" "}
        {applicationsTargetValue > 0 ? applicationsTargetValue : "Not set"}
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 6 }}>
        Applications Status: {applicationsTargetStatus}
      </Text>

      {applicationsTargetValue > 0 ? (
        <>
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
                  applicationsTargetValue
                )}%`,
                backgroundColor: getProgressColor(applicationsTargetStatus),
              }}
            />
          </View>

          <Text style={{ fontSize: 16, marginBottom: 12 }}>
            {applicationsCount > applicationsTargetValue
              ? `Exceeded by: ${applicationsCount - applicationsTargetValue}`
              : `Remaining: ${applicationsRemaining}`}
          </Text>
        </>
      ) : null}

      <Text style={{ fontSize: 16, marginBottom: 6 }}>
        Effort Target:{" "}
        {effortTargetValue > 0
          ? formatMinutes(effortTargetValue)
          : "Not set"}
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 6 }}>
        Effort Status: {effortTargetStatus}
      </Text>

      {effortTargetValue > 0 ? (
        <>
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
                  effortMinutes,
                  effortTargetValue
                )}%`,
                backgroundColor: getProgressColor(effortTargetStatus),
              }}
            />
          </View>

          <Text style={{ fontSize: 16, marginBottom: 20 }}>
            {effortMinutes > effortTargetValue
              ? `Exceeded by: ${formatMinutes(
                  effortMinutes - effortTargetValue
                )}`
              : `Remaining: ${formatMinutes(effortRemaining)}`}
          </Text>
        </>
      ) : null}

      {/* Main status count chart */}
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Status Chart</Text>

      {statusData.length === 0 ? (
        <Text>No applications found for this time range</Text>
      ) : (
        statusData.map((item: any) => (
          <View key={item.status} style={{ marginBottom: 12 }}>
            <Text>
              {item.status}: {item.count}
            </Text>

            <View
              style={{
                height: 20,
                backgroundColor: "#ddd",
                marginTop: 4,
              }}
            >
              <View
                style={{
                  height: 20,
                  width: `${getBarWidth(item.count)}%`,
                  backgroundColor: getStatusColor(item.status),
                }}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}