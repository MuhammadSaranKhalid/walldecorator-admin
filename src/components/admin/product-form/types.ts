import * as z from "zod";
import { Database } from "@/types/supabase";

// Type aliases from Supabase
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type ProductVariantInsert = Database["public"]["Tables"]["product_variants"]["Insert"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type ProductImageInsert = Database["public"]["Tables"]["product_images"]["Insert"];
export type AttributeValue = Database["public"]["Tables"]["product_attribute_values"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

export const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category_id: z.string().nullable().optional().or(z.literal("")),
  status: z.enum(["draft", "active", "archived"]),

  // Variants: Array of material × size × thickness combinations with pricing
  variants: z.array(
    z.object({
      material_id: z.string().min(1, "Select a material"),
      size_id: z.string().min(1, "Select a size"),
      thickness_id: z.string().min(1, "Select a thickness"),
      price: z.coerce.number().min(0, "Price must be positive"),
      compare_at_price: z.coerce.number().min(0).optional().nullable(),
      cost_per_item: z.coerce.number().min(0).optional().nullable(),
      is_default: z.boolean().optional(),
    })
  ).min(1, "Add at least one variant"),

  // Product Images
  images: z.array(
    z.object({
      url: z.string(),
      file: z.instanceof(File).optional(),
      displayOrder: z.number(),
      blurhash: z.string().optional(),
      isUploading: z.boolean().optional(),
      uploadedUrl: z.string().optional(),
      storage_path: z.string().optional(),
      thumbnailPath: z.string().optional(),
      mediumPath: z.string().optional(),
      largePath: z.string().optional(),
      altText: z.string().optional(),
      dbImageId: z.string().optional(),
      is_primary: z.boolean().optional(),
    })
  ).min(1, "Add at least one product image"),

  is_featured: z.boolean(),

  // SEO fields
  seo_title: z.string().max(60, "SEO title should be under 60 characters").optional().or(z.literal("")),
  seo_description: z.string().max(160, "SEO description should be under 160 characters").optional().or(z.literal("")),
});

export type FormValues = z.infer<typeof formSchema>;

// Extended types for form UI
export interface ProductImageUI {
  url: string;
  file?: File;
  displayOrder: number;
  blurhash?: string;
  isUploading?: boolean;
  uploadedUrl?: string;
  storage_path?: string;
  thumbnailPath?: string;
  mediumPath?: string;
  largePath?: string;
  altText?: string;
  dbImageId?: string;
  is_primary?: boolean;
}


