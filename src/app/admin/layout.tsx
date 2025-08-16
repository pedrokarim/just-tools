"use client";

import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/admin/auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const isAccessDeniedPage = pathname === "/admin/access-denied";

  // Si c'est la page de connexion ou d'accès refusé, ne pas appliquer l'AuthGuard
  if (isLoginPage || isAccessDeniedPage) {
    return <>{children}</>;
  }

  // Pour toutes les autres pages admin, appliquer l'AuthGuard
  return (
    <AuthGuard>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="text-sm font-medium">
                {pathname === "/admin" && "Dashboard"}
                {pathname === "/admin/visitors" && "Visiteurs"}
                {pathname === "/admin/pages" && "Pages"}
                {pathname === "/admin/logins" && "Connexions"}
                {pathname === "/admin/settings" && "Paramètres"}
                {pathname.startsWith("/admin/") &&
                  ![
                    "/admin",
                    "/admin/visitors",
                    "/admin/pages",
                    "/admin/logins",
                    "/admin/settings",
                  ].includes(pathname) &&
                  "Admin"}
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
