import { NextRequest, NextResponse } from "next/server";
import { assertSafeExternalUrl } from "@/lib/safe-fetch";

/** Au-delà, on coupe : évite qu'une URL hostile serve un flux sans fin. */
const MAX_BYTES = 10 * 1024 * 1024; // 10 Mo
const TIMEOUT_MS = 10_000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  // Validation AVANT toute requête sortante : c'est le seul moment où l'on
  // peut empêcher le serveur d'atteindre le réseau interne.
  const safe = await assertSafeExternalUrl(imageUrl);
  if (!safe.ok) {
    return NextResponse.json({ error: safe.reason }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(safe.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JustTools/1.0)" },
      signal: controller.signal,
      // Sans ça, une redirection pourrait renvoyer vers une IP interne après
      // que la validation a eu lieu.
      redirect: "error",
    });

    if (!response.ok) {
      // Statut amont volontairement masqué : le renvoyer transformait cette
      // route en oracle permettant de cartographier hôtes et ports.
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "URL does not point to a valid image" },
        { status: 400 }
      );
    }

    const declared = Number(response.headers.get("content-length") ?? "0");
    if (declared > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const imageBuffer = await response.arrayBuffer();
    // `content-length` est déclaratif : on revérifie sur la taille réelle.
    if (imageBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 502 }
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
