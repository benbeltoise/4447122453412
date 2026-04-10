// Import global application context
import { ApplicationContext } from "@/app/_layout";

// Import register function 
import { registerUser } from "@/auth/auth";

// Import navigation and link component
import { Link, useRouter } from "expo-router";

// Import React hooks
import { useContext, useState } from "react";

// Import React Native UI components
import { Button, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
  const router = useRouter(); // navigation
  const context = useContext(ApplicationContext); // access global app state

  // Form input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  // Handle register button press
  async function handleRegister() {
    setError("");

    // Call register function
    const result = await registerUser(name, email, password);

    // If registration returns an error
    if (result.error) {
      setError(result.error);
      return;
    }

    // If no user returned 
    if (!result.user) {
      setError("Register failed");
      return;
    }

    // Set current user in global context
    context.setCurrentUser(result.user);

    // Load user-related data 
    await context.refreshUserData(result.user.id);

    // Navigate to main app tab
    router.replace("/(tabs)" as any);
  }

  // html and css to render
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Register</Text>

      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

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

      <Button title="Register" onPress={handleRegister} />

      <View style={{ marginTop: 20 }}>
        <Link href={"/login" as any}>Go to Login</Link>
      </View>
    </View>
  );
}