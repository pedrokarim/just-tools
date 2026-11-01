"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { JustToolsMark } from "@/components/brand/just-tools-lockup";
import { ThemeToggle } from "@/components/site/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

/**
 * L'habillage du panneau : barre latérale, en-tête, titre courant.
 *
 * Séparé du layout parce que le titre dépend de `usePathname()`, donc du
 * client, alors que **la décision d'autoriser doit rester serveur**. Mélanger
 * les deux obligeait à passer tout le layout en composant client, et c'est de
 * là que venait le garde côté navigateur.
 *
 * La forme est celle de `ConsoleShell` d'Ascencia ID : la barre colle au bord de
 * la fenêtre et rien ne contraint la coquille. La largeur de lecture se borne à
 * l'intérieur du contenu, aligné à gauche, pour que le regard qui quitte la barre
 * tombe dessus au lieu de le chercher au centre.
 */

export interface AdminChromeUser {
  name: string | null;
  email: string | null;
  picture: string | null;
  roles: string[];
}

/** Le titre de chaque écran. Ailleurs, un repli honnête plutôt qu'un vide. */
const TITLES: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/visitors": "Visiteurs",
  "/admin/pages": "Pages",
  "/admin/logins": "Connexions",
  "/admin/database": "Base de données",
  "/admin/artifacts": "Artefacts",
  "/admin/settings": "Paramètres",
};

export function AdminChrome({
  user,
  children,
}: {
  user: AdminChromeUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Administration";

  return (
    <SidebarProvider>
      <AdminSidebar user={user} />
      <SidebarInset>
        <header className="border-border flex min-h-14 min-w-0 shrink-0 items-center gap-3 border-b px-5 lg:px-10">
          <SidebarTrigger className="-ms-2" />
          <JustToolsMark size={22} title="" className="md:hidden" />
          <nav aria-label="Fil d'Ariane" className="min-w-0 flex-1">
            <ol className="text-fg-muted flex min-w-0 items-center gap-1.5 text-sm">
              <li className="flex shrink-0 items-center gap-1.5 max-sm:hidden">
                <Link
                  href="/admin"
                  className="hover:text-fg flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Administration
                </Link>
                <ChevronRight
                  size={14}
                  className="text-fg-subtle shrink-0"
                  aria-hidden
                />
              </li>
              <li
                aria-current="page"
                title={title}
                className="text-fg min-w-0 truncate font-medium"
              >
                {title}
              </li>
            </ol>
          </nav>
          <ThemeToggle className="shrink-0" />
        </header>
        <div className="flex w-full max-w-[100rem] min-w-0 flex-col gap-8 px-5 py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
