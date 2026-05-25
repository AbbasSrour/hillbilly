import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the admin dashboard</p>
    </div>
  );
}
