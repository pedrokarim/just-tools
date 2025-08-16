import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "25");
    const offset = (page - 1) * pageSize;

    const loginAttempts = await (prisma as any).loginAttempt.findMany({
      orderBy: {
        timestamp: "desc",
      },
      skip: offset,
      take: pageSize,
    });

    // Calculer les statistiques
    const totalAttempts = await (prisma as any).loginAttempt.count();
    const successfulAttempts = await (prisma as any).loginAttempt.count({
      where: { success: true },
    });
    const failedAttempts = await (prisma as any).loginAttempt.count({
      where: { success: false },
    });

    // Tentatives des dernières 24h
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const last24hAttempts = await (prisma as any).loginAttempt.count({
      where: {
        timestamp: {
          gte: last24h,
        },
      },
    });

    // Convertir explicitement tous les BigInt en Number avant la sérialisation
    const serializedData = JSON.parse(
      JSON.stringify(
        {
          loginAttempts,
          stats: {
            totalAttempts,
            successfulAttempts,
            failedAttempts,
            last24hAttempts,
            successRate:
              totalAttempts > 0
                ? (successfulAttempts / totalAttempts) * 100
                : 0,
          },
          pagination: {
            page,
            pageSize,
            total: totalAttempts,
            totalPages: Math.ceil(totalAttempts / pageSize),
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
    console.error(
      "Erreur lors de la récupération des tentatives de connexion:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
