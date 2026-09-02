"use client";

import {
  CheckCircle2Icon,
  FilePlus2Icon,
  LoaderCircleIcon,
  RotateCcwIcon,
  SaveIcon,
  ShieldAlertIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { ErrorState } from "@/components/common/error-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getFirebaseErrorMessage } from "@/firebase/errors";
import { cn } from "@/lib/utils";

interface FieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  description?: string;
  disabled?: boolean;
  placeholder?: string;
  type?: ComponentProps<typeof Input>["type"];
  inputMode?: ComponentProps<typeof Input>["inputMode"];
  autoComplete?: string;
}

export function FormField({
  id,
  label,
  registration,
  error,
  description,
  disabled,
  ...inputProps
}: FieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [descriptionId, errorId].filter(Boolean).join(" ") || undefined
        }
        {...inputProps}
        {...registration}
      />
      {description && (
        <p id={descriptionId} className="text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  description?: string;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  json?: boolean;
}

export function FormTextarea({
  id,
  label,
  registration,
  error,
  description,
  disabled,
  rows = 5,
  json = false,
  ...textareaProps
}: TextareaFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Textarea
        id={id}
        rows={rows}
        disabled={disabled}
        spellCheck={!json}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [descriptionId, errorId].filter(Boolean).join(" ") || undefined
        }
        className={cn(json && "font-mono text-xs leading-5")}
        {...textareaProps}
        {...registration}
      />
      {description && (
        <p id={descriptionId} className="text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

export function DocumentNotice({ documentName }: { documentName: string }) {
  return (
    <Alert>
      <FilePlus2Icon aria-hidden="true" />
      <AlertTitle>{documentName} has not been created yet</AlertTitle>
      <AlertDescription>
        The form is showing safe defaults. Saving it will create the Firestore
        document with a server timestamp.
      </AlertDescription>
    </Alert>
  );
}

export function SaveFeedback({
  isSuccess,
  error,
}: {
  isSuccess: boolean;
  error: unknown;
}) {
  if (error) {
    return (
      <Alert variant="destructive" aria-live="polite">
        <ShieldAlertIcon aria-hidden="true" />
        <AlertTitle>Changes were not saved</AlertTitle>
        <AlertDescription>
          {getFirebaseErrorMessage(
            error,
            "Unable to save these changes. Please try again.",
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isSuccess) {
    return (
      <Alert aria-live="polite">
        <CheckCircle2Icon aria-hidden="true" />
        <AlertTitle>Changes saved</AlertTitle>
        <AlertDescription>
          Firestore has been updated and the public content cache was refreshed.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export function FormActions({
  isPending,
  isDirty,
  isNew,
  onReset,
}: {
  isPending: boolean;
  isDirty: boolean;
  isNew: boolean;
  onReset: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {isDirty
          ? "You have unsaved changes."
          : isNew
            ? "Review the defaults before creating this document."
            : "All displayed changes are saved."}
      </p>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending || !isDirty}
          onClick={onReset}
        >
          <RotateCcwIcon aria-hidden="true" />
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isPending || (!isDirty && !isNew)}
        >
          {isPending ? (
            <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
          ) : (
            <SaveIcon aria-hidden="true" />
          )}
          {isPending ? "Saving…" : isNew ? "Create document" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

export function EditorLoading({ label }: { label: string }) {
  return (
    <div className="space-y-6" role="status" aria-label={`Loading ${label}`}>
      <Skeleton className="h-20 rounded-xl" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <span className="sr-only">Loading {label}&hellip;</span>
    </div>
  );
}

export function EditorError({
  label,
  error,
  onRetry,
}: {
  label: string;
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <ErrorState
      title={`Unable to load ${label}`}
      description={getFirebaseErrorMessage(
        error,
        `Unable to load ${label}. Please try again.`,
      )}
      onRetry={onRetry}
    />
  );
}

export function PermissionDenied() {
  return (
    <ErrorState
      title="Permission required"
      description="Only ADMIN and SUPER_ADMIN accounts can update this content."
    />
  );
}

