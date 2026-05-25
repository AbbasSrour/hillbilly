import type { PermissionKeys } from "@hillbilly/ui/types/permission-keys";
import { usePermission } from "@hillbilly/ui/context/permission";
import { Button } from "@hillbilly/ui/core/button";
import type { ComponentProps } from "react";

interface SystemActionProps extends ComponentProps<typeof Button> {
  permission?: PermissionKeys;
  loading?: boolean;
  error?: boolean;
  tooltip?: string;
}

export const SystemAction = ({
  permission,
  loading,
  error,
  className,
  tooltip,
  ...props
}: SystemActionProps) => {
  const { hasPermission: checkPermission } = usePermission();
  const hasPermission = checkPermission(permission);

  const getTooltip = () => {
    if (loading) {
      return "Loading...";
    }

    if (error) {
      return "An error occurred. Please try again.";
    }

    if (!hasPermission) {
      return "You do not have permission to perform this action";
    }

    return tooltip;
  };

  return (
    <Button
      {...props}
      className={className}
      loading={loading}
      error={error}
      disabled={props.disabled || !hasPermission}
      tooltip={getTooltip()}
    >
      {props.children}
    </Button>
  );
};
