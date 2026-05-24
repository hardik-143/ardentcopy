import { readFileSync } from "node:fs";

const pageBuilder = JSON.parse(
  readFileSync(
    new URL("../temp-atlanta-pagebuilder.json", import.meta.url),
    "utf8"
  )
);

const cities = [
  { city: "Alpharetta", state: "Georgia", slug: "alpharetta-georgia-personal-injury-lawyer" },
  { city: "Marietta", state: "Georgia", slug: "marietta-georgia-personal-injury-lawyer" },
  { city: "Roswell", state: "Georgia", slug: "roswell-georgia-personal-injury-lawyer" },
  { city: "Sandy Springs", state: "Georgia", slug: "sandy-springs-georgia-personal-injury-lawyer" },
  { city: "Birmingham", state: "Alabama", slug: "birmingham-alabama-personal-injury-lawyer" },
  { city: "Montgomery", state: "Alabama", slug: "montgomery-alabama-personal-injury-lawyer" },
  { city: "Mobile", state: "Alabama", slug: "mobile-alabama-personal-injury-lawyer" },
  { city: "Tuscaloosa", state: "Alabama", slug: "tuscaloosa-alabama-personal-injury-lawyer" },
  { city: "Huntsville", state: "Alabama", slug: "huntsville-alabama-personal-injury-lawyer" },
];

const documents = cities.map(({ city, slug }) => ({
  type: "page",
  content: {
    title: `${city} Personal Injury Lawyer`,
    slug: { _type: "slug", current: `/${slug}` },
    pageBuilder,
    seoNoIndex: false,
  },
}));

const payload = {
  resource: { projectId: "4uxdyxv3", dataset: "production" },
  documents,
};

console.log(JSON.stringify(payload, null, 0));
