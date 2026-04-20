// taken from week 12 tutorial method
// unit test: verifies seed function inserts data into all core tables

import { db } from "@/db/client";
import {
  applications,
  applicationStatusLogs,
  categories,
  targets,
  users,
} from "@/db/schema";
import { seedDatabaseIfEmpty } from "@/db/seed";

jest.mock("@/db/client", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

const mockDb = db as unknown as {
  select: jest.Mock;
  insert: jest.Mock;
};

describe("seedDatabaseIfEmpty", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inserts sample data into all core tables when database is empty", async () => {
    const mockUsersFrom = jest.fn().mockResolvedValue([]);
    const mockTargetsValues = jest.fn().mockResolvedValue(undefined);
    const mockLogsValues = jest.fn().mockResolvedValue(undefined);

    // mock db.insert to return different responses depending on which table is being inserted into
    // needed because the seed function inserts into multiple tables and expects specific return values (e.g. user id)
    
    mockDb.select.mockReturnValue({
      from: mockUsersFrom,
    });

    mockDb.insert.mockImplementation((table: unknown) => {
      if (table === users) {
        return {
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: 1 }]),
          }),
        };
      }

      if (table === categories) {
        return {
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              { id: 1, name: "Graduate", color: "blue", icon: "briefcase" },
              { id: 2, name: "Internship", color: "green", icon: "school" },
              { id: 3, name: "Frontend", color: "purple", icon: "code" },
              { id: 4, name: "Backend", color: "orange", icon: "server" },
              { id: 5, name: "Full Stack", color: "red", icon: "laptop" },
            ]),
          }),
        };
      }

      if (table === applications) {
        return {
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              {
                id: 1,
                company: "Google",
                role: "Graduate Software Engineer",
                categoryId: 1,
              },
              {
                id: 2,
                company: "Meta",
                role: "Software Engineering Intern",
                categoryId: 2,
              },
              {
                id: 3,
                company: "Stripe",
                role: "Frontend Developer",
                categoryId: 3,
              },
              {
                id: 4,
                company: "HubSpot",
                role: "Backend Engineer",
                categoryId: 4,
              },
              {
                id: 5,
                company: "Microsoft",
                role: "Full Stack Developer",
                categoryId: 5,
              },
              { id: 6, company: "Amazon", role: "Frontend Engineer", categoryId: 3 },
              { id: 7, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 8, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 9, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 10, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 11, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 11, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 12, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 13, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 14, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 15, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 16, company: "Apple", role: "Frontend Engineer", categoryId: 2 },
              { id: 17, company: "Apple", role: "Frontend Engineer", categoryId: 2 },


            ]),
          }),
        };
      }

      if (table === targets) {
        return {
          values: mockTargetsValues,
        };
      }

      if (table === applicationStatusLogs) {
        return {
          values: mockLogsValues,
        };
      }

      return {
        values: jest.fn().mockResolvedValue(undefined),
      };
    });

    await seedDatabaseIfEmpty();

    expect(mockDb.insert).toHaveBeenCalledWith(users);
    expect(mockDb.insert).toHaveBeenCalledWith(categories);
    expect(mockDb.insert).toHaveBeenCalledWith(applications);
    expect(mockDb.insert).toHaveBeenCalledWith(targets);
    expect(mockDb.insert).toHaveBeenCalledWith(applicationStatusLogs);

    expect(mockTargetsValues).toHaveBeenCalled();
    expect(mockLogsValues).toHaveBeenCalled();
  });

  it("does not insert duplicate data when users already exist", async () => {
    const mockUsersFrom = jest.fn().mockResolvedValue([
      { id: 1, name: "Existing User" },
    ]);

    mockDb.select.mockReturnValue({
      from: mockUsersFrom,
    });

    await seedDatabaseIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});