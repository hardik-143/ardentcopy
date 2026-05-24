import { TableIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const tableBlock = defineType({
  name: "tableBlock",
  title: "Table",
  type: "object",
  icon: TableIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Optional heading shown above the table",
    }),
    // defineField({
    //   name: "table",
    //   title: "Table",
    //   type: "table",
    //   validation: (Rule) => Rule.required(),
    // }),
  ],
  preview: {
    select: {
      title: "title",
      // rows: "table.rows",
    },
    // prepare({ title, rows }) {
    //   const rowCount = Array.isArray(rows) ? rows.length : 0;
    //   const colCount = Array.isArray(rows) && rows[0] ? (rows[0] as { cells?: string[] }).cells?.length ?? 0 : 0;
    //   return {
    //     title: title || "Table",
    //     subtitle: rowCount ? `${rowCount} rows × ${colCount} cols` : "Empty table",
    //   };
    // },
    prepare({ title }) {
      return {
        title: title || "Table",
      };
    },
  },
});
