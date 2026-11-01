import Link from "next/link";
import { AuthNotice, AuthScreen } from "@/components/admin/auth-screen";
import { Button } from "@/components/ui/button";
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
 * Maintenant c'est un lien. Le serveur d'Ascencia ID s'occupe du reste (PKCE,
 * `state`, `nonce`) et la page **fonctionne sans JavaScript**, ce qui est la
 * moindre des choses pour un écran d'authentification.
 *
 * Les messages d'erreur arrivent par la requête plutôt que par un effet : ils
 * sont donc rendus du premier coup, sans clignotement.
 */

const ERRORS: Record<string, string> = {
  access_denied:
    "Ce compte n'a pas accès au panneau d'administration. Demande une invitation.",
  invalid_state:
    "La demande a expiré ou provient d'un autre onglet. Réessaie depuis cette page.",
  missing_transaction:
    "La connexion a commencé ailleurs. Réessaie depuis cette page.",
  authentication_failed:
    "La connexion n'a pas abouti. Réessaie dans un instant.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = typeof query.error === "string" ? query.error : null;
  const message = raw
    ? (ERRORS[raw] ?? "La connexion n'a pas abouti. Réessaie dans un instant.")
    : null;

  return (
    <AuthScreen
      title="Panneau d'administration"
      subtitle="La connexion passe par Ascencia ID."
    >
      {message ? <AuthNotice tone="danger">{message}</AuthNotice> : null}

      <Button asChild className="w-full" size="lg">
        <Link href={signInUrl("/admin")} prefetch={false}>
          Se connecter
        </Link>
      </Button>

      <p className="text-fg-subtle text-center text-xs leading-relaxed">
        L&apos;accès est sur invitation. Chaque connexion et chaque refus sont
        enregistrés dans le journal d&apos;audit d&apos;Ascencia ID.
      </p>
    </AuthScreen>
  );
}
