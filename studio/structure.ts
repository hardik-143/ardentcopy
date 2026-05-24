import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import {
  BookAIcon,
  BookMarked,
  BriefcaseIcon,
  Building2Icon,
  CalculatorIcon,
  CogIcon,
  File,
  FileText,
  HomeIcon,
  MapPinIcon,
  type LucideIcon,
  MessageCircle,
  PanelBottom,
  PanelBottomIcon,
  Settings2,
  TrendingUpDown,
  User,
} from "lucide-react";
import type {
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import { createSlugBasedStructure } from "@studio/components/nested-pages-structure";
import type { SchemaType, SingletonType } from "@studio/schemaTypes/index";
import { getTitleCase } from "@studio/utils/helper";

type Base<T = SchemaType> = {
  id?: string;
  type: T;
  preview?: boolean;
  title?: string;
  icon?: LucideIcon;
};

type CreateSingleTon = {
  S: StructureBuilder;
} & Base<SingletonType>;

const createSingleTon = ({ S, type, title, icon }: CreateSingleTon) => {
  const newTitle = title ?? getTitleCase(type);
  return S.listItem()
    .title(newTitle)
    .icon(icon ?? File)
    .child(S.document().schemaType(type).documentId(type));
};

type CreateList = {
  S: StructureBuilder;
} & Base;

// This function creates a list item for a type. It takes a StructureBuilder instance (S),
// a type, an icon, and a title as parameters. It generates a title for the type if not provided,
// and uses a default icon if not provided. It then returns a list item with the generated or
// provided title and icon.

const createList = ({ S, type, icon, title, id }: CreateList) => {
  const newTitle = title ?? getTitleCase(type);
  return S.documentTypeListItem(type)
    .id(id ?? type)
    .title(newTitle)
    .icon(icon ?? File);
};

type CreateIndexList = {
  S: StructureBuilder;
  list: Base;
  index: Base<SingletonType>;
  context: StructureResolverContext;
};

const createIndexListWithOrderableItems = ({
  S,
  index,
  list,
  context,
}: CreateIndexList) => {
  const indexTitle = index.title ?? getTitleCase(index.type);
  const listTitle = list.title ?? getTitleCase(list.type);
  return S.listItem()
    .title(listTitle)
    .icon(index.icon ?? File)
    .child(
      S.list()
        .title(indexTitle)
        .items([
          S.listItem()
            .title(indexTitle)
            .icon(index.icon ?? File)
            .child(
              S.document()
                .views([S.view.form()])
                .schemaType(index.type)
                .documentId(index.type)
            ),
          orderableDocumentListDeskItem({
            type: list.type,
            S,
            context,
            icon: list.icon ?? File,
            title: `${listTitle}`,
          }),
        ])
    );
};

export const structure = (
  S: StructureBuilder,
  context: StructureResolverContext
) =>
  S.list()
    .title("Content")
    .items([
      createSingleTon({ S, type: "homePage", icon: HomeIcon }),
      S.divider(),
      createSlugBasedStructure(S, "page"),
      createIndexListWithOrderableItems({
        S,
        index: { type: "blogIndex", icon: BookMarked },
        list: { type: "blog", title: "Blogs", icon: FileText },
        context,
      }),
      S.listItem()
        .title("Glossary")
        .icon(BookAIcon)
        .child(
          S.list()
            .title("Glossary")
            .items([
              S.listItem()
                .title("Glossary Page")
                .icon(BookAIcon)
                .child(
                  S.document()
                    .views([S.view.form()])
                    .schemaType("glossaryIndex")
                    .documentId("glossaryIndex")
                ),
              orderableDocumentListDeskItem({
                type: "glossary",
                S,
                context,
                icon: BookAIcon,
                title: "Terms",
              }),
            ])
        ),
      S.listItem()
        .title("Careers")
        .icon(BriefcaseIcon)
        .child(
          S.list()
            .title("Careers")
            .items([
              S.listItem()
                .title("Careers Page")
                .icon(BriefcaseIcon)
                .child(
                  S.document()
                    .views([S.view.form()])
                    .schemaType("careersIndex")
                    .documentId("careersIndex")
                ),
              orderableDocumentListDeskItem({
                type: "career",
                S,
                context,
                icon: BriefcaseIcon,
                title: "Openings",
              }),
            ])
        ),
      createList({
        S,
        type: "faq",
        title: "FAQs",
        icon: MessageCircle,
      }),
      createList({ S, type: "author", title: "Authors", icon: User }),
      createList({
        S,
        type: "redirect",
        title: "Redirects",
        icon: TrendingUpDown,
      }),
      S.divider(),
      S.listItem()
        .title("Carpet Calculators")
        .icon(CalculatorIcon)
        .child(
          S.list()
            .title("Carpet Calculators")
            .items([
              createList({
                S,
                type: "commercialCalculator",
                title: "Commercial",
                icon: Building2Icon,
              }),
              createList({
                S,
                type: "residentialCalculator",
                title: "Residential",
                icon: HomeIcon,
              }),
              createList({
                S,
                type: "residentialZipCodeSet",
                title: "Residential Zip Sets",
                icon: MapPinIcon,
              }),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("Site Configuration")
        .icon(Settings2)
        .child(
          S.list()
            .title("Site Configuration")
            .items([
              createSingleTon({
                S,
                type: "navbar",
                title: "Navigation",
                icon: PanelBottom,
              }),
              createSingleTon({
                S,
                type: "footer",
                title: "Footer",
                icon: PanelBottomIcon,
              }),
              createSingleTon({
                S,
                type: "settings",
                title: "Global Settings",
                icon: CogIcon,
              }),
            ])
        ),
    ]);
