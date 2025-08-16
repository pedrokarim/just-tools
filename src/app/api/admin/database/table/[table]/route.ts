import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "25");
    const offset = (page - 1) * pageSize;

    let records: any[] = [];
    let totalCount = 0;

    switch (table) {
      case "pageView":
        totalCount = await prisma.pageView.count();
        records = await prisma.pageView.findMany({
          orderBy: { timestamp: "desc" },
          skip: offset,
          take: pageSize,
        });
        break;

      case "uniqueVisitor":
        totalCount = await prisma.uniqueVisitor.count();
        records = await prisma.uniqueVisitor.findMany({
          orderBy: { lastVisit: "desc" },
          skip: offset,
          take: pageSize,
        });
        break;

      case "loginAttempt":
        totalCount = await (prisma as any).loginAttempt.count();
        records = await (prisma as any).loginAttempt.findMany({
          orderBy: { timestamp: "desc" },
          skip: offset,
          take: pageSize,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Table non reconnue" },
          { status: 400 }
        );
    }

    // Convertir explicitement tous les BigInt en Number avant la sérialisation
    const serializedRecords = JSON.parse(
      JSON.stringify(records, (key, value) => {
        if (typeof value === "bigint") {
          return Number(value);
        }
        return value;
      })
    );

    return NextResponse.json({
      table,
      records: serializedRecords,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la table ${params.table}:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
