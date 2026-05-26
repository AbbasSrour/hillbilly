import { useNavigation } from '@hillbilly/ui/context/navigation';
import { useProjectContext } from '@hillbilly/ui/context/project';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@hillbilly/ui/core/sidebar';
import { Link } from '@tanstack/react-router';
import * as React from 'react';

export const ProjectLogo = () => {
  const { logoSmall } = useProjectContext();
  const { homepage, projectName, projectDescription } = useNavigation();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link to={homepage || '/'}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <img
                src={logoSmall}
                alt={projectName || 'Logo'}
                width={32}
                height={32}
                className="size-8"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{projectName || 'Project'}</span>
              <span className="truncate text-xs">{projectDescription || ''}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
