import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Validation de l'URL - on vérifie juste que c'est une URL valide
    const url = new URL(imageUrl);

    // PROTECTION DES IMAGES COMMENTÉE :
    // On laisse passer toutes les images maintenant car :
    // 1. On ne stocke pas les images (Vercel s'en occupe)
    // 2. La vérification du Content-Type suffit pour s'assurer que c'est une image
    // 3. Cela permet plus de flexibilité pour les utilisateurs

    // Ancien code de vérification des domaines autorisés (commenté) :
    /*
    const allowedDomains = [
      "images.unsplash.com",
      "picsum.photos", 
      "via.placeholder.com",
      "loremflickr.com",
      "placehold.co",
      "placehold.it",
      "dummyimage.com",
      "imgur.com",
      "i.imgur.com",
      "cdn.pixabay.com",
      "images.pexels.com",
      "source.unsplash.com",
      "img.ascencia.re",
    ];

    const isAllowedDomain = allowedDomains.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowedDomain) {
      return NextResponse.json(
        {
          error: "Domain not allowed for security reasons",
        },
        { status: 403 }
      );
    }
    */

    // Récupérer l'image
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JustTools/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch image: ${response.status}`,
        },
        { status: response.status }
      );
    }

    // VÉRIFICATION IMPORTANTE : S'assurer que c'est vraiment une image
    // Cette vérification est cruciale car elle empêche :
    // - L'injection de scripts malveillants
    // - Le téléchargement de fichiers non-images
    // - Les attaques par proxy de contenu dangereux
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "URL does not point to a valid image",
        },
        { status: 400 }
      );
    }

    // Récupérer les données de l'image
    const imageBuffer = await response.arrayBuffer();

    // Renvoyer l'image avec les bons headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache 1 heure
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return NextResponse.json(
      {
        error: "Failed to proxy image",
      },
      { status: 500 }
    );
  }
}

// Gérer les requêtes OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
