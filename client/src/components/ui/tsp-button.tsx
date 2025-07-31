import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tspButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-tsp-navy text-white hover:bg-tsp-navy-hover shadow-sm hover:shadow-md hover:-translate-y-0.5",
        secondary: "bg-tsp-gold text-white hover:bg-tsp-gold-hover shadow-sm hover:shadow-md hover:-translate-y-0.5",
        accent: "bg-tsp-burgundy text-white hover:bg-tsp-burgundy-hover shadow-sm hover:shadow-md hover:-translate-y-0.5",
        outline: "border border-tsp-navy text-tsp-navy hover:bg-tsp-navy hover:text-white",
        ghost: "hover:bg-tsp-navy-light hover:text-tsp-navy",
        link: "text-tsp-navy underline-offset-4 hover:underline hover:text-tsp-navy-hover",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface TSPButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tspButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const TSPButton = React.forwardRef<HTMLButtonElement, TSPButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(tspButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-1">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-1">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
TSPButton.displayName = "TSPButton";

// Icon Button Component
export interface TSPIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tspButtonVariants> {
  icon: React.ReactNode;
  label: string;
}

const TSPIconButton = React.forwardRef<HTMLButtonElement, TSPIconButtonProps>(
  ({ icon, label, variant = "ghost", size = "icon", className, ...props }, ref) => {
    return (
      <TSPButton
        ref={ref}
        variant={variant}
        size={size}
        className={cn("relative", className)}
        aria-label={label}
        {...props}
      >
        {icon}
      </TSPButton>
    );
  }
);
TSPIconButton.displayName = "TSPIconButton";

// Button Group Component
interface TSPButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const TSPButtonGroup = React.forwardRef<HTMLDivElement, TSPButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
          "[&>*:not(:last-child)]:border-r-0",
          className
        )}
        {...props}
      />
    );
  }
);
TSPButtonGroup.displayName = "TSPButtonGroup";

export { TSPButton, TSPIconButton, TSPButtonGroup, tspButtonVariants };