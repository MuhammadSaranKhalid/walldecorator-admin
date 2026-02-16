"use client";

import { useOne } from "@refinedev/core";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/category-form";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

import { Tables } from "@/types/supabase";

export default function EditCategoryPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const { result: data, query: { isLoading } } = useOne<Tables<"categories">>({
        resource: "categories",
        id: id ?? "",
        queryOptions: {
            enabled: !!id,
        },
    });

    const categoryName = (data as any)?.name || "Category";

    return (
        <div className="max-w-5xl mx-auto">
            {/* Breadcrumbs & Header */}
            <div className="mb-6">
                <Breadcrumb />
                <div className="mt-4">
                    <h1 className="text-2xl font-bold leading-tight tracking-tight">
                        Edit Category
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                            </span>
                        ) : (
                            `Update details for "${categoryName}"`
                        )}
                    </p>
                </div>
            </div>

            {/* Category Form */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <CategoryForm mode="edit" categoryId={id} />
            )}
        </div>
    );
}
