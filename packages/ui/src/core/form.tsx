import { Button } from "@hillbilly/ui/core/button";
import { Label } from "@hillbilly/ui/core/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hillbilly/ui/core/tooltip";
import { cn } from "@hillbilly/ui/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";

const Form = FormProvider as typeof FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

FormItem.displayName = "FormItem";

function FormLabel({
  className,
  required,
  tooltip,
  ...props
}: React.ComponentProps<typeof Label> & {
  required?: boolean;
  tooltip?: React.ReactNode;
}) {
  const { error, formItemId } = useFormField();

  const label = (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className, {
        "gap-0": required,
        "cursor-help": !!tooltip,
      })}
      htmlFor={formItemId}
      {...props}
    >
      {props.children}
      {required && <span className="text-destructive">*</span>}
    </Label>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{label}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return label;
}

FormLabel.displayName = "FormLabel";

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

FormControl.displayName = "FormControl";

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

FormDescription.displayName = "FormDescription";

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

FormMessage.displayName = "FormMessage";

interface FormContentProps extends HTMLAttributes<HTMLDivElement> {}

// FormContent
function FormContent({
  className,
  ...props
}: FormContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return <div {...props} className={cn("pb-6 space-y-6", className)} />;
}

FormContent.displayName = "FormContent";

interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
  layout?: "vertical" | "horizontal";
}

// FormSection
function FormSection({
  layout = "vertical",
  className,
  ...props
}: FormSectionProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      {...props}
      className={cn(
        "border-b border-border pb-6",
        layout === "horizontal"
          ? "grid grid-cols-1 gap-x-8 space-y-6 md:grid-cols-3 md:space-y-0"
          : "space-y-6",
        className,
      )}
    />
  );
}

FormSection.displayName = "FormSection";

interface FormSectionHeaderProps extends HTMLAttributes<HTMLDivElement> {}

// FormSectionHeader
function FormSectionHeader({
  className,
  ...props
}: FormSectionHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  return <div {...props} className={cn("flex flex-col gap-0.5", className)} />;
}

FormSectionHeader.displayName = "FormSectionHeader";

interface FormSectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

// FormSectionTitle
function FormSectionTitle({
  className,
  ...props
}: FormSectionTitleProps & { ref?: React.Ref<HTMLHeadingElement> }) {
  return <h2 {...props} className={cn("text-lg font-semibold tracking-tight", className)} />;
}

FormSectionTitle.displayName = "FormSectionTitle";

interface FormSectionDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

// FormSectionDescription
function FormSectionDescription({
  className,
  ...props
}: FormSectionDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) {
  return <p {...props} className={cn("text-sm text-muted-foreground", className)} />;
}

const formSectionContentVariants = cva("col-span-2", {
  variants: {
    layout: {
      grid: "grid",
      flex: "flex",
    },
    direction: {
      row: "flex-row flex-wrap",
      column: "flex-col",
    },
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
      6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    },
    spacing: {
      none: "gap-0",
      xs: "gap-x-2 gap-y-2",
      sm: "gap-x-4 gap-y-3",
      md: "gap-x-6 gap-y-4",
      lg: "gap-x-8 gap-y-6",
      xl: "gap-x-10 gap-y-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
  },
  compoundVariants: [
    {
      layout: "flex",
      direction: "row",
      className: "flex-row flex-wrap",
    },
    {
      layout: "flex",
      direction: "column",
      className: "flex-col",
    },
  ],
  defaultVariants: {
    layout: "grid",
    cols: 1,
    spacing: "md",
    align: "start",
  },
});

interface FormSectionContentProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof formSectionContentVariants> {
  gridTemplate?: string;
}

// FormSectionContent
function FormSectionContent({
  layout = "grid",
  direction = "column",
  cols = 1,
  spacing = "md",
  align = "start",
  justify,
  gridTemplate,
  className,
  ...props
}: FormSectionContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      {...props}
      className={cn(
        formSectionContentVariants({
          layout,
          direction,
          cols,
          spacing,
          align,
          justify,
        }),
        className,
      )}
      style={gridTemplate ? { gridTemplateColumns: gridTemplate } : undefined}
      data-slot="form-section-content"
    />
  );
}

FormSectionContent.displayName = "FormSectionContent";

const formRowVariants = cva("grid w-full", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
      6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
      auto: "grid-cols-auto",
    },
    spacing: {
      none: "gap-0",
      xs: "gap-x-2 gap-y-2",
      sm: "gap-x-4 gap-y-3",
      md: "gap-x-6 gap-y-4",
      lg: "gap-x-8 gap-y-6",
      xl: "gap-x-10 gap-y-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
  },
  defaultVariants: {
    cols: 1,
    spacing: "md",
    align: "start",
  },
});

interface FormRowProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof formRowVariants> {
  gridTemplate?: string;
}

// FormRow
function FormRow({
  cols = 1,
  spacing = "md",
  align = "start",
  justify,
  gridTemplate,
  className,
  ...props
}: FormRowProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      {...props}
      className={cn(formRowVariants({ cols, spacing, align, justify }), className)}
      style={gridTemplate ? { gridTemplateColumns: gridTemplate } : undefined}
      data-slot="form-row"
    />
  );
}

FormRow.displayName = "FormRow";

interface FormFooterProps extends HTMLAttributes<HTMLDivElement> {
  onCancel?: () => void;
  submitDisabled?: boolean;
}

// FormFooter
function FormFooter({
  onCancel,
  className,
  // TODO pass mutate key to the form provider instead of passing submitDisabled and disable the submit button automatically on submit
  submitDisabled = false,
  ...props
}: FormFooterProps & { ref?: React.Ref<HTMLDivElement> }) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  return (
    <div {...props} className={cn("flex items-center justify-end gap-x-2", className)}>
      <Button type="button" variant={"outline"} className={"min-w-40"} onClick={handleCancel}>
        Cancel
      </Button>
      <Button type="submit" variant={"default"} className={"min-w-40"} disabled={submitDisabled}>
        Save
      </Button>
    </div>
  );
}

FormFooter.displayName = "FormFooter";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormContent,
  FormSection,
  FormSectionHeader,
  FormSectionTitle,
  FormSectionDescription,
  FormSectionContent,
  FormRow,
  FormFooter,
};
