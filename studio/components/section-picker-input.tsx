import { Select, Stack, Text } from "@sanity/ui";
import { set, unset, useFormValue } from "sanity";
import type { StringInputProps } from "sanity";

type PageBuilderBlock = {
  _key: string;
  _type: string;
  anchorId?: string;
  title?: string;
  heading?: string;
  internalName?: string;
};

function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function getBlockLabel(block: PageBuilderBlock, index: number): string {
  const name = block.title ?? block.heading ?? block.internalName;
  const label = name ?? camelToTitle(block._type);
  const idHint = block.anchorId ? ` (#${block.anchorId})` : "";
  return `${index + 1}. ${label}${idHint}`;
}

export function SectionPickerInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props;
  const pageBuilder = useFormValue(["pageBuilder"]) as
    | PageBuilderBlock[]
    | undefined;

  const blocks = pageBuilder ?? [];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    onChange(val ? set(val) : unset());
  }

  if (!blocks.length) {
    return (
      <Stack space={2}>
        <Text muted size={1}>
          No page builder sections found in this document.
        </Text>
      </Stack>
    );
  }

  return (
    <Select
      disabled={readOnly}
      onChange={handleChange}
      value={value ?? ""}
    >
      <option value="">— Select a section —</option>
      {blocks.map((block, index) => (
        <option key={block._key} value={block.anchorId || block._key}>
          {getBlockLabel(block, index)}
        </option>
      ))}
    </Select>
  );
}
