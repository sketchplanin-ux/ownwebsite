import type { Metadata } from "next";

import { BlogCreateScreen } from "@/features/admin-blogs/blog-create-screen";

export const metadata: Metadata = {
  title: "Create Blog Post",
};

export default function AdminBlogCreatePage() {
  return <BlogCreateScreen />;
}
