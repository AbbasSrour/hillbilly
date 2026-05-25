import type { PermissionKeys } from "@hillbilly/ui/types/permission-keys";
import { createContext, type PropsWithChildren, useContext } from "react";

export interface PermissionContext {
  permissions: PermissionKeys[];
  hasPermission: (permission?: PermissionKeys) => boolean;
}

const PermissionContext = createContext<PermissionContext>({
  permissions: [],
  hasPermission: () => true,
});

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
};

interface PermissionProviderProps {
  permissions: PermissionKeys[];
  hasPermission?: (permission?: PermissionKeys) => boolean;
}

export const PermissionProvider = ({
  children,
  permissions,
  hasPermission,
}: PropsWithChildren<PermissionProviderProps>) => {
  const defaultHasPermission = (permission?: PermissionKeys) => {
    if (!permission) return true;
    return permissions.includes(permission);
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        hasPermission: hasPermission || defaultHasPermission,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
