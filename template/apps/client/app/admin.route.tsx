import { PageBreadcrumbs } from '@hillbilly/ui/components/navigation/page-breadcrumbs';
import { ThemeSwitch } from '@hillbilly/ui/components/utils/theme-switcher';
import { NavigationProvider } from '@hillbilly/ui/context/navigation';
import { PermissionProvider } from '@hillbilly/ui/context/permission';
import { Separator } from '@hillbilly/ui/core/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@hillbilly/ui/core/sidebar';
import type { PermissionKeys } from '@hillbilly/ui/types/permission-keys';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { navigationConfig } from '@/config/navigation';
import { useSession } from '@/lib/auth.ts';
import { requireAdmin } from '@/middleware/require-admin.ts';

export const Route = createFileRoute('/admin')({
  server: {
    middleware: [requireAdmin],
  },
  component: AdminRoute,
});

function AdminRoute() {
  const { data: sessionData } = useSession();

  const user = sessionData?.user;

  return (
    <PermissionProvider permissions={(user?.permissions as Array<PermissionKeys>) || []}>
      <NavigationProvider
        projectName={'[[ project_name ]]'}
        main={navigationConfig.admin}
        user={
          user && {
            name: user.name,
            identifier: user.email,
            avatar: user.image,
          }
        }
      >
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 w-full shrink-0 items-center justify-between px-4">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4! w-1" />
                <PageBreadcrumbs />
              </div>
              <div className="flex items-center gap-3">
                <LocaleSwitcher />
                <ThemeSwitch />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </NavigationProvider>
    </PermissionProvider>
  );
}
