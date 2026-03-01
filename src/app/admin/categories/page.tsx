"use client";

import { useState, useMemo } from "react";
import { useList, useDelete } from "@refinedev/core";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    AlertCircle,
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    MoreVertical,
    Eye,
    EyeOff,
    FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { categories } from "@/generated/prisma";
import {
    buildCategoryTree,
    flattenCategoryTree,
    collectAllParentIds,
    CategoryTree,
} from "@/lib/category-utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Category = categories;

export default function CategoriesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
            mode: "off",
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
    });


    const { mutate: deleteCategory } = useDelete();

    const categoryTree = useMemo(() => {
        return buildCategoryTree(categories);
    }, [categories]);

    const flattenedTree = useMemo(() => {
        return flattenCategoryTree(categoryTree, expandedIds);
    }, [categoryTree, expandedIds]);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAll = () => {
        const allIds = collectAllParentIds(categoryTree);
        setExpandedIds(allIds);
    };

    const collapseAll = () => {
        setExpandedIds(new Set());
    };

    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        if (confirm(`Are you sure you want to delete "${categoryName}"? This will also delete all subcategories.`)) {
            deleteCategory(
                {
                    resource: "categories",
                    id: categoryId,
                },
                {
                    onSuccess: () => {
                        toast.success("Category deleted successfully");
                        refetchCategories();
                    },
                    onError: (error) => {
                        toast.error(`Failed to delete category: ${error.message}`);
                    }
                }
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight">
                        Categories
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Organize your products into categories and subcategories.
                        {totalCategories > 0 && ` ${totalCategories} total.`}
                    </p>
                </div>
                <Link href="/admin/categories/create">
                    <Button className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                    </Button>
                </Link>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={expandAll}
                        disabled={categoriesLoading}
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={collapseAll}
                        disabled={categoriesLoading}
                    >
                        Collapse All
                    </Button>
                </div>
            </div>

            {/* Loading State */}
            {categoriesLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">
                        Loading categories...
                    </span>
                </div>
            )}

            {/* Error State */}
            {categoriesError && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mb-3" />
                    <h3 className="text-lg font-semibold mb-2">
                        Error loading categories
                    </h3>
                    <Button onClick={() => refetchCategories()} variant="outline" className="mt-4">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Category List */}
            {!categoriesLoading && !categoriesError && (
                <div className="border rounded-lg bg-card">
                    {flattenedTree.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Folder className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Get started by creating your first category.
                            </p>
                            <Link href="/admin/categories/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Category
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {flattenedTree.map((category) => {
                                const hasChildren = category.children.length > 0;
                                const isExpanded = expandedIds.has(category.id);
                                const indentLevel = category.level;

                                return (
                                    <div
                                        key={category.id}
                                        className={cn(
                                            "group hover:bg-muted/50 transition-colors",
                                            indentLevel === 0 && "bg-muted/20"
                                        )}
                                    >
                                        <div
                                            className="flex items-center gap-3 p-4"
                                            style={{ paddingLeft: `${16 + indentLevel * 32}px` }}
                                        >
                                            {/* Expand/Collapse Button */}
                                            <button
                                                onClick={() => hasChildren && toggleExpand(category.id)}
                                                className={cn(
                                                    "flex-shrink-0 p-1 rounded hover:bg-muted transition-colors",
                                                    !hasChildren && "invisible"
                                                )}
                                                disabled={!hasChildren}
                                            >
                                                {hasChildren && (
                                                    isExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )
                                                )}
                                            </button>

                                            {/* Category Icon */}
                                            <div className="flex-shrink-0">
                                                {category.image_path ? (
                                                    <div className="h-10 w-10 rounded-md overflow-hidden border">
                                                        <img
                                                            src={category.image_path}
                                                            alt={category.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center">
                                                        {hasChildren ? (
                                                            <FolderOpen className="h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <Folder className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Category Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={cn(
                                                        "font-medium truncate",
                                                        indentLevel === 0 && "font-semibold"
                                                    )}>
                                                        {category.name}
                                                    </h3>
                                                    {!category.is_visible && (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        /{category.slug}
                                                    </span>
                                                    {category.product_count && category.product_count > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/categories/${category.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/categories/create?parent=${category.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <FolderPlus className="h-4 w-4 mr-1" />
                                                        Add Sub
                                                    </Button>
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/categories/${category.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Category
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/categories/create?parent=${category.id}`}>
                                                                <FolderPlus className="h-4 w-4 mr-2" />
                                                                Add Subcategory
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDeleteCategory(category.id, category.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
