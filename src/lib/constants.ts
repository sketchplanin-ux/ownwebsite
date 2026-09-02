export const SITE_NAME = "SKETCHPLAN";
export const SITE_TAGLINE = "Architecture, Interior & Planning";

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hello SKETCHPLAN, I would like to discuss an architecture or interior design project.";

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export const BLOG_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "CONVERTED",
  "CLOSED",
  "SPAM",
] as const;

export const SUGGESTED_PROJECT_CATEGORIES = [
  "Residential",
  "Commercial",
  "Interior",
  "Renovation",
  "Planning",
] as const;

export const PUBLIC_ROUTES = Object.freeze({
  home: "/",
  about: "/about/",
  services: "/services/",
  projects: "/projects/",
  projectDetails: "/projects/view/",
  blog: "/blog/",
  blogDetails: "/blog/view/",
  contact: "/contact/",
});

export const ADMIN_ROUTES = Object.freeze({
  login: "/admin/login/",
  dashboard: "/admin/dashboard/",
  homepage: "/admin/homepage/",
  services: "/admin/services/",
  projects: "/admin/projects/",
  blogs: "/admin/blogs/",
  banners: "/admin/banners/",
  offers: "/admin/offers/",
  leads: "/admin/leads/",
  settings: "/admin/settings/",
});

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
