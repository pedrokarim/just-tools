"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DiscordIcon } from "@/components/icons";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier s'il y a une erreur dans l'URL
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "ACCESS_DENIED") {
      toast.error("Accès refusé", {
        description:
          "Vous n'êtes pas autorisé à accéder au panel d'administration.",
        duration: 5000,
      });
    } else if (error) {
      toast.error("Erreur de connexion", {
        description: "Une erreur s'est produite lors de la connexion.",
        duration: 5000,
      });
    }
  }, [searchParams]);

  const handleDiscordLogin = async () => {
    try {
      setIsLoading(true);

      // Toast de chargement
      const loadingToast = toast.loading("Connexion en cours...", {
        description: "Redirection vers Discord...",
      });

      await authClient.signIn.social({
        provider: "discord",
        callbackURL: "/admin", // Rediriger directement vers admin
      });

      // Dismiss le toast de chargement
      toast.dismiss(loadingToast);

      // Si on arrive ici, c'est que la redirection a commencé
      toast.success("Redirection vers Discord...", {
        description:
          "Vous allez être redirigé vers Discord pour autoriser l'accès.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Erreur de connexion Discord:", error);
      setIsLoading(false);

      // Toast d'erreur avec rich colors
      toast.error("Échec de la connexion", {
        description:
          "Erreur de base de données ou de configuration. Vérifiez les logs.",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <CardDescription>
            Connectez-vous avec Discord pour accéder au panel d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            size="lg"
          >
            <DiscordIcon className="mr-2 h-5 w-5" />
            {isLoading ? "Connexion..." : "Se connecter avec Discord"}
          </Button>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>⚠️ Seuls les utilisateurs autorisés peuvent accéder au panel</p>
            <p className="mt-1">
              Toutes les tentatives de connexion sont surveillées
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
