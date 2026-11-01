"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";

import { UsePaginationReturn } from "@/hooks/use-pagination";

interface PaginationControlsProps {
  pagination: UsePaginationReturn;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
}

/**
 * La pagination des listes.
 *
 * De vrais boutons : le changement de page est un état, pas une adresse, et un
 * `<a>` sans `href` n'est ni focalisable ni atteignable au clavier. Onze cases de
 * 44 px ne tiennent pas sur un téléphone : sous `lg`, les numéros cèdent la place
 * à « Page 3 sur 12 » entre les deux flèches.
 */
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
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-3">
      {/* Informations sur la page */}
      {showPageInfo && (
        <div className="text-fg-muted text-sm tabular-nums">
          {Math.min((page - 1) * pageSize + 1, total).toLocaleString("fr-FR")} à{" "}
          {Math.min(page * pageSize, total).toLocaleString("fr-FR")} sur{" "}
          {total.toLocaleString("fr-FR")} résultats
        </div>
      )}

      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        {/* Sélecteur de taille de page */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-fg-muted text-sm whitespace-nowrap">
              Par page&nbsp;:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                goToPage(1); // Retour à la première page
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-20"
                aria-label="Résultats par page"
              >
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
        <Pagination className="mx-0 w-auto">
          <PaginationContent className="flex-wrap">
            {/* Page précédente */}
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevPage}
                disabled={!hasPrevPage}
                aria-label="Page précédente"
              >
                <ChevronLeft aria-hidden />
              </Button>
            </PaginationItem>

            <PaginationItem className="text-fg-muted px-2 text-sm whitespace-nowrap tabular-nums lg:hidden">
              Page {page} sur {totalPages}
            </PaginationItem>

            {/* Pages numérotées */}
            {visiblePages.map((pageNum, index) => (
              <PaginationItem key={index} className="hidden lg:block">
                {pageNum === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <Button
                    variant={page === pageNum ? "soft" : "ghost"}
                    size="icon"
                    className="tabular-nums"
                    onClick={() => goToPage(pageNum as number)}
                    aria-current={page === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </Button>
                )}
              </PaginationItem>
            ))}

            {/* Page suivante */}
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextPage}
                disabled={!hasNextPage}
                aria-label="Page suivante"
              >
                <ChevronRight aria-hidden />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
