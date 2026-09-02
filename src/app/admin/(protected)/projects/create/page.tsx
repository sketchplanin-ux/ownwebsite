import type { Metadata } from "next";

import { ProjectCreateScreen } from "@/features/admin-projects/project-create-screen";

export const metadata: Metadata = {
  title: "Create Project",
};

export default function AdminProjectCreatePage() {
  return <ProjectCreateScreen />;
}
