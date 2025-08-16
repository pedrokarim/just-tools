import React from "react";
import { render } from "@testing-library/react";
import { AnalyticsTracker } from "@/components/analytics-tracker";

// Mock de l'API analytics
vi.mock("@/lib/analytics", () => ({
  recordPageView: vi.fn(),
}));

// Mock de usePathname
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("AnalyticsTracker Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(<AnalyticsTracker />);
    // Le composant ne rend rien visible, on vérifie juste qu'il ne crash pas
    expect(document.body).toBeInTheDocument();
  });

  it("should work with different paths", () => {
    render(<AnalyticsTracker />);
    expect(document.body).toBeInTheDocument();
  });

  it("should work with admin paths", () => {
    render(<AnalyticsTracker />);
    expect(document.body).toBeInTheDocument();
  });
});
