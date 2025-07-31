import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// Form Field Component
export const FormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormField.displayName = "FormField";

// Form Label with TSP styling
export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn(
      "text-sm font-medium text-tsp-charcoal",
      className
    )}
    {...props}
  />
));
FormLabel.displayName = "FormLabel";

// Form Input with TSP styling
export const FormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-md border border-tsp-gray-light bg-white px-3 py-2 text-sm",
      "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tsp-navy focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all duration-200",
      "hover:border-tsp-navy/50",
      className
    )}
    ref={ref}
    {...props}
  />
));
FormInput.displayName = "FormInput";

// Form Select with TSP styling
export const FormSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    className={cn(
      "flex h-11 w-full rounded-md border border-tsp-gray-light bg-white px-3 py-2 text-sm",
      "ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tsp-navy focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all duration-200",
      "hover:border-tsp-navy/50",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </select>
));
FormSelect.displayName = "FormSelect";

// Form Textarea with TSP styling
export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-tsp-gray-light bg-white px-3 py-2 text-sm",
      "ring-offset-background",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tsp-navy focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all duration-200",
      "hover:border-tsp-navy/50",
      className
    )}
    ref={ref}
    {...props}
  />
));
FormTextarea.displayName = "FormTextarea";

// Form Error Message
export const FormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null;
  
  return (
    <p
      ref={ref}
      className={cn("text-sm text-destructive mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
});
FormError.displayName = "FormError";

// Form Helper Text
export const FormHelperText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-1", className)}
    {...props}
  />
));
FormHelperText.displayName = "FormHelperText";

// Form Group (for grouping related fields)
export const FormGroup = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn(
      "space-y-4 p-4 rounded-lg border border-tsp-gray-light/50 bg-tsp-navy-light/5",
      className
    )}
    {...props}
  />
));
FormGroup.displayName = "FormGroup";

// Form Actions (for form buttons)
export const FormActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-end gap-2 pt-4",
      className
    )}
    {...props}
  />
));
FormActions.displayName = "FormActions";