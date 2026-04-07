import { ApplicationContext } from "@/app/_layout";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";

export default function CategoriesScreen() {
  const router = useRouter();
  const context = useContext(ApplicationContext);

  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState("");

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

  async function handleAddCategory() {
    setError("");

    if (!name || !color || !icon) {
      setError("Fill in all category fields");
      return;
    }

    await db.insert(categories).values({
      userId: context.currentUser.id,
      name: name,
      color: color,
      icon: icon,
      createdAt: new Date().toISOString(),
    });

    setName("");
    setColor("");
    setIcon("");

    await context.refreshUserData(context.currentUser.id);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Categories</Text>

      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Color</Text>
      <TextInput
        value={color}
        onChangeText={setColor}
        placeholder="blue"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      <Text>Icon</Text>
      <TextInput
        value={icon}
        onChangeText={setIcon}
        placeholder="briefcase"
        style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
      />

      {error ? (
        <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
      ) : null}

      <Button title="Add Category" onPress={handleAddCategory} />

      <View style={{ height: 20 }} />

      <Text style={{ fontSize: 18, marginBottom: 10 }}>Saved Categories</Text>

      {context.categories.length === 0 ? (
        <Text>No categories yet</Text>
      ) : (
        context.categories.map((item: any) => (
          <View
            key={item.id}
            style={{ borderWidth: 1, padding: 12, marginBottom: 10 }}
          >
            <Text>Name: {item.name}</Text>
            <Text>Color: {item.color}</Text>
            <Text>Icon: {item.icon}</Text>
            <Text>Id: {item.id}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}