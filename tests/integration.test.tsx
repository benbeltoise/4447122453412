// used week 12 tuto methods
// integration test: verifies data flows from db to UI in main screen

import { render, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@/app/_layout", () => {
  const React = require("react");
  return {
    ApplicationContext: React.createContext(null),
  };
});

jest.mock("@/db/client", () => ({
  db: {
    delete: jest.fn(() => ({
      where: jest.fn(),
    })),
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

import IndexScreen from "@/app/(tabs)/index";
import { ApplicationContext } from "@/app/_layout";

const mockContextValue = {
  currentUser: {
    id: 1,
    name: "Demo User",
    email: "demo@student.com",
  },
  setCurrentUser: jest.fn(),
  logout: jest.fn(),
  deleteProfile: jest.fn(),
  applications: [
    {
      id: 1,
      userId: 1,
      company: "OpenAI",
      role: "Frontend Intern",
      dateApplied: "2026-04-10",
      effortMinutes: 90,
      salaryExpectation: 30000,
      categoryId: 1,
      currentStatus: "applied",
      notes: "Seeded application",
      createdAt: "2026-04-10T10:00:00.000Z",
      updatedAt: "2026-04-10T10:00:00.000Z",
    },
  ],
  categories: [
    {
      id: 1,
      userId: 1,
      name: "Tech",
      color: "blue",
      icon: "briefcase",
      createdAt: "2026-04-10T10:00:00.000Z",
    },
  ],
  targets: [
    {
      id: 1,
      userId: 1,
      periodType: "weekly",
      metricType: "applications",
      targetCount: 5,
      categoryId: null,
      createdAt: "2026-04-10T10:00:00.000Z",
    },
    {
      id: 2,
      userId: 1,
      periodType: "weekly",
      metricType: "effortMinutes",
      targetCount: 300,
      categoryId: null,
      createdAt: "2026-04-10T10:00:00.000Z",
    },
  ],
  statusLogs: [
    {
      id: 1,
      applicationId: 1,
      status: "applied",
      changedAt: "2026-04-10T10:00:00.000Z",
    },
  ],
  refreshUserData: jest.fn(),
  isReady: true,
};

describe("IndexScreen", () => {
  it("renders seeded application data on the main list screen", async () => {
    const { getByText } = render(
      <ApplicationContext.Provider value={mockContextValue as any}>
        <IndexScreen />
      </ApplicationContext.Provider>
    );

    await waitFor(() => {
      expect(getByText("Applications")).toBeTruthy();
      expect(getByText("Company: OpenAI")).toBeTruthy();
      expect(getByText("Role: Frontend Intern")).toBeTruthy();
      expect(getByText("Category: Tech")).toBeTruthy();
      expect(getByText("Add Application")).toBeTruthy();
    });
  });
});