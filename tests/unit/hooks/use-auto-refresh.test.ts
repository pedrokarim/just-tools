// Mock de jotai
vi.mock("jotai", () => ({
  useAtom: vi.fn(),
  atom: vi.fn((initialValue) => initialValue),
}));

import { renderHook } from "@testing-library/react";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

const mockUseAtom = vi.mocked(await import("jotai")).useAtom;

// Mock de setInterval et clearInterval
const mockSetInterval = vi.fn();
const mockClearInterval = vi.fn();

Object.defineProperty(global, "setInterval", {
  writable: true,
  value: mockSetInterval,
});

Object.defineProperty(global, "clearInterval", {
  writable: true,
  value: mockClearInterval,
});

describe("useAutoRefresh", () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset les mocks pour chaque test
    mockUseAtom.mockReset();
    mockSetInterval.mockReturnValue(123 as any); // Mock interval ID
  });

  it("should return correct initial state", () => {
    mockUseAtom
      .mockReturnValueOnce([false, vi.fn()]) // autoRefreshEnabled
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval
      .mockReturnValueOnce([0, vi.fn()]); // forceRefresh

    const { result } = renderHook(() => useAutoRefresh(mockCallback));

    expect(result.current.isEnabled).toBe(false);
    expect(result.current.interval).toBe(30);
  });

  it("should not set interval when auto-refresh is disabled", () => {
    mockUseAtom
      .mockReturnValueOnce([false, vi.fn()]) // autoRefreshEnabled
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval
      .mockReturnValueOnce([0, vi.fn()]); // forceRefresh

    renderHook(() => useAutoRefresh(mockCallback));

    expect(mockSetInterval).not.toHaveBeenCalled();
    expect(mockClearInterval).not.toHaveBeenCalled();
  });

  it("should set interval when auto-refresh is enabled", () => {
    mockUseAtom
      .mockReturnValueOnce([true, vi.fn()]) // autoRefreshEnabled = true
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval = 30
      .mockReturnValueOnce([0, vi.fn()]); // forceRefresh = 0

    renderHook(() => useAutoRefresh(mockCallback));

    expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 30000);
  });

  it("should call callback when interval triggers", () => {
    let intervalCallback: (() => void) | null = null;
    mockSetInterval.mockImplementation((callback) => {
      intervalCallback = callback;
      return 123 as any;
    });

    mockUseAtom
      .mockReturnValueOnce([true, vi.fn()]) // autoRefreshEnabled = true
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval = 30
      .mockReturnValueOnce([0, vi.fn()]); // forceRefresh = 0

    renderHook(() => useAutoRefresh(mockCallback));

    expect(mockCallback).not.toHaveBeenCalled();

    // Simuler le déclenchement de l'intervalle
    if (intervalCallback) {
      intervalCallback();
    }

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should clear interval when auto-refresh is disabled", () => {
    mockUseAtom
      .mockReturnValueOnce([true, vi.fn()]) // autoRefreshEnabled = true
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval = 30
      .mockReturnValueOnce([0, vi.fn()]); // forceRefresh = 0

    const { rerender } = renderHook(() => useAutoRefresh(mockCallback));

    expect(mockSetInterval).toHaveBeenCalledTimes(1);

    // Désactiver l'auto-refresh
    mockUseAtom
      .mockReturnValueOnce([false, vi.fn()]) // autoRefreshEnabled = false
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval = 30
      .mockReturnValueOnce([0, vi.fn()]); // forceRefresh = 0

    rerender();

    expect(mockClearInterval).toHaveBeenCalledWith(123);
  });

  it("should call callback when force refresh is triggered", () => {
    mockUseAtom
      .mockReturnValueOnce([false, vi.fn()]) // autoRefreshEnabled = false
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval = 30
      .mockReturnValueOnce([1, vi.fn()]); // forceRefresh = 1

    renderHook(() => useAutoRefresh(mockCallback));

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should not call callback when force refresh is 0", () => {
    mockUseAtom
      .mockReturnValueOnce([false, vi.fn()]) // autoRefreshEnabled = false
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval = 30
      .mockReturnValueOnce([0, vi.fn()]); // forceRefresh = 0

    renderHook(() => useAutoRefresh(mockCallback));

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should clear interval on unmount", () => {
    mockUseAtom
      .mockReturnValueOnce([true, vi.fn()]) // autoRefreshEnabled = true
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval = 30
      .mockReturnValueOnce([0, vi.fn()]); // forceRefresh = 0

    const { unmount } = renderHook(() => useAutoRefresh(mockCallback));

    expect(mockSetInterval).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockClearInterval).toHaveBeenCalledWith(123);
  });

  it("should handle multiple force refresh triggers", () => {
    mockUseAtom
      .mockReturnValueOnce([false, vi.fn()]) // autoRefreshEnabled = false
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval = 30
      .mockReturnValueOnce([1, vi.fn()]); // forceRefresh = 1

    const { rerender } = renderHook(() => useAutoRefresh(mockCallback));

    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Changer forceRefresh à 2
    mockUseAtom
      .mockReturnValueOnce([false, vi.fn()]) // autoRefreshEnabled = false
      .mockReturnValueOnce([30, vi.fn()]) // autoRefreshInterval = 30
      .mockReturnValueOnce([2, vi.fn()]); // forceRefresh = 2

    rerender();

    expect(mockCallback).toHaveBeenCalledTimes(2);
  });
});
