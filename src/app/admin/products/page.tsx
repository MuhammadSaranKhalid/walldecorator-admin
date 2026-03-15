"use client";

import { useState, useMemo } from "react";
import { useDelete } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  Download,
  Filter,
  Upload,
  Archive,
  DollarSign,
  X,
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

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
  product_id: string;
  image_id: string;
  display_order: number | null;
  is_primary: boolean | null;
  images?: {
    storage_path: string;
    thumbnail_path: string | null;
    medium_path: string | null;
    large_path: string | null;
    alt_text: string | null;
    processing_status: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "draft" | "active" | "inactive" | "archived";
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
  categories?: Category;
}

export default function ProductsPage() {
  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Additional state for filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  const { mutate: deleteProduct } = useDelete();

  // Calculate filter based on active tab
  const getTabFilter = () => {
    switch (activeTab) {
      case "active":
        return [{ field: "status", operator: "eq" as const, value: "active" }];
      case "low-inventory":
        // TODO: Implement low inventory filter based on your inventory threshold logic
        return [];
      case "out-of-stock":
        // TODO: Implement out of stock filter based on your inventory logic
        return [];
      default:
        return [];
    }
  };

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
      return `Rs. ${minPrice.toFixed(2)}`;
    }
    return `Rs. ${minPrice.toFixed(2)} - Rs. ${maxPrice.toFixed(2)}`;
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
    const imgData = primaryImage.images;
    if (!imgData) return null;

    // Use thumbnail, medium, or large path based on availability
    const path = imgData.thumbnail_path || imgData.medium_path || imgData.large_path || imgData.storage_path;

    if (!path) return null;
    if (path.startsWith('http')) return path;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!supabaseUrl) return path;

    // Ensure we don't double-slash or misconstruct the URL
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${supabaseUrl}/storage/v1/object/public/product-images/${cleanPath}`;
  };

  // Get SKU from variants
  const getProductSKU = (product: Product): string => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return "N/A";
    }
    // Return the first variant's SKU or the default variant's SKU
    const defaultVariant = product.product_variants.find(v => v.is_default);
    return defaultVariant?.sku || product.product_variants[0]?.sku || "N/A";
  };

  // Define columns
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
        minSize: 40,
        maxSize: 40,
      },
      {
        id: "product_details",
        header: "PRODUCT DETAILS",
        cell: ({ row }) => {
          const primaryImage = getPrimaryImage(row.original);
          const variantCount = getVariantCount(row.original);

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-lg">
                {primaryImage ? (
                  <AvatarImage
                    src={primaryImage}
                    alt={row.original.name}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="rounded-lg text-xs">
                    No image
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{row.original.name}</div>
                <div className="text-xs text-muted-foreground">
                  {variantCount} color {variantCount === 1 ? "variant" : "variants"} • {variantCount} {variantCount === 1 ? "size" : "sizes"}
                </div>
              </div>
            </div>
          );
        },
        enableSorting: false,
        size: 300
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const variant =
            status === "active" ? "default" :
              status === "draft" ? "secondary" :
                status === "inactive" ? "outline" :
                  "destructive";

          const className =
            status === "active" ? "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/10" :
              status === "draft" ? "bg-destructive/10 text-destructive hover:bg-destructive/10" :
                "";

          return (
            <Badge variant={variant} className={className}>
              {status === "active" ? "Active" :
                status === "draft" ? "Out of Stock" :
                  status === "inactive" ? "Low Stock" :
                    status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
        size: 120
      },
      {
        id: "category",
        header: "CATEGORY",
        cell: ({ row }) => {
          const category = row.original.categories;
          return (
            <div className="text-sm text-muted-foreground">
              {category?.name || "—"}
            </div>
          );
        },
        enableSorting: false,
        size: 150
      },
      {
        id: "sku",
        header: "SKU",
        cell: ({ row }) => {
          const sku = getProductSKU(row.original);
          return (
            <div className="text-sm font-mono text-muted-foreground">
              {sku}
            </div>
          );
        },
        enableSorting: false,
        size: 150
      },
      {
        id: "price_range",
        header: "PRICE RANGE",
        cell: ({ row }) => {
          const priceRange = getPriceRange(row.original);
          return <div className="text-sm font-semibold">{priceRange}</div>;
        },
        enableSorting: false,
        size: 150
      },
      {
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => {
          const productId = String(row.original.id);
          return (
            <div className="flex justify-end gap-1">
              <Link href={`/admin/products/${productId}`}>
                <Button variant="ghost" size="icon" title="View product" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/admin/products/${productId}/edit`}>
                <Button variant="ghost" size="icon" title="Edit product" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteProduct(productId, row.original.name)}
                title="Delete product"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 120
      },
    ],
    []
  );

  // Initialize table with refine and react-table
  const table = useTable({
    columns,
    refineCoreProps: {
      resource: "products",
      pagination: {
        pageSize: 10,
      },
      sorters: {
        initial: [{ field: "created_at", order: "desc" }],
      },
      filters: {
        permanent: getTabFilter(),
      },
      meta: {
        select: `
          *,
          categories(id, name, slug),
          product_variants(
            id, sku, price, compare_at_price, cost_per_item, is_default,
            material:product_attribute_values!product_variants_material_id_fkey(id, value, display_name),
            size:product_attribute_values!product_variants_size_id_fkey(id, value, display_name),
            thickness:product_attribute_values!product_variants_thickness_id_fkey(id, value, display_name)
          ),
          product_images(product_id, image_id, display_order, is_primary, images(id, storage_path, thumbnail_path, medium_path, large_path, alt_text, processing_status))
        `,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const { reactTable, refineCore } = table;

  const {
    refetch: refetchProducts,
    isLoading: productsLoading,
    isError: productsError,
  } = refineCore.tableQuery;


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
          },
          onError: (error) => {
            toast.error(`Failed to delete product: ${error.message}`);
          },
        }
      );
    }
  };

  // Get selected row count
  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedRows = reactTable.getFilteredSelectedRowModel().rows;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Product Catalog
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage variants, stock levels and pricing across all channels.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/admin/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList >
            <TabsTrigger
              value="all"
            >
              All Products
              <Badge variant="secondary" className="ml-2 data-[state=active]:bg-primary-foreground/20">
                {refineCore.tableQuery.data?.total || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="active"
            >
              Active
              <Badge variant="secondary" className="ml-2 data-[state=active]:bg-primary-foreground/20">
                {/* TODO: Get actual count */}
                98
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="low-inventory"
            >
              Low Inventory
              <Badge variant="secondary" className="ml-2 data-[state=active]:bg-primary-foreground/20">
                {/* TODO: Get actual count */}
                12
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="out-of-stock"
            >
              Out of Stock
              <Badge variant="secondary" className="ml-2 data-[state=active]:bg-primary-foreground/20">
                {/* TODO: Get actual count */}
                14
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
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
        <DataTable table={table} />
      )}

      {/* Batch Actions Bar */}
      {selectedRowCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-card text-card-foreground border rounded-full shadow-2xl px-6 py-4 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center font-semibold">
                {selectedRowCount}
              </div>
              <span className="font-medium">Product selected</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  // TODO: Implement publish action
                  toast.info("Publish functionality coming soon");
                }}
              >
                <Upload className="h-4 w-4" />
                Publish
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  // TODO: Implement archive action
                  toast.info("Archive functionality coming soon");
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  // TODO: Implement edit pricing action
                  toast.info("Edit pricing functionality coming soon");
                }}
              >
                <DollarSign className="h-4 w-4" />
                Edit Pricing
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 gap-2"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedRowCount} product(s)?`)) {
                    selectedRows.forEach((row) => {
                      deleteProduct(
                        {
                          resource: "products",
                          id: String(row.original.id),
                        },
                        {
                          onSuccess: () => {
                            refetchProducts();
                          },
                          onError: (error) => {
                            toast.error(`Failed to delete: ${error.message}`);
                          },
                        }
                      );
                    });
                    toast.success(`Deleted ${selectedRowCount} product(s)`);
                    reactTable.resetRowSelection();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => reactTable.resetRowSelection()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
