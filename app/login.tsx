// Import global application context
import { ApplicationContext } from "@/app/_layout";

// Import login function
import { loginUser } from "@/auth/auth";

// Import navigation and link component
import { Link, useRouter } from "expo-router";

// Import React hooks
import { useContext, useState } from "react";

// Import React Native UI components
import { Button, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter(); // navigation
  const context = useContext(ApplicationContext); // access global app state

  // Input states (pre-filled with a demo account)
  const [email, setEmail] = useState("demo@student.com");
  const [password, setPassword] = useState("demo-password");

  // Error message state
  const [error, setError] = useState("");

  // Show loading screen if app not ready yet
  if (!context || !context.isReady) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Handle login button press
  async function handleLogin() {
    setError("");

    // Call login function
    const result = await loginUser(email, password);

    // If login returns an error
    if (result.error) {
      setError(result.error);
      return;
    }

    // If no user returned 
    if (!result.user) {
      setError("Login failed");
      return;
    }

    // Set current user in global context
    context.setCurrentUser(result.user);

    // Load user-related data 
    await context.refreshUserData(result.user.id);

    // Navigate to main tab
    router.replace("/(tabs)" as any);
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      {error ? (
        <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
      ) : null}

      <Button title="Login" onPress={handleLogin} />

      <View style={{ marginTop: 20 }}>
        <Link href={"/register" as any}>Go to Register</Link>
      </View>
    </View>
  );
}