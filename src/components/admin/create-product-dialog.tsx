"use client";

/**
 * SKU STRUCTURE DOCUMENTATION
 * 
 * Base Product SKU Format: WD-{CATEGORY}-{PRODUCT}-{SEQUENCE}
 * - WD: Brand prefix (WallDecorator)
 * - CATEGORY: 3-4 letter category code (e.g., WALL, SCUL, DECO)
 * - PRODUCT: 8 character product identifier from name
 * - SEQUENCE: 3-digit sequential number (001, 002, 003...)
 * 
 * Sequence Logic:
 * - Automatically queries database for existing products
 * - Finds the highest sequence number for similar products
 * - Increments by 1 to ensure unique, sequential SKUs
 * - No timestamps or random numbers used
 * 
 * Examples:
 * - WD-WALL-GEOLION-001 (First Geometric Lion Head)
 * - WD-WALL-GEOLION-002 (Second Geometric Lion Head variant)
 * - WD-SCUL-ABSTRACT-001 (First Abstract Sculpture)
 * - WD-GEN-MODERNART-001 (Modern Art - No category/General)
 * 
 * Material Variant SKUs (stored in product_materials):
 * Base SKU + Material Suffix
 * - WD-WALL-GEOLION-001-ACR (Acrylic variant)
 * - WD-WALL-GEOLION-001-STL (Steel variant)
 * - WD-WALL-GEOLION-001-IRN (Iron variant)
 * - WD-WALL-GEOLION-001-WD (Wood variant)
 * 
 * Benefits:
 * ✓ Human-readable and memorable
 * ✓ Sequential numbering for easy tracking
 * ✓ Category grouping for inventory management
 * ✓ Unique identification for each product
 * ✓ Material variants clearly identified
 * ✓ Scalable for future growth
 */

import { useState, useEffect } from "react";
import { useCreate, useUpdate, useList, useOne } from "@refinedev/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, X, Star, ImagePlus, MoveUp, MoveDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowserClient } from "@/utils/supabase/client";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category_id: z.string().uuid().nullable().optional().or(z.literal("")),
  primary_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive", "archived", "draft"]),
  materials: z.array(z.string().uuid()).min(1, "Select at least one material"),
  // Material-specific pricing: { materialId: { price, inventory, lowStockThreshold, finish } }
  materialPricing: z.record(
    z.object({
      price: z.coerce.number().min(0, "Price must be positive"),
      inventory: z.coerce.number().min(0, "Inventory must be positive"),
      lowStockThreshold: z.coerce.number().min(0).optional(),
      finish: z.string().optional(),
    })
  ),
  dimensions_width: z.coerce.number().optional(),
  dimensions_height: z.coerce.number().optional(),
  dimensions_depth: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  is_featured: z.boolean(),
  is_new_arrival: z.boolean(),
  is_best_seller: z.boolean(),
});

interface ProductImage {
  url: string;
  file?: File;
  isPrimary: boolean;
  blurhash?: string;
  isUploading?: boolean;
  uploadedUrl?: string; // Original Supabase storage URL
  thumbnailUrl?: string; // 400x400 variant
  mediumUrl?: string; // 800x800 variant
  largeUrl?: string; // 1200x1200 variant
  width?: number;
  height?: number;
  fileSize?: number;
}

type FormValues = z.infer<typeof formSchema>;

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string; // If provided, dialog is in edit mode
}

