// src/components/ui/Button.tsx

import React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
};

export default function Button({
  intent = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  // Base: rounded corners, font-display for consistency, transition
  const baseStyles = "rounded-full font-display font-semibold transition-colors ";

  // Intent-specific styles
  const intentStyles = {
    primary: "bg-brand-teal hover:bg-brand-navy text-white",
    secondary: "bg-brand-coral hover:bg-brand-navy text-white",
  };

  // Size variants
  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        baseStyles,
        intentStyles[intent],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}