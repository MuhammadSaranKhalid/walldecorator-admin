"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Loader2, X, Star, ImagePlus, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { ProductImage, FormValues } from "./types";

interface ProductImagesProps {
  productImages: ProductImage[];
  setProductImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
}

export function ProductImages({
  productImages,
  setProductImages,
}: ProductImagesProps) {
  // Helper function to delete image from storage
  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts.length < 2) return;

      const path = urlParts[1];
      await supabaseBrowserClient.storage.from('product-images').remove([path]);

      const basePath = path.replace(/\.[^/.]+$/, '');
      const variants = ['_thumbnail.webp', '_medium.webp', '_large.webp'];

      for (const variant of variants) {
        const variantPath = basePath + variant;
        await supabaseBrowserClient.storage.from('product-images').remove([variantPath]);
      }

      console.log(`✓ Deleted image and variants from storage: ${path}`);
    } catch (error) {
      console.error('Error deleting image from storage:', error);
    }
  };

  // Helper function to delete image from database
  const deleteImageFromDatabase = async (imageId: string) => {
    try {
      await supabaseBrowserClient.from('product_images').delete().eq('id', imageId);
      console.log(`✓ Deleted image from database: ${imageId}`);
    } catch (error) {
      console.error('Error deleting image from database:', error);
    }
  };
  
  const { setValue } = useFormContext<FormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldDescription>
          Upload multiple images. The first one will be the primary image.
        </FieldDescription>

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

              // Validation constants
              const MAX_SIZE = 10 * 1024 * 1024; // 10MB
              const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

              // Validate files
              const validFiles: File[] = [];
              const errors: string[] = [];

              for (const file of files) {
                if (file.size > MAX_SIZE) {
                  errors.push(`${file.name} is too large (max 10MB)`);
                  continue;
                }

                if (!ALLOWED_TYPES.includes(file.type)) {
                  errors.push(`${file.name} format not supported (use JPG, PNG, or WebP)`);
                  continue;
                }

                validFiles.push(file);
              }

              if (errors.length > 0) {
                errors.forEach(error => toast.error(error));
              }

              if (validFiles.length === 0) {
                e.target.value = "";
                return;
              }

              console.log(`✓ ${validFiles.length} valid file(s) ready for upload`);

              // Create preview images with uploading state
              const newImages: ProductImage[] = validFiles.map((file, index) => ({
                url: URL.createObjectURL(file),
                file,
                isPrimary: productImages.length === 0 && index === 0,
                isUploading: true,
                blurhash: undefined,
                uploadedUrl: undefined,
              }));

              setProductImages([...productImages, ...newImages]);
              toast.info(`Uploading ${validFiles.length} image(s) to storage...`);

              // Upload all files simultaneously
              const uploadPromises = validFiles.map(async (file, i) => {
                const imageIndex = productImages.length + i;

                console.log(`\n📤 Starting upload ${i + 1}/${validFiles.length}: ${file.name}`);

                try {
                  const fileExt = file.name.split(".").pop();
                  const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.${fileExt}`;
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

                  const { data: { publicUrl } } = supabaseBrowserClient.storage
                    .from("product-images")
                    .getPublicUrl(filePath);

                  console.log(`  ✓ Upload successful`);
                  console.log(`  🔗 Public URL: ${publicUrl}`);

                  setProductImages((prev) => {
                    const updated = [...prev];
                    updated[imageIndex] = {
                      ...updated[imageIndex],
                      uploadedUrl: publicUrl,
                      original_url: publicUrl,
                      storage_path: filePath,
                      isUploading: false,
                    };
                    return updated;
                  });

                  console.log(`  ✅ Image ${i + 1} fully processed`);
                } catch (error) {
                  console.error('Error uploading image:', error);
                }
              });

              await Promise.all(uploadPromises);

              toast.success(`${validFiles.length} image(s) uploaded successfully!`);
              console.log(`✅ All ${validFiles.length} images uploaded and processed simultaneously`);
              e.target.value = "";
            }}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("image-upload")?.click()}
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
                          const updated = productImages.map((img, i) => ({
                            ...img,
                            isPrimary: i === index,
                          }));
                          setProductImages(updated);
                          setValue("primary_image_url", image.url);
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
                          [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
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
                          [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
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
                      onClick={async () => {
                        try {
                          if (image.uploadedUrl) {
                            await deleteImageFromStorage(image.uploadedUrl);
                          }

                          if (image.dbImageId) {
                            await deleteImageFromDatabase(image.dbImageId);
                          }

                          const updated = productImages.filter((_, i) => i !== index);

                          if (image.isPrimary && updated.length > 0) {
                            updated[0].isPrimary = true;
                            setValue("primary_image_url", updated[0].url);
                          } else if (updated.length === 0) {
                            setValue("primary_image_url", "");
                          }

                          setProductImages(updated);
                          toast.success("Image removed successfully");
                        } catch (error) {
                          console.error("Error removing image:", error);
                          toast.error("Failed to remove image");
                        }
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
            <p className="text-xs mt-1">Click &ldquo;Upload Images&rdquo; to add product photos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
