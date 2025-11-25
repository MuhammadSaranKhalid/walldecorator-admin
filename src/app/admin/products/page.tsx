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

// Define interfaces based on database schema
interface Material {
  id: string;
  name: string;
  slug: string;
}

interface ProductMaterial {
  id: string;
  material_id: string;
  price: number;
  inventory_quantity: number;
  low_stock_threshold: number;
  finish?: string;
  is_available: boolean;
  materials?: Material; // Relation from Supabase join
}

interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string;
  primary_image_url: string;
  status: "active" | "inactive" | "archived" | "draft";
  category_id?: string;
  dimensions_width?: number;
  dimensions_height?: number;
  dimensions_depth?: number;
  weight?: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  created_at: string;
  updated_at: string;
  product_materials?: ProductMaterial[]; // Relation from Supabase join
}

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
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
              operator: "or" as const,
              value: [
                {
                  field: "name",
                  operator: "contains" as const,
                  value: searchQuery,
                },
                {
                  field: "sku",
                  operator: "contains" as const,
                  value: searchQuery,
                },
              ],
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
      select:
        "*, product_materials(id, material_id, price, inventory_quantity, low_stock_threshold, finish, is_available, materials(id, name, slug))",
    },
  });

  // Fetch all materials for filter dropdown
  const {
    result: { data: materials = [] },
  } = useList<Material>({
    resource: "materials",
    filters: [
      {
        field: "is_active",
        operator: "eq",
        value: true,
      },
    ],
    sorters: [
      {
        field: "display_order",
        order: "asc",
      },
    ],
    pagination: {
      mode: "off",
    },
  });

  const { mutate: deleteProduct } = useDelete();

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Filter products by material if filter is active
  const filteredProducts = useMemo(() => {
    if (materialFilter === "all") return products;

    return products.filter((product) => {
      return product.product_materials?.some(
        (pm: ProductMaterial) => pm.materials?.id === materialFilter
      );
    });
  }, [products, materialFilter]);

  // Helper function to get material names for a product
  const getProductMaterials = (product: Product): string => {
    if (!product.product_materials || product.product_materials.length === 0) {
      return "N/A";
    }
    return product.product_materials
      .map((pm) => pm.materials?.name || "Unknown")
      .join(", ");
  };

  // Helper function to get total inventory
  const getTotalInventory = (product: Product): number => {
    if (!product.product_materials || product.product_materials.length === 0) {
      return 0;
    }
    return product.product_materials.reduce(
      (sum, pm) => sum + pm.inventory_quantity,
      0
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => String(p.id)));
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
      <Card>
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by product name or SKU"
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
                value={materialFilter}
                onValueChange={(value) => {
                  setMaterialFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] h-12">
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Materials</SelectItem>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                          filteredProducts.length > 0 &&
                          selectedProducts.length === filteredProducts.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead colSpan={2}>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p className="text-lg font-medium mb-2">
                            No products found
                          </p>
                          <p className="text-sm">
                            {searchQuery ||
                            materialFilter !== "all" ||
                            statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Get started by creating your first product"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const totalInventory = getTotalInventory(product);
                      const materialsStr = getProductMaterials(product);
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
                              {product.primary_image_url ? (
                                <AvatarImage
                                  src={product.primary_image_url}
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
                          <TableCell className="font-mono text-muted-foreground">
                            {product.sku}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {materialsStr}
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
                              {product.status.charAt(0).toUpperCase() +
                                product.status.slice(1)}
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
        </CardContent>
      </Card>
    </div>
  );
}
