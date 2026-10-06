import type { ReactNode } from "react";

export function ContextRail({ children }: { children: ReactNode }) {
  return <aside className="context-rail">{children}</aside>;
}
export function RailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rail-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
