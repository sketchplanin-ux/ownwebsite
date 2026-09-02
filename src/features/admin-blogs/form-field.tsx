import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AdminBlogFormFieldProps {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  error?: string;
  htmlFor: string;
  label: ReactNode;
  required?: boolean;
}

export function AdminBlogFormField({
  children,
  className,
  description,
  error,
  htmlFor,
  label,
  required = false,
}: AdminBlogFormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {description ? (
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
