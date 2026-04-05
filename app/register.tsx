import { ApplicationContext } from "@/app/_layout";
import { registerUser } from "@/auth/auth";
import { Link, useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const context = useContext(ApplicationContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!context || !context.isReady) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  async function handleRegister() {
    setError("");

    const result = await registerUser(name, email, password);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (!result.user) {
      setError("Register failed");
      return;
    }

    context.setCurrentUser(result.user);
    await context.refreshUserData(result.user.id);
    router.replace("/(tabs)" as any);
  }

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