import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@hillbilly/ui/core/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@hillbilly/ui/core/sidebar";
import { useRecentsStore } from "@hillbilly/ui/store/recents";
import * as LucideIcons from "lucide-react";
import { ExternalLink, type LucideIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_VISIBLE_RECENTS = 3;

export function NavRecents() {
  const { isMobile } = useSidebar();
  const [showAll, setShowAll] = useState(false);
  const recents = useRecentsStore.getState().recents;
  const removeRecent = useRecentsStore.getState().removeRecent;

  const recentsWithIcons = useMemo(() => {
    return recents.map((recent) => {
      const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[recent.icon];
      return {
        ...recent,
        IconComponent: IconComponent || LucideIcons.File,
      };
    });
  }, [recents]);

  const visibleRecents = showAll
    ? recentsWithIcons
    : recentsWithIcons.slice(0, DEFAULT_VISIBLE_RECENTS);
  const hasMore = recentsWithIcons.length > DEFAULT_VISIBLE_RECENTS;

  if (recents.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recents</SidebarGroupLabel>
      <SidebarMenu>
        {visibleRecents.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.IconComponent />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="text-muted-foreground" />
                    <span>Open in New Tab</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => removeRecent(item.id)}>
                  <Trash2 className="text-muted-foreground" />
                  <span>Remove from Recents</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {hasMore && (
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setShowAll(!showAll)}>
              <MoreHorizontal />
              <span>
                {showAll
                  ? "Show Less"
                  : `${recentsWithIcons.length - DEFAULT_VISIBLE_RECENTS} More`}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
