import {BlockContentIcon, HighlightIcon, ImageIcon, LinkIcon, StrikethroughIcon} from '@sanity/icons'
import { type DecoratorProps, HighlightAnnotation } from '@studio/components/portableText/decorators'

import HighlightColorInput from '@studio/components/portableText/HighlightColorInput'
import ImageWidthInput from '@studio/components/portableText/ImageWidthInput'
import { customUrl } from '@studio/schemaTypes/definitions/custom-url'
type BlockFeature =
  | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'highlight'
  | 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote'
  | 'ul' | 'ol'
  | 'link' | 'floatingImage' | 'button' | 'inlineContentSection' | 'singleImage'
//   'inlineImage' | 'inlineVideo'

type BlockConfig = Partial<Record<BlockFeature, boolean>> & {
  /** When true, all features default to OFF — only explicitly true ones are enabled */
  only?: boolean
}

const isOn = (val: boolean | undefined, onlyMode: boolean): boolean =>
  onlyMode ? val === true : val !== false

export const floatingImageBlock = {
  name: 'floatingImage',
  type: 'object',
  title: 'Floating Image',
  icon: ImageIcon,
  fields: [
    {
      name: 'image',
      type: 'image',
      title: 'Image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
      ],
    },
    {
      name: 'position',
      type: 'string',
      title: 'Float Position',
      initialValue: 'left',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
      },
    },
    {
      name: 'maxWidth',
      type: 'number',
      title: 'Max Width (px)',
      description: 'Maximum width of the floating image in pixels (default 200)',
      initialValue: 200,
    },
  ],
} as const

export const buttonBlock = {
  type: 'button',
} as const

export const buttonsGroupBlock = {
  name: 'buttonsGroup',
  type: 'object',
  title: 'Buttons',
  fields: [
    {
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      of: [{ type: 'button' }],
    },
  ],
  preview: {
    select: { buttons: 'buttons' },
    prepare: ({ buttons = [] }: { buttons?: unknown[] }) => ({
      title: `Buttons (${buttons.length})`,
      subtitle: 'Button Group',
    }),
  },
} as const

export const singleImageBlock = {
  name: 'singleImage',
  type: 'object',
  title: 'Single Image',
  icon: ImageIcon,
  fields: [
    {
      name: 'image',
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt Text' },
      ],
    },
    {
      name: 'width',
      type: 'string',
      title: 'Width',
      initialValue: 'full',
      components: {
        input: ImageWidthInput,
      },
      options: {
        list: [
          { title: 'Full Width', value: 'full' },
          { title: '75%', value: '75' },
          { title: '50%', value: '50' },
          { title: '25%', value: '25' },
        ],
      },
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                icon: LinkIcon,
                fields: customUrl.fields,
              },
            ],
          },
        },
      ],
    },
    {
      name: 'captionAlignment',
      type: 'string',
      title: 'Caption Alignment',
      initialValue: 'left',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
          { title: 'Right', value: 'right' },
        ],
      },
    },
  ],
}

export const inlineContentSectionBlock = {
  name: 'inlineContentSection',
  type: 'object',
  title: 'Inline Content Section',
  icon: BlockContentIcon,
  fields: [
    {
      name: 'image',
      type: 'image',
      title: 'Image',
      options: {hotspot: true},
      fields: [
        {name: 'alt', type: 'string', title: 'Alt Text'},
      ],
    },
    {
      name: 'imagePosition',
      type: 'string',
      title: 'Image Position',
      initialValue: 'left',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
      },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [{title: 'Bold', value: 'strong'}],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                icon: LinkIcon,
                fields: customUrl.fields,
              },
            ],
          },
        },
      ],
    },
  ],
}

