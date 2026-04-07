import { ApplicationContext } from "@/app/_layout";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext } from "react";
import { Button, ScrollView, Text, View } from "react-native";

export default function ApplicationDetailScreen() {
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

  const logs = context.statusLogs.filter(
    (log: any) => log.applicationId === application.id
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Application Detail</Text>

      <Text>Company: {application.company}</Text>
      <Text>Role: {application.role}</Text>
      <Text>Date Applied: {application.dateApplied}</Text>
      <Text>Status: {application.currentStatus}</Text>
      <Text>Effort Minutes: {application.effortMinutes}</Text>
      <Text>Salary Expectation: {application.salaryExpectation}</Text>
      <Text>Category Id: {application.categoryId}</Text>
      <Text>Notes: {application.notes}</Text>

      <View style={{ height: 20 }} />

      <Text style={{ fontSize: 18, marginBottom: 10 }}>Status History</Text>

      {logs.length === 0 ? (
        <Text>No status history</Text>
      ) : (
        logs.map((log: any) => (
          <View
            key={log.id}
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <Text>Status: {log.status}</Text>
            <Text>Changed At: {log.changedAt}</Text>
          </View>
        ))
      )}

      <View style={{ height: 10 }} />

      <Button
        title="Edit Application"
        onPress={() => router.push(`/edit/${application.id}` as any)}
      />

      <View style={{ height: 10 }} />

      <Button title="Back" onPress={() => router.back()} />
    </ScrollView>
  );
}