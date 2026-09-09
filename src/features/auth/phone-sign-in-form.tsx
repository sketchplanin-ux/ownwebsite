"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFirebaseErrorMessage } from "@/firebase/errors";
import {
  phoneNumberSchema,
  verificationCodeSchema,
  type PhoneNumberFormValues,
  type VerificationCodeFormValues,
} from "@/features/auth/login-schema";
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

export function PhoneSignInForm({
  disabled,
  onError,
  onSuccess,
}: {
  disabled?: boolean;
  onError: (message: string) => void;
  onSuccess: () => void;
}) {
  const auth = useAuth();
  const recaptchaRef = useRef<HTMLDivElement | null>(null);

  const numberForm = useForm<PhoneNumberFormValues>({
    resolver: zodResolver(phoneNumberSchema),
    defaultValues: { phoneNumber: "" },
  });
  const codeForm = useForm<VerificationCodeFormValues>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: { code: "" },
  });

  const awaitingCode = auth.pendingPhoneNumber !== null;
  const busy =
    disabled ||
    numberForm.formState.isSubmitting ||
    codeForm.formState.isSubmitting;

  const sendCode = async ({ phoneNumber }: PhoneNumberFormValues) => {
    onError("");

    const container = recaptchaRef.current;

    if (!container) {
      onError("The verification widget could not load. Reload the page.");
      return;
    }

    try {
      await auth.sendPhoneCode(phoneNumber, container);
      codeForm.reset({ code: "" });
    } catch (error) {
      onError(
        getFirebaseErrorMessage(
          error,
          "Unable to send the verification code. Please try again.",
        ),
      );
    }
  };

  const confirmCode = async ({ code }: VerificationCodeFormValues) => {
    onError("");

    try {
      await auth.confirmPhoneCode(code);
      onSuccess();
    } catch (error) {
      onError(
        getFirebaseErrorMessage(
          error,
          "Unable to verify that code. Please try again.",
        ),
      );
    }
  };

  const useAnotherNumber = () => {
    onError("");
    auth.cancelPhoneLogin();
    codeForm.reset({ code: "" });
  };

  return (
    <div className="space-y-5">
      {awaitingCode ? (
        <form
          className="space-y-5"
          noValidate
          onSubmit={codeForm.handleSubmit(confirmCode)}
        >
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">
              {auth.pendingPhoneNumber}
            </span>
            .
          </p>

          <div className="space-y-2">
            <label htmlFor="admin-otp" className="text-sm font-medium">
              Verification code
            </label>
            <Input
              id="admin-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              aria-invalid={Boolean(codeForm.formState.errors.code)}
              aria-describedby={
                codeForm.formState.errors.code ? "admin-otp-error" : undefined
              }
              disabled={busy}
              {...codeForm.register("code")}
            />
            <FieldError
              id="admin-otp-error"
              message={codeForm.formState.errors.code?.message}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy && (
              <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
            )}
            {busy ? "Verifying access…" : "Verify and sign in"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={busy}
            onClick={useAnotherNumber}
          >
            Use a different number
          </Button>
        </form>
      ) : (
        <form
          className="space-y-5"
          noValidate
          // Built inside the handler: sendCode reads a ref, which must not
          // happen during render.
          onSubmit={(event) => void numberForm.handleSubmit(sendCode)(event)}
        >
          <div className="space-y-2">
            <label htmlFor="admin-phone" className="text-sm font-medium">
              Phone number
            </label>
            <Input
              id="admin-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+919876543210"
              aria-invalid={Boolean(numberForm.formState.errors.phoneNumber)}
              aria-describedby={
                numberForm.formState.errors.phoneNumber
                  ? "admin-phone-error"
                  : "admin-phone-hint"
              }
              disabled={busy}
              {...numberForm.register("phoneNumber")}
            />
            <FieldError
              id="admin-phone-error"
              message={numberForm.formState.errors.phoneNumber?.message}
            />
            <p id="admin-phone-hint" className="text-xs text-muted-foreground">
              Include the country code, for example +91 for India.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy && (
              <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
            )}
            {busy ? "Sending code…" : "Send verification code"}
          </Button>
        </form>
      )}

      {/* Invisible reCAPTCHA host. It must stay mounted for the whole flow. */}
      <div ref={recaptchaRef} />
    </div>
  );
}
