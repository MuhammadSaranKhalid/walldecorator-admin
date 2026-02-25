import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { encode } from "blurhash";
import { createSupabaseAdminClient } from "@utils/supabase/server";

export async function POST(req: NextRequest) {
    console.log("Process Images API called");

    try {
        // 1. Authorization Check
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Create admin client
        const supabaseAdmin = await createSupabaseAdminClient();

        // 2. Parse Payload
        const rawBody = await req.text();
        console.log("Raw Request Body:", rawBody);

        if (!rawBody) {
            return NextResponse.json({ error: "Empty request body" }, { status: 400 });
        }

        const body = JSON.parse(rawBody);
        const { record } = body;

        console.log("Processing record:", record?.id);

        if (!record || !record.id) {
            return NextResponse.json({ error: "No record found" }, { status: 400 });
        }

        // 3. Determine Image Path
        let imagePath = "";
        let bucketId = "product-images"; // Default bucket

        // Rely on original_url to determine imagePath
        if (record.original_url) {
            const urlParts = record.original_url.split(`${bucketId}/`);
            if (urlParts.length > 1) {
                imagePath = urlParts[1];
            } else {
                // If bucketId is not in the URL, assume the whole URL path is the imagePath
                // This might need refinement depending on how original_url is structured
                imagePath = record.original_url;
            }
        }

        if (!imagePath) {
            console.error("Could not determine image path for record", record);
            return NextResponse.json({ error: "Could not determine image path" }, { status: 400 });
        }

        console.log(`Downloading ${imagePath} from ${bucketId}...`);

        // 4. Download Image
        const { data: imageBlob, error: downloadError } = await supabaseAdmin
            .storage
            .from(bucketId)
            .download(imagePath);

        if (downloadError || !imageBlob) {
            console.error("Download failed:", downloadError);
            return NextResponse.json({ error: "Download failed" }, { status: 500 });
        }

        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 5. Generate and Upload Variants
        const metadata = await sharp(buffer).metadata();
        const metaWidth = metadata.width || 0;
        const metaHeight = metadata.height || 0;

        // Generate Blurhash
        let blurhash = null;
        try {
            const { data: pixels, info: pixelInfo } = await sharp(buffer)
                .resize(32, 32, { fit: 'inside' })
                .raw()
                .ensureAlpha()
                .toBuffer({ resolveWithObject: true });

            blurhash = encode(new Uint8ClampedArray(pixels), pixelInfo.width, pixelInfo.height, 4, 3);
            console.log("Generated Blurhash:", blurhash);
        } catch (bhError) {
            console.error("Error generating blurhash:", bhError);
        }

        const updates: Record<string, string | null> = {
            blurhash: blurhash
        };

        const folder = imagePath.substring(0, imagePath.lastIndexOf("/"));
        const filename = imagePath.substring(imagePath.lastIndexOf("/") + 1);
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf(".")) || filename;
        const basePath = folder ? `${folder}/${nameWithoutExt}` : nameWithoutExt;

        // Hardcoded variants configuration
        const variants: { name: string; width: number; format: 'webp' | 'jpeg' | 'png' }[] = [
            { name: "thumbnail", width: 400, format: 'webp' },
            { name: "medium", width: 800, format: 'webp' },
            { name: "large", width: 1200, format: 'webp' },
        ];

        const variantInserts: any[] = [];

        // Fetch original image storage ID if missing
        let originalStorageId = null;

        if (imagePath) {
            const folderPath = imagePath.includes('/')
                ? imagePath.substring(0, imagePath.lastIndexOf('/'))
                : '';
            const fileName = imagePath.includes('/')
                ? imagePath.substring(imagePath.lastIndexOf('/') + 1)
                : imagePath;

            const { data: fileList, error: listError } = await supabaseAdmin
                .storage
                .from(bucketId)
                .list(folderPath, {
                    search: fileName,
                    limit: 1
                });



            if (!listError && fileList && fileList.length > 0) {
                const match = fileList.find(f => f.name === fileName);
                if (match && match.id) {
                    originalStorageId = match.id;
                }
            }
        }

        // Add "original" as a variant
        variantInserts.push({
            product_image_id: record.id,
            variant_name: "original",
            width: metaWidth,
            height: metaHeight,
            size: buffer.length,
            format: metadata.format,
            storage_path: imagePath,
            public_url: record.original_url || "", // Should be available if we downloaded it
            storage_object_id: originalStorageId || null
        });

        const uploadPromises = variants.map(async (variant) => {
            try {
                const format = variant.format;

                let transform = sharp(buffer);

                if (variant.width) {
                    transform = transform.resize(variant.width, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    });
                }

                // Get buffer and info
                const { data: resizedBuffer, info } = await transform
                    .toFormat(format)
                    .toBuffer({ resolveWithObject: true });

                const variantPath = `${basePath}_${variant.name}.${format}`;
                console.log(`Uploading ${variantPath}...`);

                const { error: uploadError } = await supabaseAdmin
                    .storage
                    .from(bucketId)
                    .upload(variantPath, resizedBuffer, {
                        contentType: `image/${format}`,
                        upsert: true,
                    });

                if (uploadError) {
                    console.error(`Upload failed for ${variant.name}:`, uploadError);
                } else {
                    const { data: { publicUrl } } = supabaseAdmin.storage.from(bucketId).getPublicUrl(variantPath);

                    // Fetch storage object ID using list()
                    // We search in the folder for the specific filename
                    // variantPath is "folder/filename.ext" or just "filename.ext"

                    const folderPath = variantPath.includes('/')
                        ? variantPath.substring(0, variantPath.lastIndexOf('/'))
                        : '';
                    const fileName = variantPath.includes('/')
                        ? variantPath.substring(variantPath.lastIndexOf('/') + 1)
                        : variantPath;

                    const { data: fileList, error: listError } = await supabaseAdmin
                        .storage
                        .from(bucketId)
                        .list(folderPath, {
                            search: fileName,
                            limit: 1
                        });

                    let storageObjectId = null;

                    if (listError) {
                        console.error(`Could not list storage objects for ${variantPath}:`, listError);
                    } else if (fileList && fileList.length > 0) {
                        // The list returns objects with 'name' relative to the folder if folder is provided?
                        // list(folder) returns items inside. 'name' is just the filename.
                        // We strictly searched for it.
                        const match = fileList.find(f => f.name === fileName);
                        if (match && match.id) {
                            storageObjectId = match.id;
                        }
                    }

                    // Update legacy URL columns
                    const colName = `${variant.name}_url`;
                    updates[colName] = publicUrl;

                    // Collect data for separate table
                    variantInserts.push({
                        product_image_id: record.id,
                        variant_name: variant.name,
                        width: info.width,
                        height: info.height,
                        size: info.size,
                        format: info.format,
                        storage_path: variantPath,
                        public_url: publicUrl,
                        storage_object_id: storageObjectId || null
                    });
                }
            } catch (err) {
                console.error(`Error processing variant ${variant.name}:`, err);
            }
        });

        await Promise.all(uploadPromises);

        // 6. Update Database Records

        // A. Update legacy URL columns on parent table
        if (Object.keys(updates).length > 0) {
            const { error: dbError } = await supabaseAdmin
                .from("product_images")
                .update(updates)
                .eq("id", record.id);

            if (dbError) {
                console.error("Database update failed:", dbError);
                return NextResponse.json({ error: "Database update failed" }, { status: 500 });
            }
            console.log("Updated record with variants:", updates);
        }

        // B. Insert separate variant records
        if (variantInserts.length > 0) {
            // Upsert based on composite key (product_image_id, variant_name)
            const { error: variantsError } = await supabaseAdmin
                .from("product_image_variants")
                .upsert(variantInserts, { onConflict: 'product_image_id, variant_name' });

            if (variantsError) {
                console.error("Failed to insert variants:", variantsError);
                // We don't fail the whole request as main update succeeded
            } else {
                console.log(`Inserted ${variantInserts.length} variant records.`);
            }
        }

        return NextResponse.json({ success: true, updates });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