interface Material {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  is_active: boolean;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  productId,
}: CreateProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const isEditMode = !!productId;

  // Fetch materials from database
  const {
    query: { isLoading: materialsLoading },
    result: { data: materials = [] },
  } = useList<Material>({
    resource: "materials",
    filters: [
      {
        field: "is_active",
        operator: "eq",
        value: true,
      },
    ],
    sorters: [
      {
        field: "display_order",
        order: "asc",
      },
    ],
  });

  // Fetch categories from database
  const {
    query: { isLoading: categoriesLoading },
    result: { data: categories = [] },
  } = useList<Category>({
    resource: "categories",
    filters: [
      {
        field: "is_active",
        operator: "eq",
        value: true,
      },
    ],
    sorters: [
      {
        field: "display_order",
        order: "asc",
      },
    ],
    pagination: {
      mode: "off",
    },
  });

  // Fetch existing product data if in edit mode
  const {
    result: existingProduct,
    query: { isLoading: productLoading },
  } = useOne({
    resource: "products",
    id: productId || "",
    queryOptions: {
      enabled: isEditMode && open,
    },
    meta: {
      select: "*, product_materials(id, material_id, price, inventory_quantity, low_stock_threshold, finish, is_available), product_images(id, image_url, is_primary, display_order)",
    },
  });

  // Refine's useCreate hooks for creating related records
  const { mutateAsync: createProduct } = useCreate();
  const { mutateAsync: updateProduct } = useUpdate();
  const { mutateAsync: createProductImage } = useCreate();
  const { mutateAsync: createProductMaterial } = useCreate();

  // React Hook Form for form management
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      description: "",
      category_id: "",
      primary_image_url: "",
      status: "active",
      materials: [],
      materialPricing: {},
      dimensions_width: 0,
      dimensions_height: 0,
      dimensions_depth: 0,
      weight: 0,
      is_featured: false,
      is_new_arrival: false,
      is_best_seller: false,
    },
  });

  // Populate form with existing product data when in edit mode
  useEffect(() => {
    if (isEditMode && existingProduct && open) {
      const product = existingProduct as any;

      // Reset form with product data
      form.reset({
        name: product.name || "",
        slug: product.slug || "",
        sku: product.sku || "",
        description: product.description || "",
        category_id: product.category_id || "",
        primary_image_url: product.primary_image_url || "",
        status: product.status || "active",
        materials: product.product_materials?.map((pm: any) => pm.material_id) || [],
        materialPricing: product.product_materials?.reduce((acc: any, pm: any) => {
          acc[pm.material_id] = {
            price: pm.price,
            inventory: pm.inventory_quantity,
            lowStockThreshold: pm.low_stock_threshold,
            finish: pm.finish || "",
          };
          return acc;
        }, {}) || {},
        dimensions_width: product.dimensions_width || 0,
        dimensions_height: product.dimensions_height || 0,
        dimensions_depth: product.dimensions_depth || 0,
        weight: product.weight || 0,
        is_featured: product.is_featured || false,
        is_new_arrival: product.is_new_arrival || false,
        is_best_seller: product.is_best_seller || false,
      });

      // Set product images
      if (product.product_images && product.product_images.length > 0) {
        const images = product.product_images
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((img: any) => ({
            url: img.image_url,
            isPrimary: img.is_primary,
          }));
        setProductImages(images);
      }
    }
  }, [isEditMode, existingProduct, open, form]);

  // Auto-generate slug and SKU from name
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    form.setValue("slug", slug);
    
    // Auto-generate SKU if it's empty
    if (!form.getValues("sku")) {
      generateAndSetSKU(value);
    }
  };

  // Generate professional SKU with category, product, and proper sequence
  const generateAndSetSKU = async (name: string) => {
    const prefix = "WD"; // WallDecorator brand prefix
    
    // Get category abbreviation if selected
    const categoryId = form.getValues("category_id");
    let categoryCode = "GEN"; // Default: General
    
    if (categoryId && categoryId !== "" && categoryId !== "none") {
      const selectedCategory = categories.find((c) => c.id === categoryId);
      if (selectedCategory) {
        // Generate 3-4 letter category code from category name
        categoryCode = selectedCategory.name
          .toUpperCase()
          .replace(/[^A-Z]/g, "")
          .substring(0, 4);
        
        // If category code is too short, pad it
        if (categoryCode.length < 3) {
          categoryCode = selectedCategory.name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .substring(0, 4)
            .padEnd(3, "X");
        }
      }
    }
    
    // Generate product code from name (8 characters)
    const productCode = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") // Remove special characters and spaces
      .substring(0, 8); // Take first 8 characters
    
    // Query database to get the next sequence number
    let sequence = 1;
    try {
      const skuPattern = `${prefix}-${categoryCode}-${productCode}-%`;
      
      // Use Supabase to query products with similar SKU pattern
      const { data: existingProducts } = await supabaseBrowserClient
        .from("products")
        .select("sku")
        .like("sku", skuPattern)
        .order("sku", { ascending: false })
        .limit(1);
      
      if (existingProducts && existingProducts.length > 0) {
        // Extract sequence number from the last SKU
        const lastSKU = existingProducts[0].sku;
        const parts = lastSKU.split("-");
        const lastSequence = parseInt(parts[parts.length - 1]) || 0;
        sequence = lastSequence + 1;
      }
    } catch (error) {
      console.warn("Could not fetch existing SKUs, using sequence 1:", error);
      // If query fails, start with 1 (or use a random number as fallback)
      sequence = Math.floor(Math.random() * 100) + 1;
    }
    
    // Format sequence as 3-digit number
    const sequenceStr = sequence.toString().padStart(3, "0");
    
    // Format: WD-CATEGORY-PRODUCTCODE-SEQUENCE
    const sku = `${prefix}-${categoryCode}-${productCode}-${sequenceStr}`;
    form.setValue("sku", sku);
    return sku;
  };
  
  // Helper function to generate material-specific SKU suffix
  const getMaterialSuffix = (materialName: string): string => {
    const suffixes: { [key: string]: string } = {
      acrylic: "ACR",
      steel: "STL",
      iron: "IRN",
      wood: "WD",
      brass: "BRS",
      copper: "CPR",
      aluminum: "ALU",
      glass: "GLS",
      ceramic: "CER",
      metal: "MTL",
    };
    
    const lowerName = materialName.toLowerCase();
    
    // Check for exact match first
    if (suffixes[lowerName]) {
      return suffixes[lowerName];
    }
    
    // Generate from first 3 letters if no match
    return materialName.toUpperCase().replace(/[^A-Z]/g, "").substring(0, 3);
  };

  // Helper function to format categories hierarchically
  const getCategoryDisplayName = (category: Category): string => {
    if (category.parent_id) {
      const parent = categories.find((c) => c.id === category.parent_id);
      if (parent) {
        return `${parent.name} → ${category.name}`;
      }
    }
    return category.name;
  };

  // Sort categories to show parents first, then children
  const sortedCategories = [...categories].sort((a, b) => {
    // Parents first (no parent_id)
    if (!a.parent_id && b.parent_id) return -1;
    if (a.parent_id && !b.parent_id) return 1;
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  const onSubmit = async (values: FormValues) => {
    console.log("=== Product Submission Started ===");
    console.log("Mode:", isEditMode ? "EDIT" : "CREATE");
    console.log("Product ID:", productId);
    console.log("Form Values:", values);
    console.log("Product Images Count:", productImages.length);

    setIsSubmitting(true);
    try {
      if (productImages.length === 0) {
        console.error("❌ Validation failed: No images uploaded");
        toast.error("Please upload at least one product image");
        setIsSubmitting(false);
        return;
      }

      console.log("✓ Validation passed");

      // Check if any images are still uploading
      const stillUploading = productImages.some((img) => img.isUploading);
      if (stillUploading) {
        console.warn("⚠️  Some images are still uploading");
        toast.error("Please wait for all images to finish uploading");
        setIsSubmitting(false);
        return;
      }

      console.log("📦 Preparing image data from pre-uploaded images...");

      // Use pre-uploaded images (already in Supabase storage with variants)
      const uploadedImages: {
        url: string;
        isPrimary: boolean;
        displayOrder: number;
        blurhash?: string;
        thumbnailUrl?: string;
        mediumUrl?: string;
        largeUrl?: string;
        width?: number;
        height?: number;
        fileSize?: number;
      }[] = productImages.map((image, i) => {
        console.log(`\n📷 Image ${i + 1}/${productImages.length}`);
        console.log(`  - Has uploaded URL: ${!!image.uploadedUrl}`);
        console.log(`  - Has thumbnail: ${!!image.thumbnailUrl}`);
        console.log(`  - Has medium: ${!!image.mediumUrl}`);
        console.log(`  - Has large: ${!!image.largeUrl}`);
        console.log(`  - Has blurhash: ${!!image.blurhash}`);
        console.log(`  - Is primary: ${image.isPrimary}`);

        return {
          url: image.uploadedUrl || image.url,
          isPrimary: image.isPrimary,
          displayOrder: i,
          blurhash: image.blurhash,
          thumbnailUrl: image.thumbnailUrl,
          mediumUrl: image.mediumUrl,
          largeUrl: image.largeUrl,
          width: image.width,
          height: image.height,
          fileSize: image.fileSize,
        };
      });

      console.log(`\n✅ Prepared ${uploadedImages.length} images for database`);

      // Extract materials and pricing for separate table
      const { materials, materialPricing, ...productData } = values;

      console.log(`\n📦 Product Data Preparation:`);
      console.log(`  - Materials selected: ${materials.length}`);
      console.log(`  - Category ID: ${productData.category_id || 'None'}`);

      // Update primary_image_url with the primary image
      const primaryImage = uploadedImages.find((img) => img.isPrimary);
      console.log(`  - Primary image: ${primaryImage ? primaryImage.url : uploadedImages[0]?.url}`);

      // Clean up data: convert empty strings to null, then filter out null/undefined
      // This is important for UUID fields like category_id which can't accept empty strings
      const cleanedProductData = Object.fromEntries(
        Object.entries(productData)
          .map(([key, value]) => [key, value === "" ? null : value]) // Convert empty strings to null
          .filter(([_, value]) => value !== null && value !== undefined) // Remove null/undefined
      );

      console.log(`  - Cleaned product data fields: ${Object.keys(cleanedProductData).length}`);

      if (isEditMode && productId) {
        console.log(`\n=== EDIT MODE ===`);
        console.log(`📝 Updating product ID: ${productId}`);

        // Step 1: Update the product
        console.log(`\nStep 1/5: Updating product base data...`);
        await updateProduct({
          resource: "products",
          id: productId,
          values: {
            ...cleanedProductData,
            primary_image_url: primaryImage?.url || uploadedImages[0].url,
          },
        });
        console.log(`✓ Product updated successfully`);

        // Step 2: Delete existing product materials (we'll recreate them)
        console.log(`\nStep 2/5: Deleting existing product materials...`);
        const existingMaterials = (existingProduct as any)?.product_materials || [];
        console.log(`  - Existing materials: ${existingMaterials.length}`);
        if (existingMaterials.length > 0) {
          await Promise.all(
            existingMaterials.map((pm: any) =>
              supabaseBrowserClient
                .from("product_materials")
                .delete()
                .eq("id", pm.id)
            )
          );
          console.log(`✓ Deleted ${existingMaterials.length} existing materials`);
        }

        // Step 3: Create new product materials
        console.log(`\nStep 3/5: Creating new product materials...`);
        console.log(`  - New materials to create: ${materials.length}`);
        if (materials && materials.length > 0) {
          await Promise.all(
            materials.map((materialId) => {
              const pricing = materialPricing[materialId] || {
                price: 0,
                inventory: 0,
                lowStockThreshold: 10,
                finish: "",
              };
              return createProductMaterial({
                resource: "product_materials",
                values: {
                  product_id: productId,
                  material_id: materialId,
                  price: pricing.price,
                  inventory_quantity: pricing.inventory,
                  low_stock_threshold: pricing.lowStockThreshold || 10,
                  finish: pricing.finish || null,
                  is_available: true,
                },
              });
            })
          );
          console.log(`✓ Created ${materials.length} product materials`);
        }

        // Step 4: Delete existing product images (we'll recreate them)
        console.log(`\nStep 4/5: Deleting existing product images...`);
        const existingImages = (existingProduct as any)?.product_images || [];
        console.log(`  - Existing images: ${existingImages.length}`);
        if (existingImages.length > 0) {
          await Promise.all(
            existingImages.map((img: any) =>
              supabaseBrowserClient
                .from("product_images")
                .delete()
                .eq("id", img.id)
            )
          );
          console.log(`✓ Deleted ${existingImages.length} existing images`);
        }

        // Step 5: Create new product images
        console.log(`\nStep 5/5: Creating new product images...`);
        console.log(`  - Images to create: ${uploadedImages.length}`);
        if (uploadedImages.length > 0) {
          await Promise.all(
            uploadedImages.map((image) =>
              createProductImage({
                resource: "product_images",
                values: {
                  product_id: productId,
                  original_url: image.url,
                  thumbnail_url: image.thumbnailUrl || null,
                  medium_url: image.mediumUrl || null,
                  large_url: image.largeUrl || null,
                  width: image.width || null,
                  height: image.height || null,
                  file_size: image.fileSize || null,
                  is_primary: image.isPrimary,
                  display_order: image.displayOrder,
                  blurhash: image.blurhash || null,
                },
              })
            )
          );
          console.log(`✓ Created ${uploadedImages.length} product images`);
        }

        console.log(`\n✅ Product "${values.name}" updated successfully!`);
        toast.success(`Product "${values.name}" updated successfully!`);
      } else {
        console.log(`\n=== CREATE MODE ===`);
        console.log(`📝 Creating new product: ${values.name}`);

        // Step 1: Create the product
        console.log(`\nStep 1/3: Creating product base data...`);
        const productResult = await createProduct({
          resource: "products",
          values: {
            ...cleanedProductData,
            primary_image_url: primaryImage?.url || uploadedImages[0].url,
          },
        });

        const createdProductId = productResult.data.id;
        console.log(`✓ Product created with ID: ${createdProductId}`);

        // Step 2: Create product materials with pricing
        console.log(`\nStep 2/3: Creating product materials...`);
        console.log(`  - Materials to create: ${materials.length}`);
        if (materials && materials.length > 0) {
          await Promise.all(
            materials.map((materialId) => {
              const pricing = materialPricing[materialId] || {
                price: 0,
                inventory: 0,
                lowStockThreshold: 10,
                finish: "",
              };
              return createProductMaterial({
                resource: "product_materials",
                values: {
                  product_id: createdProductId,
                  material_id: materialId,
                  price: pricing.price,
                  inventory_quantity: pricing.inventory,
                  low_stock_threshold: pricing.lowStockThreshold || 10,
                  finish: pricing.finish || null,
                  is_available: true,
                },
              });
            })
          );
          console.log(`✓ Created ${materials.length} product materials`);
        }

        // Step 3: Create product images (all images including primary)
        console.log(`\nStep 3/3: Creating product images...`);
        console.log(`  - Images to create: ${uploadedImages.length}`);
        if (uploadedImages.length > 0) {
          await Promise.all(
            uploadedImages.map((image) =>
              createProductImage({
                resource: "product_images",
                values: {
                  product_id: createdProductId,
                  original_url: image.url,
                  thumbnail_url: image.thumbnailUrl || null,
                  medium_url: image.mediumUrl || null,
                  large_url: image.largeUrl || null,
                  width: image.width || null,
                  height: image.height || null,
                  file_size: image.fileSize || null,
                  is_primary: image.isPrimary,
                  display_order: image.displayOrder,
                  blurhash: image.blurhash || null,
                },
              })
            )
          );
          console.log(`✓ Created ${uploadedImages.length} product images`);
        }

        console.log(`\n✅ Product "${values.name}" created successfully!`);
        console.log(`   - Product ID: ${createdProductId}`);
        console.log(`   - Images: ${uploadedImages.length}`);
        console.log(`   - Materials: ${materials.length}`);

        toast.success(
          `Product "${values.name}" created successfully with ${uploadedImages.length} images and ${materials.length} material variants!`
        );
      }

      console.log(`\n🧹 Cleaning up form state...`);
      setProductImages([]);
      form.reset();
      onOpenChange(false);
      console.log(`✅ Form closed successfully`);
      console.log(`=== Product Submission Complete ===\n`);
    } catch (error: any) {
      console.error(`\n❌ Error ${isEditMode ? 'updating' : 'creating'} product:`, error);
      console.error(`Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      toast.error(
        `Error ${isEditMode ? 'updating' : 'creating'} product: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
      console.log(`Submission state reset`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Product" : "Create New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the product information below."
              : "Add a new product to your catalog. Fill in all the required information."}
          </DialogDescription>
        </DialogHeader>

        {/* Loading state while fetching product data */}
        {isEditMode && productLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading product data...</span>
          </div>
        )}

        {/* Show form when not loading or in create mode */}
        {(!isEditMode || !productLoading) && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Geometric Lion Head"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input placeholder="geometric-lion-head" {...field} />
                      </FormControl>
                      <FormDescription>Auto-generated from name</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base SKU *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="WD-WALL-GEOLION-001" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={async () => {
                            const name = form.getValues("name");
                            if (name) {
                              await generateAndSetSKU(name);
                              toast.success("SKU regenerated successfully");
                            } else {
                              toast.error("Please enter product name first");
                            }
                          }}
                          title="Regenerate SKU"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>
                        Format: Brand-Category-Product-Sequence (Material variants tracked separately)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed product description..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Images Section */}
              <div className="space-y-4">
                <div>
                  <FormLabel>Product Images</FormLabel>
                  <FormDescription className="mt-1">
                    Upload multiple images. The first one will be the primary
                    image.
                  </FormDescription>
                </div>

                {/* File Upload */}
                <div className="flex items-center gap-4">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;

                      console.log(`📁 Selected ${files.length} file(s) for upload`);

                      // Create preview images with uploading state
                      const newImages: ProductImage[] = files.map((file, index) => ({
                        url: URL.createObjectURL(file),
                        file,
                        isPrimary: productImages.length === 0 && index === 0,
                        isUploading: true,
                        blurhash: undefined,
                        uploadedUrl: undefined,
                      }));

                      setProductImages([...productImages, ...newImages]);
                      toast.info(`Uploading ${files.length} image(s) to storage...`);

                      // Upload all files simultaneously (in parallel)
                      const uploadPromises = files.map(async (file, i) => {
                        const imageIndex = productImages.length + i;

                        console.log(`\n📤 Starting upload ${i + 1}/${files.length}: ${file.name}`);

                        try {
                          // Upload to Supabase Storage
                          const fileExt = file.name.split(".").pop();
                          const fileName = `${Date.now()}_${i}_${Math.random()
                            .toString(36)
                            .substring(7)}.${fileExt}`;
                          const filePath = `products/${fileName}`;

                          console.log(`  📦 File size: ${(file.size / 1024).toFixed(2)} KB`);
                          console.log(`  ⬆️  Uploading to: ${filePath}`);

                          const { error: uploadError } = await supabaseBrowserClient.storage
                            .from("product-images")
                            .upload(filePath, file, {
                              cacheControl: "3600",
                              upsert: false,
                            });

                          if (uploadError) {
                            console.error(`  ❌ Upload failed:`, uploadError);
                            toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);

                            // Update image state to show error
                            setProductImages((prev) => {
                              const updated = [...prev];
                              updated[imageIndex] = {
                                ...updated[imageIndex],
                                isUploading: false,
                              };
                              return updated;
                            });
                            return;
                          }

                          // Get public URL
                          const {
                            data: { publicUrl },
                          } = supabaseBrowserClient.storage
                            .from("product-images")
                            .getPublicUrl(filePath);

                          console.log(`  ✓ Upload successful`);
                          console.log(`  🔗 Public URL: ${publicUrl}`);
                          console.log(`  🔄 Processing variants and generating blurhash...`);

                          // Process image to generate variants + blurhash
                          let blurhash: string | undefined;
                          let thumbnailUrl: string | undefined;
                          let mediumUrl: string | undefined;
                          let largeUrl: string | undefined;
                          let width: number | undefined;
                          let height: number | undefined;
                          let fileSize: number | undefined;

                          try {
                            const response = await fetch("/api/process-image", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                imageUrl: publicUrl,
                                storagePath: filePath,
                              }),
                            });

                            if (response.ok) {
                              const data = await response.json();
                              blurhash = data.blurhash;
                              width = data.width;
                              height = data.height;
                              fileSize = data.file_size;

                              console.log(`  ✓ Blurhash generated: ${blurhash?.substring(0, 20)}...`);
                              console.log(`  📐 Dimensions: ${width}x${height}`);
                              console.log(`  📦 File size: ${((fileSize || 0) / 1024).toFixed(2)} KB`);

                              // Upload variants back to storage
                              console.log(`  ⬆️  Uploading ${data.variants.length} variants...`);

                              for (const variant of data.variants) {
                                const variantBuffer = Buffer.from(variant.data, "base64");
                                const variantBlob = new Blob([variantBuffer], {
                                  type: "image/webp",
                                });

                                const { error: variantError } =
                                  await supabaseBrowserClient.storage
                                    .from("product-images")
                                    .upload(variant.path, variantBlob, {
                                      cacheControl: "3600",
                                      upsert: false,
                                    });

                                if (variantError) {
                                  console.warn(
                                    `    ⚠️  Failed to upload ${variant.name}:`,
                                    variantError
                                  );
                                  continue;
                                }

                                // Get public URL for variant
                                const {
                                  data: { publicUrl: variantPublicUrl },
                                } = supabaseBrowserClient.storage
                                  .from("product-images")
                                  .getPublicUrl(variant.path);

                                // Assign to appropriate URL variable
                                if (variant.name === "thumbnail") {
                                  thumbnailUrl = variantPublicUrl;
                                } else if (variant.name === "medium") {
                                  mediumUrl = variantPublicUrl;
                                } else if (variant.name === "large") {
                                  largeUrl = variantPublicUrl;
                                }

                                console.log(
                                  `    ✓ ${variant.name}: ${(variant.size / 1024).toFixed(2)} KB`
                                );
                              }

                              console.log(`  ✅ All variants uploaded`);
                            } else {
                              const errorData = await response.json();
                              console.warn(
                                `  ⚠️  Image processing failed:`,
                                errorData
                              );
                            }
                          } catch (error) {
                            console.error(`  ❌ Image processing error:`, error);
                          }

                          // Update image state with all URLs and metadata
                          setProductImages((prev) => {
                            const updated = [...prev];
                            updated[imageIndex] = {
                              ...updated[imageIndex],
                              uploadedUrl: publicUrl,
                              thumbnailUrl,
                              mediumUrl,
                              largeUrl,
                              blurhash,
                              width,
                              height,
                              fileSize,
                              isUploading: false,
                            };
                            return updated;
                          });

                          console.log(`  ✅ Image ${i + 1} fully processed`);
                        } catch (error: any) {
                          console.error(`  ❌ Error processing image ${i + 1}:`, error);
                          toast.error(`Error processing ${file.name}`);

                          setProductImages((prev) => {
                            const updated = [...prev];
                            updated[imageIndex] = {
                              ...updated[imageIndex],
                              isUploading: false,
                            };
                            return updated;
                          });
                        }
                      });

                      // Wait for all uploads to complete
                      await Promise.all(uploadPromises);

                      toast.success(`${files.length} image(s) uploaded successfully!`);
                      console.log(`✅ All ${files.length} images uploaded and processed simultaneously`);
                      e.target.value = ""; // Reset input
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                    className="w-full"
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                </div>

                {/* Image Previews Grid */}
                {productImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {productImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative group border rounded-lg overflow-hidden bg-muted"
                      >
                        {/* Image */}
                        <div className="aspect-square relative">
                          <img
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Uploading Overlay */}
                          {image.isUploading && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <div className="text-center text-white">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                <p className="text-xs font-medium">Uploading...</p>
                              </div>
                            </div>
                          )}

                          {/* Primary Badge */}
                          {image.isPrimary && !image.isUploading && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Primary
                            </div>
                          )}

                          {/* Uploaded Success Badge */}
                          {image.uploadedUrl && !image.isUploading && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                              ✓ Uploaded
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                          <div className="grid grid-cols-2 gap-2">
                            {/* Set as Primary */}
                            {!image.isPrimary && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const updated = productImages.map(
                                    (img, i) => ({
                                      ...img,
                                      isPrimary: i === index,
                                    })
                                  );
                                  setProductImages(updated);
                                  form.setValue("primary_image_url", image.url);
                                  toast.success("Primary image updated");
                                }}
                                className="h-10 w-10 p-0"
                                title="Set as primary"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Move Up */}
                            {index > 0 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const updated = [...productImages];
                                  [updated[index - 1], updated[index]] = [
                                    updated[index],
                                    updated[index - 1],
                                  ];
                                  setProductImages(updated);
                                }}
                                className="h-10 w-10 p-0"
                                title="Move up"
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Move Down */}
                            {index < productImages.length - 1 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const updated = [...productImages];
                                  [updated[index], updated[index + 1]] = [
                                    updated[index + 1],
                                    updated[index],
                                  ];
                                  setProductImages(updated);
                                }}
                                className="h-10 w-10 p-0"
                                title="Move down"
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Remove */}
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const updated = productImages.filter(
                                  (_, i) => i !== index
                                );
                                // If removing primary, make first image primary
                                if (image.isPrimary && updated.length > 0) {
                                  updated[0].isPrimary = true;
                                  form.setValue(
                                    "primary_image_url",
                                    updated[0].url
                                  );
                                } else if (updated.length === 0) {
                                  form.setValue("primary_image_url", "");
                                }
                                setProductImages(updated);
                                toast.success("Image removed");
                              }}
                              className="h-10 w-10 p-0"
                              title="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {productImages.length === 0 && (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <ImagePlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No images uploaded yet</p>
                    <p className="text-xs mt-1">
                      Click &ldquo;Upload Images&rdquo; to add product photos
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Product Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          // Handle "none" as null/undefined
                          field.onChange(value === "none" ? "" : value);
                        }}
                        value={field.value || "none"}
                        disabled={categoriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Category</SelectItem>
                          {sortedCategories.length === 0 && !categoriesLoading ? (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                              No categories available
                            </div>
                          ) : (
                            sortedCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {getCategoryDisplayName(category)}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Materials & Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Materials & Pricing *</h3>
              <p className="text-xs text-muted-foreground">
                Select materials and set price/inventory for each variant
              </p>
              {form.watch("sku") && form.watch("materials")?.length > 0 && (
                <div className="bg-muted/50 border rounded-lg p-3">
                  <p className="text-xs font-medium mb-2">Material Variant SKUs Preview:</p>
                  <div className="space-y-1">
                    {form.watch("materials")?.map((materialId) => {
                      const material = materials.find((m: Material) => m.id === materialId);
                      if (!material) return null;
                      const baseSKU = form.watch("sku");
                      const suffix = getMaterialSuffix(material.name);
                      return (
                        <div key={materialId} className="text-xs text-muted-foreground font-mono">
                          → {baseSKU}-{suffix} <span className="text-foreground/60">({material.name})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {materialsLoading ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading materials...
                </div>
              ) : materials.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                  <p className="text-sm">No materials found</p>
                  <p className="text-xs mt-1">
                    Please add materials in the admin panel first
                  </p>
                </div>
              ) : (
                materials.map((material: Material) => {
                  const selectedMaterials = form.watch("materials");
                  const isSelected = selectedMaterials?.includes(material.id);

                  return (
                    <div
                      key={material.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <FormField
                        control={form.control}
                        name="materials"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([
                                      ...field.value,
                                      material.id,
                                    ]);
                                    // Initialize pricing for this material
                                    form.setValue(
                                      `materialPricing.${material.id}`,
                                      {
                                        price: 0,
                                        inventory: 0,
                                        lowStockThreshold: 10,
                                        finish: "",
                                      }
                                    );
                                  } else {
                                    field.onChange(
                                      field.value?.filter(
                                        (value) => value !== material.id
                                      )
                                    );
                                    // Remove pricing for this material
                                    const currentPricing =
                                      form.getValues("materialPricing");
                                    const { [material.id]: _, ...rest } =
                                      currentPricing;
                                    form.setValue("materialPricing", rest);
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="flex-1">
                              <FormLabel className="font-semibold cursor-pointer">
                                {material.name}
                              </FormLabel>
                              {material.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {material.description}
                                </p>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />

                      {isSelected && (
                        <div className="grid grid-cols-4 gap-3 pl-7">
                          <FormField
                            control={form.control}
                            name={`materialPricing.${material.id}.price` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Price ($)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={
                              `materialPricing.${material.id}.inventory` as any
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Inventory
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={
                              `materialPricing.${material.id}.lowStockThreshold` as any
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Low Stock Alert
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="10"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 10
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={
                              `materialPricing.${material.id}.finish` as any
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Finish
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="e.g., Brushed"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <FormField
                control={form.control}
                name="materials"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Dimensions & Weight</h3>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="dimensions_width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimensions_height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="36"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimensions_depth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depth (in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Display Options</h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Product</FormLabel>
                        <FormDescription>
                          Display this product in the featured section
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_new_arrival"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>New Arrival</FormLabel>
                        <FormDescription>
                          Mark as a new arrival product
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_best_seller"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Best Seller</FormLabel>
                        <FormDescription>
                          Mark as a best seller product
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setProductImages([]);
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  materialsLoading ||
                  (isEditMode && productLoading) ||
                  productImages.some((img) => img.isUploading)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : materialsLoading || (isEditMode && productLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : productImages.some((img) => img.isUploading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading images...
                  </>
                ) : (
                  isEditMode ? "Update Product" : "Create Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
