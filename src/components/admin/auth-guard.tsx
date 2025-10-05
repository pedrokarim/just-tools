"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier d'abord si on a une session
        if (status === "loading") {
          return; // Attendre que la session soit chargée
        }

        if (status === "unauthenticated" || !session?.user) {
          router.replace("/admin/login");
          return;
        }

        // Attendre un peu que la session soit synchronisée
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Vérifier l'autorisation via l'API
        const response = await fetch("/api/auth/check-authorization");
        const data = await response.json();

        if (!data.authorized) {
          // Utilisateur non autorisé ou non connecté - DÉCONNEXION IMMÉDIATE
          if (data.reason === "Non connecté") {
            router.replace("/admin/login");
          } else {
            // Utilisateur connecté mais non autorisé - VIDER LA SESSION
            try {
              await signOut({ redirect: false });
              toast.error("Accès refusé", {
                description:
                  "Vous n'êtes pas autorisé à accéder au panel d'administration. Session déconnectée.",
                duration: 5000,
              });
            } catch (error) {
              console.error("Erreur lors de la déconnexion:", error);
            }
            router.replace("/admin/access-denied");
          }
          return;
        }

        // Utilisateur autorisé
        setIsAuthorized(true);
      } catch (error) {
        console.error(
          "Erreur lors de la vérification d'authentification:",
          error
        );
        router.replace("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, session, status]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Vérification de l'autorisation...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // La redirection est en cours
  }

  return <>{children}</>;
}
