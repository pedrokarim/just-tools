import { NextResponse } from "next/server";
import { getUniqueVisitors } from "@/lib/analytics";

export async function GET() {
  try {
    const visitors = await getUniqueVisitors();
    return NextResponse.json(visitors);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
