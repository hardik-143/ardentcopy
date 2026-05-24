import { SanityLive } from "@/utils/sanity/live";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Suspense } from "react";

import { FooterServer, FooterSkeleton } from "@/components/footer";
import { CombinedJsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { PreviewBar } from "@/components/preview-bar";
import { Providers } from "@/components/providers";
import { getNavigationData } from "@/lib/navigation";

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nav = await getNavigationData();
  return (
    <Providers>
      <Navbar navbarData={nav.navbarData} settingsData={nav.settingsData} />
      {children}
      <Suspense fallback={<FooterSkeleton />}>
        <FooterServer />
      </Suspense>
      <SanityLive />
      <CombinedJsonLd includeOrganization includeWebsite />
      {(await draftMode()).isEnabled && (
        <>
          <PreviewBar />
          <VisualEditing />
        </>
      )}
    </Providers>
  );
}
