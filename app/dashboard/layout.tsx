import type React from "react";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
