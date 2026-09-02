import { SiteShellClient } from "@/components/website/site-shell-client";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteShellClient>{children}</SiteShellClient>;
}
