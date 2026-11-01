"use client";

import * as React from "react";
import { Settings, Users, Home, FileText, Database, Shield, Sparkles } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import type { AdminChromeUser } from "./admin-chrome";
import { JustToolsMark } from "@/components/brand/just-tools-lockup";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail } from "@/components/ui/sidebar";

// Données de navigation pour l'admin
const navData = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/admin",
      icon: Home,
      isActive: true,
    },
    {
      title: "Visiteurs",
      url: "/admin/visitors",
      icon: Users,
    },
    {
      title: "Pages",
      url: "/admin/pages",
      icon: FileText,
    },
    {
      title: "Connexions",
      url: "/admin/logins",
      icon: Shield,
    },
    {
      title: "Base de données",
      url: "/admin/database",
      icon: Database,
    },
    {
      title: "Artefacts",
      url: "/admin/artifacts",
      icon: Sparkles,
    },
    {
      title: "Paramètres",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
};

export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: AdminChromeUser }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-border h-16 shrink-0 flex-row items-center gap-2.5 border-b px-5 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <JustToolsMark size={28} title="" />
        <div className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
          <span
            translate="no"
            className="font-display text-fg truncate text-[1.0625rem] leading-none font-semibold tracking-[-0.03em]"
          >
            Just Tools
          </span>
          <span className="text-fg-subtle truncate text-xs leading-none">
            Administration
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-border border-t p-3 group-data-[collapsible=icon]:p-2">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
