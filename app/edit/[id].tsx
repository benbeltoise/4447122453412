import { ApplicationContext } from "@/app/_layout";
import { db } from "@/db/client";
import { applications, applicationStatusLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";

export default function EditApplicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const context = useContext(ApplicationContext);

  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const application = context.applications.find(
    (item: any) => String(item.id) === String(id)
  );

  if (!application) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Application not found</Text>
        <View style={{ height: 10 }} />
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role);
  const [dateApplied, setDateApplied] = useState(application.dateApplied);
  const [effortMinutes, setEffortMinutes] = useState(
    String(application.effortMinutes)
  );
  const [salaryExpectation, setSalaryExpectation] = useState(
    String(application.salaryExpectation)
  );
  const [status, setStatus] = useState(application.currentStatus);
  const [notes, setNotes] = useState(application.notes || "");
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");

    if (!company || !role || !dateApplied) {
      setError("Fill in company, role and date");
      return;
    }

    if (!effortMinutes || !salaryExpectation) {
      setError("Fill in effort minutes and salary");
      return;
    }

    const now = new Date().toISOString();
    const statusChanged = status !== application.currentStatus;

    await db
      .update(applications)
      .set({
        company: company,
        role: role,
        dateApplied: dateApplied,
        effortMinutes: Number(effortMinutes),
        salaryExpectation: Number(salaryExpectation),
        currentStatus: status,
        notes: notes,
        updatedAt: now,
      })
      .where(eq(applications.id, application.id));

    if (statusChanged) {
      await db.insert(applicationStatusLogs).values({
        applicationId: application.id,
        status: status,
        changedAt: now,
      });
    }

    await context.refreshUserData(context.currentUser.id);
    router.replace(`/application/${application.id}` as any);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Edit Application</Text>

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

      <Text>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      {error ? (
        <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
      ) : null}

      <Button title="Save Changes" onPress={handleSave} />

      <View style={{ height: 10 }} />

      <Button title="Back" onPress={() => router.back()} />
    </ScrollView>
  );
}