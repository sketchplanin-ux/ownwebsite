"use client";

import {
  BuildingIcon,
  BracesIcon,
  ContactIcon,
  HomeIcon,
} from "lucide-react";

import { PermissionGate } from "@/components/admin/permission-gate";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AboutPageForm } from "@/features/admin-settings/about-page-form";
import { ContactPageForm } from "@/features/admin-settings/contact-page-form";
import {
  EditorLoading,
  PermissionDenied,
} from "@/features/admin-settings/form-components";
import { HomePageForm } from "@/features/admin-settings/home-page-form";
import { PERMISSIONS } from "@/features/auth/permissions";

function PagesWorkspace() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
            <HomeIcon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold">Managed pages</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              Edit the structured Firestore documents used by the Home, About,
              and Contact pages. Publishing is controlled independently for each
              document.
            </p>
          </div>
        </div>
      </div>

      <Alert>
        <BracesIcon aria-hidden="true" />
        <AlertTitle>Structured section editor</AlertTitle>
        <AlertDescription>
          Repeatable sections use validated JSON so their IDs and display order
          remain intact. Images currently accept existing URLs; direct upload
          controls can be connected later without changing the document schema.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="home">
        <TabsList className="h-auto w-full justify-start overflow-x-auto p-1">
          <TabsTrigger value="home" className="min-h-9 px-3">
            <HomeIcon aria-hidden="true" />
            Home
          </TabsTrigger>
          <TabsTrigger value="about" className="min-h-9 px-3">
            <BuildingIcon aria-hidden="true" />
            About
          </TabsTrigger>
          <TabsTrigger value="contact" className="min-h-9 px-3">
            <ContactIcon aria-hidden="true" />
            Contact
          </TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="pt-4">
          <HomePageForm />
        </TabsContent>
        <TabsContent value="about" className="pt-4">
          <AboutPageForm />
        </TabsContent>
        <TabsContent value="contact" className="pt-4">
          <ContactPageForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function PagesScreen() {
  return (
    <PermissionGate
      permissions={PERMISSIONS.MANAGE_CONTENT}
      loadingFallback={<EditorLoading label="managed-page permissions" />}
      fallback={<PermissionDenied />}
    >
      <PagesWorkspace />
    </PermissionGate>
  );
}

