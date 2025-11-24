import { NextRequest, NextResponse } from "next/server";
import { encode } from "blurhash";
import sharp from "sharp";

/**
 * API Route: Generate BlurHash from Image
 *
 * This endpoint receives an image file or URL, processes it,
 * and returns a blurhash string that can be used for progressive
 * image loading placeholders.
 *
 * Accepts:
 * - FormData with 'image' file
 * - JSON with 'imageUrl' pointing to Supabase storage
 *
 * Returns:
 * - { blurhash: string, width: number, height: number }
 */

// Helper function to load image from URL
async function loadImageFromUrl(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper function to generate blurhash from image buffer
async function generateBlurhash(imageBuffer: Buffer): Promise<{
  blurhash: string;
  width: number;
  height: number;
}> {
  try {
    // Process image with sharp
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Resize to a small size for blurhash generation (better performance)
    // BlurHash works best with smaller images (e.g., 32x32 to 128x128)
    const { data, info } = await image
      .resize(32, 32, { fit: "inside" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Generate blurhash
    // componentX and componentY control the level of detail (4x3 is a good balance)
    const blurhash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4, // componentX
      3  // componentY
    );

    return {
      blurhash,
      width: metadata.width || info.width,
      height: metadata.height || info.height,
    };
  } catch (error: any) {
    console.error("Error generating blurhash:", error);
    throw new Error(`Failed to generate blurhash: ${error.message}`);
  }
}

// POST handler for image upload
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let imageBuffer: Buffer;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData with file upload
      const formData = await request.formData();
      const imageFile = formData.get("image") as File;

      if (!imageFile) {
        return NextResponse.json(
          { error: "No image file provided" },
          { status: 400 }
        );
      }

      // Convert File to Buffer
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes("application/json")) {
      // Handle JSON with image URL
      const body = await request.json();
      const { imageUrl } = body;

      if (!imageUrl) {
        return NextResponse.json(
          { error: "No imageUrl provided" },
          { status: 400 }
        );
      }

      // Fetch image from URL
      imageBuffer = await loadImageFromUrl(imageUrl);
    } else {
      return NextResponse.json(
        { error: "Invalid content type. Expected multipart/form-data or application/json" },
        { status: 400 }
      );
    }

    // Generate blurhash
    const result = await generateBlurhash(imageBuffer);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in blurhash generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate blurhash" },
      { status: 500 }
    );
  }
}
