import { sanityFetch } from "@/utils/sanity/live";
import {
  queryGlobalSeoSettings,
  queryNavbarData,
} from "@/utils/sanity/query";

export const getNavigationData = async () => {
  const [navbarData, settingsData] = await Promise.all([
    sanityFetch({ query: queryNavbarData }),
    sanityFetch({ query: queryGlobalSeoSettings }),
  ]);

  return { navbarData: navbarData.data, settingsData: settingsData.data };
};
