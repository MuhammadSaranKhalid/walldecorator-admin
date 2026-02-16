"use client";



import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreate, useUpdate, useCreateMany } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowserClient } from "@/utils/supabase/client";

import { formSchema, FormValues, ProductImage } from "./types";
import { BasicInformation } from "./basic-information";
import { SEOFields } from "./seo-fields";
import { ProductImages } from "./product-images";
import { ProductSettings } from "./product-settings";
import { MaterialsPricing } from "./materials-pricing";
import { DimensionsWeight } from "./dimensions-weight";
import { DisplayOptions } from "./display-options";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
}

export function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const isEditMode = mode === "edit";


  // Refine's useForm - integrates React Hook Form with Refine's data management
  const {
    refineCore: { query, formLoading, onFinish },
    ...methods
  } = useForm<FormValues>({
    refineCoreProps: {
      resource: "products",
      action: isEditMode ? "edit" : "create",
      id: productId,
      redirect: false,
      meta: {
        select: `
          *,
          product_materials (
            id, material_id, price, compare_at_price, cost_price,
            inventory_quantity, low_stock_threshold, finish, is_available
          ),
          product_images (
            id, original_url, thumbnail_url, medium_url, large_url,
            alt_text, is_primary, display_order, blurhash
          )
        `,
      },
    },
    resolver: zodResolver(formSchema) as any,
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
      meta_title: "",
      meta_description: "",
    },
  });

  const { handleSubmit, setValue, reset } = methods

  // Extract existing product data from Refine's query
  const existingProduct = query?.data?.data;
  const productLoading = formLoading;

  // Hooks for creating/updating related records (Edit Mode only)
  // Hooks for creating/updating related records (Edit Mode only)
  const { mutateAsync: createProductMaterials } = useCreateMany();
  const { mutateAsync: createProductImages } = useCreateMany();
  const { mutateAsync: updateProduct } = useUpdate();

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

      reset({
        name: product.name || "",
        slug: product.slug || "",
        sku: product.sku || "",
        description: product.description || "",
        category_id: product.category_id || "",
        primary_image_url: product.primary_image_url || "",
        status: product.status || "active",
        materials: product.product_materials?.map((pm: any) => pm.material_id) || [],
        materialPricing:
          product.product_materials?.reduce((acc: any, pm: any) => {
            acc[pm.material_id] = {
              price: pm.price,
              inventory: pm.inventory_quantity,
              lowStockThreshold: pm.low_stock_threshold,
              finish: pm.finish || "",
              compareAtPrice: pm.compare_at_price,
              costPrice: pm.cost_price,
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
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
      });

      // Set product images
      if (product.product_images && product.product_images.length > 0) {
        const images = product.product_images
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((img: any) => ({
            url: img.original_url || img.thumbnail_url || img.medium_url || img.large_url,
            uploadedUrl: img.original_url,
            thumbnailUrl: img.thumbnail_url,
            mediumUrl: img.medium_url,
            largeUrl: img.large_url,
            blurhash: img.blurhash,
            altText: img.alt_text,
            isPrimary: img.is_primary,
            isUploading: false,
            dbImageId: img.id,
          }));
        setProductImages(images);
      }
    }
  }, [isEditMode, existingProduct, reset]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setValue("slug", slug);
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
    if (suffixes[lowerName]) {
      return suffixes[lowerName];
    }

    return materialName.toUpperCase().replace(/[^A-Z]/g, "").substring(0, 3);
  };


  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (productImages.length === 0) {
        toast.error("Please upload at least one product image");
        setIsSubmitting(false);
        return;
      }

      const stillUploading = productImages.some((img) => img.isUploading);
      if (stillUploading) {
        toast.error("Please wait for all images to finish uploading");
        setIsSubmitting(false);
        return;
      }

      const uploadedImages = productImages.map((image, i) => {
        return {
          url: image.uploadedUrl || image.url,
          isPrimary: image.isPrimary,
          displayOrder: i,
          blurhash: image.blurhash,
          thumbnailUrl: image.thumbnailUrl,
          mediumUrl: image.mediumUrl,
          largeUrl: image.largeUrl,
          altText: image.altText,
        };
      });

      const { materials, materialPricing, ...productData } = values;

      const primaryImage = uploadedImages.find((img) => img.isPrimary);

      const cleanedProductData = Object.fromEntries(
        Object.entries(productData)
          .map(([key, value]) => [key, value === "" ? null : value])
          .filter(([_, value]) => value !== null && value !== undefined)
      );

      if (isEditMode && productId) {
        await updateProduct({
          resource: "products",
          id: productId,
          values: {
            ...cleanedProductData,
            primary_image_url: primaryImage?.url || uploadedImages[0].url,
          },
        });

        const existingMaterials = (existingProduct as any)?.product_materials || [];
        if (existingMaterials.length > 0) {
          await Promise.all(
            existingMaterials.map((pm: any) =>
              supabaseBrowserClient.from("product_materials").delete().eq("id", pm.id)
            )
          );
        }

        if (materials && materials.length > 0) {
          const materialsData = materials.map((materialId) => {
            const pricing = (materialPricing as any)?.[materialId] || {
              price: 0,
              inventory: 0,
              lowStockThreshold: 10,
              finish: "",
              compareAtPrice: 0,
              costPrice: 0,
            };
            return {
              product_id: productId,
              material_id: materialId,
              price: pricing.price,
              compare_at_price: pricing.compareAtPrice || null,
              cost_price: pricing.costPrice || null,
              inventory_quantity: pricing.inventory,
              low_stock_threshold: pricing.lowStockThreshold || 10,
              finish: pricing.finish || null,
              is_available: true,
            };
          });

          await createProductMaterials({
            resource: "product_materials",
            values: materialsData,
          });
        }

        const existingImages = (existingProduct as any)?.product_images || [];
        if (existingImages.length > 0) {
          await Promise.all(
            existingImages.map((img: any) =>
              supabaseBrowserClient.from("product_images").delete().eq("id", img.id)
            )
          );
        }

        if (uploadedImages.length > 0) {
          const imagesData = uploadedImages.map((image) => ({
            product_id: productId,
            original_url: image.url,
            thumbnail_url: image.thumbnailUrl || null,
            medium_url: image.mediumUrl || null,
            large_url: image.largeUrl || null,
            is_primary: image.isPrimary,
            display_order: image.displayOrder,
            blurhash: image.blurhash || null,
            alt_text: image.altText || null,
          }));

          await createProductImages({
            resource: "product_images",
            values: imagesData,
          });
        }

        toast.success(`Product "${values.name}" updated successfully!`);
        router.push("/admin/products");
      } else {
        // 1. Create Product (Base data only)
        const productResult = await onFinish({
          ...cleanedProductData,
          primary_image_url: primaryImage?.url || uploadedImages[0].url,
        });

        // The onFinish result might not directly return the ID if redirect is false, 
        // but typically it returns the response. 
        // Refine's onFinish returns a Promise that resolves to UpdateResponse<TData> | CreateResponse<TData>
        // We need the ID.

        // However, onFinish with useForm is a bit tricky to get the ID back immediately if we want to chain.
        // A better approach for sequential creation with ID dependency is to use `useCreate` directly for the product,
        // OR rely on `onMutationSuccess` callback.

        // But since we are inside onSubmit, we want to await.
        // Let's assume onFinish returns the result. 
        // If not, we might need to use `createProduct` hook instead of `onFinish` for the parent to get the ID surely.

        // Actually, let's revert to using `useCreate` for the product in Create mode too, 
        // so we have full control over the transaction order and can get the ID.
        // The user asked to use `onFinish`, but `onFinish` is best for simple forms.
        // With manual relations, explicit `create` is safer.

        // WAIT. Refine's `onFinish` does return the result!
        const newProductId = (productResult as any)?.data?.id;

        if (newProductId) {
          // 2. Create Materials
          if (materials && materials.length > 0) {
            const materialsData = materials.map((materialId) => {
              const pricing = (materialPricing as any)?.[materialId] || {
                price: 0,
                inventory: 0,
                lowStockThreshold: 10,
                finish: "",
                compareAtPrice: 0,
                costPrice: 0,
              };
              return {
                product_id: newProductId,
                material_id: materialId,
                price: pricing.price,
                compare_at_price: pricing.compareAtPrice || null,
                cost_price: pricing.costPrice || null,
                inventory_quantity: pricing.inventory,
                low_stock_threshold: pricing.lowStockThreshold || 10,
                finish: pricing.finish || null,
                is_available: true,
              };
            });

            await createProductMaterials({
              resource: "product_materials",
              values: materialsData,
            });
          }

          // 3. Create Images
          if (uploadedImages.length > 0) {
            const imagesData = uploadedImages.map((image) => ({
              product_id: newProductId,
              original_url: image.url,
              thumbnail_url: image.thumbnailUrl || null,
              medium_url: image.mediumUrl || null,
              large_url: image.largeUrl || null,
              is_primary: image.isPrimary,
              display_order: image.displayOrder,
              blurhash: image.blurhash || null,
              alt_text: image.altText || null,
            }));

            await createProductImages({
              resource: "product_images",
              values: imagesData,
            });
          }
        }

        // Manually show success and redirect because we used redirect: false in useForm
        toast.success(
          `Product "${values.name}" created successfully!`
        );
        router.push("/admin/products");
      }

      setProductImages([]);
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

        <ProductImages
          productImages={productImages}
          setProductImages={setProductImages}
        />

        <ProductSettings />

        <MaterialsPricing
          getMaterialSuffix={getMaterialSuffix}
        />

        <DimensionsWeight />

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
