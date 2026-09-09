"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFirebaseErrorMessage } from "@/firebase/errors";
import { GoogleSignInButton } from "@/features/auth/google-sign-in-button";
import {
  loginSchema,
  sanitizeAdminReturnTo,
  type LoginFormValues,
} from "@/features/auth/login-schema";
import { PhoneSignInForm } from "@/features/auth/phone-sign-in-form";
import { useAuth } from "@/hooks/use-auth";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const returnTo = useMemo(
    () => sanitizeAdminReturnTo(searchParams.get("returnTo")),
    [searchParams],
  );
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {
    formState: { errors, isSubmitting },
    register,
  } = form;

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.replace(returnTo);
    }
  }, [auth.isAuthenticated, returnTo, router]);

  const reportError = useCallback((message: string) => {
    setSubmissionError(message === "" ? null : message);
  }, []);

  const goToAdmin = useCallback(() => {
    router.replace(returnTo);
  }, [returnTo, router]);

  const submitLogin = async (values: LoginFormValues) => {
    setSubmissionError(null);

    try {
      await auth.login(values.email, values.password);
      goToAdmin();
    } catch (error) {
      setSubmissionError(
        getFirebaseErrorMessage(
          error,
          "Unable to sign in. Check your details and try again.",
        ),
      );
    }
  };

  const contextualError =
    auth.status === "inactive" ||
    auth.status === "unauthorized" ||
    auth.status === "error"
      ? auth.error
      : null;
  const displayedError = submissionError ?? contextualError;
  const submitting = isSubmitting || auth.status === "loading";

  return (
    <Card className="w-full max-w-md shadow-xl shadow-foreground/5">
      <CardHeader className="space-y-3 border-b pb-5">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheckIcon aria-hidden="true" className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">Admin sign in</CardTitle>
          <CardDescription>
            Use your authorized SKETCHPLAN administrator account.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {displayedError && (
          <Alert variant="destructive" aria-live="polite">
            <LockKeyholeIcon aria-hidden="true" />
            <AlertTitle>Sign-in unsuccessful</AlertTitle>
            <AlertDescription>{displayedError}</AlertDescription>
          </Alert>
        )}

        <GoogleSignInButton
          disabled={submitting}
          onError={reportError}
          onSuccess={goToAdmin}
        />

        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            or
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="email">
          <TabsList className="w-full">
            <TabsTrigger value="email" disabled={submitting}>
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" disabled={submitting}>
              Phone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="pt-5">
            <form
              className="space-y-5"
              noValidate
              onSubmit={form.handleSubmit(submitLogin)}
            >
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="admin@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "admin-email-error" : undefined
                  }
                  disabled={submitting}
                  {...register("email")}
                />
                <FieldError
                  id="admin-email-error"
                  message={errors.email?.message}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="pr-10"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "admin-password-error" : undefined
                    }
                    disabled={submitting}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={submitting}
                  >
                    {showPassword ? (
                      <EyeOffIcon aria-hidden="true" className="size-4" />
                    ) : (
                      <EyeIcon aria-hidden="true" className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError
                  id="admin-password-error"
                  message={errors.password?.message}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting && (
                  <LoaderCircleIcon
                    aria-hidden="true"
                    className="animate-spin"
                  />
                )}
                {submitting ? "Verifying access…" : "Sign in securely"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone" className="pt-5">
            <PhoneSignInForm
              disabled={submitting}
              onError={reportError}
              onSuccess={goToAdmin}
            />
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Access is restricted to accounts provisioned by SKETCHPLAN. Public
          registration is not available.
        </p>
      </CardContent>
    </Card>
  );
}
