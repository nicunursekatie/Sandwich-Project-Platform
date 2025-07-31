import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tspBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-tsp-navy text-white",
        secondary: "border-transparent bg-tsp-gold text-white",
        accent: "border-transparent bg-tsp-burgundy text-white",
        outline: "border border-tsp-navy text-tsp-navy",
        success: "border-transparent bg-green-500 text-white",
        warning: "border-transparent bg-amber-500 text-white",
        danger: "border-transparent bg-red-500 text-white",
        info: "border-transparent bg-tsp-teal-light text-white",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.25 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface TSPBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tspBadgeVariants> {
  dot?: boolean;
}

const TSPBadge = React.forwardRef<HTMLDivElement, TSPBadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(tspBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
        )}
        {children}
      </div>
    );
  }
);
TSPBadge.displayName = "TSPBadge";

// Status Badge Component
interface StatusBadgeProps extends Omit<TSPBadgeProps, "variant"> {
  status: "active" | "inactive" | "pending" | "completed" | "error";
}

const statusConfig = {
  active: { variant: "success" as const, label: "Active" },
  inactive: { variant: "outline" as const, label: "Inactive" },
  pending: { variant: "warning" as const, label: "Pending" },
  completed: { variant: "info" as const, label: "Completed" },
  error: { variant: "danger" as const, label: "Error" },
};

const TSPStatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, children, ...props }, ref) => {
    const config = statusConfig[status];
    
    return (
      <TSPBadge
        ref={ref}
        variant={config.variant}
        dot={status === "active" || status === "pending"}
        {...props}
      >
        {children || config.label}
      </TSPBadge>
    );
  }
);
TSPStatusBadge.displayName = "TSPStatusBadge";

// Count Badge Component
interface CountBadgeProps extends Omit<TSPBadgeProps, "children"> {
  count: number;
  max?: number;
}

const TSPCountBadge = React.forwardRef<HTMLDivElement, CountBadgeProps>(
  ({ count, max = 99, className, ...props }, ref) => {
    const displayCount = count > max ? `${max}+` : count.toString();
    
    return (
      <TSPBadge
        ref={ref}
        className={cn(
          "min-w-[20px] px-1.5 text-center",
          className
        )}
        {...props}
      >
        {displayCount}
      </TSPBadge>
    );
  }
);
TSPCountBadge.displayName = "TSPCountBadge";

export { TSPBadge, TSPStatusBadge, TSPCountBadge, tspBadgeVariants };