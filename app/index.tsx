// Import global application context
import { ApplicationContext } from "@/app/_layout";

// Import navigation
import { useRouter } from "expo-router";

// Import React hooks
import { useContext, useEffect } from "react";

// Import React Native UI components
import { Text, View } from "react-native";

export default function IndexScreen() {
  const router = useRouter(); // navigation
  const context = useContext(ApplicationContext); // access global app state

  // Runs when app loads or context changes
  useEffect(() => {
    if (!context) return;
    if (!context.isReady) return;

    // If user is logged in, go to main tabs screen
    if (context.currentUser) {
      router.replace("/(tabs)" as any);
    } else {
      // If not logged in, go to login screen
      router.replace("/login" as any);
    }
  }, [context, router]);

  return (
    // loading screen
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}