export function createCustomBlock(config: BlockConfig = {}) {
  const {only = false, ...features} = config
  const {
    bold,
    italic,
    underline,
    strikethrough,
    highlight,
    normal,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    blockquote,
    ul,
    ol,
    link,
    // inlineImage,
    // inlineVideo,
  } = features

  // Decorators
  const decorators: Array<{title: string; value: string; icon?: React.ComponentType; component?: React.ComponentType<DecoratorProps>}> = []
  if (isOn(bold, only)) decorators.push({title: 'Strong', value: 'strong'})
  if (isOn(italic, only)) decorators.push({title: 'Emphasis', value: 'em'})
  if (isOn(underline, only)) decorators.push({title: 'Underline', value: 'underline'})
  if (isOn(strikethrough, only))
    decorators.push({title: 'Strikethrough', value: 'strike-through', icon: StrikethroughIcon})

  // Styles
  const styles: Array<{title: string; value: string}> = []
  if (isOn(normal, only)) styles.push({title: 'Normal', value: 'normal'})
  if (isOn(h1, only)) styles.push({title: 'Heading 1', value: 'h1'})
  if (isOn(h2, only)) styles.push({title: 'Heading 2', value: 'h2'})
  if (isOn(h3, only)) styles.push({title: 'Heading 3', value: 'h3'})
  if (isOn(h4, only)) styles.push({title: 'Heading 4', value: 'h4'})
  if (isOn(h5, only)) styles.push({title: 'Heading 5', value: 'h5'})
  if (isOn(h6, only)) styles.push({title: 'Heading 6', value: 'h6'})
  if (isOn(blockquote, only)) styles.push({title: 'Quote', value: 'blockquote'})

  // Lists
  const lists: Array<{title: string; value: string}> = []
  if (isOn(ul, only)) lists.push({title: 'Bullet', value: 'bullet'})
  if (isOn(ol, only)) lists.push({title: 'Numbered', value: 'number'})

  // Annotations
  const annotations: Array<Record<string, unknown>> = []

//   if (isOn(anchor, only)) {
//     annotations.push({
//       name: 'anchor',
//       type: 'object',
//       icon: LinkIcon,
//       title: 'Anchor',
//       component: AnchorDecorator,
//       fields: [
//         defineField({
//           name: 'href',
//           type: 'url',
//           title: 'URL',
//           validation: (rule) =>
//             rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
//         }),
//         defineField({
//           name: 'openInNewTab',
//           type: 'boolean',
//           title: 'Open in new tab',
//           initialValue: false,
//         }),
//       ],
//     })
//   }

  if (isOn(highlight, only)) {
    annotations.push({
      name: 'highlight',
      type: 'object',
      title: 'Highlight',
      icon: HighlightIcon,
      components: {
        annotation: HighlightAnnotation,
      },
      fields: [
        {
          name: 'color',
          type: 'string',
          title: 'Highlight Color',
          components: {
            input: HighlightColorInput,
          },
          initialValue: '#c4d600',
        },
      ],
    })
  }

  if (isOn(link, only)) {
    annotations.push({
      name: 'link',
      type: 'object',
      title: 'Link',
      icon: LinkIcon,
      fields: customUrl.fields,
    })
  }

  // Inline object types (embedded within block children)
//   const inlineTypes: Array<{name: string; type: string; options?: Record<string, unknown>; fields?: unknown[]}> = []
//   if (isOn(inlineImage, only)) {
//     inlineTypes.push({
//       name: 'inlineImage',
//       type: 'image',
//       options: {hotspot: false},
//     })
//   }
//   if (isOn(inlineVideo, only)) {
//     inlineTypes.push({
//       name: 'inlineVideo',
//       type: 'object',
//       fields: [
//         {
//           name: 'video',
//           type: 'file',
//           title: 'Video file',
//           options: {accept: 'video/*'},
//         },
//         {
//           name: 'alt',
//           type: 'string',
//           title: 'Alt text',
//         },
//       ],
//     })
//   }

  return {
    type: 'block' as const,
    styles,
    lists,
    marks: {decorators, annotations},
    // ...(inlineTypes.length > 0 ? {of: inlineTypes} : {}),
  }
}
