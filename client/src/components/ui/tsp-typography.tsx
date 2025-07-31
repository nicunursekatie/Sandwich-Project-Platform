import * as React from "react";
import { cn } from "@/lib/utils";

// Heading Component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  variant?: "display" | "title" | "subtitle";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Component = "h2", variant = "title", className, ...props }, ref) => {
    const variants = {
      display: "font-main-heading text-4xl md:text-5xl tracking-tight text-tsp-navy",
      title: "font-sub-heading text-2xl md:text-3xl text-tsp-charcoal",
      subtitle: "font-sub-heading text-lg md:text-xl text-tsp-charcoal",
    };

    return (
      <Component
        ref={ref as any}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

// Text Component
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "body" | "lead" | "small" | "muted";
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ variant = "body", className, ...props }, ref) => {
    const variants = {
      body: "font-body text-base text-foreground",
      lead: "font-body text-lg text-foreground leading-relaxed",
      small: "font-body text-sm text-foreground",
      muted: "font-body-light text-sm text-muted-foreground",
    };

    return (
      <p
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

// Quote Component
interface QuoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  author?: string;
}

const Quote = React.forwardRef<HTMLQuoteElement, QuoteProps>(
  ({ author, className, children, ...props }, ref) => {
    return (
      <blockquote
        ref={ref}
        className={cn(
          "border-l-4 border-tsp-gold pl-4 py-2 italic",
          className
        )}
        {...props}
      >
        <p className="font-highlight text-lg text-tsp-charcoal mb-2">
          "{children}"
        </p>
        {author && (
          <cite className="font-body text-sm text-muted-foreground not-italic">
            — {author}
          </cite>
        )}
      </blockquote>
    );
  }
);
Quote.displayName = "Quote";

// Highlight Component (for callouts or important text)
interface HighlightProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  icon?: React.ReactNode;
}

const Highlight = React.forwardRef<HTMLDivElement, HighlightProps>(
  ({ variant = "info", icon, className, children, ...props }, ref) => {
    const variants = {
      info: "bg-tsp-teal-light/10 border-tsp-teal-light text-tsp-teal-dark",
      success: "bg-green-50 border-green-500 text-green-800",
      warning: "bg-tsp-gold/10 border-tsp-gold text-amber-800",
      error: "bg-red-50 border-red-500 text-red-800",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border-l-4 p-4 flex items-start gap-3",
          variants[variant],
          className
        )}
        {...props}
      >
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1">{children}</div>
      </div>
    );
  }
);
Highlight.displayName = "Highlight";

// Code Component
const Code = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <code
    ref={ref}
    className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
      className
    )}
    {...props}
  />
));
Code.displayName = "Code";

// Link Component
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "nav" | "subtle";
  external?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant = "default", external = false, className, children, ...props }, ref) => {
    const variants = {
      default: "text-tsp-navy hover:text-tsp-navy-hover underline-offset-4 hover:underline",
      nav: "text-tsp-charcoal hover:text-tsp-navy transition-colors",
      subtle: "text-muted-foreground hover:text-foreground transition-colors",
    };

    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <a
        ref={ref}
        className={cn(variants[variant], className)}
        {...externalProps}
        {...props}
      >
        {children}
        {external && (
          <span className="sr-only">(opens in new tab)</span>
        )}
      </a>
    );
  }
);
Link.displayName = "Link";

// List Component
interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: "unordered" | "ordered" | "none";
}

const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ variant = "unordered", className, ...props }, ref) => {
    const Component = variant === "ordered" ? "ol" : "ul";
    
    return (
      <Component
        ref={ref as any}
        className={cn(
          "space-y-2",
          variant === "unordered" && "list-disc list-inside",
          variant === "ordered" && "list-decimal list-inside",
          className
        )}
        {...props}
      />
    );
  }
);
List.displayName = "List";

// List Item Component
const ListItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("text-foreground", className)}
    {...props}
  />
));
ListItem.displayName = "ListItem";

export {
  Heading,
  Text,
  Quote,
  Highlight,
  Code,
  Link,
  List,
  ListItem,
};