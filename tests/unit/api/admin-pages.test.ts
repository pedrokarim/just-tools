import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/pages/route";

// Mock Prisma
const mockPrisma = {
  pageView: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  $queryRaw: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Admin Pages API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return pages data with pagination", async () => {
    const mockPagesStats = [
      {
        pagePath: "/",
        viewCount: 50,
        uniqueVisitors: 25,
        lastVisit: new Date("2024-01-02").toISOString(),
      },
      {
        pagePath: "/tools",
        viewCount: 30,
        uniqueVisitors: 15,
        lastVisit: new Date("2024-01-01").toISOString(),
      },
    ];

    const mockRecentViews = [
      {
        id: 1,
        timestamp: new Date("2024-01-02"),
        ipAddress: "192.168.1.1",
        country: "France",
        city: "Paris",
        fingerprint: "visitor1",
      },
    ];

    const mockUniquePages = [{ count: 10 }];

    // Mock des appels Prisma
    mockPrisma.pageView.count.mockResolvedValue(100);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce(mockUniquePages) // uniquePages count
      .mockResolvedValueOnce(mockPagesStats); // pages with stats
    mockPrisma.pageView.findMany.mockResolvedValue(mockRecentViews);

    const request = new NextRequest(
      "http://localhost:3000/api/admin/pages?page=1&size=25"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("pages");
    expect(data).toHaveProperty("stats");
    expect(data).toHaveProperty("pagination");

    expect(data.stats).toEqual({
      totalPages: 100,
      uniquePages: 10,
    });

    expect(data.pagination).toEqual({
      page: 1,
      pageSize: 25,
      total: 10,
      totalPages: 1,
    });

    expect(data.pages).toHaveLength(2);
    expect(data.pages[0]).toHaveProperty("recentViews");
    expect(data.pages[0].pagePath).toBe("/");
    expect(data.pages[0].viewCount).toBe(50);
  });

  it("should handle default pagination parameters", async () => {
    mockPrisma.pageView.count.mockResolvedValue(0);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: 0 }]) // uniquePages count
      .mockResolvedValueOnce([]); // pages with stats

    const request = new NextRequest("http://localhost:3000/api/admin/pages");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.pageSize).toBe(25);
  });

  it("should handle custom pagination parameters", async () => {
    mockPrisma.pageView.count.mockResolvedValue(200);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: 20 }]) // uniquePages count
      .mockResolvedValueOnce([]); // pages with stats

    const request = new NextRequest(
      "http://localhost:3000/api/admin/pages?page=2&size=5"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.pageSize).toBe(5);
    expect(data.pagination.totalPages).toBe(4);
  });

  it("should handle database errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.pageView.count.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/admin/pages");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Erreur lors de la récupération des données",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erreur lors de la récupération des pages:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should use PostgreSQL syntax for queries", async () => {
    mockPrisma.pageView.count.mockResolvedValue(50);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: 5 }]) // uniquePages count
      .mockResolvedValueOnce([]); // pages with stats

    const request = new NextRequest("http://localhost:3000/api/admin/pages");
    await GET(request);

    // Vérifier que les requêtes PostgreSQL sont utilisées
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.stringContaining('SELECT COUNT(DISTINCT "pagePath") as count')
    );
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.stringContaining('FROM "pageView"')
    );
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.stringContaining('SELECT "pagePath"')
    );
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.stringContaining('COUNT(*)::integer as "viewCount"')
    );
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.stringContaining(
        'COUNT(DISTINCT fingerprint)::integer as "uniqueVisitors"'
      )
    );
  });

  it("should order pages by view count descending", async () => {
    mockPrisma.pageView.count.mockResolvedValue(50);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: 5 }]) // uniquePages count
      .mockResolvedValueOnce([]); // pages with stats

    const request = new NextRequest("http://localhost:3000/api/admin/pages");
    await GET(request);

    // Vérifier que l'ordre est correct
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY "viewCount" DESC')
    );
  });

  it("should include recent views for each page", async () => {
    const mockPagesStats = [
      {
        pagePath: "/",
        viewCount: 50,
        uniqueVisitors: 25,
        lastVisit: new Date("2024-01-02").toISOString(),
      },
    ];

    const mockRecentViews = [
      {
        id: 1,
        timestamp: new Date("2024-01-02"),
        ipAddress: "192.168.1.1",
        country: "France",
        city: "Paris",
        fingerprint: "visitor1",
      },
    ];

    mockPrisma.pageView.count.mockResolvedValue(50);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: 1 }]) // uniquePages count
      .mockResolvedValueOnce(mockPagesStats); // pages with stats
    mockPrisma.pageView.findMany.mockResolvedValue(mockRecentViews);

    const request = new NextRequest("http://localhost:3000/api/admin/pages");
    const response = await GET(request);
    const data = await response.json();

    expect(data.pages[0].recentViews).toHaveLength(1);
    expect(data.pages[0].recentViews[0]).toHaveProperty("fingerprint");
    expect(data.pages[0].recentViews[0]).toHaveProperty("ipAddress");
    expect(data.pages[0].recentViews[0]).toHaveProperty("country");
  });

  it("should handle empty pages data", async () => {
    mockPrisma.pageView.count.mockResolvedValue(0);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: 0 }]) // uniquePages count
      .mockResolvedValueOnce([]); // pages with stats

    const request = new NextRequest("http://localhost:3000/api/admin/pages");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pages).toEqual([]);
    expect(data.stats.totalPages).toBe(0);
    expect(data.stats.uniquePages).toBe(0);
  });
});
