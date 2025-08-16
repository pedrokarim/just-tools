import { NextResponse } from "next/server";
import { clearAnalytics } from "@/lib/analytics";

export async function POST() {
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
