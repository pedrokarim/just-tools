import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/visitors/route";

// Mock Prisma
const mockPrisma = {
  uniqueVisitor: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  pageView: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  $queryRaw: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Admin Visitors API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return visitors data with pagination", async () => {
    const mockVisitors = [
      {
        id: 1,
        fingerprint: "visitor1",
        firstVisit: new Date("2024-01-01"),
        lastVisit: new Date("2024-01-02"),
        visitCount: 5,
      },
      {
        id: 2,
        fingerprint: "visitor2",
        firstVisit: new Date("2024-01-01"),
        lastVisit: new Date("2024-01-03"),
        visitCount: 3,
      },
    ];

    const mockRecentViews = [
      {
        id: 1,
        pagePath: "/",
        timestamp: new Date("2024-01-02"),
        ipAddress: "192.168.1.1",
        country: "France",
        city: "Paris",
      },
    ];

    const mockUniquePages = [{ count: 3 }];

    // Mock des appels Prisma
    mockPrisma.uniqueVisitor.count.mockResolvedValue(50);
    mockPrisma.pageView.count.mockResolvedValue(100);
    mockPrisma.uniqueVisitor.findMany.mockResolvedValue(mockVisitors);
    mockPrisma.pageView.findMany.mockResolvedValue(mockRecentViews);
    mockPrisma.pageView.count.mockResolvedValue(5); // totalViews pour chaque visiteur
    mockPrisma.$queryRaw.mockResolvedValue(mockUniquePages);

    const request = new NextRequest(
      "http://localhost:3000/api/admin/visitors?page=1&size=25"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("visitors");
    expect(data).toHaveProperty("stats");
    expect(data).toHaveProperty("pagination");

    expect(data.stats).toEqual({
      totalVisitors: 50,
      totalPageViews: 100,
      averageVisitsPerVisitor: 2,
    });

    expect(data.pagination).toEqual({
      page: 1,
      pageSize: 25,
      total: 50,
      totalPages: 2,
    });

    expect(data.visitors).toHaveLength(2);
    expect(data.visitors[0]).toHaveProperty("recentViews");
    expect(data.visitors[0]).toHaveProperty("totalViews");
    expect(data.visitors[0]).toHaveProperty("uniquePages");
  });

  it("should handle default pagination parameters", async () => {
    mockPrisma.uniqueVisitor.count.mockResolvedValue(0);
    mockPrisma.pageView.count.mockResolvedValue(0);
    mockPrisma.uniqueVisitor.findMany.mockResolvedValue([]);

    const request = new NextRequest("http://localhost:3000/api/admin/visitors");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.pageSize).toBe(25);
  });

  it("should handle custom pagination parameters", async () => {
    mockPrisma.uniqueVisitor.count.mockResolvedValue(100);
    mockPrisma.pageView.count.mockResolvedValue(200);
    mockPrisma.uniqueVisitor.findMany.mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost:3000/api/admin/visitors?page=3&size=10"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(3);
    expect(data.pagination.pageSize).toBe(10);
    expect(data.pagination.totalPages).toBe(10);
  });

  it("should handle database errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.uniqueVisitor.count.mockRejectedValue(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/admin/visitors");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Erreur lors de la récupération des données",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Erreur lors de la récupération des visiteurs:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should use PostgreSQL syntax for unique pages query", async () => {
    mockPrisma.uniqueVisitor.count.mockResolvedValue(1);
    mockPrisma.pageView.count.mockResolvedValue(5);
    mockPrisma.uniqueVisitor.findMany.mockResolvedValue([
      {
        id: 1,
        fingerprint: "visitor1",
        firstVisit: new Date(),
        lastVisit: new Date(),
        visitCount: 1,
      },
    ]);
    mockPrisma.pageView.findMany.mockResolvedValue([]);
    mockPrisma.pageView.count.mockResolvedValue(5);
    mockPrisma.$queryRaw.mockResolvedValue([{ count: 3 }]);

    const request = new NextRequest("http://localhost:3000/api/admin/visitors");
    await GET(request);

    // Vérifier que la requête PostgreSQL est utilisée
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.stringContaining('SELECT COUNT(DISTINCT "pagePath") as count')
    );
    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.stringContaining('FROM "pageView"')
    );
  });

  it("should calculate visitor statistics correctly", async () => {
    mockPrisma.uniqueVisitor.count.mockResolvedValue(20);
    mockPrisma.pageView.count.mockResolvedValue(100);
    mockPrisma.uniqueVisitor.findMany.mockResolvedValue([]);

    const request = new NextRequest("http://localhost:3000/api/admin/visitors");
    const response = await GET(request);
    const data = await response.json();

    expect(data.stats.averageVisitsPerVisitor).toBe(5); // 100 / 20
  });

  it("should handle zero visitors gracefully", async () => {
    mockPrisma.uniqueVisitor.count.mockResolvedValue(0);
    mockPrisma.pageView.count.mockResolvedValue(0);
    mockPrisma.uniqueVisitor.findMany.mockResolvedValue([]);

    const request = new NextRequest("http://localhost:3000/api/admin/visitors");
    const response = await GET(request);
    const data = await response.json();

    expect(data.stats.averageVisitsPerVisitor).toBe(0);
  });
});
