"use client";

import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

/**
 * L'habillage du panneau : barre latérale, en-tête, titre courant.
 *
 * Séparé du layout parce que le titre dépend de `usePathname()`, donc du
 * client, alors que **la décision d'autoriser doit rester serveur**. Mélanger
 * les deux obligeait à passer tout le layout en composant client, et c'est de
 * là que venait le garde côté navigateur.
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

  return (
    <SidebarProvider>
      <AdminSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" aria-hidden />
              <div className="text-sm font-medium">
                {TITLES[pathname] ?? "Administration"}
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
