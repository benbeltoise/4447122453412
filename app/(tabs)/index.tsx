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
  // list of saved icon names and their matching material icons
  const knownIcons: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
    // briefcase icon option
    briefcase: "briefcase",
    // home icon option
    home: "home",
    // car icon option
    car: "car",
    // food icon option
    food: "food",
    // heart icon option
    heart: "heart",
    // star icon option
    star: "star",
    // school icon option
    school: "school",
    // shopping icon option
    shopping: "shopping",
    // gym icon option
    gym: "dumbbell",
    // travel icon option
    travel: "airplane",
    // money icon option
    money: "cash",
    // phone icon option
    phone: "phone",
  };
  // return the matching icon or a fallback icon of a tag
  return knownIcons[icon.toLowerCase()] ?? "tag";
}

// END OF CLAUDE.AI SECTION 1

export default function HomeScreen() {
  // get router for screen navigation
  const router = useRouter(); // navigation
  // get access to global app state
  const context = useContext(ApplicationContext); //access global app state

  // search input state
  // store current search text
  const [searchQuery, setSearchQuery] = useState("");
  // select status filter
  // store selected status filter value
  const [selectedStatus, setSelectedStatus] = useState("All");

  // date filter states
  // store start date filter
  const [fromDate, setFromDate] = useState("");
  // store end date filter
  const [toDate, setToDate] = useState("");

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
  // border colour for inputs and cards
  const borderColor = "#D1D5DB";

  // check auth when loading
  useEffect(() => {
    // stop if context is not ready yet
    if (!context) return;
    // stop if app data has not finished loading
    if (!context.isReady) return;

    // redirect to login if no user is logged in
    if (!context.currentUser) {
      router.replace("/login" as any);
    }
  }, [context, router]);

  // loading state while context is loading
  if (!context || !context.currentUser) {
    return (
      // loading container
      <View style={{ padding: 20, backgroundColor, flex: 1 }}>
        {/* loading text */}
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  // delete an application from db, then refresh context data
  async function handleDeleteApplication(id: number) {
    // delete the matching application from the database
    await db.delete(applications).where(eq(applications.id, id));
    // refresh all user data after delete
    await context.refreshUserData(context.currentUser.id);
  }

  // get the user's weekly targets
  const applicationsTarget = context.targets.find(
    (t: any) =>
      // target must belong to current user
      t.userId === context.currentUser.id &&
      // target must be weekly
      t.periodType === "weekly" &&
      // target must track applications count
      t.metricType === "applications"
  );

  // get the user's weekly effort target
  const effortTarget = context.targets.find(
    (t: any) =>
      // target must belong to current user
      t.userId === context.currentUser.id &&
      // target must be weekly
      t.periodType === "weekly" &&
      // target must track effort minutes
      t.metricType === "effortMinutes"
  );

  // get today's date and the date 1 week ago
  // current date and time
  const now = new Date();
  // create date object for one week ago
  const oneWeekAgo = new Date();
  // subtract 7 days from today
  oneWeekAgo.setDate(now.getDate() - 7);

  // keep only applications from the last 7 days
  const weeklyApplications = context.applications.filter((app: any) => {
    // convert saved date string into date object
    const date = new Date(app.dateApplied);
    // keep applications on or after one week ago
    return date >= oneWeekAgo;
  });

  // count applications this week
  const applicationsCount = weeklyApplications.length;

  // count effort minutes from this week
  const effortMinutes = weeklyApplications.reduce(
    // add each application's effort minutes to total
    (sum: number, app: any) => sum + app.effortMinutes,
    // start total at zero
    0
  );

  // helper to format minutes into hours and minutes
  function formatMinutes(mins: number) {
    // get full hours from total minutes
    const h = Math.floor(mins / 60);
    // get remaining minutes after hours
    const m = mins % 60;
    // show only minutes if under one hour
    if (h === 0) return `${m}m`;
    // otherwise show hours and minutes
    return `${h}h ${m}m`;
  }

  // helper to get progress width
  function getProgressWidth(actual: number, target: number) {
    // avoid divide by zero
    if (target <= 0) return 0;
    // return progress percentage, capped at 100
    return Math.min((actual / target) * 100, 100);
  }

  // helper to get progress colour
  function getProgressColor(actual: number, target: number) {
    // use gray if target is missing or invalid
    if (target <= 0) return "gray";
    // orange when below target
    if (actual < target) return "orange";
    // green when exactly on target
    if (actual === target) return "green";
    // use brand colour when above target
    return primaryColor;
  }

  // status filter options
  const statuses = ["All", "applied", "interviewing", "rejected"];

  // filter applications by search, status, and date range
  const filteredApplications = context.applications.filter((item: any) => {
    // match search against company, role, or notes
    const matchesSearch =
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes || "").toLowerCase().includes(searchQuery.toLowerCase());

    // match selected status unless all statuses is selected
    const matchesStatus =
      selectedStatus === "All" || item.currentStatus === selectedStatus;

    // simple date filtering using string comparison
    // keep all items if no from date is entered, otherwise compare dates
    const matchesFromDate =
      !fromDate || item.dateApplied >= fromDate;

    // keep all items if no to date is entered, otherwise compare dates
    const matchesToDate =
      !toDate || item.dateApplied <= toDate;

    // item must match all active filters
    return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
  });

  // html and css to render
  return (
    // main scrollable page container
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor }}>
      {/* app brand title */}
      <Text
        style={{
          // large heading size
          fontSize: 30,
          // small spacing below title
          marginBottom: 4,
          // use brand colour
          color: primaryColor,
          // bold title
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
          // space below subtitle
          marginBottom: 20,
          // muted text colour
          color: mutedTextColor,
        }}
      >
        Job Application Tracker
      </Text>

      {/* page heading */}
      <Text style={{ fontSize: 24, marginBottom: 20, color: textColor }}>
        Applications
      </Text>

      {/* weekly applications target summary */}
      <Text style={{ fontSize: 18, marginBottom: 10, color: textColor }}>
        Applications this week: {applicationsCount} /{" "}
        {applicationsTarget ? applicationsTarget.targetCount : "-"}
      </Text>

      {/* show weekly applications progress bar only if target exists */}
      {applicationsTarget ? (
        <View
          style={{
            // progress bar height
            height: 20,
            // empty bar background
            backgroundColor: "#ddd",
            // small top spacing
            marginTop: 4,
            // spacing below bar
            marginBottom: 12,
            // rounded corners
            borderRadius: 6,
            // hide overflow so inner bar stays rounded
            overflow: "hidden",
          }}
        >
          <View
            style={{
              // inner progress bar height
              height: 20,
              // width based on progress percentage
              width: `${getProgressWidth(
                applicationsCount,
                applicationsTarget.targetCount
              )}%`,
              // colour based on progress level
              backgroundColor: getProgressColor(
                applicationsCount,
                applicationsTarget.targetCount
              ),
            }}
          />
        </View>
      ) : null}

      {/* weekly effort target summary */}
      <Text style={{ fontSize: 18, marginBottom: 10, color: textColor }}>
        Effort this week: {formatMinutes(effortMinutes)} /{" "}
        {effortTarget ? formatMinutes(effortTarget.targetCount) : "-"}
      </Text>

      {/* show weekly effort progress bar only if target exists */}
      {effortTarget ? (
        <View
          style={{
            // progress bar height
            height: 20,
            // empty bar background
            backgroundColor: "#ddd",
            // small top spacing
            marginTop: 4,
            // spacing below bar
            marginBottom: 20,
            // rounded corners
            borderRadius: 6,
            // hide overflow so inner bar stays rounded
            overflow: "hidden",
          }}
        >
          <View
            style={{
              // inner progress bar height
              height: 20,
              // width based on progress percentage
              width: `${getProgressWidth(
                effortMinutes,
                effortTarget.targetCount
              )}%`,
              // colour based on progress level
              backgroundColor: getProgressColor(
                effortMinutes,
                effortTarget.targetCount
              ),
            }}
          />
        </View>
      ) : null}

      <TextInput
        // accessibility label for search field
        accessibilityLabel="Search applications"
        // controlled search value
        value={searchQuery}
        // update search state as user types
        onChangeText={setSearchQuery}
        // placeholder text when empty
        placeholder="Search by company, role or notes"
        // placeholder colour
        placeholderTextColor={mutedTextColor}
        style={{
          // thin input border
          borderWidth: 1,
          // border colour
          borderColor: borderColor,
          // inner spacing
          padding: 10,
          // spacing below search input
          marginBottom: 10,
          // rounded corners
          borderRadius: 8,
          // white background
          backgroundColor: "#FFFFFF",
          // main text colour
          color: textColor,
        }}
      />

      {/* date filters */}
      {/* label for from date input */}
      <Text style={{ color: textColor, marginBottom: 6 }}>From Date</Text>
      <TextInput
        // accessibility label for from date input
        accessibilityLabel="Filter from date"
        // controlled from date value
        value={fromDate}
        // update from date state
        onChangeText={setFromDate}
        // placeholder format hint
        placeholder="YYYY-MM-DD"
        // placeholder colour
        placeholderTextColor={mutedTextColor}
        style={{
          // thin input border
          borderWidth: 1,
          // border colour
          borderColor: borderColor,
          // inner spacing
          padding: 10,
          // spacing below input
          marginBottom: 10,
          // rounded corners
          borderRadius: 8,
          // white background
          backgroundColor: "#FFFFFF",
          // text colour
          color: textColor,
        }}
      />

      {/* label for to date input */}
      <Text style={{ color: textColor, marginBottom: 6 }}>To Date</Text>
      <TextInput
        // accessibility label for to date input
        accessibilityLabel="Filter to date"
        // controlled to date value
        value={toDate}
        // update to date state
        onChangeText={setToDate}
        // placeholder format hint
        placeholder="YYYY-MM-DD"
        // placeholder colour
        placeholderTextColor={mutedTextColor}
        style={{
          // thin input border
          borderWidth: 1,
          // border colour
          borderColor: borderColor,
          // inner spacing
          padding: 10,
          // spacing below input
          marginBottom: 10,
          // rounded corners
          borderRadius: 8,
          // white background
          backgroundColor: "#FFFFFF",
          // text colour
          color: textColor,
        }}
      />

      {/* status filter buttons container */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        {statuses.map((status) => (
          <View key={status} style={{ marginRight: 10, marginBottom: 10 }}>
            <Button
              // accessibility label changes depending on selected status option
              accessibilityLabel={
                status === "All"
                  ? "Filter by all statuses"
                  : `Filter by ${status}`
              }
              // show status text on button
              title={status}
              // update selected status when pressed
              onPress={() => setSelectedStatus(status)}
              // use primary brand colour
              color={primaryColor}
            />
          </View>
        ))}
      </View>

      <Button
        // accessibility label for add button
        accessibilityLabel="Add new application"
        // button text
        title="Add Application"
        // go to add application screen
        onPress={() => router.push("/add" as any)}
        // use primary brand colour
        color={primaryColor}
      />

      {/* spacing before applications list */}
      <View style={{ height: 20 }} />

      {/* show empty state if no applications match filters */}
      {filteredApplications.length === 0 ? (
        <Text style={{ color: mutedTextColor }}>No applications match your filters</Text>
      ) : (
        filteredApplications.map((item: any) => {
          // find the category linked to this application
          const category = context.categories.find(
            (cat: any) => cat.id === item.categoryId
          );

          return (
            <View
              // unique key for each application card
              key={item.id}
              style={{
                // thin card border
                borderWidth: 1,
                // border colour
                borderColor: borderColor,
                // thicker left border for category colour
                borderLeftWidth: 6,
                // use category colour or fallback grey
                borderLeftColor: category ? category.color : "#cccccc",
                // inner card spacing
                padding: 12,
                // space below each card
                marginBottom: 12,
                // white card background
                backgroundColor: cardColor,
                // rounded card corners
                borderRadius: 10,
              }}
            >
              {/* show category badge only if category exists */}
              {category && (
                <View
                  style={{
                    // place icon and text in a row
                    flexDirection: "row",
                    // vertically align icon and text
                    alignItems: "center",
                    // space below category row
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      // use category colour behind icon
                      backgroundColor: category.color,
                      // rounded icon badge corners
                      borderRadius: 6,
                      // padding around icon
                      padding: 5,
                      // space between icon and text
                      marginRight: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      // convert saved icon string into real icon name
                      name={getCategoryIcon(category.icon)}
                      // icon size
                      size={16}
                      // white icon colour
                      color="white"
                      // accessibility description for icon
                      accessibilityLabel={`${category.icon} icon`}
                    />
                  </View>
                  {/* category name */}
                  <Text style={{ fontWeight: "bold", color: textColor }}>{category.name}</Text>
                </View>
              )}

              {/* company name */}
              <Text style={{ color: textColor }}>Company: {item.company}</Text>
              {/* role name */}
              <Text style={{ color: textColor }}>Role: {item.role}</Text>
              {/* date applied */}
              <Text style={{ color: textColor }}>Date Applied: {item.dateApplied}</Text>
              {/* current status */}
              <Text style={{ color: textColor }}>Status: {item.currentStatus}</Text>
              {/* effort minutes */}
              <Text style={{ color: textColor }}>Effort Minutes: {item.effortMinutes}</Text>
              {/* salary expectation */}
              <Text style={{ color: textColor }}>Salary Expectation: {item.salaryExpectation}</Text>
              {/* category name or fallback */}
              <Text style={{ color: textColor }}>Category: {category ? category.name : "Unknown"}</Text>
              {/* notes text */}
              <Text style={{ color: textColor }}>Notes: {item.notes}</Text>

              {/* spacing before action buttons */}
              <View style={{ height: 10 }} />

              <Button
                // accessibility label for view button
                accessibilityLabel={`View application for ${item.company}`}
                // button text
                title="View"
                // go to application detail screen
                onPress={() => router.push(`/application/${item.id}` as any)}
                // use primary brand colour
                color={primaryColor}
              />

              {/* spacing between buttons */}
              <View style={{ height: 10 }} />

              <Button
                // accessibility label for delete button
                accessibilityLabel={`Delete application for ${item.company}`}
                // button text
                title="Delete"
                // delete this application
                onPress={() => handleDeleteApplication(item.id)}
                // use primary brand colour
                color={primaryColor}
              />
            </View>
          );
        })
      )}
    </ScrollView>
  );
}