"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import type { categories } from "@/generated/prisma";

export type CategoryFormData = {
    name: string;
    slug: string;
    description?: string;
    parent_id?: string | null;
    image_path?: string | null;
    display_order: number;
    is_visible: boolean;
    seo_title?: string;
    seo_description?: string;
};

export type ActionResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

/**
 * Create a new category
 */
export async function createCategory(
    formData: CategoryFormData
): Promise<ActionResponse<categories>> {
    try {
        // Validate slug uniqueness
        const existingCategory = await prisma.categories.findUnique({
            where: { slug: formData.slug },
            select: { id: true },
        });

        if (existingCategory) {
            return {
                success: false,
                error: "A category with this slug already exists",
            };
        }

        // Insert category
        const category = await prisma.categories.create({
            data: {
                name: formData.name,
                slug: formData.slug,
                description: formData.description || null,
                parent_id: formData.parent_id || null,
                image_path: formData.image_path || null,
                display_order: formData.display_order || 0,
                is_visible: formData.is_visible ?? true,
                seo_title: formData.seo_title || null,
                seo_description: formData.seo_description || null,
            },
        });

        revalidatePath("/admin/categories");

        return {
            success: true,
            data: category,
        };
    } catch (error: any) {
        console.error("Create category exception:", error);
        return {
            success: false,
            error: error.message || "Failed to create category",
        };
    }
}

/**
 * Update an existing category
 */
export async function updateCategory(
    categoryId: string,
    formData: CategoryFormData
): Promise<ActionResponse<categories>> {
    try {
        // Validate slug uniqueness (excluding current category)
        const existingCategory = await prisma.categories.findFirst({
            where: {
                slug: formData.slug,
                NOT: { id: categoryId },
            },
            select: { id: true },
        });

        if (existingCategory) {
            return {
                success: false,
                error: "A category with this slug already exists",
            };
        }

        // Update category
        const category = await prisma.categories.update({
            where: { id: categoryId },
            data: {
                name: formData.name,
                slug: formData.slug,
                description: formData.description || null,
                parent_id: formData.parent_id || null,
                image_path: formData.image_path || null,
                display_order: formData.display_order || 0,
                is_visible: formData.is_visible ?? true,
                seo_title: formData.seo_title || null,
                seo_description: formData.seo_description || null,
            },
        });

        revalidatePath("/admin/categories");
        revalidatePath(`/admin/categories/${categoryId}/edit`);

        return {
            success: true,
            data: category,
        };
    } catch (error: any) {
        console.error("Update category exception:", error);
        return {
            success: false,
            error: error.message || "Failed to update category",
        };
    }
}

/**
 * Delete a category (will cascade to children due to database constraint)
 */
export async function deleteCategory(
    categoryId: string
): Promise<ActionResponse> {
    try {
        await prisma.categories.delete({
            where: { id: categoryId },
        });

        revalidatePath("/admin/categories");

        return {
            success: true,
        };
    } catch (error: any) {
        console.error("Delete category exception:", error);
        return {
            success: false,
            error: error.message || "Failed to delete category",
        };
    }
}

/**
 * Get a single category by ID
 */
export async function getCategory(
    categoryId: string
): Promise<ActionResponse<categories>> {
    try {
        const category = await prisma.categories.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            return {
                success: false,
                error: "Category not found",
            };
        }

        return {
            success: true,
            data: category,
        };
    } catch (error: any) {
        console.error("Get category exception:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch category",
        };
    }
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<ActionResponse<categories[]>> {
    try {
        const categories = await prisma.categories.findMany({
            orderBy: { display_order: "asc" },
        });

        return {
            success: true,
            data: categories || [],
        };
    } catch (error: any) {
        console.error("Get categories exception:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch categories",
        };
    }
}
