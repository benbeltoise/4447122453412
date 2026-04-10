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
  const router = useRouter(); // nav
  const { id } = useLocalSearchParams(); // get applicatio id from URL
  const context = useContext(ApplicationContext); // access global state

  // loading state
  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
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
      <View style={{ padding: 20 }}>
        <Text>Application not found</Text>
        <View style={{ height: 10 }} />
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  // initialise the form's state with the existing applic data
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    application.categoryId
  );
  // error message state
  const [error, setError] = useState("");


  // save updated application
  async function handleSave() {
    setError("");

    // basic validation
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

    // check if status changed
    const statusChanged = status !== application.currentStatus;

    // update applic in db
    await db
      .update(applications)
      .set({
        company: company,
        role: role,
        dateApplied: dateApplied,
        effortMinutes: Number(effortMinutes),
        salaryExpectation: Number(salaryExpectation),
        categoryId: selectedCategoryId,
        currentStatus: status,
        notes: notes,
        updatedAt: now,
      })
      .where(eq(applications.id, application.id));

    // if status changed, log it in status history table
    if (statusChanged) {
      await db.insert(applicationStatusLogs).values({
        applicationId: application.id,
        status: status,
        changedAt: now,
      });
    }

    // refresh context data from DB
    await context.refreshUserData(context.currentUser.id);

    // navigate back to application detail screen
    router.replace(`/application/${application.id}` as any);
  }

  // html and css to render
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

      <Text>Category</Text>
      {context.categories.map((item: any) => (
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
      ))}

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