import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/access-denied",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Vérifier l'autorisation pour Discord
      if (account?.provider === "discord") {
        const discordId = account.providerAccountId;

        // Vérifier si l'utilisateur est autorisé
        const authorizedUsers = process.env.AUTHORIZED_USERS?.split(",") || [];
        const isAuthorized = authorizedUsers.includes(discordId);

        if (!isAuthorized) {
          // Enregistrer la tentative échouée
          await recordLoginAttempt({
            discordId,
            username: user.name || undefined,
            email: user.email || undefined,
            avatar: user.image || undefined,
            success: false,
            reason: "Utilisateur non autorisé",
          });

          return false; // Refuser la connexion
        } else {
          // Enregistrer la tentative réussie
          await recordLoginAttempt({
            discordId,
            username: user.name || undefined,
            email: user.email || undefined,
            avatar: user.image || undefined,
            success: true,
            reason: "Connexion autorisée",
          });
        }
      }

      return true;
    },
    async session({ session, user }) {
      // Ajouter l'ID utilisateur à la session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log des connexions pour debugging
      console.log(
        `Connexion: ${user.name} (${user.email}) via ${account?.provider}`
      );
    },
  },
});
