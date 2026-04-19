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
  // get router for screen navigation
  const router = useRouter(); // navigation
  // get access to global app state
  const context = useContext(ApplicationContext); // access global app state

  // Input states (pre-filled with a demo account)
  // email input
  const [email, setEmail] = useState("demo@student.com");
  // password input
  const [password, setPassword] = useState("demouser");

  // Error message state
  // store login error message
  const [error, setError] = useState("");

  // app colours
  // page background colour
  const backgroundColor = "#F7F9FC";
  // card background colour
  const cardColor = "#FFFFFF";
  // main brand colour
  const primaryColor = "#2F6FED";
  // main text colour
  const textColor = "#1F2937";
  // muted text colour
  const mutedTextColor = "#6B7280";
  // border colour for card and inputs
  const borderColor = "#D1D5DB";

  // Show loading screen if app not ready yet
  if (!context || !context.isReady) {
    return (
      // loading screen container
      <View style={{ flex: 1, padding: 20, justifyContent: "center", backgroundColor }}>
        {/* loading text */}
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  // Handle login button press
  async function handleLogin() {
    // clear old error before login attempt
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
    // main page container
    <View style={{ flex: 1, padding: 20, justifyContent: "center", backgroundColor }}>
      {/* login card */}
      <View
        style={{
          // card background colour
          backgroundColor: cardColor,
          // thin border around card
          borderWidth: 1,
          // border colour
          borderColor: borderColor,
          // inner spacing
          padding: 20,
          // rounded corners
          borderRadius: 12,
        }}
      >
        {/* app brand title */}
        <Text
          style={{
            // title size
            fontSize: 30,
            // small spacing below title
            marginBottom: 4,
            // brand colour
            color: primaryColor,
            // bold title text
            fontWeight: "bold",
            // centre align title
            textAlign: "center",
          }}
        >
          Appli
        </Text>

        {/* app subtitle */}
        <Text
          style={{
            // subtitle size
            fontSize: 16,
            // spacing below subtitle
            marginBottom: 20,
            // muted text colour
            color: mutedTextColor,
            // centre align subtitle
            textAlign: "center",
          }}
        >
          Job Application Tracker
        </Text>

        {/* page heading */}
        <Text style={{ fontSize: 24, marginBottom: 20, color: textColor }}>Login</Text>

        {/* email label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Email</Text>
        <TextInput
          accessibilityLabel="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={mutedTextColor}
          autoCapitalize="none"
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // spacing below input
            marginBottom: 12,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* password label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Password</Text>
        <TextInput
          accessibilityLabel="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={mutedTextColor}
          secureTextEntry
          style={{
            // thin input border
            borderWidth: 1,
            // border colour
            borderColor: borderColor,
            // inner spacing
            padding: 10,
            // spacing below input
            marginBottom: 12,
            // rounded corners
            borderRadius: 8,
            // white background
            backgroundColor: "#FFFFFF",
            // text colour
            color: textColor,
          }}
        />

        {/* show error message if login fails */}
        {error ? (
          <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
        ) : null}

        {/* login button */}
        <Button title="Login" onPress={handleLogin} color={primaryColor} />

        {/* register link container */}
        <View style={{ marginTop: 20 }}>
          <Link href={"/register" as any} style={{ color: primaryColor }}>
            Go to Register
          </Link>
        </View>
      </View>
    </View>
  );
}