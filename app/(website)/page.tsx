import { sanityFetch } from "@/utils/sanity/live";
import { queryHomePageData } from "@/utils/sanity/query";

import { PageBuilder } from "@/components/pagebuilder";
import { buildSEO } from "@/lib/seo";
import { fetchHomePageSEOData } from "@/action/seo";

async function fetchHomePageData() {
  return await sanityFetch({
    query: queryHomePageData,
  });
}

export async function generateMetadata() {
  const { data } = await fetchHomePageSEOData();
  return buildSEO(data);
}

export default async function Page() {
  const { data: homePageData } = await fetchHomePageData();

  if (!homePageData) {
    return <div>No home page data</div>;
  }

  const { _id, _type, pageBuilder } = homePageData ?? {};

  return <PageBuilder id={_id} pageBuilder={pageBuilder ?? []} type={_type} />;
}
