---
title: Common Patterns, Best Practices & Troubleshooting
impact: MEDIUM
tags: patterns, best-practices, troubleshooting, performance, soft-delete, optimistic, search, overtime, meta
---

## Common Patterns

---

### 1. Master-Detail (List + Detail Drawer)

```typescript
const [selectedId, setSelectedId] = useState<string>();

const { result: detail, query } = useOne({
  resource: "products",
  id: selectedId,
  queryOptions: { enabled: !!selectedId }
});

// In table cell:
<button onClick={() => setSelectedId(row.original.id)}>View</button>

// Drawer shows detail.data
```

---

### 2. Dependent Filters (Cascading Selects)

```typescript
const watchedCategory = watch("category_id");

const { result: subcategories } = useList({
  resource: "subcategories",
  filters: [{ field: "category_id", operator: "eq", value: watchedCategory }],
  queryOptions: { enabled: !!watchedCategory }
});
```

---

### 3. Soft Delete

```typescript
const { mutate } = useUpdate();

mutate({
  resource: "products",
  id: productId,
  values: { deleted_at: new Date().toISOString() }
});

// Always exclude soft-deleted in list queries
filters: [{ field: "deleted_at", operator: "null", value: true }]
```

---

### 4. Optimistic Status Toggle

```typescript
const { mutate } = useUpdate();

mutate({
  resource: "products",
  id: productId,
  values: { active: !currentActive },
  mutationMode: "optimistic"
});
```

---

### 5. Undoable Delete

```typescript
const { mutate } = useDelete();

mutate({
  resource: "products",
  id: productId,
  mutationMode: "undoable",
  undoableTimeout: 5000
});
```

---

### 6. Table Search (useTable + setFilters)

```typescript
const table = useTable({ refineCoreProps: { resource: "products" } });

const handleSearch = (searchText: string) => {
  table.refineCore.setFilters([
    { field: "name", operator: "contains", value: searchText }
  ], "replace");
};

<input onChange={(e) => handleSearch(e.target.value)} placeholder="Search..." />
```

---

### 7. Select with Autocomplete Search

```typescript
const { options, onSearch } = useSelect({
  resource: "categories",
  onSearch: (value) => [
    { field: "name", operator: "contains", value }
  ],
  debounce: 300
});

<input onChange={(e) => onSearch(e.target.value)} />
<datalist>
  {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
</datalist>
```

---

### 8. Batch Operations

```typescript
const { mutate: updateMany } = useUpdateMany();
const { mutate: deleteMany } = useDeleteMany();

// Update selected rows
updateMany({
  resource: "products",
  ids: selectedIds,
  values: { status: "inactive" }
});

// Delete selected rows
deleteMany({
  resource: "products",
  ids: selectedIds,
  mutationMode: "undoable"
});
```

---

### 9. Store-Scoped Permanent Filters

```typescript
const { currentStore } = useStoreContext();

const { result } = useList({
  resource: "purchase_orders",
  filters: [
    { field: "store_id", operator: "eq", value: currentStore.id }
  ]
});

// In useTable
refineCoreProps: {
  filters: {
    permanent: [{ field: "store_id", operator: "eq", value: currentStore.id }]
  }
}
```

---

### 10. Overtime / Slow Request Detection

```typescript
useList({
  resource: "large_table",
  overtimeOptions: {
    interval: 1000,
    onInterval: (elapsedMs) => {
      if (elapsedMs > 3000) showSlowLoadingWarning();
    }
  }
});
```

---

### 11. Query Invalidation After Side Effects

```typescript
const invalidate = useInvalidate();

// After a custom action affecting multiple resources
invalidate({ resource: "products",       invalidates: ["list"] });
invalidate({ resource: "inventory",      invalidates: ["list", "many"] });
invalidate({ resource: "purchase_orders", invalidates: ["resourceAll"] });
```

---

### 12. Conditional Data Fetching Chain

```typescript
// Fetch parent first, then child when parent is ready
const { result: order } = useOne({ resource: "orders", id: orderId });

const { result: customer } = useOne({
  resource: "customers",
  id: order.data?.customer_id,
  queryOptions: { enabled: !!order.data?.customer_id }
});
```

---

## Performance Best Practices

```typescript
// 1. Select only needed columns (Supabase)
meta: { select: "id, name, price, status" }

// 2. Use joins to avoid N+1
meta: { select: "*, category:categories(name)" }

// 3. Use estimated count for large tables
meta: { count: "estimated" }

// 4. Cache with staleTime
queryOptions: { staleTime: 5 * 60 * 1000 }

// 5. Disable queries until dependencies are ready
queryOptions: { enabled: !!storeId && !!userId }

// 6. Use permanent filters to reduce result sets
filters: { permanent: [{ field: "deleted_at", operator: "null", value: true }] }
```

---

## Troubleshooting

| Problem | Cause & Fix |
|---------|-------------|
| "Resource not found" | Resource `name` must match Supabase table name exactly (snake_case) |
| Data not loading | Check RLS SELECT policy in Supabase dashboard |
| Form not populating on edit | Confirm `action: "edit"`, `id` is set, `meta.select` includes all form fields |
| `useNavigation is not a function` | Removed in v5 — use `useGo()` + `useBack()` instead |
| `useResource is not a function` | Removed in v5 — use `useResourceParams()` instead |
| Permission denied | Check RLS, user role, and call `clearPermissionCache(userId)` |
| Stale data after mutation | Add `invalidates: ["list", "detail"]` or call `useInvalidate()` |
| Infinite loading | Verify `{ data, total }` returned from data provider, check auth session |
| Auto-save not working | Requires `@refinedev/react-hook-form` — core `useForm` doesn't have form state access |
| `warnWhenUnsavedChanges` not showing | Add `<UnsavedChangesNotifier />` from `@refinedev/nextjs-router` to layout |
| `useModalForm` state persisting | Set `autoResetFormWhenClose: true` (default) or call `reset()` on close |
| Real-time not working for joins | Supabase Realtime doesn't track relation changes — manually `useSubscription` on related table |
| `mutation.isLoading` undefined | TanStack Query v5 renamed to `mutation.isPending` |

---

## Project File Quick Reference

```typescript
// Providers
import { refineDataProvider }    from "@/lib/refine/data-provider";
import { authProvider }          from "@/lib/refine/auth-provider";
import { accessControlProvider } from "@/lib/refine/access-control-provider";

// UI Components
import { CreateButton, EditButton, DeleteButton, ShowButton, RefreshButton, ListButton, CloneButton }
  from "@/components/refine-ui/buttons";

import { ListView, CreateView, EditView, ShowView }
  from "@/components/refine-ui/views";

import { DataTable, DataTableFilter, DataTablePagination, DataTableSorter }
  from "@/components/refine-ui/data-table";

import { Layout, Header, Sidebar, Breadcrumb, UserAvatar }
  from "@/components/refine-ui/layout";

// Utilities
import { useStoreContext }       from "@/lib/stores/store-context";
import { clearPermissionCache }  from "@/lib/refine/access-control-provider";
import type { Database }         from "@/lib/supabase/database.types";
```
