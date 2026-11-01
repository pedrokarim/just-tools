"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, X } from "lucide-react";
import { CopyButton } from "@/components/site/copy-button";
import { ToolPage } from "@/components/site/tool-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";

const EXAMPLE_TEXT = "Bonjour, les accents passent très bien : é, à, ç.";

/** `btoa` ne connaît que le Latin-1 : on lui donne les octets UTF-8 du texte. */
function encodeBase64(text: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(text)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/** Lit de l'UTF-8, et retombe sur le Latin-1 pour un contenu qui n'en est pas. */
function decodeBase64(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return binary;
  }
}

function convert(mode: Mode, input: string) {
  if (!input) return { output: "", failed: false };

  try {
    return {
      output: mode === "encode" ? encodeBase64(input) : decodeBase64(input),
      failed: false,
    };
  } catch {
    return { output: "", failed: true };
  }
}

const formatLength = (length: number) =>
  `${length.toLocaleString("fr-FR")} caractère${length > 1 ? "s" : ""}`;

export default function Base64Converter() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  // Le résultat se déduit de l'entrée : il suit la frappe, et ce qui est affiché
  // correspond toujours à ce qui est saisi.
  const { output, failed } = useMemo(() => convert(mode, input), [mode, input]);
  const encoding = mode === "encode";

  const handleSwap = () => {
    setInput(output);
    setMode(encoding ? "decode" : "encode");
  };

  const handleExample = () =>
    setInput(encoding ? EXAMPLE_TEXT : encodeBase64(EXAMPLE_TEXT));

  return (
    <ToolPage>
      <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
        <TabsList aria-label="Sens de la conversion">
          <TabsTrigger value="encode">Encoder</TabsTrigger>
          <TabsTrigger value="decode">Décoder</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-h-9 items-center justify-between gap-3">
            <Label htmlFor="base64-input">
              {encoding ? "Texte à encoder" : "Base64 à décoder"}
            </Label>
            {input && (
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-fg-subtle text-xs tabular-nums">
                  {formatLength(input.length)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput("")}
                >
                  <X aria-hidden="true" />
                  Effacer
                </Button>
              </div>
            )}
          </div>
          <Textarea
            id="base64-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              encoding ? "Écris ou colle ton texte…" : "Colle ton Base64…"
            }
            spellCheck={false}
            aria-invalid={failed}
            className={cn(
              "field-sizing-fixed min-h-64 flex-1 resize-none",
              !encoding && "font-mono"
            )}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-h-9 items-center justify-between gap-3">
            <h2 className="text-fg font-sans text-sm font-medium tracking-normal">
              {encoding ? "Base64" : "Texte décodé"}
            </h2>
            {output && (
              <span className="text-fg-subtle shrink-0 text-xs tabular-nums">
                {formatLength(output.length)}
              </span>
            )}
          </div>

          <Card className="min-h-64 flex-1 gap-4 p-5">
            {failed ? (
              <div
                role="alert"
                className="asc-animate-fade flex flex-1 flex-col gap-1.5"
              >
                <p className="text-danger text-sm font-semibold">
                  Ce n&apos;est pas du Base64 valide.
                </p>
                <p className="text-fg-muted text-sm leading-relaxed">
                  Vérifie qu&apos;il n&apos;est pas tronqué et qu&apos;il ne
                  contient que des lettres, des chiffres, + et /. Pour convertir
                  ce texte en Base64, passe sur «&nbsp;Encoder&nbsp;».
                </p>
              </div>
            ) : output ? (
              <>
                <p
                  className={cn(
                    "asc-animate-step-in text-fg max-h-96 min-h-0 flex-1 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap",
                    encoding ? "break-all" : "break-words"
                  )}
                >
                  {output}
                </p>
                <div className="border-border flex flex-wrap items-center gap-2 border-t pt-4">
                  <CopyButton value={output} />
                  <Button
                    variant="secondary"
                    onClick={handleSwap}
                    title="Reprendre ce résultat comme entrée et changer de sens"
                  >
                    <ArrowLeftRight aria-hidden="true" />
                    Inverser
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-start gap-3">
                <p className="text-fg-muted text-sm leading-relaxed">
                  {encoding
                    ? "Le Base64 s'affiche ici dès que tu écris."
                    : "Le texte décodé s'affiche ici dès que tu colles du Base64."}
                </p>
                <Button variant="secondary" onClick={handleExample}>
                  Essayer un exemple
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ToolPage>
  );
}
