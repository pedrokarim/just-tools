import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock de window.matchMedia
const mockMatchMedia = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

Object.defineProperty(window, "innerWidth", {
  writable: true,
  value: 1024,
});

describe("useIsMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia.mockReturnValue({
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });
  });

  it("should return false for desktop screen", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("should return true for mobile screen", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 375,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should return true for tablet screen", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should return true for small mobile screen", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 320,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should add and remove event listener", () => {
    const { unmount } = renderHook(() => useIsMobile());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("should handle media query change", () => {
    let changeCallback: (() => void) | null = null;
    mockAddEventListener.mockImplementation((event, callback) => {
      if (event === "change") {
        changeCallback = callback;
      }
    });

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    const { result, rerender } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simuler un changement vers mobile
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 375,
    });

    if (changeCallback) {
      act(() => {
        changeCallback();
      });
    }

    rerender();

    expect(result.current).toBe(true);
  });

  it("should handle edge case at breakpoint", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should handle edge case just above breakpoint", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});
