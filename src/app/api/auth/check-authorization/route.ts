import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Utiliser la vraie session côté serveur avec BetterAuth
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ authorized: false, reason: "Non connecté" });
    }

    // Récupérer l'account Discord associé à cette session
    const account = await (prisma as any).account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "discord",
      },
    });

    if (!account) {
      return NextResponse.json({
        authorized: false,
        reason: "Aucun compte Discord trouvé",
      });
    }

    const discordId = account.accountId;

    // Vérifier si l'utilisateur est autorisé
    const authorizedUsers = process.env.AUTHORIZED_USERS?.split(",") || [];
    const isAuthorized = authorizedUsers.includes(discordId);

    return NextResponse.json({
      authorized: isAuthorized,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        discordId: discordId,
      },
      reason: isAuthorized ? undefined : "Utilisateur non autorisé",
    });
  } catch (error) {
    console.error("Erreur lors de la vérification d'autorisation:", error);
    return NextResponse.json(
      { authorized: false, reason: "Erreur de vérification" },
      { status: 500 }
    );
  }
}
