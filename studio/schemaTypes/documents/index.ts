import { author } from "@studio/schemaTypes/documents/author";
import { blog } from "@studio/schemaTypes/documents/blog";
import { blogIndex } from "@studio/schemaTypes/documents/blog-index";
import { career } from "@studio/schemaTypes/documents/career";
import { careersIndex } from "@studio/schemaTypes/documents/careers-index";
import { commercialCalculator } from "@studio/schemaTypes/documents/commercial-calculator";
import { faq } from "@studio/schemaTypes/documents/faq";
import { footer } from "@studio/schemaTypes/documents/footer";
import { glossary } from "@studio/schemaTypes/documents/glossary";
import { glossaryIndex } from "@studio/schemaTypes/documents/glossary-index";
import { homePage } from "@studio/schemaTypes/documents/home-page";
import { navbar } from "@studio/schemaTypes/documents/navbar";
import { page } from "@studio/schemaTypes/documents/page";
import { redirect } from "@studio/schemaTypes/documents/redirect";
import { residentialCalculator } from "@studio/schemaTypes/documents/residential-calculator";
import { residentialZipCodeSet } from "@studio/schemaTypes/documents/residential-zip-code-set";
import { settings } from "@studio/schemaTypes/documents/settings";

export const singletons = [
  homePage,
  blogIndex,
  glossaryIndex,
  careersIndex,
  settings,
  footer,
  navbar,
];

export const documents = [
  blog,
  page,
  faq,
  author,
  glossary,
  career,
  ...singletons,
  redirect,
  commercialCalculator,
  residentialCalculator,
  residentialZipCodeSet,
];
