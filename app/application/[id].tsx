// import global app context
import { ApplicationContext } from "@/app/_layout";
// import route params and navigation
import { useLocalSearchParams, useRouter } from "expo-router";
// import react hook
import { useContext } from "react";
// react native ui components
import { Button, ScrollView, Text, View } from "react-native";

export default function ApplicationDetailScreen() {
  // get router for screen navigation
  const router = useRouter();
  // get id from the route params
  const { id } = useLocalSearchParams();
  // get access to global app state
  const context = useContext(ApplicationContext);

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

  // loading state while context is not ready
  if (!context || !context.currentUser) {
    return (
      // loading container
      <View style={{ padding: 20, backgroundColor, flex: 1 }}>
        {/* loading text */}
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  // find the application that matches the route id
  const application = context.applications.find(
    (item: any) => String(item.id) === String(id)
  );

  // show fallback screen if application does not exist
  if (!application) {
    return (
      // not found container
      <View style={{ padding: 20, backgroundColor, flex: 1 }}>
        {/* not found message */}
        <Text style={{ color: textColor }}>Application not found</Text>
        {/* spacing before button */}
        <View style={{ height: 10 }} />
        <Button
          accessibilityLabel="Go back"
          title="Back"
          onPress={() => router.back()}
          color={primaryColor}
        />
      </View>
    );
  }

  // find the category linked to this application
  const category = context.categories.find(
    (item: any) => item.id === application.categoryId
  );

  // get all status logs linked to this application
  const logs = context.statusLogs.filter(
    (log: any) => log.applicationId === application.id
  );

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
        job application tracker
      </Text>

      {/* application details card */}
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
        <Text style={{ fontSize: 24, marginBottom: 20, color: textColor }}>
          Application Detail
        </Text>

        {/* application company */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Company: {application.company}
        </Text>
        {/* application role */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Role: {application.role}
        </Text>
        {/* application date applied */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Date Applied: {application.dateApplied}
        </Text>
        {/* application current status */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Status: {application.currentStatus}
        </Text>
        {/* formatted effort time */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Effort: {formatMinutes(application.effortMinutes)}
        </Text>
        {/* salary expectation */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Salary Expectation: {application.salaryExpectation}
        </Text>
        {/* linked category name */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Category: {category ? category.name : "Unknown"}
        </Text>
        {/* application notes */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Notes: {application.notes}
        </Text>
      </View>

      {/* status history card */}
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
        <Text style={{ fontSize: 18, marginBottom: 10, color: textColor }}>
          Status History
        </Text>

        {/* show empty state if there are no status logs */}
        {logs.length === 0 ? (
          <Text style={{ color: mutedTextColor }}>No status history</Text>
        ) : (
          logs.map((log: any) => (
            <View
              key={log.id}
              style={{
                // thin border around each log item
                borderWidth: 1,
                // border colour
                borderColor: borderColor,
                // inner spacing
                padding: 10,
                // spacing below each log item
                marginBottom: 10,
                // rounded corners
                borderRadius: 8,
                // white background
                backgroundColor: "#FFFFFF",
              }}
            >
              {/* saved status value */}
              <Text style={{ color: textColor, marginBottom: 4 }}>
                Status: {log.status}
              </Text>
              {/* timestamp for the status change */}
              <Text style={{ color: textColor }}>
                Changed At: {log.changedAt}
              </Text>
            </View>
          ))
        )}
      </View>

      <Button
        // accessibility label for edit button
        accessibilityLabel="Edit application"
        // button text
        title="Edit Application"
        // go to edit application screen
        onPress={() => router.push(`/edit/${application.id}` as any)}
        // use primary brand colour
        color={primaryColor}
      />

      {/* spacing between buttons */}
      <View style={{ height: 10 }} />

      <Button
        // accessibility label for back button
        accessibilityLabel="Go back"
        // button text
        title="Back"
        // go back to previous screen
        onPress={() => router.back()}
        // use primary brand colour
        color={primaryColor}
      />
    </ScrollView>
  );
}