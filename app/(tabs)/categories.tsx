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




// CLAUDE.AI SECTION 1. LINK TO CHAT: https://claude.ai/share/bc07d173-4d9d-42c0-a957-cc5156f3c698

import { TouchableOpacity } from "react-native";

// icons from expo vector icons
import { MaterialCommunityIcons } from "@expo/vector-icons";

// map a saved icon string to a MaterialCommunityIcons name, with a fallback
function getCategoryIcon(icon: string): React.ComponentProps<typeof MaterialCommunityIcons>["name"] {
  const knownIcons: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
    briefcase: "briefcase",
    home: "home",
    car: "car",
    food: "food",
    heart: "heart",
    star: "star",
    school: "school",
    shopping: "shopping",
    gym: "dumbbell",
    travel: "airplane",
    money: "cash",
    phone: "phone",
  };
  // return the matching icon or a fallback tag icon
  return knownIcons[icon.toLowerCase()] ?? "tag";
}

// END OF CLAUDE.AI SECTION 1

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

  // CLAUDE.AI SECTION 2. LINK TO CHAT: https://claude.ai/share/bc07d173-4d9d-42c0-a957-cc5156f3c698
  // fixed list of selectable colours
  const colorOptions = ["blue", "green", "purple", "orange", "red", "teal"];

  // fixed list of selectable icons with their MaterialCommunityIcons names
  const iconOptions: { label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"] }[] = [
    { label: "briefcase",     icon: "briefcase"      },
    { label: "folder",        icon: "folder"         },
    { label: "code",          icon: "code-tags"      },
    { label: "desktop",       icon: "desktop-classic"},
    { label: "server",        icon: "server"         },
    { label: "school",        icon: "school"         },
    { label: "graph",         icon: "chart-line"     },
    { label: "laptop",        icon: "laptop"         },
  ];

  // END OF CLAUDE.AI SECTION 2

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

      {/*CALUDE AI SECTION 3 LINK TO CHAT: https://claude.ai/share/bc07d173-4d9d-42c0-a957-cc5156f3c698 */} 
      <Text>Color</Text>
      {/* selectable colour swatches — replaces the colour text input */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
        {colorOptions.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setColor(c)}
            accessibilityLabel={`Select colour ${c}`}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              backgroundColor: c,
              marginRight: 10,
              marginBottom: 10,
              // thick border when selected, thin when not
              borderWidth: color === c ? 3 : 1,
              borderColor: color === c ? "#000000" : "#cccccc",
            }}
          />
        ))}
      </View>

      <Text>Icon</Text>
      {/* selectable icon buttons — replaces the icon text input */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
        {iconOptions.map((option) => (
          <TouchableOpacity
            key={option.label}
            onPress={() => setIcon(option.label)}
            accessibilityLabel={`Select icon ${option.label}`}
            style={{
              borderRadius: 6,
              padding: 8,
              marginRight: 10,
              marginBottom: 10,
              // filled background when selected, plain border when not
              backgroundColor: icon === option.label ? (color || "#888888") : "transparent",
              borderWidth: icon === option.label ? 0 : 1,
              borderColor: "#cccccc",
            }}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={24}
              // white icon on filled background, dark icon on plain background
              color={icon === option.label ? "white" : "#333333"}
            />
          </TouchableOpacity>
        ))}
      </View>

        {/*END OF CLAUDE.AI SECTION 3 */} 
      

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
          // CLAUDE.AI SECTION 4: LINK TO CHAT: https://claude.ai/share/bc07d173-4d9d-42c0-a957-cc5156f3c698
          <View
            key={item.id}
            style={{
              borderWidth: 1,
              borderLeftWidth: 6,
              // use the saved colour as the left border
              borderLeftColor: item.color,
              padding: 12,
              marginBottom: 10,
            }}
          >
            {/* icon badge using the saved colour as the background */}
            <View
              style={{
                backgroundColor: item.color,
                alignSelf: "flex-start",
                borderRadius: 6,
                padding: 6,
                marginBottom: 8,
              }}
            >
              <MaterialCommunityIcons
                name={getCategoryIcon(item.icon)}
                size={20}
                color="white"
                accessibilityLabel={`${item.icon} icon`}
              />
            </View>
            <Text>Name: {item.name}</Text>
            <Text>Color: {item.color}</Text>
            <Text>Icon: {item.icon}</Text>
            <Text>Id: {item.id}</Text>
            <View style={{ height: 10 }} />
            <Button
              title="Edit"
              onPress={() => handleEditCategory(item)}
              accessibilityLabel={`Edit ${item.name} category`}
            />
            <View style={{ height: 10 }} />
            <Button
              title="Delete"
              onPress={() => handleDeleteCategory(item.id)}
              accessibilityLabel={`Delete ${item.name} category`}
            />
          </View>
          // END OF CLAUDE.AI SECTION 4
        ))
      )}
    </ScrollView>
  );
}