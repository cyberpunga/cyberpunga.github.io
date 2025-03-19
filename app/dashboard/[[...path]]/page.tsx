import DashboardClient from "@/components/dashboard/dashboard-client";

export function generateStaticParams() {
  // This satisfies the static export requirement
  return [{ path: [] }];
}

export default function DashboardPage() {
  return <DashboardClient />;
}
