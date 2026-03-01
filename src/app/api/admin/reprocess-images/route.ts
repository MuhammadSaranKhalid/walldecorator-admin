import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@utils/supabase/server";

export async function POST(req: NextRequest) {
    console.log("Reprocess Images Admin API called");

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

        // 2. Query for unprocessed images
        console.log("Querying for unprocessed images...");
        const { data: unprocessedImages, error: queryError } = await supabaseAdmin
            .from("product_images")
            .select("*")
            .is("blurhash", null)
            .is("thumbnail_url", null)
            .is("medium_url", null)
            .is("large_url", null);

        if (queryError) {
            console.error("Query error:", queryError);
            return NextResponse.json({ error: "Failed to query unprocessed images" }, { status: 500 });
        }

        if (!unprocessedImages || unprocessedImages.length === 0) {
            return NextResponse.json({
                message: "No unprocessed images found",
                processed: 0,
                failed: 0,
                results: []
            });
        }

        console.log(`Found ${unprocessedImages.length} unprocessed images`);

        // 3. Process each image by calling the process-images endpoint
        const processImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/process-images`;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const results = await Promise.allSettled(
            unprocessedImages.map(async (image) => {
                try {
                    console.log(`Processing image ${image.id}...`);

                    const response = await fetch(processImageUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ record: image }),
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Failed to process image ${image.id}: ${errorText}`);
                    }

                    const result = await response.json();
                    return {
                        id: image.id,
                        product_id: image.product_id,
                        status: 'success',
                        result
                    };
                } catch (error: any) {
                    console.error(`Error processing image ${image.id}:`, error);
                    return {
                        id: image.id,
                        product_id: image.product_id,
                        status: 'failed',
                        error: error.message
                    };
                }
            })
        );

        // 4. Compile results
        const processed = results.filter(r => r.status === 'fulfilled' && (r.value as any).status === 'success').length;
        const failed = results.filter(r => r.status === 'rejected' || (r.value as any).status === 'failed').length;

        const detailedResults = results.map(r => {
            if (r.status === 'fulfilled') {
                return r.value;
            } else {
                return {
                    status: 'failed',
                    error: r.reason?.message || 'Unknown error'
                };
            }
        });

        console.log(`Batch processing complete. Processed: ${processed}, Failed: ${failed}`);

        return NextResponse.json({
            message: `Batch processing complete`,
            total: unprocessedImages.length,
            processed,
            failed,
            results: detailedResults
        });

    } catch (error: any) {
        console.error("Admin API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
