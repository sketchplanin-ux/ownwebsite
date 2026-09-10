import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = (
  process.env.SITE_URL?.trim() || "http://localhost:3000"
).replace(/\/+$/, "");

const publicPages = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about/", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services/", changeFrequency: "monthly", priority: 0.9 },
  { path: "/projects/", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog/", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact/", changeFrequency: "yearly", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }));
}
