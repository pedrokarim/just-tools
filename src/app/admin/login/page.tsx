import Image from "next/image";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInUrl } from "@/lib/auth";

/**
 * L'écran de connexion.
 *
 * ── Ce qu'il n'est plus ────────────────────────────────────────────────────
 *
 * Un composant client avec un état de chargement, un `Suspense`, des toasts et
 * un `signIn()` de NextAuth. Tout ça pour, au bout du compte, envoyer le
 * navigateur ailleurs.
 *
 * Maintenant c'est un lien. Le serveur d'Ascencia ID s'occupe du reste — PKCE,
 * `state`, `nonce` — et la page **fonctionne sans JavaScript**, ce qui est la
 * moindre des choses pour un écran d'authentification.
 *
 * Les messages d'erreur arrivent par la requête plutôt que par un effet : ils
 * sont donc rendus du premier coup, sans clignotement.
 */

const ERRORS: Record<string, string> = {
  access_denied:
    "Ce compte n'a pas accès au panneau d'administration. Demandez une invitation.",
  invalid_state:
    "La demande a expiré ou provient d'un autre onglet. Réessayez depuis cette page.",
  missing_transaction:
    "La connexion a commencé ailleurs. Réessayez depuis cette page.",
  authentication_failed:
    "La connexion n'a pas abouti. Réessayez dans un instant.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = typeof query.error === "string" ? query.error : null;
  const message = raw ? (ERRORS[raw] ?? "La connexion n'a pas abouti.") : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/images/icon-origin.png"
              alt="Just Tools"
              width={120}
              height={120}
            />
          </div>
          <CardTitle className="text-2xl font-bold">Panneau d&apos;administration</CardTitle>
          <CardDescription>
            La connexion passe par Ascencia ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <p
              role="alert"
              className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {message}
            </p>
          ) : null}

          <Button asChild className="w-full" size="lg">
            <Link href={signInUrl("/admin")}>Se connecter</Link>
          </Button>

          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            {/* Une icône plutôt qu'un emoji : un emoji change de dessin selon
                la plateforme et n'existe pas partout. */}
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>
              L&apos;accès est sur invitation. Chaque connexion et chaque refus
              sont enregistrés dans le journal d&apos;audit d&apos;Ascencia ID.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
