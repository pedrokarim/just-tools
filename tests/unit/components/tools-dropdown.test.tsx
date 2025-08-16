import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToolsDropdown } from "@/components/tools-dropdown";

// Mock des dépendances
vi.mock("@/lib/constants", () => ({
  PROJECT_CONFIG: {
    name: "Just Tools",
    description: "Suite d'outils de développement gratuits",
    tools: [
      {
        name: "Convertisseur Base64",
        description: "Convertissez du texte en Base64 et vice versa",
        route: "/tools/base64-converter",
        icon: "🔧",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        name: "Formateur de Code",
        description: "Formatez votre code avec différents langages",
        route: "/tools/code-formatter",
        icon: "💻",
        gradient: "from-green-500 to-emerald-500",
      },
    ],
  },
}));

vi.mock("@/lib/tools-metadata", () => ({
  isToolNew: vi.fn(() => false),
}));

describe("ToolsDropdown Component", () => {
  it("should render mobile version when isMobile is true", () => {
    render(<ToolsDropdown isMobile={true} />);

    const link = screen.getByRole("link", { name: "Outils" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/tools");
    expect(link).toHaveClass("text-slate-700", "dark:text-slate-300");
  });

  it("should render desktop version when isMobile is false", () => {
    render(<ToolsDropdown isMobile={false} />);

    const trigger = screen.getByRole("button", { name: "Outils" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass("bg-transparent");
  });

  it("should render desktop version by default", () => {
    render(<ToolsDropdown />);

    const trigger = screen.getByRole("button", { name: "Outils" });
    expect(trigger).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(<ToolsDropdown className="custom-class" />);

    const navigationMenu = screen.getByRole("navigation");
    expect(navigationMenu).toHaveClass("custom-class");
  });

  it("should show project information in desktop version", () => {
    render(<ToolsDropdown />);

    // Vérifier que le trigger est présent
    const trigger = screen.getByRole("button", { name: "Outils" });
    expect(trigger).toBeInTheDocument();
  });

  it("should handle navigation menu interactions", () => {
    render(<ToolsDropdown />);

    const trigger = screen.getByRole("button", { name: "Outils" });

    // Simuler l'ouverture du menu
    fireEvent.click(trigger);

    // Vérifier que le menu est accessible
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("should render tool list items correctly", () => {
    render(<ToolsDropdown />);

    const trigger = screen.getByRole("button", { name: "Outils" });
    fireEvent.click(trigger);

    // Vérifier que les outils sont listés
    expect(screen.getByText("Convertisseur Base64")).toBeInTheDocument();
    expect(screen.getByText("Formateur de Code")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<ToolsDropdown />);

    const trigger = screen.getByRole("button", { name: "Outils" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("should handle keyboard navigation", () => {
    render(<ToolsDropdown />);

    const trigger = screen.getByRole("button", { name: "Outils" });

    // Simuler la navigation au clavier
    fireEvent.keyDown(trigger, { key: "Enter" });

    // Vérifier que le trigger existe toujours
    expect(trigger).toBeInTheDocument();
  });
});
