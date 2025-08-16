import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Statistiques générales
    const totalPageViews = Number(await prisma.pageView.count());
    const totalUniqueVisitors = Number(await prisma.uniqueVisitor.count());
    const totalLoginAttempts = Number(await prisma.loginAttempt.count());

    // Vues récentes
    const recentPageViews = await prisma.pageView.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: 10,
      select: {
        id: true,
        pagePath: true,
        timestamp: true,
        ipAddress: true,
        country: true,
        city: true,
      },
    });

    // Visiteurs récents
    const recentVisitors = await prisma.uniqueVisitor.findMany({
      orderBy: {
        lastVisit: "desc",
      },
      take: 10,
      select: {
        id: true,
        fingerprint: true,
        firstVisit: true,
        lastVisit: true,
        visitCount: true,
      },
    });

    // Tentatives de connexion récentes
    const recentLoginAttempts = await prisma.loginAttempt.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: 20,
      select: {
        id: true,
        discordId: true,
        username: true,
        success: true,
        reason: true,
        timestamp: true,
        ipAddress: true,
        country: true,
        city: true,
      },
    });

    return NextResponse.json({
      totalPageViews,
      totalUniqueVisitors,
      totalLoginAttempts,
      recentPageViews,
      recentVisitors,
      recentLoginAttempts,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats DB:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
