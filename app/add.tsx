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
  const router = useRouter(); // nav
  const context = useContext(ApplicationContext); // access global app state

  // form input states
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [dateApplied, setDateApplied] = useState("");
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [effortHours, setEffortHours] = useState("");
  const [effortMins, setEffortMins] = useState("");

  // selected status option
  const [selectedStatusOption, setSelectedStatusOption] = useState("applied");

  // custom status text
  const [customStatus, setCustomStatus] = useState("");

  // notes input
  const [notes, setNotes] = useState("");

  // selected category (default to the first category if it exists)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    context?.categories?.length ? context.categories[0].id : null
  );

  // error message
  const [error, setError] = useState("");

  // loading state if context is loading
  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // final status value to save
  const finalStatus =
    selectedStatusOption === "custom" ? customStatus : selectedStatusOption;

  // function to add a new application
  async function handleAddApplication() {
    setError("");

    // basic form validation
    if (!company || !role || !dateApplied) {
      setError("Fill in company, role and date");
      return;
    }

    if (
      (effortHours === "" && effortMins === "") ||
      !salaryExpectation
    ) {
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

    const now = new Date().toISOString();

    // insert new application into db
    const inserted = await db
      .insert(applications)
      .values({
        userId: context.currentUser.id,
        company: company,
        role: role,
        dateApplied: dateApplied,
        effortMinutes: Number(effortHours || 0) * 60 + Number(effortMins || 0),
        salaryExpectation: Number(salaryExpectation),
        categoryId: selectedCategoryId,
        currentStatus: finalStatus.trim(),
        notes: notes,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const newApp = inserted[0]; // get inserted application

    // insert first status log entry
    await db.insert(applicationStatusLogs).values({
      applicationId: newApp.id,
      status: finalStatus.trim(),
      changedAt: now,
    });

    // refresh context data from the db
    await context.refreshUserData(context.currentUser.id);

    // go back to main tabs screen
    router.replace("/(tabs)" as any);
  }

  // html & css for render
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Add Application</Text>

      <Text>Company</Text>
      <TextInput
        accessibilityLabel="Company"
        value={company}
        onChangeText={setCompany}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Role</Text>
      <TextInput
        accessibilityLabel="Role"
        value={role}
        onChangeText={setRole}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Date Applied</Text>
      <TextInput
        accessibilityLabel="Date Applied"
        value={dateApplied}
        onChangeText={setDateApplied}
        placeholder="2026-04-05"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Effort</Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text>Hours</Text>
          <TextInput
            accessibilityLabel="Effort hours"
            value={effortHours}
            onChangeText={setEffortHours}
            keyboardType="numeric"
            style={{ borderWidth: 1, padding: 10 }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text>Minutes</Text>
          <TextInput
            accessibilityLabel="Effort minutes"
            value={effortMins}
            onChangeText={setEffortMins}
            keyboardType="numeric"
            style={{ borderWidth: 1, padding: 10 }}
          />
        </View>
      </View>

      <Text>Salary Expectation</Text>
      <TextInput
        accessibilityLabel="Salary Expectation"
        value={salaryExpectation}
        onChangeText={setSalaryExpectation}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Status</Text>

      <View style={{ marginBottom: 8 }}>
        <Button
          accessibilityLabel="Set status to applied"
          title={
            selectedStatusOption === "applied"
              ? "Selected: applied"
              : "applied"
          }
          onPress={() => setSelectedStatusOption("applied")}
        />
      </View>

      <View style={{ marginBottom: 8 }}>
        <Button
          accessibilityLabel="Set status to interviewing"
          title={
            selectedStatusOption === "interviewing"
              ? "Selected: interviewing"
              : "interviewing"
          }
          onPress={() => setSelectedStatusOption("interviewing")}
        />
      </View>

      <View style={{ marginBottom: 8 }}>
        <Button
          accessibilityLabel="Set status to rejected"
          title={
            selectedStatusOption === "rejected"
              ? "Selected: rejected"
              : "rejected"
          }
          onPress={() => setSelectedStatusOption("rejected")}
        />
      </View>

      <View style={{ marginBottom: 8 }}>
        <Button
          accessibilityLabel="Set status to custom"
          title={
            selectedStatusOption === "custom"
              ? "Selected: custom"
              : "custom"
          }
          onPress={() => setSelectedStatusOption("custom")}
        />
      </View>

      {selectedStatusOption === "custom" ? (
        <TextInput
          accessibilityLabel="Custom Status"
          value={customStatus}
          onChangeText={setCustomStatus}
          placeholder="Enter custom status"
          style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
        />
      ) : null}

      <Text>Category</Text>
      {context.categories.length === 0 ? (
        <Text style={{ marginBottom: 12 }}>No categories available</Text>
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
            />
          </View>
        ))
      )}

      <Text>Notes</Text>
      <TextInput
        accessibilityLabel="Notes"
        value={notes}
        onChangeText={setNotes}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      {error ? (
        <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
      ) : null}

      <Button
        accessibilityLabel="Save application"
        title="Save"
        onPress={handleAddApplication}
      />

      <View style={{ height: 10 }} />

      <Button
        accessibilityLabel="Go back"
        title="Back"
        onPress={() => router.back()}
      />
    </ScrollView>
  );
}