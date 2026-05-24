import {
  AlignLeftIcon,
  Heading2Icon,
  ImageIcon,
  QuoteIcon,
  SeparatorHorizontalIcon,
  TableIcon,
  VideoIcon,
} from "lucide-react";
import { defineType } from "sanity";

export const blogContent = defineType({
  name: "blogContent",
  title: "Blog Content",
  type: "array",
  of: [
    { type: "headingBlock", icon: Heading2Icon },
    { type: "paragraphBlock", icon: AlignLeftIcon },
    { type: "imageBlock", icon: ImageIcon },
    { type: "videoBlock", icon: VideoIcon },
    { type: "quoteBlock", icon: QuoteIcon },
    { type: "tableBlock", icon: TableIcon },
    { type: "breakBlock", icon: SeparatorHorizontalIcon },
  ],
  options: {
    insertMenu: {
      views: [{ name: "grid" }, { name: "list" }],
    },
  },
});
