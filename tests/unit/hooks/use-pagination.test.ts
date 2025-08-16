// Mock de nuqs
vi.mock("nuqs", () => ({
  useQueryState: vi.fn(),
}));

import { renderHook, act } from "@testing-library/react";
import { usePagination } from "@/hooks/use-pagination";

const mockUseQueryState = vi.mocked(await import("nuqs")).useQueryState;

describe("usePagination", () => {
  const mockSetPage = vi.fn();
  const mockSetPageSize = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset les mocks pour chaque test
    mockUseQueryState.mockReset();
  });

  it("should initialize with default values", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(100));

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.total).toBe(100);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it("should calculate pagination correctly", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([5, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(25, 5));

    expect(result.current.totalPages).toBe(5);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it("should handle single page", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(5, 10));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it("should handle empty data", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(0, 10));

    expect(result.current.totalPages).toBe(0);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it("should call setPage when nextPage is called", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(100));

    act(() => {
      result.current.nextPage();
    });

    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it("should not call setPage when nextPage is called on last page", () => {
    mockUseQueryState
      .mockReturnValueOnce([10, mockSetPage]) // page = 10 (last page)
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize = 10

    const { result } = renderHook(() => usePagination(100));

    act(() => {
      result.current.nextPage();
    });

    expect(mockSetPage).not.toHaveBeenCalled();
  });

  it("should call setPage when prevPage is called", () => {
    mockUseQueryState
      .mockReturnValueOnce([2, mockSetPage]) // page = 2
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize = 10

    const { result } = renderHook(() => usePagination(100));

    act(() => {
      result.current.prevPage();
    });

    expect(mockSetPage).toHaveBeenCalledWith(1);
  });

  it("should not call setPage when prevPage is called on first page", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page = 1
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize = 10

    const { result } = renderHook(() => usePagination(100));

    act(() => {
      result.current.prevPage();
    });

    expect(mockSetPage).not.toHaveBeenCalled();
  });

  it("should call setPage when goToPage is called with valid page", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(100));

    act(() => {
      result.current.goToPage(5);
    });

    expect(mockSetPage).toHaveBeenCalledWith(5);
  });

  it("should not call setPage when goToPage is called with invalid page", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(100));

    act(() => {
      result.current.goToPage(0); // Invalid: less than 1
    });

    expect(mockSetPage).not.toHaveBeenCalled();

    act(() => {
      result.current.goToPage(15); // Invalid: greater than totalPages
    });

    expect(mockSetPage).not.toHaveBeenCalled();
  });

  it("should call setPage and setPageSize when reset is called", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([20, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(100, 20));

    act(() => {
      result.current.reset();
    });

    expect(mockSetPage).toHaveBeenCalledWith(1);
    expect(mockSetPageSize).toHaveBeenCalledWith(20);
  });

  it("should handle edge case with exact page size", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(10, 10));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it("should handle large numbers", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([100, mockSetPageSize]); // pageSize

    const { result } = renderHook(() => usePagination(10000, 100));

    expect(result.current.totalPages).toBe(100);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it("should handle custom default page size", () => {
    mockUseQueryState
      .mockReturnValueOnce([1, mockSetPage]) // page
      .mockReturnValueOnce([25, mockSetPageSize]); // pageSize = 25

    const { result } = renderHook(() => usePagination(100, 25));

    expect(result.current.pageSize).toBe(25);
    expect(result.current.totalPages).toBe(4);
  });

  it("should handle middle page state", () => {
    mockUseQueryState
      .mockReturnValueOnce([5, mockSetPage]) // page = 5 (middle)
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize = 10

    const { result } = renderHook(() => usePagination(100));

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it("should handle last page state", () => {
    mockUseQueryState
      .mockReturnValueOnce([10, mockSetPage]) // page = 10 (last)
      .mockReturnValueOnce([10, mockSetPageSize]); // pageSize = 10

    const { result } = renderHook(() => usePagination(100));

    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(true);
  });
});
