// import global app context
import { ApplicationContext } from "@/app/_layout";
// import db
import { db } from "@/db/client";
// import tables from db
import { applications, applicationStatusLogs } from "@/db/schema";
// import nav
import { useRouter } from "expo-router";
// import react hooks
import { useContext, useState } from "react";
// import ui components
import { Button, ScrollView, Text, TextInput, View } from "react-native";

export default function AddScreen() {
  // get router for screen navigation
  const router = useRouter(); // nav
  // get access to global app state
  const context = useContext(ApplicationContext); // access global app state

  // form input states
  // company input
  const [company, setCompany] = useState("");
  // role input
  const [role, setRole] = useState("");
  // date applied input
  const [dateApplied, setDateApplied] = useState("");
  // salary expectation input
  const [salaryExpectation, setSalaryExpectation] = useState("");
  // effort hours input
  const [effortHours, setEffortHours] = useState("");
  // effort minutes input
  const [effortMins, setEffortMins] = useState("");

  // selected status option
  // selected built in status option
  const [selectedStatusOption, setSelectedStatusOption] = useState("applied");

  // custom status text
  // custom status input when custom is selected
  const [customStatus, setCustomStatus] = useState("");

  // notes input
  // notes input
  const [notes, setNotes] = useState("");

  // selected category (default to the first category if it exists)
  // selected category id
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    context?.categories?.length ? context.categories[0].id : null
  );

  // error message
  // store validation error message
  const [error, setError] = useState("");

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
  // border colour for cards and inputs
  const borderColor = "#D1D5DB";

  // loading state if context is loading
  if (!context || !context.currentUser) {
    return (
      // loading container
      <View style={{ padding: 20, backgroundColor, flex: 1 }}>
        {/* loading text */}
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  // final status value to save
  // use custom status if custom was selected, otherwise use selected option
  const finalStatus =
    selectedStatusOption === "custom" ? customStatus : selectedStatusOption;

  // function to add a new application
  async function handleAddApplication() {
    // clear old error before validation
    setError("");

    // basic form validation
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

    if (!finalStatus.trim()) {
      setError("Choose or enter a status");
      return;
    }

    // current timestamp for created and updated fields
    const now = new Date().toISOString();

    // insert new application into db
    const inserted = await db
      .insert(applications)
      .values({
        // link application to current user
        userId: context.currentUser.id,
        // save company value
        company: company,
        // save role value
        role: role,
        // save application date
        dateApplied: dateApplied,
        // combine hours and minutes into total effort minutes
        effortMinutes: Number(effortHours || 0) * 60 + Number(effortMins || 0),
        // save salary expectation as a number
        salaryExpectation: Number(salaryExpectation),
        // save selected category id
        categoryId: selectedCategoryId,
        // save current status
        currentStatus: finalStatus.trim(),
        // save notes text
        notes: notes,
        // save created timestamp
        createdAt: now,
        // save updated timestamp
        updatedAt: now,
      })
      .returning();

    // get inserted application
    const newApp = inserted[0]; // get inserted application

    // insert first status log entry
    await db.insert(applicationStatusLogs).values({
      // link status log to the new application
      applicationId: newApp.id,
      // save first status value
      status: finalStatus.trim(),
      // save time of status creation
      changedAt: now,
    });

    // refresh context data from the db
    await context.refreshUserData(context.currentUser.id);

    // go back to main tabs screen
    router.replace("/(tabs)" as any);
  }

  // html & css for render
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

      {/* add form card */}
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
          Add Application
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

        {/* effort inputs row */}
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

        {/* applied status button */}
        <View style={{ marginBottom: 8 }}>
          <Button
            accessibilityLabel="Set status to applied"
            title={
              selectedStatusOption === "applied"
                ? "Selected: applied"
                : "applied"
            }
            onPress={() => setSelectedStatusOption("applied")}
            color={primaryColor}
          />
        </View>

        {/* interviewing status button */}
        <View style={{ marginBottom: 8 }}>
          <Button
            accessibilityLabel="Set status to interviewing"
            title={
              selectedStatusOption === "interviewing"
                ? "Selected: interviewing"
                : "interviewing"
            }
            onPress={() => setSelectedStatusOption("interviewing")}
            color={primaryColor}
          />
        </View>

        {/* rejected status button */}
        <View style={{ marginBottom: 8 }}>
          <Button
            accessibilityLabel="Set status to rejected"
            title={
              selectedStatusOption === "rejected"
                ? "Selected: rejected"
                : "rejected"
            }
            onPress={() => setSelectedStatusOption("rejected")}
            color={primaryColor}
          />
        </View>

        {/* custom status button */}
        <View style={{ marginBottom: 8 }}>
          <Button
            accessibilityLabel="Set status to custom"
            title={
              selectedStatusOption === "custom"
                ? "Selected: custom"
                : "custom"
            }
            onPress={() => setSelectedStatusOption("custom")}
            color={primaryColor}
          />
        </View>

        {/* custom status input shown only when custom is selected */}
        {selectedStatusOption === "custom" ? (
          <TextInput
            accessibilityLabel="Custom Status"
            value={customStatus}
            onChangeText={setCustomStatus}
            placeholder="Enter custom status"
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
        ) : null}

        {/* category label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Category</Text>
        {context.categories.length === 0 ? (
          <Text style={{ marginBottom: 12, color: mutedTextColor }}>
            No categories available
          </Text>
        ) : (
          context.categories.map((item: any) => (
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
          ))
        )}

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
          accessibilityLabel="Save application"
          // button text
          title="Save"
          // save the new application
          onPress={handleAddApplication}
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