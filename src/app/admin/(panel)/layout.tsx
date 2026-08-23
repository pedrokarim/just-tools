import { redirect } from "next/navigation";
import { ADMIN_PERMISSION } from "@/lib/admin-auth";
import { auth, getProfile } from "@/lib/auth";
import { AdminChrome } from "@/components/admin/admin-chrome";

/**
 * Le garde du panneau d'administration.
 *
 * ── Pourquoi côté serveur ──────────────────────────────────────────────────
 *
 * Il était côté client : un composant monté, qui attendait la session, patientait
 * une seconde en dur, puis interrogeait `/api/auth/check-authorization` avant de
 * décider. Trois conséquences, toutes désagréables — le contenu clignotait avant
 * de disparaître, la décision arrivait après le rendu, et la page dépendait du
 * JavaScript pour se protéger visuellement.
 *
 * Ici la question est posée avant le premier octet. Rien n'est envoyé à qui n'a
 * pas le droit de le voir.
 *
 * ── Ce que ça ne remplace pas ──────────────────────────────────────────────
 *
 * Ce garde protège l'**affichage**. Les données restent protégées par
 * `requireAdmin()` dans chaque route d'API : un garde de rendu n'empêche
 * personne d'appeler l'API directement, et c'est là que vivent les données.
 *
 * ── Le groupe de routes ────────────────────────────────────────────────────
 *
 * `(panel)` ne change aucune URL — `/admin`, `/admin/visitors`… sont
 * inchangées. Il sert à ce que `/admin/login` et `/admin/access-denied`
 * échappent à ce layout : sans ça, la page de connexion serait gardée par le
 * garde qu'elle sert à franchir.
 */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await auth();

  // Les deux refus ne mènent pas au même endroit, et c'est ce qui rend l'écran
  // utile : sans session, on peut se connecter ; avec une session sans droit,
  // se reconnecter ne changerait rien et il faut demander un accès.
  if (!context) redirect("/admin/login");
  if (!context.can(ADMIN_PERMISSION)) redirect("/admin/access-denied");

  const profile = await getProfile();

  return (
    <AdminChrome
      user={{
        name: profile?.name ?? null,
        email: profile?.email ?? null,
        picture: profile?.picture ?? null,
        roles: [...context.roles],
      }}
    >
      {children}
    </AdminChrome>
  );
}
