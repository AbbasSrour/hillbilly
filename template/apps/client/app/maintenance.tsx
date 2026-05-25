import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/maintenance')({
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Under Maintenance
        </h1>
        <p className="text-muted-foreground text-lg">
          We are currently performing scheduled maintenance. Please check back
          soon.
        </p>
      </div>
    </div>
  );
}
