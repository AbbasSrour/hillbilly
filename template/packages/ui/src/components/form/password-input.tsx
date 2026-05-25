import { Input } from "@hillbilly/ui/core/input";
import { cn } from "@hillbilly/ui/lib/utils";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import * as React from "react";

function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        icon={LockIcon}
        className={cn("pr-9", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground"
      >
        {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
