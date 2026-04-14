// Import global application context
import { ApplicationContext } from "@/app/_layout";

// Import React hooks
import { useContext, useState } from "react";

// Import React Native UI components
import { Button, ScrollView, Text, View } from "react-native";

export default function InsightsScreen() {
  const context = useContext(ApplicationContext); // access global state

  // chosen time range (daily / weekly / monthly)
  const [selectedRange, setSelectedRange] = useState("weekly");

  // Loading state if context not ready
  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const now = new Date(); // current date

  // Filter applications based on selected time range
  const filteredApplications = context.applications.filter((app: any) => {
    const appDate = new Date(app.dateApplied);

    // Daily
    if (selectedRange === "daily") {
      return appDate.toDateString() === now.toDateString();
    }

    // Weekly
    if (selectedRange === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return appDate >= oneWeekAgo;
    }

    // Monthly
    if (selectedRange === "monthly") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(now.getDate() - 30);
      return appDate >= oneMonthAgo;
    }

    return true;
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

  // build effort totals for each status
  const effortByStatus = uniqueStatuses.map((status: string) => {
    const totalEffort = filteredApplications
      .filter((app: any) => (app.currentStatus || "unknown") === status)
      .reduce((sum: number, app: any) => sum + app.effortMinutes, 0);

    return {
      status,
      totalEffort,
    };
  });

  // build percentage distribution for statuses
  const statusDistribution = statusData.map((item: any) => {
    const percentage =
      applicationsCount > 0
        ? Math.round((item.count / applicationsCount) * 100)
        : 0;

    return {
      status: item.status,
      count: item.count,
      percentage,
    };
  });

  // build percentage distribution for effort by status
  const effortDistribution = effortByStatus.map((item: any) => {
    const percentage =
      effortMinutes > 0
        ? Math.round((item.totalEffort / effortMinutes) * 100)
        : 0;

    return {
      status: item.status,
      totalEffort: item.totalEffort,
      percentage,
    };
  });

  // html & css to render
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {/* Screen title */}
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Insights</Text>

      {/* Time range selector buttons */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        <View style={{ marginRight: 10, marginBottom: 10 }}>
          <Button
            accessibilityLabel="Show daily insights"
            title="Daily"
            onPress={() => setSelectedRange("daily")}
          />
        </View>

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

      {/* Show selected range */}
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Selected Range: {selectedRange}
      </Text>

      {/* Summary metrics */}
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Applications: {applicationsCount}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Effort: {effortMinutes} mins
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Interviews: {interviewCount}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Effort Minutes per Interview:{" "}
        {interviewCount > 0 ? effortPerInterview : "No interviews yet"}
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
        <Text style={{ fontSize: 16, marginBottom: 12 }}>
          {applicationsCount > applicationsTargetValue
            ? `Exceeded by: ${applicationsCount - applicationsTargetValue}`
            : `Remaining: ${applicationsRemaining}`}
        </Text>
      ) : null}

      <Text style={{ fontSize: 16, marginBottom: 6 }}>
        Effort Target:{" "}
        {effortTargetValue > 0 ? `${effortTargetValue} mins` : "Not set"}
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 6 }}>
        Effort Status: {effortTargetStatus}
      </Text>

      {effortTargetValue > 0 ? (
        <Text style={{ fontSize: 16, marginBottom: 20 }}>
          {effortMinutes > effortTargetValue
            ? `Exceeded by: ${effortMinutes - effortTargetValue} mins`
            : `Remaining: ${effortRemaining} mins`}
        </Text>
      ) : null}

      {/* Main status count chart */}
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Status Chart</Text>

      {statusData.length === 0 ? (
        <Text>No applications in this time range</Text>
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
                  backgroundColor: "blue",
                }}
              />
            </View>
          </View>
        ))
      )}

      {/* Status distribution section */}
      <Text style={{ fontSize: 20, marginTop: 20, marginBottom: 10 }}>
        Status Distribution
      </Text>

      {statusDistribution.length === 0 ? (
        <Text>No status data available</Text>
      ) : (
        statusDistribution.map((item: any) => (
          <View key={item.status} style={{ marginBottom: 12 }}>
            <Text>
              {item.status}: {item.count} applications ({item.percentage}%)
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
                  width: `${item.percentage}%`,
                  backgroundColor: "green",
                }}
              />
            </View>
          </View>
        ))
      )}

      {/* Effort distribution section */}
      <Text style={{ fontSize: 20, marginTop: 20, marginBottom: 10 }}>
        Effort Distribution by Status
      </Text>

      {effortDistribution.length === 0 ? (
        <Text>No effort data available</Text>
      ) : (
        effortDistribution.map((item: any) => (
          <View key={item.status} style={{ marginBottom: 12 }}>
            <Text>
              {item.status}: {item.totalEffort} mins ({item.percentage}%)
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
                  width: `${item.percentage}%`,
                  backgroundColor: "orange",
                }}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}