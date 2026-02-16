import * as z from "zod";

export const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  sku: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category_id: z.string().uuid().nullable().optional().or(z.literal("")),
  primary_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive", "archived", "draft"]),
  materials: z.array(z.string().uuid()).min(1, "Select at least one material"),
  // Material-specific pricing: { materialId: { price, inventory, lowStockThreshold, finish, compareAtPrice, costPrice } }
  materialPricing: z.record(
    z.string(),
    z.object({
      price: z.coerce.number().min(0, "Price must be positive"),
      inventory: z.coerce.number().min(0, "Inventory must be positive"),
      lowStockThreshold: z.coerce.number().min(0).optional(),
      finish: z.string().optional(),
      compareAtPrice: z.coerce.number().min(0).optional(),
      costPrice: z.coerce.number().min(0).optional(),
    })
  ),
  dimensions_width: z.coerce.number().optional(),
  dimensions_height: z.coerce.number().optional(),
  dimensions_depth: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  is_featured: z.boolean(),
  is_new_arrival: z.boolean(),
  is_best_seller: z.boolean(),
  // SEO fields
  meta_title: z.string().max(60, "Meta title should be under 60 characters").optional().or(z.literal("")),
  meta_description: z.string().max(160, "Meta description should be under 160 characters").optional().or(z.literal("")),
});

export type FormValues = z.infer<typeof formSchema>;

export interface ProductImage {
  url: string;
  file?: File;
  isPrimary: boolean;
  blurhash?: string;
  isUploading?: boolean;
  uploadedUrl?: string;
  original_url?: string;
  storage_path?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  altText?: string;
  dbImageId?: string;
}

export interface Material {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  is_active: boolean;
}


