import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/common/loading-state";
import { BlogEditScreen } from "@/features/admin-blogs/blog-edit-screen";

export const metadata: Metadata = {
  title: "Edit Blog Post",
};

export default function AdminBlogEditPage() {
  return (
    <Suspense
      fallback={<LoadingState variant="page" message="Opening blog editor…" />}
    >
      <BlogEditScreen />
    </Suspense>
  );
}
