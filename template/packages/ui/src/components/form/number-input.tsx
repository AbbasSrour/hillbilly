import { Input } from "@hillbilly/ui/core/input";
import { cn } from "@hillbilly/ui/lib/utils";
import type { ComponentProps } from "react";
import * as React from "react";
import { useNumberFormatter } from "react-aria";

export interface NumberInputProps extends Omit<ComponentProps<typeof Input>, "type"> {
  formatOptions?: Intl.NumberFormatOptions;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, formatOptions = {}, onChange, onFocus, ...props }, ref) => {
    const formatter = useNumberFormatter(formatOptions);
    const isCurrency = formatOptions?.style === "currency";
    const inputType = isCurrency ? "text" : "number";

    const formatCurrency = (value: number) => {
      return formatter.format(value);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isCurrency) {
        const target = e.currentTarget;
        target.setSelectionRange(target.value.length, target.value.length);
      }

      onFocus?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isCurrency) {
        const target = e.currentTarget;
        const numericValue = Number(target.value.replace(/\D/g, "")) / 100;
        target.value = formatCurrency(numericValue);
      }

      onChange?.(e);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type={inputType}
        className={cn(
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className,
        )}
        maxLength={isCurrency ? 22 : undefined}
        onFocus={handleFocus}
        onChange={handleChange}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
