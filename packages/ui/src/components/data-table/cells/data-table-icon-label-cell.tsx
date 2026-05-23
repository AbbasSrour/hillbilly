import { cn } from "@hillbilly/ui/lib/utils";
import type { ComponentType, ReactNode } from "react";

export interface IconLabelOption {
  value: string;
  label?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  className?: string;
  iconClassName?: string;
}

interface DataTableIconLabelCellProps {
  /** The value to display */
  value: string | undefined | null;
  /** Array of options to match against the value */
  options?: readonly IconLabelOption[];
  /** Default icon if no option matches */
  defaultIcon?: ComponentType<{ size?: number; className?: string }>;
  /** Icon size in pixels */
  iconSize?: number;
  /** Additional class name for the container */
  className?: string;
  /** Additional class name for the icon */
  iconClassName?: string;
  /** Additional class name for the label */
  labelClassName?: string;
  /** Whether to capitalize the label */
  capitalize?: boolean;
  /** Fallback content when value is empty */
  fallback?: ReactNode;
}

export function DataTableIconLabelCell({
  value,
  options = [],
  defaultIcon: DefaultIcon,
  iconSize = 16,
  className,
  iconClassName,
  labelClassName,
  capitalize = true,
  fallback = "-",
}: DataTableIconLabelCellProps) {
  if (!value) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  const option = options.find((opt) => opt.value === value);
  const Icon = option?.icon ?? DefaultIcon;
  const label = option?.label ?? value.toLowerCase().replace(/_/g, " ");

  return (
    <div className={cn("flex items-center gap-x-2", className)}>
      {Icon && (
        <Icon
          size={iconSize}
          className={cn("text-muted-foreground", option?.iconClassName, iconClassName)}
        />
      )}
      <span
        className={cn("text-sm", capitalize && "capitalize", option?.className, labelClassName)}
      >
        {label}
      </span>
    </div>
  );
}
