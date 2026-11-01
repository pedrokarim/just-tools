import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthNotice, AuthScreen } from "@/components/admin/auth-screen";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <AuthScreen
      title="Accès refusé"
      subtitle="Ce compte n'a pas accès au panneau d'administration."
    >
      <AuthNotice tone="warning">
        Ta tentative a été enregistrée. Si tu dois pouvoir entrer, demande une
        invitation à l&apos;administrateur.
      </AuthNotice>

      <Button asChild variant="outline" className="w-full">
        <Link href="/admin/login">
          <ArrowLeft aria-hidden />
          Retour à la connexion
        </Link>
      </Button>
    </AuthScreen>
  );
}
