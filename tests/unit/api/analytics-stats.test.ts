import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/analytics/stats/route";

// Mock de la fonction getAnalyticsStats
const mockGetAnalyticsStats = vi.fn();

vi.mock("@/lib/analytics", () => ({
  getAnalyticsStats: mockGetAnalyticsStats,
}));

describe("Analytics Stats API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return analytics stats successfully", async () => {
    const mockStats = {
      totalViews: 1000,
      uniqueVisitors: 250,
      last24hViews: 50,
      last24hNewVisitors: 15,
      viewsByPage: [
        { pagePath: "/", count: 300 },
        { pagePath: "/tools", count: 200 },
        { pagePath: "/about", count: 100 },
      ],
      viewsByHour: [
        { hour: "0", count: 2 },
        { hour: "1", count: 1 },
        { hour: "2", count: 0 },
        { hour: "3", count: 1 },
        { hour: "4", count: 0 },
        { hour: "5", count: 2 },
        { hour: "6", count: 3 },
        { hour: "7", count: 5 },
        { hour: "8", count: 8 },
        { hour: "9", count: 12 },
        { hour: "10", count: 15 },
        { hour: "11", count: 18 },
        { hour: "12", count: 20 },
        { hour: "13", count: 22 },
        { hour: "14", count: 25 },
        { hour: "15", count: 28 },
        { hour: "16", count: 30 },
        { hour: "17", count: 32 },
        { hour: "18", count: 35 },
        { hour: "19", count: 38 },
        { hour: "20", count: 40 },
        { hour: "21", count: 35 },
        { hour: "22", count: 25 },
        { hour: "23", count: 15 },
      ],
    };

    mockGetAnalyticsStats.mockResolvedValue(mockStats);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockStats);
    expect(mockGetAnalyticsStats).toHaveBeenCalledOnce();
  });

  it("should handle BigInt serialization correctly", async () => {
    const mockStatsWithBigInt = {
      totalViews: BigInt(1000),
      uniqueVisitors: BigInt(250),
      last24hViews: BigInt(50),
      last24hNewVisitors: BigInt(15),
      viewsByPage: [
        { pagePath: "/", count: BigInt(300) },
        { pagePath: "/tools", count: BigInt(200) },
      ],
      viewsByHour: [
        { hour: "0", count: BigInt(2) },
        { hour: "1", count: BigInt(1) },
      ],
    };

    mockGetAnalyticsStats.mockResolvedValue(mockStatsWithBigInt);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);

    // Vérifier que les BigInt sont convertis en Number
    expect(typeof data.totalViews).toBe("number");
    expect(typeof data.uniqueVisitors).toBe("number");
    expect(typeof data.last24hViews).toBe("number");
    expect(typeof data.last24hNewVisitors).toBe("number");

    expect(data.totalViews).toBe(1000);
    expect(data.uniqueVisitors).toBe(250);
    expect(data.last24hViews).toBe(50);
    expect(data.last24hNewVisitors).toBe(15);

    expect(data.viewsByPage[0].count).toBe(300);
    expect(data.viewsByPage[1].count).toBe(200);
    expect(data.viewsByHour[0].count).toBe(2);
    expect(data.viewsByHour[1].count).toBe(1);
  });

  it("should handle database errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetAnalyticsStats.mockRejectedValue(
      new Error("Database connection failed")
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Internal server error",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching analytics stats:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should handle empty stats data", async () => {
    const mockEmptyStats = {
      totalViews: 0,
      uniqueVisitors: 0,
      last24hViews: 0,
      last24hNewVisitors: 0,
      viewsByPage: [],
      viewsByHour: [],
    };

    mockGetAnalyticsStats.mockResolvedValue(mockEmptyStats);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockEmptyStats);
  });

  it("should handle mixed data types in serialization", async () => {
    const mockMixedStats = {
      totalViews: 1000,
      uniqueVisitors: BigInt(250),
      last24hViews: 50,
      last24hNewVisitors: BigInt(15),
      viewsByPage: [
        { pagePath: "/", count: 300 },
        { pagePath: "/tools", count: BigInt(200) },
      ],
      viewsByHour: [
        { hour: "0", count: BigInt(2) },
        { hour: "1", count: 1 },
      ],
    };

    mockGetAnalyticsStats.mockResolvedValue(mockMixedStats);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);

    // Tous les nombres doivent être des Number après sérialisation
    expect(typeof data.totalViews).toBe("number");
    expect(typeof data.uniqueVisitors).toBe("number");
    expect(typeof data.last24hViews).toBe("number");
    expect(typeof data.last24hNewVisitors).toBe("number");
    expect(typeof data.viewsByPage[0].count).toBe("number");
    expect(typeof data.viewsByPage[1].count).toBe("number");
    expect(typeof data.viewsByHour[0].count).toBe("number");
    expect(typeof data.viewsByHour[1].count).toBe("number");
  });

  it("should preserve string values during serialization", async () => {
    const mockStatsWithStrings = {
      totalViews: 1000,
      uniqueVisitors: 250,
      last24hViews: 50,
      last24hNewVisitors: 15,
      viewsByPage: [
        { pagePath: "/", count: 300 },
        { pagePath: "/tools", count: 200 },
      ],
      viewsByHour: [
        { hour: "00", count: 2 },
        { hour: "01", count: 1 },
      ],
    };

    mockGetAnalyticsStats.mockResolvedValue(mockStatsWithStrings);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);

    // Les strings doivent être préservées
    expect(typeof data.viewsByPage[0].pagePath).toBe("string");
    expect(typeof data.viewsByPage[1].pagePath).toBe("string");
    expect(typeof data.viewsByHour[0].hour).toBe("string");
    expect(typeof data.viewsByHour[1].hour).toBe("string");

    expect(data.viewsByPage[0].pagePath).toBe("/");
    expect(data.viewsByPage[1].pagePath).toBe("/tools");
    expect(data.viewsByHour[0].hour).toBe("00");
    expect(data.viewsByHour[1].hour).toBe("01");
  });
});
