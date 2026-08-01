import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET } from "@/app/api/admin/visitors/route";

// `vi.mock` est hissé en haut du fichier : sa factory ne peut pas référencer un
// `const` déclaré plus bas (« Cannot access 'mockPrisma' before
// initialization »). `vi.hoisted` remonte la déclaration avec elle.
const { mockPrisma, mockRequireAdmin } = vi.hoisted(() => ({
  mockPrisma: {
    uniqueVisitor: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    pageView: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
  mockRequireAdmin: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: mockRequireAdmin,
}));

const AUTHORIZED = {
  ok: true as const,
  user: { id: "u1", name: "Test", email: null, discordId: "42" },
};

/** Recompose le SQL de tous les appels `$queryRaw` (templates balisés). */
function executedSql(): string {
  return mockPrisma.$queryRaw.mock.calls
    .map(([strings]: [unknown]) =>
      Array.isArray(strings) ? strings.join(" ? ") : String(strings)
    )
    .join("\n");
}

describe("Admin Visitors API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue(AUTHORIZED);
  });

  it("refuse la requête si l'appelant n'est pas administrateur", async () => {
    mockRequireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    });

    const request = new NextRequest("http://localhost:3000/api/admin/visitors");
    const response = await GET(request);

    expect(response.status).toBe(403);
    expect(mockPrisma.uniqueVisitor.count).not.toHaveBeenCalled();
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

    // Mock des appels Prisma.
    // `pageView.count` est appelé deux fois par la route : d'abord pour le
    // total global, puis une fois par visiteur. Il faut donc `...Once` pour le
    // premier — un second `mockResolvedValue` écrasait le premier, ce qui
    // ramenait `totalPageViews` à 5 et la moyenne à 0,1.
    mockPrisma.uniqueVisitor.count.mockResolvedValue(50);
    mockPrisma.pageView.count
      .mockResolvedValueOnce(100) // totalPageViews
      .mockResolvedValue(5); // totalViews de chaque visiteur
    mockPrisma.uniqueVisitor.findMany.mockResolvedValue(mockVisitors);
    mockPrisma.pageView.findMany.mockResolvedValue(mockRecentViews);
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

    // `$queryRaw` est appelé en template balisé : le mock reçoit un
    // TemplateStringsArray, jamais une chaîne. `stringContaining` ne pouvait
    // donc pas matcher — on recompose le SQL avant de l'inspecter.
    const sql = executedSql();
    expect(sql).toContain('SELECT COUNT(DISTINCT "pagePath") as count');
    expect(sql).toContain('FROM "page_views"');
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
