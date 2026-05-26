import * as React from 'react';

import { NavMain } from '@hillbilly/ui/components/navigation/nav-main';
import { NavRecents } from '@hillbilly/ui/components/navigation/nav-recents';
import { NavSecondary } from '@hillbilly/ui/components/navigation/nav-secondary';
import { NavUser } from '@hillbilly/ui/components/navigation/nav-user';
import { ProjectLogo } from '@hillbilly/ui/components/navigation/project-logo';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@hillbilly/ui/core/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <ProjectLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavRecents />
        <NavSecondary />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
