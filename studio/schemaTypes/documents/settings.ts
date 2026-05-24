import { CogIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

const socialLinks = defineField({
  name: "socialLinks",
  title: "Social Media Links",
  description: "Add links to your social media profiles",
  type: "object",
  fields: [
    defineField({
      name: "linkedin",
      title: "LinkedIn URL",
      description: "Full URL to your LinkedIn profile/company page",
      type: "string",
    }),
    defineField({
      name: "facebook",
      title: "Facebook URL",
      description: "Full URL to your Facebook profile/page",
      type: "string",
    }),
    defineField({
      name: "twitter",
      title: "Twitter/X URL",
      description: "Full URL to your Twitter/X profile",
      type: "string",
    }),
    defineField({
      name: "instagram",
      title: "Instagram URL",
      description: "Full URL to your Instagram profile",
      type: "string",
    }),
    defineField({
      name: "youtube",
      title: "YouTube URL",
      description: "Full URL to your YouTube channel",
      type: "string",
    }),
  ],
});

export const settings = defineType({
  name: "settings",
  type: "document",
  title: "Settings",
  description: "Global settings and configuration for your website",
  icon: CogIcon,
  groups: [
    { name: "general", title: "General", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "label",
      type: "string",
      initialValue: "Settings",
      title: "Label",
      description: "Label used to identify settings in the CMS",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "siteTitle",
      type: "string",
      title: "Site Title",
      description:
        "The main title of your website, used in browser tabs and SEO",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "siteDescription",
      type: "text",
      title: "Site Description",
      description: "A brief description of your website for SEO purposes",
      validation: (rule) => rule.required().min(50).max(160),
    }),
    defineField({
      name: "logo",
      type: "image",
      title: "Site Logo",
      description: "Upload your website logo (used in light mode)",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "logoDark",
      type: "image",
      title: "Site Logo (Dark Mode)",
      description:
        "Optional logo for dark mode. If not set, the main logo is used with inverted colors.",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "contactEmail",
      type: "string",
      title: "Contact Email",
      description: "Primary contact email address for your website",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "titleTemplate",
      title: "Title Template",
      type: "string",
      group: "seo",
      description:
        "Pattern applied to every page title. %s is replaced with the page's own title, {siteTitle} with your Site Title.",
      initialValue: "%s | {siteTitle}",
      options: {
        list: [
          { title: "%s | {siteTitle}", value: "%s | {siteTitle}" },
          { title: "%s - {siteTitle}", value: "%s - {siteTitle}" },
          { title: "{siteTitle} | %s", value: "{siteTitle} | %s" },
          { title: "{siteTitle} - %s", value: "{siteTitle} - %s" },
          { title: "%s (no suffix)", value: "%s" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "file",
      group: "seo",
      description:
        "Browser tab icon. Accepts .ico, .png, or .svg. Recommended: 32×32 or 48×48 px.",
      options: {
        accept: ".ico,.png,.svg,image/x-icon,image/png,image/svg+xml",
      },
    }),
    socialLinks,
  ],
  preview: {
    select: {
      title: "label",
    },
    prepare: ({ title }) => ({
      title: title || "Untitled Settings",
      media: CogIcon,
    }),
  },
});
