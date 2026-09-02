"use client"

import * as React from "react"
import { LoaderCircleIcon, LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { useAdmin } from "@/hooks/use-admin"
import { cn } from "@/lib/utils"

interface AdminLogoutButtonProps
  extends Omit<React.ComponentProps<"button">, "children" | "onClick"> {
  compact?: boolean
  inverse?: boolean
  onLoggedOut?: () => void
}

function AdminLogoutButton({
  className,
  compact = false,
  inverse = false,
  onLoggedOut,
  ...props
}: AdminLogoutButtonProps) {
  const admin = useAdmin()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    try {
      await admin.logout()
    } catch {
      // AuthProvider clears private client state even if Firebase sign-out fails.
    } finally {
      onLoggedOut?.()
      router.replace("/admin/login/")
      setIsLoggingOut(false)
    }
  }

  return (
    <button
      type="button"
      data-slot="admin-logout-button"
      disabled={isLoggingOut}
      aria-busy={isLoggingOut}
      aria-label={compact ? "Log out of admin" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none",
        inverse
          ? "text-slate-300 hover:bg-white/10 hover:text-white focus-visible:ring-white"
          : "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring",
        compact && "size-10 p-0",
        className
      )}
      onClick={() => void handleLogout()}
      {...props}
    >
      {isLoggingOut ? (
        <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <LogOutIcon aria-hidden="true" className="size-4" />
      )}
      {!compact && <span>{isLoggingOut ? "Signing out…" : "Logout"}</span>}
    </button>
  )
}

export { AdminLogoutButton, type AdminLogoutButtonProps }
