// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";


const blogs = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blogs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const project = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/project", // Base path sudah benar (tanpa 's')
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heroImage: z.string(),

    // PERUBAHAN DI SINI:
    // Menerima array yang isinya bisa berupa string ATAU object
    techStack: z.array(
      z.union([
        z.string(), // Untuk mendukung format lama: ["logos:react"]
        z.object({  // Untuk mendukung format baru dengan warna
          icon: z.string(),
          color: z.string().optional(),
        }),
      ])
    ).default([]), // Jika tidak diisi di MDX, otomatis menjadi array kosong

    isFeatured: z.boolean().default(false),
  }),
});

export const collections = {
  blogs,
  project,
};
