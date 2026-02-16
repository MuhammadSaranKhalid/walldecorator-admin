"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/category-form";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

export default function NewCategoryPage() {
    const router = useRouter();

    return (
        <div className="max-w-5xl mx-auto">
            {/* Breadcrumbs & Header */}
            <div className="mb-6">
                <Breadcrumb />
                <div className="mt-4">
                    <h1 className="text-2xl font-bold leading-tight tracking-tight">
                        Create New Category
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Add a new category to organize your products.
                    </p>
                </div>
            </div>

            {/* Category Form */}
            <CategoryForm mode="create" />
        </div>
    );
}
