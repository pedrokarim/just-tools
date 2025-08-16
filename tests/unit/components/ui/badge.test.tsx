import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge, badgeVariants } from "@/components/ui/badge";

describe("Badge Component", () => {
  it("should render with default props", () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText("Default Badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("inline-flex", "items-center", "justify-center");
  });

  it("should render with different variants", () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass(
      "border-transparent",
      "bg-primary"
    );

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toHaveClass(
      "border-transparent",
      "bg-secondary"
    );

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText("Destructive")).toHaveClass(
      "border-transparent",
      "bg-destructive"
    );

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveClass("text-foreground");
  });

  it("should render as child when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    );

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveClass("inline-flex", "items-center", "justify-center");
  });

  it("should apply custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>);

    const badge = screen.getByText("Custom");
    expect(badge).toHaveClass("custom-class");
  });

  it("should render with icon and text", () => {
    render(
      <Badge>
        <span>Icon</span>
        <svg data-testid="icon" />
      </Badge>
    );

    const badge = screen.getByText("Icon");
    expect(badge).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<Badge aria-label="Custom label">Badge</Badge>);

    const badge = screen.getByText("Badge");
    expect(badge).toHaveAttribute("aria-label", "Custom label");
  });

  it("should handle focus states", () => {
    render(<Badge>Focusable</Badge>);

    const badge = screen.getByText("Focusable");
    expect(badge).toHaveClass(
      "focus-visible:border-ring",
      "focus-visible:ring-ring/50"
    );
  });

  it("should handle invalid states", () => {
    render(<Badge aria-invalid="true">Invalid</Badge>);

    const badge = screen.getByText("Invalid");
    expect(badge).toHaveClass("aria-invalid:ring-destructive/20");
  });

  it("should render with different content types", () => {
    render(<Badge>Text Content</Badge>);
    expect(screen.getByText("Text Content")).toBeInTheDocument();

    render(<Badge>123</Badge>);
    expect(screen.getByText("123")).toBeInTheDocument();

    render(<Badge>🚀</Badge>);
    expect(screen.getByText("🚀")).toBeInTheDocument();
  });

  it("should have correct default variant", () => {
    render(<Badge>Test</Badge>);

    const badge = screen.getByText("Test");
    expect(badge).toHaveClass("border-transparent", "bg-primary");
  });
});
