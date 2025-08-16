import { useQueryState } from "nuqs";

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
}

export function usePagination(
  total: number,
  defaultPageSize: number = 10
): UsePaginationReturn {
  const [page, setPage] = useQueryState("page", {
    defaultValue: "1",
    parse: (value) => parseInt(value) || 1,
    serialize: (value) => value.toString(),
  });

  const [pageSize, setPageSize] = useQueryState("size", {
    defaultValue: defaultPageSize.toString(),
    parse: (value) => parseInt(value) || defaultPageSize,
    serialize: (value) => value.toString(),
  });

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPage = () => {
    if (hasNextPage) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setPage(page - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const reset = () => {
    setPage(1);
    setPageSize(defaultPageSize);
  };

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
}
