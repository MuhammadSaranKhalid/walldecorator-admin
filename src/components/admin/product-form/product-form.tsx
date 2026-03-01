"use client";



import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        product_variants (
          id, sku, material_id, size_id, thickness_id, price,
          compare_at_price, cost_per_item, is_default
        ),
        product_images (
          id, storage_path, thumbnail_path, medium_path, large_path,
          alt_text, display_order, blurhash, processing_status
        )
      `,
    },
  });

  // React Hook Form
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
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

  const { handleSubmit, setValue, reset, watch } = methods;
  const productImages = watch("images") || [];

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (productImages.length > 0) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [productImages.length]);

  // Populate form with existing product data when in edit mode
  useEffect(() => {
    if (isEditMode && existingProduct) {
      const product = existingProduct as any;

      const images = product.product_images && product.product_images.length > 0
        ? product.product_images
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((img: any, index: number) => ({
            url: img.thumbnail_path || img.medium_path || img.large_path || img.storage_path,
            uploadedUrl: img.storage_path,
            thumbnailPath: img.thumbnail_path,
            mediumPath: img.medium_path,
            largePath: img.large_path,
            storage_path: img.storage_path,
            blurhash: img.blurhash,
            altText: img.alt_text,
            displayOrder: img.display_order || index,
            isUploading: false,
            dbImageId: img.id,
            is_primary: img.is_primary || false,
          }))
        : [];

      reset({
        name: product.name || "",
        slug: product.slug || "",
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
        })) || [],
        images: images,
        is_featured: product.is_featured || false,
        seo_title: product.seo_title || "",
        seo_description: product.seo_description || "",
      });
    }
  }, [isEditMode, existingProduct, reset]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setValue("slug", slug);
  };


  const onSubmit = async (values: FormValues) => {
    console.log(values)
    setIsSubmitting(true);
    try {
      const uploadedImages = values.images.map((image, i) => ({
        storage_path: image.uploadedUrl || image.url,
        display_order: i,
        blurhash: image.blurhash,
        thumbnail_path: image.thumbnailPath,
        medium_path: image.mediumPath,
        large_path: image.largePath,
        alt_text: image.altText,
        is_primary: image.is_primary ?? (i === 0), // Use existing is_primary or default to first image
      }));

      const { variants, images, ...productData } = values;

      if (isEditMode && productId) {
        // Update the product using server action
        const result = await updateProduct({
          id: productId,
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          category_id: productData.category_id || null,
          status: productData.status,
          is_featured: productData.is_featured,
          seo_title: productData.seo_title || null,
          seo_description: productData.seo_description || null,
          variants: variants || [],
          images: uploadedImages,
        });

        if (!result.success) {
          toast.error(result.error || "Failed to update product");
          setIsSubmitting(false);
          return;
        }

        toast.success(`Product "${values.name}" updated successfully!`);
        router.push("/admin/products");
      } else {
        // Create the product using server action
        const result = await createProduct({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          category_id: productData.category_id || null,
          status: productData.status,
          is_featured: productData.is_featured,
          seo_title: productData.seo_title || null,
          seo_description: productData.seo_description || null,
          variants: variants || [],
          images: uploadedImages,
        });

        if (!result.success) {
          toast.error(result.error || "Failed to create product");
          setIsSubmitting(false);
          return;
        }

        toast.success(`Product "${values.name}" created successfully!`);
        router.push("/admin/products");
      }

      reset();
    } catch (error: any) {
      toast.error(
        `Error ${isEditMode ? "updating" : "creating"} product: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
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
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <BasicInformation
          handleNameChange={handleNameChange}
        >
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
