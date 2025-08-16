import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "25");
    const offset = (page - 1) * pageSize;

    // Récupérer les statistiques des visiteurs
    const totalVisitors = Number(await prisma.uniqueVisitor.count());
    const totalPageViews = Number(await prisma.pageView.count());

    // Récupérer les visiteurs avec pagination
    const visitors = await prisma.uniqueVisitor.findMany({
      orderBy: {
        lastVisit: "desc",
      },
      skip: offset,
      take: pageSize,
      select: {
        id: true,
        fingerprint: true,
        firstVisit: true,
        lastVisit: true,
        visitCount: true,
      },
    });

    // Récupérer les détails des dernières vues pour chaque visiteur
    const visitorsWithDetails = await Promise.all(
      visitors.map(async (visitor) => {
        const recentViews = await prisma.pageView.findMany({
          where: { fingerprint: visitor.fingerprint },
          orderBy: { timestamp: "desc" },
          take: 5,
          select: {
            id: true,
            pagePath: true,
            timestamp: true,
            ipAddress: true,
            country: true,
            city: true,
          },
        });

        // Calculer les statistiques du visiteur
        const totalViews = await prisma.pageView.count({
          where: { fingerprint: visitor.fingerprint },
        });

        const uniquePages = (await prisma.$queryRaw`
          SELECT COUNT(DISTINCT pagePath) as count
          FROM pageView
          WHERE fingerprint = ${visitor.fingerprint}
        `) as Array<{ count: number }>;

        return {
          ...visitor,
          recentViews,
          totalViews,
          uniquePages: Number(uniquePages[0]?.count || 0),
        };
      })
    );

    // Convertir explicitement tous les BigInt en Number avant la sérialisation
    const serializedData = JSON.parse(
      JSON.stringify(
        {
          visitors: visitorsWithDetails,
          stats: {
            totalVisitors,
            totalPageViews,
            averageVisitsPerVisitor:
              totalVisitors > 0 ? totalPageViews / totalVisitors : 0,
          },
          pagination: {
            page,
            pageSize,
            total: totalVisitors,
            totalPages: Math.ceil(totalVisitors / pageSize),
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
    console.error("Erreur lors de la récupération des visiteurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
