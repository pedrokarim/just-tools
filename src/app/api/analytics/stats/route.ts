import { NextResponse } from "next/server";
import { getAnalyticsStats } from "@/lib/analytics";

export async function GET() {
  try {
    const stats = await getAnalyticsStats();

    // Convertir explicitement tous les BigInt en Number avant la sérialisation
    const serializedStats = JSON.parse(
      JSON.stringify(stats, (key, value) => {
        if (typeof value === "bigint") {
          return Number(value);
        }
        return value;
      })
    );

    return NextResponse.json(serializedStats);
  } catch (error) {
    console.error("Error fetching analytics stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
