import DashboardClient from "@/components/dashboard/dashboard-client";

export function generateStaticParams() {
  // This satisfies the static export requirement
  // Include common dashboard paths to pre-render them
  return [
    { path: [] },
    { path: ["profile"] },
    { path: ["profile", "new"] },
    { path: ["posts"] },
    { path: ["posts", "new"] },
  ];
}

export default function DashboardPage() {
  return <DashboardClient />;
}
