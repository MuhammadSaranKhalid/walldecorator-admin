import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Calendar, FileText, User, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CustomOrderActions } from "./custom-order-actions";

export const dynamic = "force-dynamic";

export default async function CustomOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const p = await params;

    const order = await prisma.custom_orders.findUnique({
        where: { id: p.id },
    });

    if (!order) {
        notFound();
    }

    // Construct full Supabase Storage public URL
    // Assuming the bucket name is 'custom-orders' based on typical Supabase setups. 
    // If your bucket name is different (e.g., 'images'), change it below.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const bucketName = "custom-orders";

    let imageUrl = order.image_url;
    if (!imageUrl.startsWith("http")) {
        imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imageUrl}`;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/customizations"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Custom Request Details
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="uppercase font-mono">
                            {order.id.split("-")[0]}
                        </Badge>
                        <span>•</span>
                        <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {format(new Date(order.created_at), "PPP 'at' p")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

                {/* Left Column: Image & Details */}
                <div className="space-y-6">
                    {/* Uploaded Image */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <div className="bg-muted p-4 border-b font-medium text-sm flex items-center">
                            <ImageIcon className="inline-block mr-2 h-4 w-4" />
                            Customer Uploaded Photo
                        </div>
                        <div className="relative aspect-square w-full bg-black/5 flex items-center justify-center">
                            {/* Using standard img tag fallback if next/image throws on non-configured domains */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt="Custom order reference"
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                        <h3 className="font-semibold flex items-center">
                            <FileText className="mr-2 h-4 w-4" /> Product Preferences
                        </h3>

                        <dl className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <dt className="text-muted-foreground">Material</dt>
                                <dd className="font-medium capitalize">{order.preferred_material || "Not specified"}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Size</dt>
                                <dd className="font-medium">{order.preferred_size || "Not specified"}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Thickness</dt>
                                <dd className="font-medium">{order.preferred_thickness ? `${order.preferred_thickness}mm` : "Not specified"}</dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-muted-foreground mb-1">Customer Description/Notes</dt>
                                <dd className="rounded-md bg-muted p-3 text-sm">
                                    {order.description || "No description provided."}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Right Column: Customer Info & Actions */}
                <div className="space-y-6">

                    {/* Customer Info */}
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                        <h3 className="font-semibold flex items-center">
                            <User className="mr-2 h-4 w-4" /> Customer Information
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Name</span>
                                <span className="font-medium">{order.customer_name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Email</span>
                                <span className="font-medium">{order.customer_email}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-muted-foreground">Phone</span>
                                <span className="font-medium">{order.customer_phone || "Not provided"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Workflow Actions */}
                    <CustomOrderActions order={order} />

                </div>
            </div>
        </div>
    );
}
