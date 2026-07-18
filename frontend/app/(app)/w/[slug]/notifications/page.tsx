import { PageHeader, EmptyState } from "@/components/dashboard/DashboardUI";

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        description="Milestone events, proposal accepts, and release confirmations for this workspace."
      />
      <EmptyState
        title="No notifications yet"
        description="Escrow events you're involved in will surface here in real time."
      />
    </div>
  );
}
