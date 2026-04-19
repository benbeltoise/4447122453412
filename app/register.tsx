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
  // get router for screen navigation
  const router = useRouter(); // navigation
  // get access to global app state
  const context = useContext(ApplicationContext); // access global app state

  // Form input states
  // name input
  const [name, setName] = useState("");
  // email input
  const [email, setEmail] = useState("");
  // password input
  const [password, setPassword] = useState("");

  // Error message state
  // store register error message
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

  // Handle register button press
  async function handleRegister() {
    // clear old error before register attempt
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
    // main page container
    <View style={{ flex: 1, padding: 20, justifyContent: "center", backgroundColor }}>
      {/* register card */}
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
          job application tracker
        </Text>

        {/* page heading */}
        <Text style={{ fontSize: 24, marginBottom: 20, color: textColor }}>Register</Text>

        {/* name label */}
        <Text style={{ color: textColor, marginBottom: 6 }}>Name</Text>
        <TextInput
          accessibilityLabel="Name"
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor={mutedTextColor}
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

        {/* show error message if register fails */}
        {error ? (
          <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
        ) : null}

        {/* register button */}
        <Button title="Register" onPress={handleRegister} color={primaryColor} />

        {/* login link container */}
        <View style={{ marginTop: 20 }}>
          <Link href={"/login" as any} style={{ color: primaryColor }}>
            Go to Login
          </Link>
        </View>
      </View>
    </View>
  );
}