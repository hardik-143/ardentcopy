import { blogContent } from "@studio/schemaTypes/definitions/blog-content";
import {
  breakBlock,
  headingBlock,
  imageBlock,
  paragraphBlock,
  quoteBlock,
  tableBlock,
  videoBlock,
} from "@studio/schemaTypes/blocks/blog";
import { button } from "@studio/schemaTypes/definitions/button";
import { customUrl } from "@studio/schemaTypes/definitions/custom-url";
import { pageBuilder } from "@studio/schemaTypes/definitions/pagebuilder";
import { richText } from "@studio/schemaTypes/definitions/rich-text";

export const definitions = [
  customUrl,
  richText,
  button,
  pageBuilder,
  blogContent,
  headingBlock,
  paragraphBlock,
  imageBlock,
  videoBlock,
  quoteBlock,
  tableBlock,
  breakBlock,
];
