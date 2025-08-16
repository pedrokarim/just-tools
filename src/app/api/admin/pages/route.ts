import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "25");
    const offset = (page - 1) * pageSize;

    // Récupérer les statistiques des pages
    const totalPages = Number(await prisma.pageView.count());
    const uniquePages = (await prisma.$queryRaw`
      SELECT COUNT(DISTINCT pagePath) as count
      FROM pageView
    `) as Array<{ count: number }>;
    const uniquePagesCount = Number(uniquePages[0]?.count || 0);

    // Récupérer les pages les plus visitées avec pagination
    const pagesWithStats = (await prisma.$queryRaw`
      SELECT 
        pagePath,
        CAST(COUNT(*) AS INTEGER) as viewCount,
        CAST(COUNT(DISTINCT fingerprint) AS INTEGER) as uniqueVisitors,
        MAX(timestamp) as lastVisit
      FROM pageView
      GROUP BY pagePath
      ORDER BY viewCount DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `) as Array<{
      pagePath: string;
      viewCount: number;
      uniqueVisitors: number;
      lastVisit: string;
    }>;

    // Récupérer les détails des dernières vues pour chaque page
    const pagesWithDetails = await Promise.all(
      pagesWithStats.map(async (pageStats) => {
        const recentViews = await prisma.pageView.findMany({
          where: { pagePath: pageStats.pagePath },
          orderBy: { timestamp: "desc" },
          take: 5,
          select: {
            id: true,
            timestamp: true,
            ipAddress: true,
            country: true,
            city: true,
            fingerprint: true,
          },
        });

        return {
          ...pageStats,
          recentViews,
        };
      })
    );

    // Convertir explicitement tous les BigInt en Number avant la sérialisation
    const serializedData = JSON.parse(
      JSON.stringify(
        {
          pages: pagesWithDetails,
          stats: {
            totalPages,
            uniquePages: uniquePagesCount,
          },
          pagination: {
            page,
            pageSize,
            total: uniquePagesCount,
            totalPages: Math.ceil(uniquePagesCount / pageSize),
          },
        },
        (key, value) => {
          if (typeof value === "bigint") {
            return Number(value);
          }
          return value;
        }
      )
    );

    return NextResponse.json(serializedData);
  } catch (error) {
    console.error("Erreur lors de la récupération des pages:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
