import { ApplicationContext } from "@/app/_layout";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { Button, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const context = useContext(ApplicationContext);

  useEffect(() => {
    if (!context) return;
    if (!context.isReady) return;

    if (!context.currentUser) {
      router.replace("/login" as any);
    }
  }, [context, router]);

  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  async function handleDeleteProfile() {
    await context.deleteProfile();
    router.replace("/login" as any);
  }

  function handleLogout() {
    context.logout();
    router.replace("/login" as any);
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Profile</Text>
      <Text>Name: {context.currentUser.name}</Text>
      <Text style={{ marginBottom: 20 }}>Email: {context.currentUser.email}</Text>

      <Button title="Logout" onPress={handleLogout} />
      <View style={{ height: 10 }} />
      <Button title="Delete Profile" onPress={handleDeleteProfile} />
    </View>
  );
}