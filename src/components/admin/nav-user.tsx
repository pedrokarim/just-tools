"use client";

import { ChevronsUpDown, LogOut, UserCog } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AdminChromeUser } from "./admin-chrome";

/**
 * Le bloc utilisateur de la barre latérale.
 *
 * ── Ce qui a disparu ───────────────────────────────────────────────────────
 *
 * Trois états (chargement, non connecté, connecté) et un `useSession()` pour
 * les départager. Ils n'ont plus lieu d'être : le layout serveur ne rend cette
 * barre **que** si la personne est autorisée, donc l'utilisateur est toujours
 * là. Les deux états morts servaient à couvrir une incertitude qui n'existe
 * plus.
 *
 * La déconnexion était un `onClick` avec trois toasts. C'est maintenant un
 * lien vers `/api/auth/signout` : ça marche sans JavaScript, ça laisse une
 * trace HTTP ordinaire, et il n'y a plus d'état intermédiaire à afficher.
 *
 * Les entrées « Profil » et « Paramètres » du menu ne faisaient rien : aucun
 * `onClick`, aucun lien. Le profil vit maintenant dans Ascencia ID, qui a un
 * centre de compte : le lien y mène.
 */

/** Deux lettres à partir du nom, ou une à partir de l'e-mail. */
function initials(user: AdminChromeUser): string {
  const source = user.name ?? user.email ?? "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p.charAt(0));
  return (letters.join("") || "?").toUpperCase();
}

export function NavUser({ user }: { user: AdminChromeUser }) {
  const name = user.name ?? "Compte Ascencia";
  const subtitle = user.email ?? user.roles.join(", ") ?? "";
  const accountUrl = `${process.env.NEXT_PUBLIC_ASCENCIA_ISSUER ?? "https://id.ascencia.re"}/account`;

  const face = (
    <Avatar className="size-8">
      {user.picture ? <AvatarImage src={user.picture} alt="" /> : null}
      <AvatarFallback className="text-fg-muted text-xs font-semibold">
        {initials(user)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label={`Menu du compte, ${name}`}
              className="data-[state=open]:bg-bg gap-2.5 px-2"
            >
              {face}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-fg truncate text-sm font-medium" title={name}>
                  {name}
                </span>
                <span className="text-fg-muted truncate text-xs" title={subtitle}>
                  {subtitle}
                </span>
              </span>
              <ChevronsUpDown
                className="text-fg-subtle ml-auto size-4 shrink-0"
                aria-hidden
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[max(var(--radix-dropdown-menu-trigger-width),15rem)] max-w-[calc(100vw-2rem)]"
            side="top"
            align="start"
          >
            <DropdownMenuLabel className="p-0 font-sans text-sm font-normal tracking-normal normal-case">
              <div className="flex min-w-0 items-center gap-2.5 px-2.5 py-2">
                {face}
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-fg font-medium break-words">{name}</span>
                  <span className="text-fg-muted text-xs break-all">
                    {subtitle}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            {user.roles.length > 0 ? (
              <>
                <DropdownMenuSeparator />
                <div className="text-fg-muted px-2.5 py-1.5 text-xs break-words">
                  Rôles&nbsp;: {user.roles.join(", ")}
                </div>
              </>
            ) : null}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={accountUrl} target="_blank" rel="noreferrer">
                <UserCog aria-hidden />
                Gérer mon compte
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            {/*
              Un `<a>` et non un `<Link>` : la cible est une route d'API, pas
              une page. `Link` tente une navigation côté client, va chercher une
              charge utile React qui n'existe pas, et le clic ne fait rien : c'est
              exactement ce qu'on a constaté.

              Et un lien plutôt qu'un `onClick` : la déconnexion doit aboutir
              même si le JavaScript de la page a échoué. C'est précisément le
              moment où l'on veut pouvoir partir.
            */}
            <DropdownMenuItem asChild>
              <a href="/api/auth/signout">
                <LogOut aria-hidden />
                Se déconnecter
              </a>
            </DropdownMenuItem>

            {/*
              Se déconnecter d'ici ne ferme pas la session Ascencia ID : c'est
              le principe du SSO, et c'est le bon défaut sur un poste à soi.
              Mais sans cette seconde entrée, on se déconnecte, on reclique
              « Se connecter », et on rentre **sans qu'on nous demande rien**,
              ce qui donne l'impression que la déconnexion n'a pas marché.
            */}
            <DropdownMenuItem asChild>
              <a href="/api/auth/signout?global=1">
                <LogOut aria-hidden />
                Se déconnecter partout
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
