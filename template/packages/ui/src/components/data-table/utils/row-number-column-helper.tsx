import { type RowData, createColumnHelper } from "@tanstack/react-table";
import { cn } from "@hillbilly/ui/lib/utils";

interface RowNumberColumnOptions {
  className?: string;
  cellClassName?: string;
  position?: "left" | "right";
  /** Start counting from this number (default: 1) */
  startFrom?: number;
}

export function createRowNumberColumn<TData extends RowData>(options: RowNumberColumnOptions = {}) {
  const columnHelper = createColumnHelper<TData>();

  const { className, cellClassName, position = "left", startFrom = 1 } = options;

  const defaultClassName = cn(
    "sticky md:table-cell z-10 w-12",
    position === "left" ? "left-0 rounded-tl" : "right-0 rounded-tr",
    "bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
    className,
  );

  return columnHelper.display({
    id: "rowNumber",
    header: () => <span className="text-muted-foreground">#</span>,
    meta: {
      className: defaultClassName,
    },
    cell: ({ row }) => (
      <span className={cn("text-muted-foreground tabular-nums", cellClassName)}>
        {row.index + startFrom}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
  });
}
