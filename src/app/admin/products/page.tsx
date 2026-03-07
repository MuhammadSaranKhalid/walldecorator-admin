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

  const { mutate: deleteProduct } = useDelete();

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
    // Use thumbnail, medium, or large path based on availability
    const path = primaryImage.thumbnail_path || primaryImage.medium_path || primaryImage.large_path || primaryImage.storage_path;

    if (!path) return null;
    if (path.startsWith('http')) return path;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!supabaseUrl) return path;

    // Ensure we don't double-slash or misconstruct the URL
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${supabaseUrl}/storage/v1/object/public/product-images/${cleanPath}`;
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
        id: "image",
        header: "Image",
        cell: ({ row }) => {
          const primaryImage = getPrimaryImage(row.original);
          return (
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
          );
        },
        enableSorting: false,
        size: 80
      },
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        id: "priceRange",
        header: "Price Range",
        cell: ({ row }) => {
          const priceRange = getPriceRange(row.original);
          return <div className="text-muted-foreground">{priceRange}</div>;
        },
        enableSorting: false,
      },
      {
        id: "variants",
        header: "Variants",
        cell: ({ row }) => {
          const variantCount = getVariantCount(row.original);
          return (
            <div className="text-muted-foreground">
              {variantCount} {variantCount === 1 ? "variant" : "variants"}
            </div>
          );
        },
        enableSorting: false,
        size: 80
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <div className="text-center">
              <Badge
                variant={
                  status === "active"
                    ? "default"
                    : status === "draft"
                      ? "secondary"
                      : "destructive"
                }
              >
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft"}
              </Badge>
            </div>
          );
        },
        size: 60
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const productId = String(row.original.id);
          return (
            <div className="flex justify-end gap-2">
              <Link href={`/admin/products/${productId}/edit`}>
                <Button variant="ghost" size="icon" title="Edit product">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteProduct(productId, row.original.name)}
                title="Delete product"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 80
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
        permanent: statusFilter !== "all"
          ? [
            {
              field: "status",
              operator: "eq",
              value: statusFilter,
            },
          ]
          : [],
      },
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
            value={globalFilter ?? ""}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
            }}
            className="pl-12 h-12"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
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
        <DataTable table={table} />
      )}
      {/* </CardContent>
      </Card> */}
    </div>
  );
}
