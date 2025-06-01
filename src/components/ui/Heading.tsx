// src/components/ui/Heading.tsx

import React, { JSX } from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3;
  className?: string;
}

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
} as const;

export default function Heading({
  level = 1,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = headingTags[level] as keyof JSX.IntrinsicElements;
  const TagComponent = Tag as any;

  // Base styles: use font-display (Space Grotesk), color brand-navy
  const baseStyles = "font-display text-brand-navy text-center mb-4";
  // Size variants for each heading
  const sizeStyles = {
    1: "text-3xl sm:text-4xl",
    2: "text-2xl sm:text-3xl",
    3: "text-xl sm:text-2xl",
  };

  return (
    <TagComponent
      className={cn(baseStyles, sizeStyles[level], className)}
      {...props}
    >
      {children}
    </TagComponent>
  );
}
