import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return <div className="prose-scope">{children}</div>;
}
