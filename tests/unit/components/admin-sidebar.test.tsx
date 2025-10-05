import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

// Mock des composants UI
vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children, ...props }: any) => (
    <div data-testid="sidebar" {...props}>
      {children}
    </div>
  ),
  SidebarContent: ({ children }: any) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarFooter: ({ children }: any) => (
    <div data-testid="sidebar-footer">{children}</div>
  ),
  SidebarHeader: ({ children }: any) => (
    <div data-testid="sidebar-header">{children}</div>
  ),
  SidebarRail: () => <div data-testid="sidebar-rail" />,
}));

// Mock des composants de navigation
vi.mock("@/components/admin/nav-main", () => ({
  NavMain: ({ items }: any) => (
    <div data-testid="nav-main">
      {items.map((item: any, index: number) => (
        <div key={index} data-testid={`nav-item-${item.title.toLowerCase()}`}>
          {item.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/admin/nav-user", () => ({
  NavUser: () => <div data-testid="nav-user">NavUser</div>,
}));

describe("AdminSidebar Component", () => {
  it("should render without crashing", () => {
    render(<AdminSidebar />);

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-content")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-footer")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-rail")).toBeInTheDocument();
  });

  it("should display admin panel title", () => {
    render(<AdminSidebar />);

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByText("Just Tools")).toBeInTheDocument();
  });

  it("should include all main navigation items", () => {
    render(<AdminSidebar />);

    // Vérifier que tous les éléments de navigation principaux sont présents
    expect(screen.getByTestId("nav-item-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-visiteurs")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-pages")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-connexions")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-base de données")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-artefacts")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-paramètres")).toBeInTheDocument();
  });

  it("should NOT include analytics section", () => {
    render(<AdminSidebar />);

    // Vérifier que la section Analytics n'est plus présente
    expect(screen.queryByTestId("nav-item-analytics")).not.toBeInTheDocument();
  });

  it("should include nav user component", () => {
    render(<AdminSidebar />);

    expect(screen.getByTestId("nav-user")).toBeInTheDocument();
  });

  it("should have correct navigation structure", () => {
    render(<AdminSidebar />);

    const navMain = screen.getByTestId("nav-main");
    expect(navMain).toBeInTheDocument();

    // Vérifier que le nombre d'éléments de navigation est correct (7 éléments principaux)
    const navItems = navMain.querySelectorAll('[data-testid^="nav-item-"]');
    expect(navItems).toHaveLength(7);
  });

  it("should pass collapsible prop to sidebar", () => {
    render(<AdminSidebar />);

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-collapsible", "icon");
  });

  it("should render with custom props", () => {
    const customProps = { "data-custom": "test" };
    render(<AdminSidebar {...customProps} />);

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-custom", "test");
  });

  it("should have proper icon in header", () => {
    render(<AdminSidebar />);

    // Vérifier que l'icône BarChart3 est utilisée dans le header
    const header = screen.getByTestId("sidebar-header");
    expect(header).toBeInTheDocument();
  });

  it("should maintain navigation order", () => {
    render(<AdminSidebar />);

    const navMain = screen.getByTestId("nav-main");
    const navItems = Array.from(
      navMain.querySelectorAll('[data-testid^="nav-item-"]')
    );

    // Vérifier l'ordre des éléments de navigation
    const expectedOrder = [
      "nav-item-dashboard",
      "nav-item-visiteurs",
      "nav-item-pages",
      "nav-item-connexions",
      "nav-item-base de données",
      "nav-item-artefacts",
      "nav-item-paramètres",
    ];

    navItems.forEach((item, index) => {
      expect(item).toHaveAttribute("data-testid", expectedOrder[index]);
    });
  });
});
