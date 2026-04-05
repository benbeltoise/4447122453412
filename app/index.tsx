import { ApplicationContext } from "@/app/_layout";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { Text, View } from "react-native";

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(ApplicationContext);

  useEffect(() => {
    if (!context) return;
    if (!context.isReady) return;

    if (context.currentUser) {
      router.replace("/(tabs)" as any);
    } else {
      router.replace("/login" as any);
    }
  }, [context, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}