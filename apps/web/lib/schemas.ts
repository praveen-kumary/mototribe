import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price is required"),
  comparePrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  weight: z.string().optional(),
  stock: z.coerce.number().min(0).default(0),
  category: z.string().min(1, "Category is required"),
  bike: z.string().optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK"]).default("ACTIVE")
});

export type ProductFormValues = z.infer<typeof productSchema>;
