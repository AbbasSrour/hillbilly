import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { TablerIcon } from "@tabler/icons-react";
import type { Row } from "@tanstack/react-table";
import { Button } from "@hillbilly/ui/core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@hillbilly/ui/core/dropdown-menu";
import { cn } from "@hillbilly/ui/lib/utils";
import { LucideIcon } from "lucide-react";
import { Fragment } from "react";

// TODO make the permission typed
interface DataTableRowAction {
  icon?: LucideIcon | TablerIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  permission?: string;
  theme?: "default" | "destructive";
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions?: Array<Array<DataTableRowAction>> | Array<DataTableRowAction>;
}

// TODO add support for SubContent
export function DataTableRowActions<TData>({ actions = [] }: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="data-[state=open]:bg-muted flex h-8 w-8 p-0">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {actions.map((actionList, index) =>
          Array.isArray(actionList) ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Fragment key={index}>
              {actionList.map((action, _index) => (
                <RowAction key={action.label} action={action} />
              ))}
              {index < actions.length - 1 && <DropdownMenuSeparator />}
            </Fragment>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <RowAction key={index} action={actionList} />
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RowAction({ action }: { action: DataTableRowAction }) {
  const Icon = action.icon;

  return (
    <DropdownMenuItem
      key={action.label}
      onClick={action.onClick}
      className={cn(action.theme === "destructive" && "text-destructive")}
    >
      {action.label}

      {Icon && (
        <DropdownMenuShortcut>
          <Icon size={16} className={cn(action.theme === "destructive" && "text-destructive")} />
        </DropdownMenuShortcut>
      )}
    </DropdownMenuItem>
  );
}
