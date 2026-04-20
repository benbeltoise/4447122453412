// Import global application context
import { ApplicationContext } from "@/app/_layout";
// Import database instance
import { db } from "@/db/client";
// Import tables for applications and status logs
import { applications, applicationStatusLogs } from "@/db/schema";
// Import where condition helper for DB queries
import { eq } from "drizzle-orm";
// Import navigation + route params
import { useLocalSearchParams, useRouter } from "expo-router";
// Import React hooks
import { useContext, useState } from "react";
// Import React Native UI components
import { Button, ScrollView, Text, TextInput, View } from "react-native";

export default function EditApplicationScreen() {
  // get router for screen navigation
  const router = useRouter(); // nav
  // get application id from route params
  const { id } = useLocalSearchParams(); // get applicatio id from URL
  // get access to global app state
  const context = useContext(ApplicationContext); // access global state

  // loading state
  if (!context || !context.currentUser) {
    return (
      // loading container
      <View style={{ padding: 20 }}>
        {/* loading text */}
        <Text>Loading...</Text>
      </View>
    );
  }

  // find the applicaiton to edit from the context
  const application = context.applications.find(
    (item: any) => String(item.id) === String(id)
  );

  // if applic not found, show message
  if (!application) {
    return (
      // not found container
      <View style={{ padding: 20 }}>
        {/* not found text */}
        <Text>Application not found</Text>
        {/* spacing before button */}
        <View style={{ height: 10 }} />
        <Button
          accessibilityLabel="Go back"
          title="Back"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  // initialise the form's state with the existing applic data
  // company input
  const [company, setCompany] = useState(application.company);
  // role input
  const [role, setRole] = useState(application.role);
  // date applied input
  const [dateApplied, setDateApplied] = useState(application.dateApplied);
  // salary expectation input
  const [salaryExpectation, setSalaryExpectation] = useState(
    String(application.salaryExpectation)
  );
  // status input
  const [status, setStatus] = useState(application.currentStatus);
  // notes input
  const [notes, setNotes] = useState(application.notes || "");
  // selected category id
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    application.categoryId
  );
  // error message state
  const [error, setError] = useState("");

  // simple app colours
  // page background colour
  const backgroundColor = "#F7F9FC";
  // card background colour
  const cardColor = "#FFFFFF";
  // main brand colour
  const primaryColor = "#2e6fed";
  // main text colour
  const textColor = "#1F2937";
  // muted text colour
  const mutedTextColor = "#6B7280";
  // border colour for cards and inputs
  const borderColor = "#D1D5DB";

  // splitting effortMInutes into hours and minutes for easier input for the usre
  // split existing minutes into hours + minutes
  const initialMinutes = application.effortMinutes || 0;
  // effort hours input
  const [effortHours, setEffortHours] = useState(
    String(Math.floor(initialMinutes / 60))
  );
  // effort minutes input
  const [effortMins, setEffortMins] = useState(
    String(initialMinutes % 60)
  );

  // save updated application
  async function handleSave() {
    // clear previous error
    setError("");

    // basic validation
    if (!company || !role || !dateApplied) {
      setError("Fill in company, role and date");
      return;
    }

    if ((effortHours === "" && effortMins === "") || !salaryExpectation) {
      setError("Fill in effort minutes and salary");
      return;
    }

    if (!selectedCategoryId) {
      setError("Choose a category");
      return;
    }

    // current timestamp for update and status log
    const now = new Date().toISOString();

    // check if status changed
    const statusChanged = status !== application.currentStatus;

    // update applic in db
    await db
      .update(applications)
      .set({
        // updated company value
        company: company,
        // updated role value
        role: role,
        // updated application date
        dateApplied: dateApplied,
        // combine hours and minutes into total minutes
        effortMinutes: Number(effortHours || 0) * 60 + Number(effortMins || 0),
        // updated salary expectation
        salaryExpectation: Number(salaryExpectation),
        // updated category id
        categoryId: selectedCategoryId,
        // updated current status
        currentStatus: status,
        // updated notes
        notes: notes,
        // save updated timestamp
        updatedAt: now,
      })
      // only update the selected application
      .where(eq(applications.id, application.id));

    // if status changed, log it in status history table
    if (statusChanged) {
      await db.insert(applicationStatusLogs).values({
        // link log to this application
        applicationId: application.id,
        // save new status value
        status: status,
        // save time of status change
        changedAt: now,
      });
    }

    // refresh context data from DB
    await context.refreshUserData(context.currentUser.id);

    // navigate back to application detail screen
    router.replace(`/application/${application.id}` as any);
  }

  // render
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

      {/* edit form card */}
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
          Edit Application
        </Text>

        {/* company label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Company</Text>
        <TextInput
          accessibilityLabel="Company"
          value={company}
          onChangeText={setCompany}
          placeholder="Company"
          placeholderTextColor={mutedTextColor}
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // spacing below input
            marginBottom: 12,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* role label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Role</Text>
        <TextInput
          accessibilityLabel="Role"
          value={role}
          onChangeText={setRole}
          placeholder="Role"
          placeholderTextColor={mutedTextColor}
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // spacing below input
            marginBottom: 12,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* date applied label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Date Applied</Text>
        <TextInput
          accessibilityLabel="Date Applied"
          value={dateApplied}
          onChangeText={setDateApplied}
          placeholder="2026-04-05"
          placeholderTextColor={mutedTextColor}
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // spacing below input
            marginBottom: 12,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* effort label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Effort</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            {/* hours label */}
            <Text style={{ color: textColor, marginBottom: 6 }}>Hours</Text>
            <TextInput
              accessibilityLabel="Effort hours"
              value={effortHours}
              onChangeText={setEffortHours}
              keyboardType="numeric"
              placeholder="Hours"
              placeholderTextColor={mutedTextColor}
              style={{
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

          <View style={{ flex: 1 }}>
            {/* minutes label */}
            <Text style={{ color: textColor, marginBottom: 6 }}>Minutes</Text>
            <TextInput
              accessibilityLabel="Effort minutes"
              value={effortMins}
              onChangeText={setEffortMins}
              keyboardType="numeric"
              placeholder="Minutes"
              placeholderTextColor={mutedTextColor}
              style={{
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
        </View>

        {/* salary label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>
          Salary Expectation
        </Text>
        <TextInput
          accessibilityLabel="Salary Expectation"
          value={salaryExpectation}
          onChangeText={setSalaryExpectation}
          keyboardType="numeric"
          placeholder="Salary"
          placeholderTextColor={mutedTextColor}
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // spacing below input
            marginBottom: 12,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* status label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Status</Text>
        <TextInput
          accessibilityLabel="Status"
          value={status}
          onChangeText={setStatus}
          placeholder="Status"
          placeholderTextColor={mutedTextColor}
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // spacing below input
            marginBottom: 12,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* category label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Category</Text>
        {context.categories.map((item: any) => (
          <View key={item.id} style={{ marginBottom: 8 }}>
            <Button
              accessibilityLabel={`Select category ${item.name}`}
              title={
                selectedCategoryId === item.id
                  ? `Selected: ${item.name}`
                  : item.name
              }
              onPress={() => setSelectedCategoryId(item.id)}
              color={primaryColor}
            />
          </View>
        ))}

        {/* notes label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Notes</Text>
        <TextInput
          accessibilityLabel="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes"
          placeholderTextColor={mutedTextColor}
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // spacing below input
            marginBottom: 12,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* show error message when validation fails */}
        {error ? (
          <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
        ) : null}

        <Button
          // accessibility label for save button
          accessibilityLabel="Save application changes"
          // button text
          title="Save Changes"
          // save updated application
          onPress={handleSave}
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
      </View>
    </ScrollView>
  );
}