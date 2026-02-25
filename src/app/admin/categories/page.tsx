"use client";

import { useState, useMemo } from "react";
import { useList, useDelete } from "@refinedev/core";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";

import { Tables } from "@/types/supabase";

type Category = Tables<"categories">;

const ITEMS_PER_PAGE = 10;

export default function CategoriesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const {
        result: { data: categories = [], total: totalCategories = 0 },
        query: {
            refetch: refetchCategories,
            isLoading: categoriesLoading,
            isError: categoriesError,
        },
    } = useList<Category>({
        resource: "categories",
        pagination: {
            mode: "server",
            pageSize: ITEMS_PER_PAGE,
        },
        sorters: [
            {
                field: "display_order",
                order: "asc",
            },
        ],
        filters: searchQuery
            ? [
                {
                    field: "name",
                    operator: "contains",
                    value: searchQuery,
                },
            ]
            : [],
        meta: {
            select: "*", // We might want select: "*, parent:categories!parent_id(name)" if supported by Supabase for join
        },
    });

    const { mutate: deleteCategory } = useDelete();

    const totalPages = Math.ceil(totalCategories / ITEMS_PER_PAGE);

    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        if (confirm(`Are you sure you want to delete "${categoryName}"?`)) {
            deleteCategory(
                {
                    resource: "categories",
                    id: categoryId,
                },
                {
                    onSuccess: () => {
                        toast.success("Category deleted successfully");
                        refetchCategories(); // Ensure list is refreshed
                    },
                    onError: (error) => {
                        toast.error(`Failed to delete category: ${error.message}`);
                    }
                }
            );
        }
    };

    // Helper to find parent name (if not joined in query)
    // Since we paginate, we might not have all parents loaded. Ideally we JOIN in query.
    // For simplicity, let's assume we fetch all for small catalogs or rely on ID.
    // A better approach for deep hierarchy is to fetch full tree or use a recursive component,
    // but for a flat/simple list, we can just show parent ID or name if available.

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight">
                        Categories
                    </h1>
                    <p className="text-muted-foreground text-base">
                        Manage product categories and hierarchy.
                    </p>
                </div>
                <Link href="/admin/categories/create">
                    <Button className="font-bold w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Category
                    </Button>
                </Link>
            </div>

            {/* Main Content Card */}
            {/* <Card>
                <CardContent className="p-6"> */}
                    {/* Search */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="grow relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-12 h-12"
                            />
                        </div>
                    </div>

                    {/* Loading State */}
                    {categoriesLoading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3 text-muted-foreground">
                                Loading categories...
                            </span>
                        </div>
                    )}

                    {/* Error State */}
                    {categoriesError && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="h-12 w-12 text-destructive mb-3" />
                            <h3 className="text-lg font-semibold mb-2">
                                Error loading categories
                            </h3>
                            <Button onClick={() => refetchCategories()} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* Table */}
                    {!categoriesLoading && !categoriesError && (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No categories found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((category) => (
                                            <TableRow key={category.id}>
                                                <TableCell>
                                                    <Avatar className="h-10 w-10 rounded-md">
                                                        {category.image_url ? (
                                                            <AvatarImage src={category.image_url} alt={category.name} className="object-cover" />
                                                        ) : (
                                                            <AvatarFallback className="rounded-md">IMG</AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {category.name}
                                                    {category.parent_id && <span className="text-xs text-muted-foreground block">Child Category</span>}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs">
                                                    {category.slug}
                                                </TableCell>
                                                <TableCell>
                                                    {category.display_order}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={category.is_active ? "default" : "secondary"}
                                                    >
                                                        {category.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/admin/categories/${category.id}/edit`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteCategory(category.id, category.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!categoriesLoading && !categoriesError && totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 mt-4 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                {/* </CardContent>
            </Card> */}
        </div>
    );
}
