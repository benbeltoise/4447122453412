// import global app context
import { ApplicationContext } from "@/app/_layout";
// import db
import { db } from "@/db/client";
// import tables from db
import { applications, applicationStatusLogs } from "@/db/schema";
// import nav
import { useRouter } from "expo-router";
// immport react hooks
import { useContext, useState } from "react";
// import ui components
import { Button, ScrollView, Text, TextInput, View } from "react-native";

export default function AddScreen() {
  const router = useRouter(); //nav
  const context = useContext(ApplicationContext); // access global app stae

  // form input states
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [dateApplied, setDateApplied] = useState("");
  const [effortMinutes, setEffortMinutes] = useState("");
  const [salaryExpectation, setSalaryExpectation] = useState("");

  // default status when creating a new application
  const [status, setStatus] = useState("applied");

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

  // function to add a new application
  async function handleAddApplication() {
    setError("");

    // basic form validation
    if (!company || !role || !dateApplied) {
      setError("Fill in company, role and date");
      return;
    }

    if (!effortMinutes || !salaryExpectation) {
      setError("Fill in effort minutes and salary");
      return;
    }

    if (!selectedCategoryId) {
      setError("Choose a category");
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
        effortMinutes: Number(effortMinutes),
        salaryExpectation: Number(salaryExpectation),
        categoryId: selectedCategoryId,
        currentStatus: status,
        notes: notes,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const newApp = inserted[0]; // get inserted applic

    // insert first status log entry
    await db.insert(applicationStatusLogs).values({
      applicationId: newApp.id,
      status: status,
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
        value={company}
        onChangeText={setCompany}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Role</Text>
      <TextInput
        value={role}
        onChangeText={setRole}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Date Applied</Text>
      <TextInput
        value={dateApplied}
        onChangeText={setDateApplied}
        placeholder="2026-04-05"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Effort Minutes</Text>
      <TextInput
        value={effortMinutes}
        onChangeText={setEffortMinutes}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Salary Expectation</Text>
      <TextInput
        value={salaryExpectation}
        onChangeText={setSalaryExpectation}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Status</Text>
      <TextInput
        value={status}
        onChangeText={setStatus}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Category</Text>
      {context.categories.length === 0 ? (
        <Text style={{ marginBottom: 12 }}>No categories available</Text>
      ) : (
        context.categories.map((item: any) => (
          <View key={item.id} style={{ marginBottom: 8 }}>
            <Button
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
        value={notes}
        onChangeText={setNotes}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      {error ? (
        <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
      ) : null}

      <Button title="Save" onPress={handleAddApplication} />

      <View style={{ height: 10 }} />

      <Button title="Back" onPress={() => router.back()} />
    </ScrollView>
  );
}