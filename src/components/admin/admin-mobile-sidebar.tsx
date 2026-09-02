"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { AdminSidebarContent } from "@/components/admin/admin-sidebar"

interface AdminMobileSidebarProps {
  onOpenChange: (open: boolean) => void
  open: boolean
}

function AdminMobileSidebar({
  onOpenChange,
  open,
}: AdminMobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[min(90vw,17rem)] gap-0 border-slate-800 bg-slate-950 p-0 text-white sm:max-w-[17rem]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Admin navigation</SheetTitle>
          <SheetDescription>
            Navigate between SKETCHPLAN administration areas.
          </SheetDescription>
        </SheetHeader>
        <AdminSidebarContent onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}

export { AdminMobileSidebar, type AdminMobileSidebarProps }
