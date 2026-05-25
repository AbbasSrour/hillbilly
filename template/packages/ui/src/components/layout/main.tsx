import { cn } from "@hillbilly/ui/lib/utils";
import type React from "react";

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Main = ({ fixed, ...props }: MainProps) => {
  return (
    <main
      {...props}
      className={cn(
        "flex flex-col grow peer-[.header-fixed]/header:mt-16",
        "px-4 space-y-4",
        "py-6", // removed to ensure that there is no overflow for list with insights
        fixed && "fixed-main flex grow flex-col overflow-hidden",
        props.className,
      )}
    />
  );
};

Main.displayName = "Main";
