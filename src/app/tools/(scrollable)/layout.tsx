import { ToolShell } from "@/components/site/tool-shell";

export default function ScrollableToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolShell>{children}</ToolShell>;
}
