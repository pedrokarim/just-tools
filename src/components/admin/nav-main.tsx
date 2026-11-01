"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar } from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // Sur mobile, la navigation vit dans un tiroir : sans cette fermeture, la page
  // suivante s'afficherait sous un menu resté ouvert.
  const closeMobileMenu = () => setOpenMobile(false);

  return (
    <nav aria-label="Navigation de l'administration">
      <SidebarGroup className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            const hasSubItems = item.items && item.items.length > 0;

            if (hasSubItems) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                        {item.icon && <item.icon aria-hidden />}
                        <span>{item.title}</span>
                        <ChevronRight
                          className="ml-auto transition-transform duration-(--animate-duration-fast) group-data-[state=open]/collapsible:rotate-90"
                          aria-hidden
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                              >
                                <Link
                                  href={subItem.url}
                                  aria-current={isSubActive ? "page" : undefined}
                                  onClick={closeMobileMenu}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link
                    href={item.url}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeMobileMenu}
                  >
                    {item.icon && <item.icon aria-hidden />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </nav>
  );
}
