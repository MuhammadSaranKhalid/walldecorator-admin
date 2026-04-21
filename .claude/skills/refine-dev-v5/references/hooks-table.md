---
title: Table Integration — useTable with TanStack React Table
impact: HIGH
tags: useTable, tanstack-table, pagination, sorting, filtering, columns, url-sync, filterOperator, filterKey, liveParams, overtimeOptions
---

## `useTable()` — Integrated Table Management

Package: `@refinedev/react-table`

Connects TanStack Table v8 to Refine's data layer. All pagination, sorting, and filtering is server-side by default.

```typescript
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<IProduct>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Product Name",
    size: 200,
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
    // Column-level filter config (read by Refine)
    meta: {
      filterOperator: "contains",    // CrudOperators — default operator for this column
      filterKey: "product_name"      // Override column id as filter field name
    }
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <EditButton   recordItemId={row.original.id} />
        <DeleteButton recordItemId={row.original.id} />
      </div>
    )
  }
];

const table = useTable<IProduct>({
  columns,

  initialState: {
    columnVisibility: { description: false },
    sorting:    [{ id: "created_at", desc: true }],
    pagination: { pageIndex: 0, pageSize: 10 }
  },

  refineCoreProps: {
    resource: "products",

    pagination: {
      currentPage: 1,
      pageSize: 20,
      mode: "server"      // "server" | "client" | "off"
    },

    sorters: {
      initial:   [{ field: "created_at", order: "desc" }],
      permanent: [],
      mode: "server"      // "server" | "off"
    },

    filters: {
      initial:   [],
      permanent: [{ field: "status", operator: "eq", value: "active" }],
      defaultBehavior: "merge",   // "merge" | "replace"
      mode: "server"              // "server" | "off"
    },

    syncWithLocation: true,       // Encodes state in URL query params

    meta: { select: "*, category:categories(name)" },
    dataProviderName: "default",

    queryOptions: {
      staleTime: 5 * 60 * 1000
    },

    // Real-time
    liveMode: "auto",
    onLiveEvent: (event) => {},
    liveParams: {},

    // Notifications
    errorNotification: (error) => ({
      message: "Failed to load products",
      type: "error"
    }),
    successNotification: false,

    // Overtime
    overtimeOptions: {
      interval: 1000,
      onInterval: (elapsed) => {}
    }
  }
});
```

---

## Destructuring Return Values

```typescript
const {
  // TanStack React Table API
  reactTable: {
    getHeaderGroups,
    getRowModel,
    getAllColumns,
    getState,
    setPageIndex,
    setPageSize,
    getCanNextPage,
    getCanPreviousPage,
    getSelectedRowModel,
    toggleAllRowsSelected
  },

  // Refine integration
  refineCore: {
    tableQuery,            // useList result — { query: { isLoading, refetch, ... }, result: { data, total } }
    sorters,               // Current CrudSort[]
    setSorters,            // (sorters: CrudSort[]) => void
    filters,               // Current CrudFilter[]
    setFilters,            // (filters, behavior?: "merge"|"replace") => void
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    pageCount,
    createLinkForSyncWithLocation   // (params) => string — shareable URL
  }
} = table;
```

---

## Column-Level Filter Operators

Define `meta.filterOperator` in column definitions so Refine knows which operator to use when filtering that column:

```typescript
{
  id: "title",
  accessorKey: "title",
  header: "Title",
  meta: {
    filterOperator: "contains"   // Used when setFilters is called for this column
  }
}
```

Use `meta.filterKey` to override the field name sent to the API:

```typescript
{
  id: "category",
  accessorKey: "category.name",
  header: "Category",
  meta: {
    filterOperator: "eq",
    filterKey: "category_id"     // Sends `category_id` to API, not `category.name`
  }
}
```

---

## Programmatic Filter & Sort

```typescript
// Set filters
setFilters([{ field: "category_id", operator: "eq", value: selectedId }]);

// Merge with existing filters
setFilters(
  [{ field: "status", operator: "eq", value: "active" }],
  "merge"
);

// Clear all filters
setFilters([]);

// Set sorters
setSorters([{ field: "created_at", order: "desc" }]);
```

---

## Usage with Project DataTable

```tsx
import { DataTable } from "@/components/refine-ui/data-table/data-table";

export default function ProductsListPage() {
  const table = useTable({
    columns,
    refineCoreProps: { resource: "products" }
  });
  return <DataTable table={table} />;
}
```

---

## Key Features

- Server-side or client-side pagination, sorting, filtering
- `syncWithLocation: true` — table state in URL, shareable/bookmarkable
- Column `meta.filterOperator` — per-column filter operator
- Full TanStack Table v8 API via `reactTable`
- `tableQuery.query.isLoading` for loading state
- Row selection, column pinning, column visibility built-in
