import * as React from "react";
import { cn } from "@/lib/utils";

interface TSPCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered" | "gradient";
  hover?: boolean;
}

const TSPCard = React.forwardRef<HTMLDivElement, TSPCardProps>(
  ({ className, variant = "default", hover = false, ...props }, ref) => {
    const variants = {
      default: "bg-white border border-border/50 shadow-sm",
      elevated: "bg-white shadow-md hover:shadow-lg",
      bordered: "bg-white border-2 border-tsp-navy/20",
      gradient: "bg-gradient-to-br from-white to-tsp-navy-light border border-tsp-navy/10",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg transition-all duration-200",
          variants[variant],
          hover && "hover:scale-[1.02] hover:shadow-lg cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);
TSPCard.displayName = "TSPCard";

// Card Header with TSP Styling
const TSPCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { accent?: boolean }
>(({ className, accent = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      accent && "bg-gradient-to-r from-tsp-navy to-tsp-teal-dark text-white rounded-t-lg",
      className
    )}
    {...props}
  />
));
TSPCardHeader.displayName = "TSPCardHeader";

// Card Title with TSP Typography
const TSPCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" | "h4" }
>(({ className, as: Component = "h3", ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      "font-main-heading tracking-tight",
      Component === "h1" && "text-3xl",
      Component === "h2" && "text-2xl",
      Component === "h3" && "text-xl",
      Component === "h4" && "text-lg",
      className
    )}
    {...props}
  />
));
TSPCardTitle.displayName = "TSPCardTitle";

// Card Description
const TSPCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
TSPCardDescription.displayName = "TSPCardDescription";

// Card Content
const TSPCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
TSPCardContent.displayName = "TSPCardContent";

// Card Footer
const TSPCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      className
    )}
    {...props}
  />
));
TSPCardFooter.displayName = "TSPCardFooter";

// Stat Card Component
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "navy" | "gold" | "burgundy" | "teal";
}

const TSPStatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon, trend, color = "navy", className, ...props }, ref) => {
    const colorClasses = {
      navy: "stat-card-navy",
      gold: "stat-card-gold",
      burgundy: "stat-card-burgundy",
      teal: "stat-card-teal",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-6 text-white relative overflow-hidden",
          colorClasses[color],
          className
        )}
        {...props}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
            {icon && <div className="text-white/80">{icon}</div>}
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-sm opacity-80">{description}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-sm",
                trend.isPositive ? "text-green-300" : "text-red-300"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
TSPStatCard.displayName = "TSPStatCard";

export {
  TSPCard,
  TSPCardHeader,
  TSPCardTitle,
  TSPCardDescription,
  TSPCardContent,
  TSPCardFooter,
  TSPStatCard,
};