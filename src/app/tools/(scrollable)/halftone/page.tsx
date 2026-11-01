"use client";

import { HalftonePlayground } from "@/components/halftone/halftone-playground";
import { ToolPage } from "@/components/site/tool-shell";

export default function HalftoneEffect() {
  return (
    <ToolPage wide>
      <HalftonePlayground />
    </ToolPage>
  );
}
