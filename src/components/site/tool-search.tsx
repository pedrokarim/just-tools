"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, Search } from "lucide-react";
import { ToolIcon } from "@/components/site/tool-icon";
import { cn } from "@/lib/utils";
import { tools, type ToolMetadata } from "@/lib/tools-metadata";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Vrai si tous les mots saisis se retrouvent dans la fiche de l'outil. */
function matches(tool: ToolMetadata, query: string) {
  const haystack = normalize(
    `${tool.name} ${tool.category} ${tool.description}`
  );
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

const ToolSearchContext = createContext<() => void>(() => {});

/** Ouvre la recherche d'outils depuis n'importe quel bouton. */
export const useToolSearch = () => useContext(ToolSearchContext);

/**
 * La recherche d'outils, ouverte par `Ctrl K` depuis n'importe quelle page.
 *
 * Volontairement sans animation d'ouverture : elle sert à aller vite, souvent, et
 * au clavier. Une transition y serait un retard qu'on subit à chaque fois.
 */
export function ToolSearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const results = useMemo(
    () => (query.trim() ? tools.filter((tool) => matches(tool, query)) : tools),
    [query]
  );

  const show = useCallback(() => {
    setQuery("");
    setSelected(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show]);

  const go = (tool: ToolMetadata) => {
    setOpen(false);
    router.push(tool.route);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setSelected((results.length + selected + step) % results.length);
    } else if (event.key === "Enter" && results[selected]) {
      event.preventDefault();
      go(results[selected]);
    }
  };

  return (
    <ToolSearchContext.Provider value={show}>
      {children}

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="bg-overlay fixed inset-0 z-(--z-overlay) backdrop-blur-[3px]" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="bg-elevated border-border shadow-card rounded-card fixed top-[12dvh] left-1/2 z-(--z-modal) flex max-h-[76dvh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden border outline-none"
          >
            <DialogPrimitive.Title className="sr-only">
              Chercher un outil
            </DialogPrimitive.Title>

            <div className="border-border flex items-center gap-2.5 border-b px-4">
              <Search
                size={16}
                className="text-fg-subtle shrink-0"
                aria-hidden="true"
              />
              <input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelected(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Chercher un outil…"
                aria-label="Chercher un outil"
                role="combobox"
                aria-expanded="true"
                aria-controls="tool-search-results"
                aria-activedescendant={
                  results[selected]
                    ? `tool-search-${results[selected].id}`
                    : undefined
                }
                autoComplete="off"
                spellCheck={false}
                className="text-fg placeholder:text-fg-subtle h-14 min-w-0 flex-1 bg-transparent text-[0.9375rem] focus-visible:outline-none"
              />
              <kbd className="border-border text-fg-subtle rounded-xs border px-1.5 py-0.5 font-mono text-[0.6875rem]">
                Échap
              </kbd>
            </div>

            {results.length > 0 ? (
              <ul
                id="tool-search-results"
                role="listbox"
                aria-label="Outils"
                className="min-h-0 flex-1 overflow-y-auto p-1.5"
              >
                {results.map((tool, index) => (
                  <li
                    key={tool.id}
                    id={`tool-search-${tool.id}`}
                    role="option"
                    aria-selected={index === selected}
                    onClick={() => go(tool)}
                    onMouseMove={() => setSelected(index)}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center gap-3 rounded-md px-2.5 py-2",
                      index === selected && "bg-surface"
                    )}
                  >
                    <ToolIcon icon={tool.icon} size="sm" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-fg truncate text-sm font-medium">
                        {tool.name}
                      </span>
                      <span className="text-fg-muted truncate text-xs">
                        {tool.description}
                      </span>
                    </span>
                    {index === selected && (
                      <ArrowRight
                        size={15}
                        className="text-fg-subtle shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p
                role="status"
                className="text-fg-muted px-4 py-10 text-center text-sm"
              >
                Aucun outil ne correspond à «&nbsp;{query}&nbsp;».
              </p>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ToolSearchContext.Provider>
  );
}

/** Le déclencheur, à l'allure d'un champ : c'est ce qu'il promet. */
export function ToolSearchButton({
  className,
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  const openSearch = useToolSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Chercher un outil"
      className={cn(
        "border-border bg-bg text-fg-subtle hover:border-border-strong rounded-field flex w-full min-w-0 cursor-pointer items-center gap-2.5 border px-3.5 text-left text-sm transition-colors duration-(--animate-duration-fast)",
        size === "lg" ? "h-13 shadow-sm" : "h-9",
        className
      )}
    >
      <Search size={16} className="shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">Chercher…</span>
      <kbd className="border-border rounded-xs border px-1.5 py-0.5 font-mono text-[0.6875rem] max-sm:hidden">
        Ctrl&nbsp;K
      </kbd>
    </button>
  );
}
