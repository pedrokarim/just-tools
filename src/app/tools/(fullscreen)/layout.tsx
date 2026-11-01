import { ToolShell } from "@/components/site/tool-shell";

export default function FullscreenToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolShell fullscreen>{children}</ToolShell>;
}
