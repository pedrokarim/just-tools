"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { UsePaginationReturn } from "@/hooks/use-pagination";

interface PaginationControlsProps {
  pagination: UsePaginationReturn;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
}

export function PaginationControls({
  pagination,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showPageInfo = true,
}: PaginationControlsProps) {
  const {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
  } = pagination;

  // Calculer les pages à afficher
  const getVisiblePages = () => {
    const delta = 2; // Nombre de pages à afficher de chaque côté
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Informations sur la page */}
      {showPageInfo && (
        <div className="text-sm text-muted-foreground">
          Affichage de {Math.min((page - 1) * pageSize + 1, total)} à{" "}
          {Math.min(page * pageSize, total)} sur {total} résultats
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Sélecteur de taille de page */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Par page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                goToPage(1); // Retour à la première page
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Pagination */}
        <Pagination>
          <PaginationContent>
            {/* Première page */}
            <PaginationItem>
              <PaginationPrevious
                onClick={prevPage}
                className={!hasPrevPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {/* Pages numérotées */}
            {visiblePages.map((pageNum, index) => (
              <PaginationItem key={index}>
                {pageNum === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => goToPage(pageNum as number)}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Dernière page */}
            <PaginationItem>
              <PaginationNext
                onClick={nextPage}
                className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
