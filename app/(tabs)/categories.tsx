// import the global app context
import { ApplicationContext } from "@/app/_layout";
// import database instance
import { db } from "@/db/client";
// import categories table from db
import { categories } from "@/db/schema";
// import where condition for queries
import { eq } from "drizzle-orm";
// router for navigation
import { useRouter } from "expo-router";
// React hooks
import { useContext, useEffect, useState } from "react";
// ui componenets
import { Button, ScrollView, Text, TextInput, View } from "react-native";

// categories screen
export default function CategoriesScreen() {
  const router = useRouter(); //navigation
  const context = useContext(ApplicationContext); //get to global state

  // form inputs
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");
  // erroe message
  const [error, setError] = useState("");
  // store id of category being edited (null = add mode)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // runs on loading and when context changes
  useEffect(() => {
    if (!context) return;
    if (!context.isReady) return;

    // redirect to login if no use is logged in
    if (!context.currentUser) {
      router.replace("/login" as any);
    }
  }, [context, router]);

  // loading state while context isnt ready
  if (!context || !context.currentUser) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // saving - used for both adding and editing categories
  async function handleSaveCategory() {
    setError("");

    // basic checks
    if (!name || !color || !icon) {
      setError("Fill in all category fields");
      return;
    }

    // if editing, update exisitng category
    if (editingCategoryId) {
      await db
        .update(categories)
        .set({
          name: name,
          color: color,
          icon: icon,
        })
        .where(eq(categories.id, editingCategoryId));
    } else {
      // otherwise, create a new category
      await db.insert(categories).values({
        userId: context.currentUser.id,
        name: name,
        color: color,
        icon: icon,
        createdAt: new Date().toISOString(),
      });
    }

    // reset form
    setName("");
    setColor("");
    setIcon("");
    setEditingCategoryId(null);

    // reload data from db into context
    await context.refreshUserData(context.currentUser.id);
  }

  // when clicking edit, populate the form with the selected category
  function handleEditCategory(item: any) {
    setName(item.name);
    setColor(item.color);
    setIcon(item.icon);
    setEditingCategoryId(item.id);
    setError("");
  }

  // delete categories
  async function handleDeleteCategory(id: number) {
    await db.delete(categories).where(eq(categories.id, id));

    if (editingCategoryId === id) {
      setName("");
      setColor("");
      setIcon("");
      setEditingCategoryId(null);
      setError("");
    }

    await context.refreshUserData(context.currentUser.id);
  }

  // html & css to return
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

      <Button
        title={editingCategoryId ? "Save Category" : "Add Category"}
        onPress={handleSaveCategory}
      />

      {editingCategoryId ? (
        <>
          <View style={{ height: 10 }} />
          <Button
            title="Cancel Edit"
            onPress={() => {
              setName("");
              setColor("");
              setIcon("");
              setEditingCategoryId(null);
              setError("");
            }}
          />
        </>
      ) : null}

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
            <View style={{ height: 10 }} />
            <Button title="Edit" onPress={() => handleEditCategory(item)} />
            <View style={{ height: 10 }} />
            <Button title="Delete" onPress={() => handleDeleteCategory(item.id)} />
          </View>
        ))
      )}
    </ScrollView>
  );
}