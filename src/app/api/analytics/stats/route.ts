import { NextResponse } from "next/server";
import { getAnalyticsStats } from "@/lib/analytics";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

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
