import { NextResponse } from "next/server";
import { clearAnalytics } from "@/lib/analytics";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    await clearAnalytics();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
