"use client";

import Link from "next/link";
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
  useSidebar,
} from "@/components/ui/sidebar";
import type { AdminChromeUser } from "./admin-chrome";

/**
 * Le bloc utilisateur de la barre latérale.
 *
 * ── Ce qui a disparu ───────────────────────────────────────────────────────
 *
 * Trois états — chargement, non connecté, connecté — et un `useSession()` pour
 * les départager. Ils n'ont plus lieu d'être : le layout serveur ne rend cette
 * barre **que** si la personne est autorisée, donc l'utilisateur est toujours
 * là. Les deux états morts servaient à couvrir une incertitude qui n'existe
 * plus.
 *
 * La déconnexion était un `onClick` avec trois toasts. C'est maintenant un
 * lien vers `/api/auth/signout` : ça marche sans JavaScript, ça laisse une
 * trace HTTP ordinaire, et il n'y a plus d'état intermédiaire à afficher.
 *
 * Les entrées « Profil » et « Paramètres » du menu ne faisaient rien — aucun
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
  const { isMobile } = useSidebar();

  const name = user.name ?? "Compte Ascencia";
  const subtitle = user.email ?? user.roles.join(", ") ?? "";
  const accountUrl = `${process.env.NEXT_PUBLIC_ASCENCIA_ISSUER ?? "https://id.ascencia.re"}/account`;

  const face = (
    <Avatar className="h-8 w-8 rounded-lg">
      {user.picture ? <AvatarImage src={user.picture} alt="" /> : null}
      <AvatarFallback className="rounded-lg">{initials(user)}</AvatarFallback>
    </Avatar>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {face}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
                <span className="truncate text-xs">{subtitle}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" aria-hidden />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {face}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs">{subtitle}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            {user.roles.length > 0 ? (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Rôles&nbsp;: {user.roles.join(", ")}
                </div>
              </>
            ) : null}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={accountUrl} target="_blank" rel="noreferrer">
                <UserCog className="mr-2 h-4 w-4" aria-hidden />
                Gérer mon compte
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            {/*
              Un `<a>` et non un `<Link>` : la cible est une route d'API, pas
              une page. `Link` tente une navigation côté client, va chercher une
              charge utile React qui n'existe pas, et le clic ne fait rien — ce
              qui est exactement ce qu'on a constaté.

              Et un lien plutôt qu'un `onClick` : la déconnexion doit aboutir
              même si le JavaScript de la page a échoué. C'est précisément le
              moment où l'on veut pouvoir partir.
            */}
            <DropdownMenuItem asChild>
              <a href="/api/auth/signout">
                <LogOut className="mr-2 h-4 w-4" aria-hidden />
                Se déconnecter
              </a>
            </DropdownMenuItem>

            {/*
              Se déconnecter d'ici ne ferme pas la session Ascencia ID : c'est
              le principe du SSO, et c'est le bon défaut sur un poste à soi.
              Mais sans cette seconde entrée, on se déconnecte, on reclique
              « Se connecter », et on rentre **sans qu'on nous demande rien** —
              ce qui donne l'impression que la déconnexion n'a pas marché.
            */}
            <DropdownMenuItem asChild>
              <a href="/api/auth/signout?global=1">
                <LogOut className="mr-2 h-4 w-4" aria-hidden />
                Se déconnecter partout
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
