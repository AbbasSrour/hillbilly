import { Separator } from "@hillbilly/ui/core/separator";
import type { PropsWithChildren, ReactNode } from "react";

interface PageHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  withSeparator?: boolean;
}

export const PageHeader = ({
  title,
  description,
  withSeparator = false,
  children,
}: PropsWithChildren<PageHeaderProps>) => {
  return (
    <div className="flex flex-wrap items-center justify-between space-y-2">
      <div className={"flex flex-col gap-1"}>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">{children}</div>
      {withSeparator && <Separator />}
    </div>
  );
};
