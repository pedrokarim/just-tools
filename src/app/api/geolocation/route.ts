import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "@/lib/lru-cache";
import { authClient } from "@/lib/auth-client";

// Interface pour les données de géolocalisation
interface GeolocationData {
  country: string;
  city: string;
  region: string;
  ip: string;
  timezone: string;
  org: string;
  timestamp: string;
  error?: string;
}

// Instance globale du cache pour la géolocalisation
const geolocationCache = new LRUCache<GeolocationData>(
  1000,
  24 * 60 * 60 * 1000
); // 1000 items, 24h TTL

// Fonction pour vérifier l'autorisation admin
async function checkAdminAuthorization(): Promise<boolean> {
  try {
    const session = await authClient.getSession();

    if (!session || !("data" in session) || !session.data?.user) {
      return false;
    }

    // Vérifier si l'utilisateur est autorisé
    const authorizedUsers = process.env.AUTHORIZED_USERS?.split(",") || [];
    const userDiscordId = session.data.user.id;

    return authorizedUsers.includes(userDiscordId);
  } catch (error) {
    console.error(
      "Erreur lors de la vérification d'autorisation admin:",
      error
    );
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'IP depuis les headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwarded?.split(",")[0] || realIp || "unknown";

    // Vérifier le cache d'abord
    const cachedData = geolocationCache.get(ipAddress);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Si pas en cache, faire l'appel à ipapi.co
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes

    try {
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
        headers: {
          "User-Agent": "Just-Tools-Admin/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Formater les données
      const formattedData: GeolocationData = {
        country: data.country_name,
        city: data.city,
        region: data.region,
        ip: data.ip,
        timezone: data.timezone,
        org: data.org,
        timestamp: new Date().toISOString(),
      };

      // Mettre en cache
      geolocationCache.set(ipAddress, formattedData);

      return NextResponse.json(formattedData);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la géolocalisation:",
      error
    );

    // Retourner des données par défaut en cas d'erreur
    const defaultData: GeolocationData = {
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
      ip: "unknown",
      timezone: "UTC",
      org: "Unknown",
      timestamp: new Date().toISOString(),
      error: "Failed to fetch geolocation data",
    };

    return NextResponse.json(defaultData);
  }
}

// Endpoint pour les statistiques du cache (PROTÉGÉ - Admin uniquement)
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'autorisation admin
    const isAuthorized = await checkAdminAuthorization();
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    if (action === "clear") {
      geolocationCache.clear();
      return NextResponse.json({ message: "Cache cleared", size: 0 });
    }

    if (action === "stats") {
      return NextResponse.json(geolocationCache.getStats());
    }

    if (action === "cleanup") {
      const deletedCount = geolocationCache.cleanup();
      return NextResponse.json({
        message: "Cache cleanup completed",
        deletedCount,
        stats: geolocationCache.getStats(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Erreur lors de la gestion du cache:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
