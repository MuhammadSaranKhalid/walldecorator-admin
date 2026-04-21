---
title: Additional Hooks — useSelect, useInfiniteList, useCustom, useCustomMutation, useIsAuthenticated, usePermissions, useInvalidate, useNotification, useApiUrl
impact: MEDIUM
tags: useSelect, useInfiniteList, useCustom, useCustomMutation, useIsAuthenticated, usePermissions, useInvalidate, useNotification, useApiUrl, searchField, selectedOptionsOrder, debounce
---

## `useSelect()` — Select Field Options

Fetches records formatted for dropdown/select components. Built on `useList` + an optional `useMany` for default values.

```typescript
import { useSelect } from "@refinedev/core";

const {
  options,            // { label: string; value: string }[]
  query,              // QueryObserverResult (list request)
  defaultValueQuery,  // QueryObserverResult (useMany for defaultValue)
  onSearch,           // (value: string) => void — trigger search
  overtime            // { elapsedTime }
} = useSelect<ICategory>({
  resource: "categories",

  optionLabel: "name",          // string | ((item: T) => string) — default: "title"
  optionValue: "id",            // string | ((item: T) => string) — default: "id"

  // Which field to search on (defaults to optionLabel if string, else "title")
  searchField: "name",

  // Autocomplete search — returns CrudFilter[] based on input
  onSearch: (value) => [
    { field: "name", operator: "contains", value }
  ],
  debounce: 300,               // ms debounce on search (default: 300)

  // Pre-selected value(s) — fetched via separate useMany query
  defaultValue: selectedCategoryId,             // BaseKey | BaseKey[]

  // Order: "in-place" (default) | "selected-first"
  selectedOptionsOrder: "selected-first",

  // Filters, sorters, pagination
  filters: [{ field: "active", operator: "eq", value: true }],
  sorters: [{ field: "name", order: "asc" }],
  pagination: {
    mode: "off",      // Load all at once (common for selects)
    pageSize: 100
  },

  // Separate queryOptions for the main list and defaultValue queries
  queryOptions: { staleTime: 5 * 60 * 1000 },
  defaultValueQueryOptions: { staleTime: 5 * 60 * 1000 },

  meta: { select: "id, name" },
  dataProviderName: "default",

  liveMode: "off",
  successNotification: false
});

// Native select
<select onChange={(e) => setValue("category_id", e.target.value)}>
  {options?.map(opt => (
    <option key={opt.value} value={opt.value}>{opt.label}</option>
  ))}
</select>
```

**Key Behaviors:**
- `defaultValue` triggers a separate `useMany` to ensure selected item appears in options even with pagination
- `onSearch` enables autocomplete — call `onSearch(inputValue)` on input change
- `optionLabel` / `optionValue` accept functions: `(item) => item.firstName + " " + item.lastName`

---

## `useCustom()` — Custom GET Requests

For non-standard endpoints. Uses `custom` method from data provider. **Does NOT invalidate queries.**

```typescript
import { useCustom, useApiUrl } from "@refinedev/core";

const apiUrl = useApiUrl();

const { query, overtime } = useCustom<IReport>({
  url: `${apiUrl}/reports/summary`,
  method: "get",    // "get" | "delete" | "head" | "options" | "post" | "put" | "patch"

  config: {
    headers: { "X-Custom-Header": "value" },
    query:   { period: "monthly", year: 2026 },
    payload: {},         // Request body
    sorters: [{ field: "date", order: "desc" }],
    filters: [{ field: "status", operator: "eq", value: "active" }]
  },

  queryOptions: {
    staleTime: 5 * 60 * 1000,
    enabled: isReady
  },

  meta: {},
  dataProviderName: "default",
  successNotification: false,
  errorNotification: (error) => ({
    message: "Failed to load report",
    type: "error"
  }),

  overtimeOptions: { interval: 1000, onInterval: (elapsed) => {} }
});

const report = query.data?.data;
```

**Manual invalidation after side effects:**
```typescript
import { useQueryClient } from "@tanstack/react-query";
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ["custom-key"] });
```

---

## `useCustomMutation()` — Custom POST/PUT/PATCH/DELETE

```typescript
import { useCustomMutation } from "@refinedev/core";

const { mutate, mutateAsync, mutation } = useCustomMutation<IExportResult>();

mutate({
  url: `${apiUrl}/products/export`,
  method: "post",
  values: { format: "csv", filters: activeFilters },

  config: {
    headers: { "Authorization": `Bearer ${token}` }
  },

  successNotification: {
    message: "Export started",
    type: "success"
  },
  errorNotification: (error) => ({
    message: "Export failed",
    description: error.message,
    type: "error"
  })
}, {
  onSuccess: (data) => downloadFile(data.data.url),
  onError:   (error) => console.error(error)
});
```

---

## `useApiUrl()` — Get Data Provider Base URL

```typescript
import { useApiUrl } from "@refinedev/core";

const apiUrl = useApiUrl();                    // Default provider
const analyticsUrl = useApiUrl("analytics");   // Named provider
```

---

## `useIsAuthenticated()` — Check Auth Status

```typescript
import { useIsAuthenticated } from "@refinedev/core";

const { data, isLoading } = useIsAuthenticated();

// data.authenticated — boolean
// data.redirectTo    — redirect path if not authenticated
// data.error         — Error | undefined
// data.logout        — boolean — whether to force logout

if (!isLoading && !data?.authenticated) {
  router.push(data?.redirectTo ?? "/login");
}
```

---

## `usePermissions()` — Get User Permissions

Calls `authProvider.getPermissions()`. Use for simple role checks. For fine-grained RBAC use `useCan()`.

```typescript
import { usePermissions } from "@refinedev/core";

const { data: permissions, isLoading } = usePermissions<string[]>();

if (permissions?.includes("admin")) {
  // Show admin UI
}
```

---

## `useInvalidate()` — Invalidate Cached Queries

```typescript
import { useInvalidate } from "@refinedev/core";

const invalidate = useInvalidate();

// Invalidate list
invalidate({ resource: "products", invalidates: ["list"] });

// Invalidate specific detail
invalidate({ resource: "products", invalidates: ["detail"], id: productId });

// Invalidate all queries for resource
invalidate({ resource: "products", invalidates: ["resourceAll"] });

// Invalidate everything in the app
invalidate({ invalidates: ["all"] });

// Multiple types at once
invalidate({ resource: "products", invalidates: ["list", "many", "detail"] });

// Target specific provider
invalidate({
  resource: "events",
  dataProviderName: "analytics",
  invalidates: ["list"]
});
```

**All `invalidates` types:**

| Value | Scope |
|-------|-------|
| `"list"` | List query of the resource |
| `"many"` | Many query of the resource |
| `"detail"` | Detail query for specific `id` |
| `"resourceAll"` | All queries for the resource |
| `"all"` | All queries in the entire application |

---

## `useNotification()` — Show Notifications

```typescript
import { useNotification } from "@refinedev/core";

const { open, close } = useNotification();

open?.({
  type: "success",     // "success" | "error" | "progress"
  message: "Product saved",
  description: "Changes committed",
  key: "product-saved"    // Unique ID for programmatic close
});

open?.({
  type: "error",
  message: "Failed to delete",
  description: error.message,
  key: "delete-error"
});

// Progress notification with undo (for undoable mutations)
open?.({
  type: "progress",
  message: "Deleting...",
  undoableTimeout: 5000,
  cancelMutation: () => undoFn(),
  key: "delete-progress"
});

close?.("product-saved");
```
