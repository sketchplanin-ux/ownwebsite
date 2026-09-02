import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/common/loading-state";
import { BlogPreviewScreen } from "@/features/admin-blogs/blog-preview-screen";

export const metadata: Metadata = {
  title: "Blog Post Preview",
};

export default function AdminBlogPreviewPage() {
  return (
    <Suspense
      fallback={<LoadingState variant="page" message="Opening blog preview…" />}
    >
      <BlogPreviewScreen />
    </Suspense>
  );
}
