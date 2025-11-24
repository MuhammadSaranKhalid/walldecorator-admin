# BlurHash Implementation Guide

## Overview

This project implements BlurHash for progressive image loading, providing a better user experience by showing beautiful, blurred placeholders while images load.

## What is BlurHash?

BlurHash is a compact representation of a placeholder for an image. It's a short string (20-30 characters) that represents the colors and general composition of an image. When decoded, it produces a smooth, blurred version of the image that serves as a placeholder.

**Benefits:**
- **Improved UX**: Users see content immediately instead of blank spaces
- **Small size**: Only ~30 bytes vs. traditional low-res thumbnails (several KB)
- **Smooth loading**: Beautiful fade-in transition when actual images load
- **Bandwidth efficient**: Blurhash strings are stored in the database, no extra image files needed

## Architecture

### 1. Database Schema

A `blurhash` column has been added to the `product_images` table:

```sql
-- Migration: supabase/migrations/20250101000004_add_blurhash.sql
ALTER TABLE product_images
ADD COLUMN blurhash VARCHAR(255);
```

### 2. API Route for BlurHash Generation

**File**: `src/app/api/generate-blurhash/route.ts`

This Next.js API route generates blurhash strings from images:

**Accepts:**
- `FormData` with an `image` file (for fresh uploads)
- JSON with `imageUrl` (for existing images in Supabase storage)

**Returns:**
```json
{
  "blurhash": "LGF5]+Yk^6#M@-5c,1J5@[or[Q6.",
  "width": 1920,
  "height": 1080
}
```

**How it works:**
1. Receives an image (file or URL)
2. Uses `sharp` to resize image to 32x32 (optimal for blurhash)
3. Uses `blurhash` library to encode the image into a hash string
4. Returns the hash along with original dimensions

### 3. Image Upload Flow

**File**: `src/components/admin/create-product-dialog.tsx`

When an admin uploads product images:

1. User selects image files
2. For each image:
   - Create a blob URL for preview
   - Generate blurhash via API call
   - Store both the file and blurhash in state
3. When saving the product:
   - Upload images to Supabase Storage
   - Save image URL and blurhash to database

**Key Code:**
```tsx
// Generate blurhash for each uploaded image
const formData = new FormData();
formData.append("image", file);

const response = await fetch("/api/generate-blurhash", {
  method: "POST",
  body: formData,
});

const data = await response.json();
const blurhash = data.blurhash;

// Store image with blurhash
newImages.push({
  url,
  file,
  isPrimary: index === 0,
  blurhash,
});
```

### 4. Displaying Images with BlurHash

**File**: `src/components/ui/blurhash-image.tsx`

A reusable component that displays images with blurhash placeholders:

**Features:**
- Shows blurhash placeholder while image loads
- Smooth fade-in transition when image is ready
- Error handling with fallback UI
- Supports all Next.js Image props

**Usage Example:**
```tsx
import { BlurhashImage } from "@/components/ui/blurhash-image";

<BlurhashImage
  src={product.image_url}
  alt={product.name}
  blurhash={product.blurhash}
  fill
  className="w-full h-full"
  objectFit="cover"
/>
```

### 5. Product Card Integration

**File**: `src/components/storefront/product-card.tsx`

Product cards now use `BlurhashImage` instead of regular Next.js `Image`:

```tsx
export function ProductCard({
  id,
  name,
  image_url,
  blurhash,  // New prop
  ...props
}) {
  return (
    <div>
      <BlurhashImage
        src={image_url}
        alt={name}
        blurhash={blurhash}
        fill
      />
    </div>
  );
}
```

## Running the Migration

To add the blurhash column to your database:

```bash
# If using Supabase CLI
supabase db push

# Or run the migration manually in Supabase SQL editor
# File: supabase/migrations/20250101000004_add_blurhash.sql
```

## Generating BlurHash for Existing Images

If you have existing products without blurhash, you can generate them:

### Option 1: Via API (Recommended)

```typescript
// Example script to generate blurhash for existing products
import { supabaseBrowserClient } from '@/utils/supabase/client';

async function generateBlurhashForExistingImages() {
  // Fetch all images without blurhash
  const { data: images } = await supabaseBrowserClient
    .from('product_images')
    .select('id, image_url')
    .is('blurhash', null);

  for (const image of images) {
    try {
      // Generate blurhash from URL
      const response = await fetch('/api/generate-blurhash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: image.image_url }),
      });

      const { blurhash } = await response.json();

      // Update database
      await supabaseBrowserClient
        .from('product_images')
        .update({ blurhash })
        .eq('id', image.id);

      console.log(`Updated image ${image.id}`);
    } catch (error) {
      console.error(`Failed to process image ${image.id}:`, error);
    }
  }
}
```

### Option 2: On-Demand Generation

The `BlurhashImage` component gracefully handles missing blurhash by showing an animated loading placeholder.

## Performance Considerations

### Why 32x32 for BlurHash Generation?

- **Speed**: Processing a 32x32 image is much faster than full resolution
- **Quality**: Blurhash is already blurred, so high resolution isn't needed
- **Size**: Results in smaller hash strings (faster to transfer/store)

### Component X and Y Values

The API uses `componentX=4` and `componentY=3`:
- Lower values (1-2): Very blurry, smaller hash string
- Higher values (5-9): More detail, larger hash string
- **4x3 is optimal**: Good balance between quality and size

## Troubleshooting

### BlurHash not showing

1. **Check database**: Ensure blurhash is stored
```sql
SELECT id, image_url, blurhash FROM product_images LIMIT 10;
```

2. **Check API**: Test blurhash generation
```bash
curl -X POST http://localhost:3000/api/generate-blurhash \
  -F "image=@/path/to/image.jpg"
```

3. **Check console**: Look for errors in browser dev tools

### Images not loading

- Ensure Supabase Storage is properly configured
- Check CORS settings for image URLs
- Verify bucket policies allow public access

## Best Practices

1. **Always generate blurhash on upload**: Don't skip this step, it improves UX significantly
2. **Use blurhash for all images**: Product images, thumbnails, banners, etc.
3. **Keep component values balanced**: 4x3 or 3x3 are good defaults
4. **Handle errors gracefully**: The component already does this, but ensure proper error logging

## Additional Resources

- [BlurHash Official Site](https://blurha.sh/)
- [BlurHash GitHub](https://github.com/woltapp/blurhash)
- [React BlurHash](https://github.com/woltapp/react-blurhash)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)

## Summary

Your application now has a complete BlurHash implementation:

✅ Database schema with blurhash column
✅ API endpoint for blurhash generation
✅ Automatic blurhash creation on image upload
✅ Reusable BlurhashImage component
✅ Integration in product cards
✅ Graceful fallbacks for missing blurhash

Users will now see beautiful, blurred placeholders instead of blank spaces while images load!
