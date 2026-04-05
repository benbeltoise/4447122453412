import { ApplicationContext } from "@/app/_layout";
import { loginUser } from "@/auth/auth";
import { Link, useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const context = useContext(ApplicationContext);

  const [email, setEmail] = useState("demo@student.com");
  const [password, setPassword] = useState("demo-password");
  const [error, setError] = useState("");

  if (!context || !context.isReady) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  async function handleLogin() {
    setError("");

    const result = await loginUser(email, password);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (!result.user) {
      setError("Login failed");
      return;
    }

    context.setCurrentUser(result.user);
    await context.refreshUserData(result.user.id);
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