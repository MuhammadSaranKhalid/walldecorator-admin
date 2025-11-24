import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { encode } from "blurhash";

/**
 * API Route: Process Image and Generate Variants
 *
 * This endpoint receives an image URL from Supabase storage,
 * generates multiple optimized variants (thumbnail, medium, large),
 * converts them to WebP format, uploads back to storage,
 * and generates blurhash for each variant.
 *
 * Flow:
 * 1. Download original image from Supabase
 * 2. Generate 3 variants (400x400, 800x800, 1200x1200)
 * 3. Convert to WebP format
 * 4. Upload variants back to Supabase
 * 5. Generate blurhash from thumbnail
 * 6. Return all URLs and metadata
 */

interface ImageVariant {
  name: string;
  size: number;
  url?: string;
}

interface ProcessImageResponse {
  original_url: string;
  thumbnail_url: string;
  medium_url: string;
  large_url: string;
  blurhash: string;
  width: number;
  height: number;
  file_size: number;
}

// Helper to generate blurhash from image buffer
async function generateBlurhashFromBuffer(
  imageBuffer: Buffer,
  width: number,
  height: number
): Promise<string> {
  try {
    // Resize to small size for blurhash (32x32 is optimal)
    const { data, info } = await sharp(imageBuffer)
      .resize(32, 32, { fit: "inside" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const blurhash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      3
    );

    return blurhash;
  } catch (error: any) {
    console.error("Error generating blurhash:", error);
    throw new Error(`Failed to generate blurhash: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, storagePath } = body;

    if (!imageUrl || !storagePath) {
      return NextResponse.json(
        { error: "imageUrl and storagePath are required" },
        { status: 400 }
      );
    }

    console.log(`\n🖼️  Processing image: ${imageUrl}`);
    console.log(`📁 Storage path: ${storagePath}`);

    // Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);
    const originalSize = originalBuffer.length;

    console.log(`📦 Original size: ${(originalSize / 1024).toFixed(2)} KB`);

    // Get original dimensions
    const originalImage = sharp(originalBuffer);
    const metadata = await originalImage.metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    console.log(`📐 Original dimensions: ${originalWidth}x${originalHeight}`);

    // Define variants to generate
    const variants: ImageVariant[] = [
      { name: "thumbnail", size: 400 },
      { name: "medium", size: 800 },
      { name: "large", size: 1200 },
    ];

    console.log(`\n🔄 Generating ${variants.length} variants...`);

    // Generate all variants in parallel
    const variantResults = await Promise.all(
      variants.map(async (variant) => {
        try {
          console.log(`  📸 Generating ${variant.name} (${variant.size}x${variant.size})...`);

          // Generate WebP variant
          const variantBuffer = await sharp(originalBuffer)
            .resize(variant.size, variant.size, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .webp({ quality: 85 })
            .toBuffer();

          const variantSize = variantBuffer.length;
          console.log(`  ✓ ${variant.name}: ${(variantSize / 1024).toFixed(2)} KB`);

          // Extract filename and construct variant path
          const pathParts = storagePath.split("/");
          const filename = pathParts.pop()?.replace(/\.[^/.]+$/, "") || "image";
          const directory = pathParts.join("/");
          const variantPath = `${directory}/${filename}_${variant.name}.webp`;

          return {
            name: variant.name,
            buffer: variantBuffer,
            path: variantPath,
            size: variantSize,
          };
        } catch (error: any) {
          console.error(`  ❌ Error generating ${variant.name}:`, error);
          throw error;
        }
      })
    );

    console.log(`\n✅ All variants generated successfully`);

    // Note: Since we're in the client-side upload flow, we'll return the buffers
    // and let the client upload them. For a full server-side solution, you'd
    // upload directly to Supabase here.

    // Generate blurhash from thumbnail
    console.log(`\n🎨 Generating blurhash...`);
    const thumbnailBuffer =
      variantResults.find((v) => v.name === "thumbnail")?.buffer ||
      originalBuffer;
    const blurhash = await generateBlurhashFromBuffer(
      thumbnailBuffer,
      variants[0].size,
      variants[0].size
    );
    console.log(`✓ Blurhash: ${blurhash.substring(0, 20)}...`);

    // Convert buffers to base64 for transmission
    const variantsData = variantResults.map((v) => ({
      name: v.name,
      path: v.path,
      data: v.buffer.toString("base64"),
      size: v.size,
    }));

    const response: any = {
      original_url: imageUrl,
      variants: variantsData,
      blurhash,
      width: originalWidth,
      height: originalHeight,
      file_size: originalSize,
    };

    console.log(`\n✅ Image processing complete\n`);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("\n❌ Error in image processing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image" },
      { status: 500 }
    );
  }
}
