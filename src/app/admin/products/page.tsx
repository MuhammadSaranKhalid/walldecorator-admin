"use client";

import { useState, useMemo } from "react";
import { useList, useDelete } from "@refinedev/core";
import {
  Plus,
  Search,
  ChevronDown,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

// Define interfaces based on new database schema
interface AttributeValue {
  id: string;
  value: string;
  display_name: string;
  display_order: number | null;
}

interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  material_id: string;
  size_id: string;
  thickness_id: string;
  price: number;
  compare_at_price: number | null;
  cost_per_item: number | null;
  is_default: boolean | null;
  material?: AttributeValue;
  size?: AttributeValue;
  thickness?: AttributeValue;
}

interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  medium_path: string | null;
  large_path: string | null;
  alt_text: string | null;
  display_order: number | null;
  processing_status: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  category_id?: string | null;
  is_featured: boolean | null;
  featured_order: number | null;
  total_sold: number | null;
  view_count: number | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  product_variants?: ProductVariant[];
  product_images?: ProductImage[];
}

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products from database with filters
  const {
    result: { data: products = [], total: totalProducts = 0 },
    query: {
      refetch: refetchProducts,
      isLoading: productsLoading,
      isError: productsError,
    },
  } = useList<Product>({
    resource: "products",
    filters: [
      ...(searchQuery
        ? [
            {
              field: "name",
              operator: "contains" as const,
              value: searchQuery,
            },
          ]
        : []),
      ...(statusFilter !== "all"
        ? [
            {
              field: "status",
              operator: "eq" as const,
              value: statusFilter,
            },
          ]
        : []),
    ],
    pagination: {
      mode: "server",
      pageSize: ITEMS_PER_PAGE,
    },
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    meta: {
      select: `
        *,
        product_variants(
          id, sku, price, compare_at_price, cost_per_item, is_default,
          material:product_attribute_values!product_variants_material_id_fkey(id, value, display_name),
          size:product_attribute_values!product_variants_size_id_fkey(id, value, display_name),
          thickness:product_attribute_values!product_variants_thickness_id_fkey(id, value, display_name)
        ),
        product_images(id, storage_path, thumbnail_path, medium_path, large_path, alt_text, display_order, processing_status)
      `,
    },
  });

  const { mutate: deleteProduct } = useDelete();

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Helper function to get variant count for a product
  const getVariantCount = (product: Product): number => {
    return product.product_variants?.length || 0;
  };

  // Helper function to get price range for a product
  const getPriceRange = (product: Product): string => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return "N/A";
    }

    const prices = product.product_variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `$${minPrice.toFixed(2)}`;
    }
    return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
  };

  // Helper function to get primary image
  const getPrimaryImage = (product: Product): string | null => {
    if (!product.product_images || product.product_images.length === 0) {
      return null;
    }

    // Sort by display_order and get the first image
    const sortedImages = [...product.product_images].sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );

    const primaryImage = sortedImages[0];
    // Use thumbnail, medium, or large path based on availability
    return primaryImage.thumbnail_path || primaryImage.medium_path || primaryImage.large_path || primaryImage.storage_path;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => String(p.id)));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProduct(
        {
          resource: "products",
          id: productId,
        },
        {
          onSuccess: () => {
            toast.success("Product deleted successfully");
            refetchProducts();
            setSelectedProducts(
              selectedProducts.filter((id) => id !== productId)
            );
          },
          onError: (error) => {
            toast.error(`Failed to delete product: ${error.message}`);
          },
        }
      );
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Product Management
          </h1>
          <p className="text-muted-foreground text-base">
            Manage your product catalog, including names, materials, pricing,
            and inventory.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="font-bold w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Main Content Card */}
      {/* <Card>
        <CardContent className="p-6"> */}
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by product name"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-12 h-12"
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] h-12">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {productsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Loading products...
              </span>
            </div>
          )}

          {/* Error State */}
          {productsError && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                Error loading products
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                There was an error loading the products from the database.
              </p>
              <Button onClick={() => refetchProducts()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Table */}
          {!productsLoading && !productsError && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          products.length > 0 &&
                          selectedProducts.length === products.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead colSpan={2}>Product</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p className="text-lg font-medium mb-2">
                            No products found
                          </p>
                          <p className="text-sm">
                            {searchQuery || statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Get started by creating your first product"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const variantCount = getVariantCount(product);
                      const priceRange = getPriceRange(product);
                      const primaryImage = getPrimaryImage(product);
                      const productId = String(product.id);

                      return (
                        <TableRow key={productId}>
                          <TableCell className="w-12">
                            <Checkbox
                              checked={selectedProducts.includes(productId)}
                              onCheckedChange={(checked) =>
                                handleSelectProduct(
                                  productId,
                                  checked as boolean
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="w-16">
                            <Avatar className="h-12 w-12 rounded-lg">
                              {primaryImage ? (
                                <AvatarImage
                                  src={primaryImage}
                                  alt={product.name}
                                  className="object-cover"
                                />
                              ) : (
                                <AvatarFallback className="rounded-lg text-xs">
                                  No image
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {priceRange}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {variantCount} {variantCount === 1 ? "variant" : "variants"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                product.status === "active"
                                  ? "default"
                                  : product.status === "draft"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {product.status
                                ? product.status.charAt(0).toUpperCase() + product.status.slice(1)
                                : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/products/${productId}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Edit product"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteProduct(productId, product.name)
                                }
                                title="Delete product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!productsLoading && !productsError && totalPages > 1 && (
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} ({totalProducts} total)
                </span>
              </div>
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
