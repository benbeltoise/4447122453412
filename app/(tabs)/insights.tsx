// Import global application context
import { ApplicationContext } from "@/app/_layout";

// Import React hooks
import { useContext, useState } from "react";

// Import React Native UI components
import { Button, ScrollView, Text, View } from "react-native";

export default function InsightsScreen() {
  // get access to global app state
  const context = useContext(ApplicationContext); // access global state

  // chosen time range (weekly / monthly)
  // store selected insights range
  const [selectedRange, setSelectedRange] = useState("weekly");

  // selected category (null means all)
  // store selected category filter
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // simple app colours
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
  // border colour for cards
  const borderColor = "#D1D5DB";

  // Loading state if context not ready
  if (!context || !context.currentUser) {
    return (
      // loading container
      <View style={{ padding: 20, backgroundColor, flex: 1 }}>
        {/* loading text */}
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  // current date
  const now = new Date(); // current date

  // helper to format minutes into hours and minutes
  function formatMinutes(mins: number) {
    // get full hours
    const h = Math.floor(mins / 60);
    // get remaining minutes
    const m = mins % 60;
    // show only minutes if under one hour
    if (h === 0) return `${m}m`;
    // otherwise show hours and minutes
    return `${h}h ${m}m`;
  }

  // simple status colour mapping
  function getStatusColor(status: string) {
    // make status lowercase for easier matching
    const s = status.toLowerCase();
    // applied statuses are blue
    if (s.includes("applied")) return "blue";
    // interview statuses are green
    if (s.includes("interview")) return "green";
    // rejected statuses are red
    if (s.includes("rejected")) return "red";
    // fallback colour for other statuses
    return "gray";
  }

  // get progress width as a percentage
  function getProgressWidth(actual: number, target: number) {
    // avoid divide by zero
    if (target <= 0) return 0;
    // cap width at 100 percent
    return Math.min((actual / target) * 100, 100);
  }

  // simple colour mapping for target progress
  function getProgressColor(status: string) {
    // orange when target not met
    if (status === "Unmet") return "orange";
    // green when target met
    if (status === "Met") return "green";
    // primary colour when target exceeded
    if (status === "Exceeded") return primaryColor;
    // fallback colour when target not set
    return "gray";
  }

  // Filter applications based on selected time range
  const filteredApplications = context.applications
    .filter((app: any) => {
      // convert saved date into a date object
      const appDate = new Date(app.dateApplied);

      // Weekly
      if (selectedRange === "weekly") {
        // calculate the date 7 days ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        // keep only applications from the last 7 days
        return appDate >= oneWeekAgo;
      }

      // Monthly
      if (selectedRange === "monthly") {
        // calculate the date 1 month ago
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        // keep only applications from the last month
        return appDate >= oneMonthAgo;
      }

      // fallback if another range was ever added
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
    // add each application's effort minutes
    (sum: number, app: any) => sum + app.effortMinutes,
    // start at zero
    0
  );

  // Count how many applications involve interviews by checking if the status contains the word "interview"
  const interviewCount = filteredApplications.filter((app: any) =>
    String(app.currentStatus).toLowerCase().includes("interview")
  ).length;

  // Calculate effort per interview (avoiding dividing by 0)
  const effortPerInterview =
    interviewCount > 0 ? Math.round(effortMinutes / interviewCount) : 0;

  // get the correct application target for the selected range
  const applicationsTarget = context.targets.find(
    (item: any) =>
      // target must belong to current user
      item.userId === context.currentUser.id &&
      // target period must match selected range
      item.periodType === selectedRange &&
      // target must be for application count
      item.metricType === "applications"
  );

  // get the correct effort target for the selected range
  const effortTarget = context.targets.find(
    (item: any) =>
      // target must belong to current user
      item.userId === context.currentUser.id &&
      // target period must match selected range
      item.periodType === selectedRange &&
      // target must be for effort minutes
      item.metricType === "effortMinutes"
  );

  // actual target values
  // application target number or zero if not set
  const applicationsTargetValue = applicationsTarget
    ? applicationsTarget.targetCount
    : 0;

  // effort target number or zero if not set
  const effortTargetValue = effortTarget ? effortTarget.targetCount : 0;

  // remaining amounts
  // applications left to reach target
  const applicationsRemaining = applicationsTargetValue - applicationsCount;
  // effort minutes left to reach target
  const effortRemaining = effortTargetValue - effortMinutes;

  // application target status
  let applicationsTargetStatus = "Not set";

  // only calculate target status if a target exists
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

  // only calculate target status if a target exists
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
    // use unknown as fallback if status is missing
    (app: any) => app.currentStatus || "unknown"
  );

  // build a unique status list manually
  const uniqueStatuses: string[] = [];

  allStatuses.forEach((status: string) => {
    // only add status if it is not already included
    if (!uniqueStatuses.includes(status)) {
      uniqueStatuses.push(status);
    }
  });

  // Count how many applications belong to each status
  const statusData = uniqueStatuses.map((status: string) => {
    // count applications with this status
    const count = filteredApplications.filter(
      (app: any) => (app.currentStatus || "unknown") === status
    ).length;

    // return chart data object
    return {
      status,
      count,
    };
  });

  // Find the highest status count for scaling the main bar chart
  let maxStatusCount = 1;

  statusData.forEach((item: any) => {
    // keep track of highest count
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
    // main scrollable page container
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor }}>
      {/* app brand title */}
      <Text
        style={{
          // title size
          fontSize: 30,
          // small space below title
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

      {/* Screen title */}
      <Text style={{ fontSize: 24, marginBottom: 20, color: textColor }}>
        Insights
      </Text>

      {/* summary card */}
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
        {/* Time range selector buttons */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
          <View style={{ marginRight: 10, marginBottom: 10 }}>
            <Button
              accessibilityLabel="Show weekly insights"
              title="Weekly"
              onPress={() => setSelectedRange("weekly")}
              color={primaryColor}
            />
          </View>

          <View style={{ marginRight: 10, marginBottom: 10 }}>
            <Button
              accessibilityLabel="Show monthly insights"
              title="Monthly"
              onPress={() => setSelectedRange("monthly")}
              color={primaryColor}
            />
          </View>
        </View>

        {/* Category filter buttons */}
        <Text style={{ marginBottom: 10, color: textColor }}>Filter by Category</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
          {/* all categories filter button */}
          <View style={{ marginRight: 10, marginBottom: 10 }}>
            <Button
              accessibilityLabel="Show all categories"
              title="All"
              onPress={() => setSelectedCategoryId(null)}
              color={primaryColor}
            />
          </View>

          {/* category buttons */}
          {context.categories.map((cat: any) => (
            <View key={cat.id} style={{ marginRight: 10, marginBottom: 10 }}>
              <Button
                accessibilityLabel={`Filter by ${cat.name}`}
                title={cat.name}
                onPress={() => setSelectedCategoryId(cat.id)}
                color={primaryColor}
              />
            </View>
          ))}
        </View>

        {/* Show selected range and category */}
        <Text style={{ fontSize: 18, marginBottom: 10, color: textColor }}>
          Selected Range: {selectedRange}
        </Text>

        <Text style={{ fontSize: 18, marginBottom: 10, color: textColor }}>
          Category:{" "}
          {selectedCategoryId
            ? context.categories.find((c: any) => c.id === selectedCategoryId)?.name
            : "All"}
        </Text>

        {/* Summary metrics */}
        <Text style={{ fontSize: 18, marginBottom: 10, color: textColor }}>
          Applications: {applicationsCount}
        </Text>

        <Text style={{ fontSize: 18, marginBottom: 10, color: textColor }}>
          Effort: {formatMinutes(effortMinutes)}
        </Text>

        <Text style={{ fontSize: 18, marginBottom: 10, color: textColor }}>
          Interviews: {interviewCount}
        </Text>

        <Text style={{ fontSize: 18, marginBottom: 0, color: textColor }}>
          Effort per Interview:{" "}
          {interviewCount > 0
            ? formatMinutes(effortPerInterview)
            : "No interviews yet"}
        </Text>
      </View>

      {/* target progress card */}
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
          Target Progress
        </Text>

        {/* applications target value */}
        <Text style={{ fontSize: 16, marginBottom: 6, color: textColor }}>
          Applications Target:{" "}
          {applicationsTargetValue > 0 ? applicationsTargetValue : "Not set"}
        </Text>

        {/* applications target status */}
        <Text style={{ fontSize: 16, marginBottom: 6, color: textColor }}>
          Applications Status: {applicationsTargetStatus}
        </Text>

        {/* applications target progress bar */}
        {applicationsTargetValue > 0 ? (
          <>
            <View
              style={{
                // outer progress bar height
                height: 20,
                // empty bar colour
                backgroundColor: "#ddd",
                // small top spacing
                marginTop: 4,
                // spacing below bar
                marginBottom: 12,
                // rounded corners
                borderRadius: 6,
                // keep inner bar inside rounded corners
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  // inner progress bar height
                  height: 20,
                  // width based on target progress
                  width: `${getProgressWidth(
                    applicationsCount,
                    applicationsTargetValue
                  )}%`,
                  // colour based on target status
                  backgroundColor: getProgressColor(applicationsTargetStatus),
                }}
              />
            </View>

            <Text style={{ fontSize: 16, marginBottom: 12, color: textColor }}>
              {applicationsCount > applicationsTargetValue
                ? `Exceeded by: ${applicationsCount - applicationsTargetValue}`
                : `Remaining: ${applicationsRemaining}`}
            </Text>
          </>
        ) : null}

        {/* effort target value */}
        <Text style={{ fontSize: 16, marginBottom: 6, color: textColor }}>
          Effort Target:{" "}
          {effortTargetValue > 0
            ? formatMinutes(effortTargetValue)
            : "Not set"}
        </Text>

        {/* effort target status */}
        <Text style={{ fontSize: 16, marginBottom: 6, color: textColor }}>
          Effort Status: {effortTargetStatus}
        </Text>

        {/* effort target progress bar */}
        {effortTargetValue > 0 ? (
          <>
            <View
              style={{
                // outer progress bar height
                height: 20,
                // empty bar colour
                backgroundColor: "#ddd",
                // small top spacing
                marginTop: 4,
                // spacing below bar
                marginBottom: 12,
                // rounded corners
                borderRadius: 6,
                // keep inner bar inside rounded corners
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  // inner progress bar height
                  height: 20,
                  // width based on target progress
                  width: `${getProgressWidth(
                    effortMinutes,
                    effortTargetValue
                  )}%`,
                  // colour based on target status
                  backgroundColor: getProgressColor(effortTargetStatus),
                }}
              />
            </View>

            <Text style={{ fontSize: 16, marginBottom: 0, color: textColor }}>
              {effortMinutes > effortTargetValue
                ? `Exceeded by: ${formatMinutes(
                    effortMinutes - effortTargetValue
                  )}`
                : `Remaining: ${formatMinutes(effortRemaining)}`}
            </Text>
          </>
        ) : null}
      </View>

      {/* status chart card */}
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
        {/* Main status count chart */}
        <Text style={{ fontSize: 20, marginBottom: 10, color: textColor }}>
          Status Chart
        </Text>

        {statusData.length === 0 ? (
          <Text style={{ color: mutedTextColor }}>
            No applications found for this time range
          </Text>
        ) : (
          statusData.map((item: any) => (
            <View key={item.status} style={{ marginBottom: 12 }}>
              {/* status label and count */}
              <Text style={{ color: textColor }}>
                {item.status}: {item.count}
              </Text>

              {/* status bar background */}
              <View
                style={{
                  height: 20,
                  backgroundColor: "#ddd",
                  marginTop: 4,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {/* status bar fill */}
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
      </View>
    </ScrollView>
  );
}