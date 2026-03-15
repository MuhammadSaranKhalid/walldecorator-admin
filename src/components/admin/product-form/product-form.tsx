"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useWatch, SubmitHandler } from "react-hook-form";
import { useOne } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formSchema, FormValues } from "./types";
import { BasicInformation } from "./basic-information";
import { SEOFields } from "./seo-fields";
import { ProductImages } from "./product-images";
import { ProductSettings } from "./product-settings";
import { ProductVariants } from "./product-variants";
import { DisplayOptions } from "./display-options";
import { createProduct, updateProduct } from "@/app/admin/products/actions";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
}

export function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  // Fetch product data for edit mode
  const {
    result: existingProduct,
    query: { isLoading: productLoading },
  } = useOne({
    resource: "products",
    id: productId || "",
    queryOptions: {
      enabled: isEditMode && !!productId,
    },
    meta: {
      select: `
        *,
        categories (
          id, name, parent_id
        ),
        product_variants (
          id, sku, material_id, size_id, thickness_id, price,
          compare_at_price, cost_per_item, is_default,
          inventory (
            quantity_on_hand, quantity_reserved, quantity_available,
            low_stock_threshold, allow_backorder
          )
        ),
        product_images (
          product_id, image_id, display_order, is_primary, images (
            id, storage_path, thumbnail_path, medium_path, large_path,
            alt_text, blurhash, processing_status
          )
        )
      `,
    },
  });

  console.log("existingProduct", existingProduct);

  // React Hook Form
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      status: "draft",
      variants: [],
      images: [],
      is_featured: false,
      seo_title: "",
      seo_description: "",
    },
  });

  const { handleSubmit, reset, setValue, control, formState } = methods;

  // Properly destructure formState before render (Proxy optimization)
  const { isSubmitting, isDirty, errors } = formState;

  // Use useWatch for better performance - only re-renders when images change
  const productImages = useWatch({ control, name: "images" }) || [];

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        return (e.returnValue = ''); // Required for Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Debug: Log validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("=== FORM VALIDATION ERRORS ===", errors);
    }
  }, [errors]);

  // Populate form with existing product data when in edit mode
  useEffect(() => {
    if (isEditMode && existingProduct) {
      const product = existingProduct as any;

      const sortedImages = product.product_images && product.product_images.length > 0
        ? product.product_images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        : [];

      const images = sortedImages.map((img: any, index: number) => {
        const imgData = img.images || {};
        const rawPath = imgData.thumbnail_path || imgData.medium_path || imgData.large_path || imgData.storage_path;

        let fullUrl = "";
        if (rawPath) {
          if (rawPath.startsWith("http")) {
            fullUrl = rawPath;
          } else {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
            const cleanPath = rawPath.startsWith("/") ? rawPath.substring(1) : rawPath;
            fullUrl = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/product-images/${cleanPath}` : rawPath;
          }
        }

        return {
          url: fullUrl,
          uploadedUrl: imgData.storage_path || undefined,
          thumbnailPath: imgData.thumbnail_path || undefined,
          mediumPath: imgData.medium_path || undefined,
          largePath: imgData.large_path || undefined,
          storage_path: imgData.storage_path || undefined,
          blurhash: imgData.blurhash || undefined,
          altText: imgData.alt_text || undefined,
          displayOrder: img.display_order || index,
          isUploading: false,
          dbImageId: imgData.id || img.id, // Fallback to img.id for safety, but expect imgData.id
          is_primary: img.is_primary ?? (index === 0), // First image is primary by default
        };
      });

      // Ensure at least one image is marked as primary if images exist
      if (images.length > 0 && !images.some((img: any) => img.is_primary)) {
        images[0].is_primary = true;
      }

      reset({
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id || "",
        status: product.status || "draft",
        variants: product.product_variants?.map((variant: any) => ({
          material_id: variant.material_id,
          size_id: variant.size_id,
          thickness_id: variant.thickness_id,
          price: variant.price,
          compare_at_price: variant.compare_at_price,
          cost_per_item: variant.cost_per_item,
          is_default: variant.is_default || false,
          inventory: {
            quantity_on_hand: variant.inventory?.quantity_on_hand ?? 0,
            low_stock_threshold: variant.inventory?.low_stock_threshold ?? 5,
            allow_backorder: variant.inventory?.allow_backorder ?? false,
            quantity_reserved: variant.inventory?.quantity_reserved,
            quantity_available: variant.inventory?.quantity_available,
          },
        })) || [],
        images: images,
        is_featured: product.is_featured || false,
        seo_title: product.seo_title || "",
        seo_description: product.seo_description || "",
      });

      // Explicitly set Select-bound fields after reset to ensure
      // Radix UI controlled Selects re-sync to the new values
      setTimeout(() => {
        setValue("status", product.status || "draft", { shouldDirty: false });
        setValue("category_id", product.category_id || "", { shouldDirty: false });
      }, 0);
    }
  }, [isEditMode, existingProduct, reset, setValue]);


  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    console.log("Form submitted with values:", values);

    try {
      // Transform images for server action
      const uploadedImages = values.images.map((image, i) => ({
        storage_path: image.storage_path || image.uploadedUrl || image.url,
        display_order: i,
        blurhash: image.blurhash,
        thumbnail_path: image.thumbnailPath,
        medium_path: image.mediumPath,
        large_path: image.largePath,
        alt_text: image.altText,
        is_primary: image.is_primary ?? (i === 0),
        dbImageId: image.dbImageId,
      }));

      const { variants, images, ...productData } = values;

      // Prepare data for server action
      const productInput = {
        name: productData.name,
        description: productData.description,
        category_id: productData.category_id || null,
        status: productData.status,
        is_featured: productData.is_featured,
        seo_title: productData.seo_title || null,
        seo_description: productData.seo_description || null,
        variants: variants || [],
        images: uploadedImages,
      };

      // Call appropriate server action
      const result = isEditMode && productId
        ? await updateProduct({ id: productId, ...productInput })
        : await createProduct(productInput);

      if (!result.success) {
        toast.error(result.error || `Failed to ${isEditMode ? "update" : "create"} product`);
        return;
      }

      toast.success(`Product "${values.name}" ${isEditMode ? "updated" : "created"} successfully!`);
      router.push("/admin/products");
      // Note: reset() not needed as component will unmount after navigation
    } catch (error: any) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} product:`, error);
      toast.error(
        `Error ${isEditMode ? "updating" : "creating"} product: ${error.message || "Unknown error"}`
      );
    }
  };

  // Loading state while fetching product data
  if (isEditMode && productLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading product data...</span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <BasicInformation>
          <SEOFields />
        </BasicInformation>

        <ProductImages />

        <ProductSettings />

        <ProductVariants />

        <DisplayOptions />

        {/* Sticky Footer with Actions */}
        <div className="sticky bottom-0 bg-background border-t py-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (isEditMode && productLoading) ||
              productImages.some((img) => img.isUploading)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (isEditMode && productLoading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : productImages.some((img) => img.isUploading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading images...
              </>
            ) : isEditMode ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
