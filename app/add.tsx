import { ApplicationContext } from "@/app/_layout";
import { db } from "@/db/client";
import { applications, applicationStatusLogs } from "@/db/schema";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";

export default function AddScreen() {
  const router = useRouter();
  const context = useContext(ApplicationContext);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [dateApplied, setDateApplied] = useState("");
  const [effortMinutes, setEffortMinutes] = useState("");
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [status, setStatus] = useState("applied");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  async function handleAddApplication() {
    setError("");

    if (!company || !role || !dateApplied) {
      setError("Fill in company, role and date");
      return;
    }

    if (!effortMinutes || !salaryExpectation) {
      setError("Fill in effort minutes and salary");
      return;
    }

    if (context.categories.length === 0) {
      setError("No category available");
      return;
    }

    const now = new Date().toISOString();

    // insert application
    const inserted = await db
      .insert(applications)
      .values({
        userId: context.currentUser.id,
        company: company,
        role: role,
        dateApplied: dateApplied,
        effortMinutes: Number(effortMinutes),
        salaryExpectation: Number(salaryExpectation),
        categoryId: context.categories[0].id,
        currentStatus: status,
        notes: notes,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const newApp = inserted[0];

    // insert first status log
    await db.insert(applicationStatusLogs).values({
      applicationId: newApp.id,
      status: status,
      changedAt: now,
    });

    await context.refreshUserData(context.currentUser.id);

    router.replace("/(tabs)" as any);
  }

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
        placeholder="applied"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

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