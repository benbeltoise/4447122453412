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

// import touchable button for custom colour and icon selection
import { TouchableOpacity } from "react-native";

// icons from expo vector icons
import { MaterialCommunityIcons } from "@expo/vector-icons";

// CLAUDE.AI SECTION 1. LINK TO CHAT: https://claude.ai/share/bc07d173-4d9d-42c0-a957-cc5156f3c698
// Used to refine UI & UX by making user iteractions simpler and easier. No adaptions were made from the generated code

// map a saved icon string to a MaterialCommunityIcons name, with a fallback
function getCategoryIcon(icon: string): React.ComponentProps<typeof MaterialCommunityIcons>["name"] {
  // list of allowed saved icon names and the icon they map to
  const knownIcons: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
    // icon options
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
    folder: "folder",
    code: "code-tags",
    desktop: "desktop-classic",
    server: "server",
    graph: "chart-line",
    laptop: "laptop",
  };
  // return the matching icon or a fallback tag icon
  return knownIcons[icon.toLowerCase()] ?? "tag";
}

// END OF CLAUDE.AI SECTION 1

// categories screen
export default function CategoriesScreen() {
  // get router for screen navigation
  const router = useRouter(); //navigation
  // get access to the global app state
  const context = useContext(ApplicationContext); 

  // form inputs
  // store category name input
  const [name, setName] = useState("");
  // store selected category colour
  const [color, setColor] = useState("");
  // store selected category icon
  const [icon, setIcon] = useState("");
  // erroe message
  // store validation or save errors
  const [error, setError] = useState("");
  // store id of category being edited (null = add mode)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // simple app colours
  // page background colour
  const backgroundColor = "#F7F9FC";
  // card background colour
  const cardColor = "#FFFFFF";
  // main brand colour
  const primaryColor = "#2F6FED";
  // main text colour
  const textColor = "#1F2937";
  // softer text colour
  const mutedTextColor = "#6B7280";
  // border colour used for inputs and cards
  const borderColor = "#D1D5DB";

  // runs on loading and when context changes
  useEffect(() => {
    // stop if context is not available yet
    if (!context) return;
    // stop if app data is still loading
    if (!context.isReady) return;

    // redirect to login if no use is logged in
    if (!context.currentUser) {
      router.replace("/login" as any);
    }
  }, [context, router]);

  // loading state while context isnt ready
  if (!context || !context.currentUser) {
    return (
      // loading container
      <View style={{ padding: 20, backgroundColor, flex: 1 }}>
        {/* loading text */}
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  // saving - used for both adding and editing categories
  async function handleSaveCategory() {
    // clear old error before validating
    setError("");

    // basic checks
    if (!name || !color || !icon) {
      // show validation error if any field is missing
      setError("Fill in all category fields");
      return;
    }

    // if editing, update exisitng category
    if (editingCategoryId) {
      // update the selected category in the database
      await db
        .update(categories)
        .set({
          // save updated name
          name: name,
          // save updated colour
          color: color,
          // save updated icon
          icon: icon,
        })
        // only update the matching category id
        .where(eq(categories.id, editingCategoryId));
    } else {
      // otherwise, create a new category
      // insert a new category row into the database
      await db.insert(categories).values({
        // link category to current user
        userId: context.currentUser.id,
        // save category name
        name: name,
        // save category colour
        color: color,
        // save category icon
        icon: icon,
        // save current timestamp
        createdAt: new Date().toISOString(),
      });
    }

    // reset form
    // clear name input
    setName("");
    // clear selected colour
    setColor("");
    // clear selected icon
    setIcon("");
    // switch back to add mode
    setEditingCategoryId(null);

    // reload data from db into context
    await context.refreshUserData(context.currentUser.id);
  }

  // when clicking edit, populate the form with the selected category
  function handleEditCategory(item: any) {
    // put selected name into the form
    setName(item.name);
    // put selected colour into the form
    setColor(item.color);
    // put selected icon into the form
    setIcon(item.icon);
    // store the id so save becomes update
    setEditingCategoryId(item.id);
    // clear any old error message
    setError("");
  }

  // delete categories
  async function handleDeleteCategory(id: number) {
    // delete the matching category from the database
    await db.delete(categories).where(eq(categories.id, id));

    // if the deleted category was being edited, clear the form
    if (editingCategoryId === id) {
      // clear name input
      setName("");
      // clear colour input
      setColor("");
      // clear icon input
      setIcon("");
      // exit edit mode
      setEditingCategoryId(null);
      // clear any error message
      setError("");
    }

    // refresh categories in context after delete
    await context.refreshUserData(context.currentUser.id);
  }

  // CLAUDE.AI SECTION 2. LINK TO CHAT: https://claude.ai/share/bc07d173-4d9d-42c0-a957-cc5156f3c698
  // Used to refine UI & UX by making user iteractions simpler and easier. No adaptions were made from the generated code
  // fixed list of selectable colours
  const colorOptions = ["blue", "green", "purple", "orange", "red", "teal"];

  // fixed list of selectable icons with their MaterialCommunityIcons names
  const iconOptions: { label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"] }[] = [
    // briefcase option
    { label: "briefcase",     icon: "briefcase"      },
    // folder option
    { label: "folder",        icon: "folder"         },
    // code option
    { label: "code",          icon: "code-tags"      },
    // desktop option
    { label: "desktop",       icon: "desktop-classic"},
    // server option
    { label: "server",        icon: "server"         },
    // school option
    { label: "school",        icon: "school"         },
    // graph option
    { label: "graph",         icon: "chart-line"     },
    // laptop option
    { label: "laptop",        icon: "laptop"         },
  ];

  // END OF CLAUDE.AI SECTION 2

  // render
  return (
    // main scrollable page container
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor }}>
      {/* app brand title */}
      <Text
        style={{
          // large title size
          fontSize: 30,
          // small gap below title
          marginBottom: 4,
          // brand colour
          color: primaryColor,
          // bold title text
          fontWeight: "bold",
        }}
      >
        Appli
      </Text>

      {/* app subtitle */}
      <Text
        style={{
          // subtitle text size
          fontSize: 16,
          // space below subtitle
          marginBottom: 20,
          // muted subtitle colour
          color: mutedTextColor,
        }}
      >
        Job Application Tracker
      </Text>

      {/* page heading */}
      <Text style={{ fontSize: 24, marginBottom: 20, color: textColor }}>Categories</Text>

      {/* label for category name input */}
      <Text style={{ color: textColor, marginBottom: 6 }}>Name</Text>
      <TextInput
        // accessibility label
        accessibilityLabel="Category name"
        // controlled input value
        value={name}
        // update state when text changes
        onChangeText={setName}
        // placeholder text shown when empty
        placeholder="Category name"
        // placeholder colour
        placeholderTextColor={mutedTextColor}
        style={{
          // thin border around input
          borderWidth: 1,
          // border colour
          borderColor: borderColor,
          // inner spacing
          padding: 10,
          // gap below input
          marginBottom: 12,
          // rounded corners
          borderRadius: 8,
          // white input background
          backgroundColor: "#FFFFFF",
          // text colour inside input
          color: textColor,
        }}
      />

      {/*CLAUDE AI SECTION 3 LINK TO CHAT: https://claude.ai/share/bc07d173-4d9d-42c0-a957-cc5156f3c698 
        // Used to refine UI & UX by making user iteractions simpler and easier. No adaptions were made from the generated code
      */} 
      {/* label for colour selection */}
      <Text style={{ color: textColor, marginBottom: 8 }}>Color</Text>
      {/* selectable colour swatches — replaces the colour text input */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
        {colorOptions.map((c) => (
          <TouchableOpacity
            // unique key for each colour option
            key={c}
            // set selected colour when tapped
            onPress={() => setColor(c)}
            // accessibility label for each colour button
            accessibilityLabel={`Select colour ${c}`}
            style={{
              // swatch width
              width: 36,
              // swatch height
              height: 36,
              // rounded swatch corners
              borderRadius: 6,
              // fill swatch with the actual colour
              backgroundColor: c,
              // space to the right
              marginRight: 10,
              // space below
              marginBottom: 10,
              // thick border when selected, thin when not
              borderWidth: color === c ? 3 : 1,
              // selected border is black, unselected is light grey
              borderColor: color === c ? "#000000" : "#cccccc",
            }}
          />
        ))}
      </View>

      {/* label for icon selection */}
      <Text style={{ color: textColor, marginBottom: 8 }}>Icon</Text>
      {/* selectable icon buttons — replaces the icon text input */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
        {iconOptions.map((option) => (
          <TouchableOpacity
            // unique key for each icon option
            key={option.label}
            // set selected icon when tapped
            onPress={() => setIcon(option.label)}
            // accessibility label for each icon button
            accessibilityLabel={`Select icon ${option.label}`}
            style={{
              // rounded icon button corners
              borderRadius: 6,
              // inner spacing around icon
              padding: 8,
              // space to the right
              marginRight: 10,
              // space below
              marginBottom: 10,
              // filled background when selected, plain border when not
              backgroundColor: icon === option.label ? (color || "#888888") : "transparent",
              // hide border when selected
              borderWidth: icon === option.label ? 0 : 1,
              // unselected border colour
              borderColor: "#cccccc",
            }}
          >
            <MaterialCommunityIcons
              // icon to display
              name={option.icon}
              // icon size
              size={24}
              // white icon on filled background, dark icon on plain background
              color={icon === option.label ? "white" : "#333333"}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/*END OF CLAUDE.AI SECTION 3 */} 
      
      {/* show error text when validation fails */}
      {error ? (
        <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
      ) : null}

      <Button
        // button text changes based on add or edit mode
        title={editingCategoryId ? "Save Category" : "Add Category"}
        // save or update category when pressed
        onPress={handleSaveCategory}
        // use app primary colour
        color={primaryColor}
      />

      {/* show cancel edit button only when editing */}
      {editingCategoryId ? (
        <>
          {/* spacing between buttons */}
          <View style={{ height: 10 }} />
          <Button
            // button text for cancelling edit mode
            title="Cancel Edit"
            // clear form and exit edit mode
            onPress={() => {
              // clear name input
              setName("");
              // clear colour input
              setColor("");
              // clear icon input
              setIcon("");
              // leave edit mode
              setEditingCategoryId(null);
              // clear any error
              setError("");
            }}
            // use primary colour
            color={primaryColor}
          />
        </>
      ) : null}

      {/* spacing before saved categories list */}
      <View style={{ height: 20 }} />

      {/* section heading for saved categories */}
      <Text style={{ fontSize: 18, marginBottom: 10, color: textColor }}>
        Saved Categories
      </Text>

      {/* show empty state if no categories exist */}
      {context.categories.length === 0 ? (
        <Text style={{ color: mutedTextColor }}>No categories yet</Text>
      ) : (
        context.categories.map((item: any) => (
          <View
            // unique key for each saved category
            key={item.id}
            style={{
              // thin border around card
              borderWidth: 1,
              // border colour
              borderColor: borderColor,
              // thicker left border for category colour
              borderLeftWidth: 6,
              // use the saved colour as the left border
              borderLeftColor: item.color,
              // inner spacing
              padding: 12,
              // gap below each card
              marginBottom: 10,
              // white card background
              backgroundColor: cardColor,
              // rounded corners
              borderRadius: 10,
            }}
          >
            {/* icon badge using the saved colour as the background */}
            <View
              style={{
                // badge background uses category colour
                backgroundColor: item.color,
                // keep badge aligned to its content width
                alignSelf: "flex-start",
                // rounded badge corners
                borderRadius: 6,
                // inner badge spacing
                padding: 6,
                // gap below badge
                marginBottom: 8,
              }}
            >
              <MaterialCommunityIcons
                // convert saved icon string to actual icon name
                name={getCategoryIcon(item.icon)}
                // icon size
                size={20}
                // white icon colour
                color="white"
                // accessibility description for icon
                accessibilityLabel={`${item.icon} icon`}
              />
            </View>
            {/* category name */}
            <Text style={{ color: textColor }}>Name: {item.name}</Text>
            {/* category colour */}
            <Text style={{ color: textColor }}>Color: {item.color}</Text>
            {/* category icon label */}
            <Text style={{ color: textColor }}>Icon: {item.icon}</Text>
            {/* category id */}
            <Text style={{ color: textColor }}>Id: {item.id}</Text>
            {/* spacing before action buttons */}
            <View style={{ height: 10 }} />
            <Button
              // edit button text
              title="Edit"
              // load this category into the form
              onPress={() => handleEditCategory(item)}
              // accessibility label for edit button
              accessibilityLabel={`Edit ${item.name} category`}
              // use primary colour
              color={primaryColor}
            />
            {/* spacing between action buttons */}
            <View style={{ height: 10 }} />
            <Button
              // delete button text
              title="Delete"
              // delete this category
              onPress={() => handleDeleteCategory(item.id)}
              // accessibility label for delete button
              accessibilityLabel={`Delete ${item.name} category`}
              // use primary colour
              color={primaryColor}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
}