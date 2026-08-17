import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    journal: defineCollection({
      type: 'page',
      source: 'journal/*.md',
      schema: z.object({
        author: z.object({
          name: z.string(),
          role: z.string(),
        }),
        datePublished: z.string(),
        dateModified: z.string().optional(),
        lede: z.array(z.string()),
      }),
    }),
  },
})
