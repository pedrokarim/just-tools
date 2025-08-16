import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";

// Fonction pour obtenir la géolocalisation (DÉSACTIVÉE TEMPORAIREMENT)
async function getLocationData(
  ip: string
): Promise<{ country?: string; city?: string }> {
  // DÉSACTIVÉ - Retourner des valeurs par défaut
  return {
    country: "Unknown",
    city: "Unknown",
  };
}

// Fonction pour enregistrer une tentative de connexion
async function recordLoginAttempt(data: {
  discordId?: string;
  username?: string;
  email?: string;
  avatar?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
}) {
  try {
    const locationData = data.ipAddress
      ? await getLocationData(data.ipAddress)
      : {};

    await (prisma as any).loginAttempt.create({
      data: {
        discordId: data.discordId,
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        country: locationData.country,
        city: locationData.city,
        success: data.success,
        reason: data.reason,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement de la tentative de connexion:",
      error
    );
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Ne traiter que les connexions sociales
      if (!ctx.path.startsWith("/sign-in/social")) return;

      // Récupérer l'IP et l'User-Agent
      const forwarded = ctx.request?.headers.get("x-forwarded-for");
      const realIp = ctx.request?.headers.get("x-real-ip");
      const ipAddress = forwarded?.split(",")[0] || realIp || "unknown";
      const userAgent = ctx.request?.headers.get("user-agent") || "unknown";

      // Pour Discord, on ne peut pas vérifier l'autorisation ici car on n'a pas encore l'ID Discord
      // On va juste enregistrer la tentative et laisser passer
      await recordLoginAttempt({
        ipAddress,
        userAgent,
        success: true, // On laisse passer pour l'instant
        reason: "Tentative de connexion Discord",
      });
    }),
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          // Récupérer l'account Discord associé à cette session
          try {
            const account = await (prisma as any).account.findFirst({
              where: {
                userId: session.userId,
                providerId: "discord",
              },
            });

            if (account) {
              const discordId = account.accountId;

              // Récupérer les données utilisateur
              const user = await (prisma as any).user.findUnique({
                where: { id: session.userId },
              });

              // Vérifier si l'utilisateur est autorisé
              const authorizedUsers =
                process.env.AUTHORIZED_USERS?.split(",") || [];
              const isAuthorized = authorizedUsers.includes(discordId);

              if (!isAuthorized) {
                // Supprimer la session non autorisée
                await (prisma as any).session.delete({
                  where: { id: session.id },
                });

                // Enregistrer la tentative échouée
                await recordLoginAttempt({
                  discordId,
                  username: user?.name,
                  email: user?.email,
                  avatar: user?.image,
                  ipAddress: session.ipAddress || undefined,
                  userAgent: session.userAgent || undefined,
                  success: false,
                  reason: "Utilisateur non autorisé",
                });

                // Lever une erreur pour informer le client
                throw new APIError("UNAUTHORIZED", {
                  message:
                    "Vous n'êtes pas autorisé à accéder au panel d'administration.",
                });
              } else {
                // Enregistrer la tentative réussie
                await recordLoginAttempt({
                  discordId,
                  username: user?.name,
                  email: user?.email,
                  avatar: user?.image,
                  ipAddress: session.ipAddress || undefined,
                  userAgent: session.userAgent || undefined,
                  success: true,
                  reason: "Connexion autorisée",
                });
              }
            }
          } catch (error) {
            console.error(
              "Erreur lors de la vérification d'autorisation:",
              error
            );
            throw error;
          }
        },
      },
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/access-denied",
  },
  secret: process.env.BETTER_AUTH_SECRET,
});
