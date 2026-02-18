"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { PROJECT_CONFIG } from "@/lib/constants";
import { isToolNew } from "@/lib/tools-metadata";

interface ToolsDropdownProps {
  className?: string;
  isMobile?: boolean;
}

function ToolListItem({ tool, isNew }: { tool: any; isNew: boolean }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link href={tool.route}>
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 rounded-md ${tool.iconBg} ${tool.iconColor} flex items-center justify-center flex-shrink-0`}
            >
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm leading-none font-medium">
                {tool.name}
                {isNew ? " (Nouveau)" : ""}
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                {tool.description}
              </p>
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function ToolsDropdown({
  className = "",
  isMobile = false,
}: ToolsDropdownProps) {
  if (isMobile) {
    return (
      <Link
        href="/tools"
        className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
      >
        Outils
      </Link>
    );
  }

  return (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
            Outils
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              {/* Left column */}
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
                    href="/tools"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                      </div>
                      <div className="text-lg font-medium">
                        {PROJECT_CONFIG.name}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      {PROJECT_CONFIG.description}
                    </p>
                    <div className="mt-4">
                      <div className="text-2xl font-bold">
                        {PROJECT_CONFIG.tools.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        outils disponibles
                      </div>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>

              {/* Right column - Popular tools */}
              {PROJECT_CONFIG.tools.slice(0, 3).map((tool) => {
                const isNew = isToolNew(tool);
                return <ToolListItem key={tool.id} tool={tool} isNew={isNew} />;
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
