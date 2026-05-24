import { clientRaw } from "@/utils/sanity/client";
import { sanityFetch } from "@/utils/sanity/live";
import {
  queryCareers,
  queryCareersIndexPageData,
} from "@/utils/sanity/query";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CareersPageContent } from "@/components/careers-page-content";
import { buildSEO } from "@/lib/seo";
import { fetchCareersIndexPageSEOData } from "@/action/seo";
import { handleErrors } from "@/utils";

async function fetchCareersIndexPageData() {
  const res = await sanityFetch({ query: queryCareersIndexPageData });
  return res.data;
}

async function fetchCareers() {
  const careers = await clientRaw.fetch(queryCareers);
  return careers;
}

export async function generateMetadata() {
  const { data } = await fetchCareersIndexPageSEOData();
  return buildSEO(data, {
    title: "Careers",
    description: "Join our team. View open positions.",
  });
}

export default async function CareersPage() {
  const [[indexPageData, errIndexPageData], [careers, errCareers]] =
    await Promise.all([
      handleErrors(fetchCareersIndexPageData()),
      handleErrors(fetchCareers()),
    ]);

  if (errIndexPageData || !indexPageData) {
    notFound();
  }

  if (errCareers || !careers) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {indexPageData.title || "Careers"}
          </h1>
          {indexPageData.description && (
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {indexPageData.description}
            </p>
          )}
        </div>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Unable to load open positions at the moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <Suspense fallback={null}>
      <CareersPageContent indexPageData={indexPageData} careers={careers} />
    </Suspense>
  );
}
