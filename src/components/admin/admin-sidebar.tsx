"use client";

import * as React from "react";
import {
  BarChart3,
  Eye,
  Settings,
  Users,
  Activity,
  Home,
  FileText,
  Database,
  Shield,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Données de navigation pour l'admin
const navData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: true,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
      items: [
        {
          title: "Vue d'ensemble",
          url: "/admin",
        },
        {
          title: "Visiteurs",
          url: "/admin/visitors",
        },
        {
          title: "Pages",
          url: "/admin/pages",
        },
      ],
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
      title: "Paramètres",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Admin Panel</span>
            <span className="truncate text-xs">Just Tools</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
