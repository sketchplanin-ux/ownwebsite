import type { Metadata } from "next";

import { ProjectsAdminScreen } from "@/features/admin-projects/projects-admin-screen";

export const metadata: Metadata = {
  title: "Projects",
};

export default function AdminProjectsPage() {
  return <ProjectsAdminScreen />;
}
