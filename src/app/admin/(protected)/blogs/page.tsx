import type { Metadata } from "next";

import { BlogsAdminScreen } from "@/features/admin-blogs/blogs-admin-screen";

export const metadata: Metadata = {
  title: "Blogs",
};

export default function AdminBlogsPage() {
  return <BlogsAdminScreen />;
}
