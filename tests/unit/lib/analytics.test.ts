import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  recordPageView,
  getAnalyticsStats,
  getUniqueVisitors,
  clearAnalytics,
  exportAnalytics,
} from "@/lib/analytics";

// Mock Prisma
const mockPrisma = {
  pageView: {
    create: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  uniqueVisitor: {
    upsert: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  $queryRaw: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Analytics Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("recordPageView", () => {
    it("should record a page view successfully", async () => {
      const pageViewData = {
        pagePath: "/test-page",
        userAgent: "Mozilla/5.0...",
        ipAddress: "192.168.1.1",
        fingerprint: "test-fingerprint-123",
        country: "France",
        city: "Paris",
      };

      mockPrisma.pageView.create.mockResolvedValue({ id: 1 });
      mockPrisma.uniqueVisitor.upsert.mockResolvedValue({ id: 1 });

      await recordPageView(pageViewData);

      expect(mockPrisma.pageView.create).toHaveBeenCalledWith({
        data: pageViewData,
      });

      expect(mockPrisma.uniqueVisitor.upsert).toHaveBeenCalledWith({
        where: { fingerprint: pageViewData.fingerprint },
        update: {
          lastVisit: expect.any(Date),
          visitCount: { increment: 1 },
        },
        create: {
          fingerprint: pageViewData.fingerprint,
          firstVisit: expect.any(Date),
          lastVisit: expect.any(Date),
          visitCount: 1,
        },
      });
    });

    it("should handle missing fingerprint gracefully", async () => {
      const pageViewData = {
        pagePath: "/test-page",
        userAgent: "Mozilla/5.0...",
        ipAddress: "192.168.1.1",
        fingerprint: undefined,
        country: "France",
        city: "Paris",
      };

      mockPrisma.pageView.create.mockResolvedValue({ id: 1 });

      await recordPageView(pageViewData);

      expect(mockPrisma.pageView.create).toHaveBeenCalledWith({
        data: pageViewData,
      });

      expect(mockPrisma.uniqueVisitor.upsert).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const pageViewData = {
        pagePath: "/test-page",
        fingerprint: "test-fingerprint-123",
      };

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPrisma.pageView.create.mockRejectedValue(new Error("Database error"));

      await recordPageView(pageViewData);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Erreur lors de l'enregistrement de la vue de page:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getAnalyticsStats", () => {
    it("should return analytics stats with PostgreSQL queries", async () => {
      // Mock des données de base
      mockPrisma.pageView.count
        .mockResolvedValueOnce(100) // totalViews
        .mockResolvedValueOnce(25); // last24hViews

      mockPrisma.uniqueVisitor.count
        .mockResolvedValueOnce(50) // uniqueVisitors
        .mockResolvedValueOnce(10); // last24hNewVisitors

      // Mock des requêtes PostgreSQL
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([
          { pagePath: "/", count: 30 },
          { pagePath: "/tools", count: 20 },
          { pagePath: "/about", count: 10 },
        ])
        .mockResolvedValueOnce([
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
        ]);

      const stats = await getAnalyticsStats();

      expect(stats).toEqual({
        totalViews: 100,
        uniqueVisitors: 50,
        last24hViews: 25,
        last24hNewVisitors: 10,
        viewsByPage: [
          { pagePath: "/", count: 30 },
          { pagePath: "/tools", count: 20 },
          { pagePath: "/about", count: 10 },
        ],
        viewsByHour: expect.arrayContaining([
          { hour: "0", count: 2 },
          { hour: "1", count: 1 },
          // ... autres heures
        ]),
      });

      // Vérifier que les requêtes PostgreSQL sont appelées
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('SELECT "pagePath", COUNT(*)::integer as count')
      );
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
        expect.stringContaining("EXTRACT(hour FROM timestamp)")
      );
    });

    it("should handle database errors and return default values", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPrisma.pageView.count.mockRejectedValue(new Error("Database error"));

      const stats = await getAnalyticsStats();

      expect(stats).toEqual({
        totalViews: 0,
        uniqueVisitors: 0,
        last24hViews: 0,
        last24hNewVisitors: 0,
        viewsByPage: [],
        viewsByHour: [],
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Erreur lors de la récupération des statistiques:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getUniqueVisitors", () => {
    it("should return unique visitors", async () => {
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

      mockPrisma.uniqueVisitor.findMany.mockResolvedValue(mockVisitors);

      const visitors = await getUniqueVisitors();

      expect(visitors).toEqual([
        {
          fingerprint: "visitor1",
          firstVisit: new Date("2024-01-01"),
          lastVisit: new Date("2024-01-02"),
          visitCount: 5,
        },
        {
          fingerprint: "visitor2",
          firstVisit: new Date("2024-01-01"),
          lastVisit: new Date("2024-01-03"),
          visitCount: 3,
        },
      ]);

      expect(mockPrisma.uniqueVisitor.findMany).toHaveBeenCalledWith({
        orderBy: { lastVisit: "desc" },
        take: 50,
      });
    });

    it("should handle database errors and return empty array", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPrisma.uniqueVisitor.findMany.mockRejectedValue(
        new Error("Database error")
      );

      const visitors = await getUniqueVisitors();

      expect(visitors).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Erreur lors de la récupération des visiteurs:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("clearAnalytics", () => {
    it("should clear all analytics data successfully", async () => {
      mockPrisma.pageView.deleteMany.mockResolvedValue({ count: 100 });
      mockPrisma.uniqueVisitor.deleteMany.mockResolvedValue({ count: 50 });

      const result = await clearAnalytics();

      expect(result).toEqual({ success: true });
      expect(mockPrisma.pageView.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.uniqueVisitor.deleteMany).toHaveBeenCalled();
    });

    it("should handle database errors during cleanup", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPrisma.pageView.deleteMany.mockRejectedValue(
        new Error("Database error")
      );

      const result = await clearAnalytics();

      expect(result).toEqual({
        success: false,
        error: "Database error",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Erreur lors du nettoyage des analytics:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle unknown errors during cleanup", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPrisma.pageView.deleteMany.mockRejectedValue("Unknown error");

      const result = await clearAnalytics();

      expect(result).toEqual({
        success: false,
        error: "Erreur inconnue",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("exportAnalytics", () => {
    it("should export analytics data successfully", async () => {
      const mockPageViews = [
        {
          id: 1,
          pagePath: "/",
          timestamp: new Date("2024-01-01"),
          fingerprint: "visitor1",
        },
      ];

      const mockUniqueVisitors = [
        {
          id: 1,
          fingerprint: "visitor1",
          firstVisit: new Date("2024-01-01"),
          lastVisit: new Date("2024-01-02"),
          visitCount: 5,
        },
      ];

      mockPrisma.pageView.findMany.mockResolvedValue(mockPageViews);
      mockPrisma.uniqueVisitor.findMany.mockResolvedValue(mockUniqueVisitors);

      const result = await exportAnalytics();

      expect(result).toEqual({
        pageViews: mockPageViews,
        uniqueVisitors: mockUniqueVisitors,
        exportDate: expect.any(String),
      });

      expect(mockPrisma.pageView.findMany).toHaveBeenCalledWith({
        orderBy: { timestamp: "desc" },
      });

      expect(mockPrisma.uniqueVisitor.findMany).toHaveBeenCalledWith({
        orderBy: { lastVisit: "desc" },
      });
    });

    it("should handle database errors during export", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPrisma.pageView.findMany.mockRejectedValue(
        new Error("Database error")
      );

      const result = await exportAnalytics();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Erreur lors de l'export des analytics:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
