---
title: Data Fetching Hooks — useList, useOne, useMany, useShow
impact: CRITICAL
tags: useList, useOne, useMany, useShow, fetch, query, pagination, filters, sorters, liveParams, overtimeOptions
---

## Data Fetching Hooks

Refine v5 wraps TanStack Query. The return shape: data lives in `result`, query state lives in `query`.

---

## `useList()` — Fetch Paginated Lists

```typescript
const { result, query, overtime } = useList<IProduct, HttpError>({
  resource: "products",

  // Pagination
  pagination: {
    currentPage: 1,
    pageSize: 10,
    mode: "server"     // "server" | "client" | "off"
  },

  // Filtering
  filters: [
    { field: "status",      operator: "eq",         value: "active" },
    { field: "price",       operator: "gte",         value: 100 },
    { field: "category_id", operator: "in",          value: [1, 2, 3] },
    { field: "name",        operator: "contains",    value: "iPhone" },
    { field: "deleted_at",  operator: "null",        value: true }
  ],

  // Sorting
  sorters: [
    { field: "created_at", order: "desc" },
    { field: "name",       order: "asc" }
  ],

  // Supabase meta
  meta: {
    select: "*, category:categories(name), supplier:suppliers(company_name)"
  },

  // TanStack Query options
  queryOptions: {
    enabled: isReady,
    staleTime: 5 * 60 * 1000,
    retry: 1
  },

  // Multiple providers
  dataProviderName: "default",

  // Notifications
  successNotification: false,
  errorNotification: (error) => ({
    message: "Failed to fetch products",
    description: error.message,
    type: "error"
  }),

  // Real-time
  liveMode: "auto",          // "auto" | "manual" | "off"
  onLiveEvent: (event) => {
    console.log(event.type, event.payload);
  },
  liveParams: { ids: [productId] },   // Extra params passed to liveProvider.subscribe

  // Loading indicator for slow requests
  overtimeOptions: {
    interval: 1000,                          // ms between checks
    onInterval: (elapsedInterval) => {
      console.log(`Still loading after ${elapsedInterval}ms`);
    }
  }
});

const products = result.data ?? [];
const total    = result.total;
const { isLoading, isError, error, refetch } = query;
const elapsedMs = overtime.elapsedTime;   // undefined when complete
```

**All Filter Operators:**

| Operator | SQL equivalent |
|----------|---------------|
| `eq` | `= value` |
| `ne` | `!= value` |
| `lt` | `< value` |
| `lte` | `<= value` |
| `gt` | `> value` |
| `gte` | `>= value` |
| `between` | `BETWEEN a AND b` |
| `in` | `IN (...)` |
| `nin` | `NOT IN (...)` |
| `contains` | `LIKE %value%` |
| `ncontains` | `NOT LIKE %value%` |
| `startswith` | `LIKE value%` |
| `endswith` | `LIKE %value` |
| `null` | `IS NULL` |
| `nnull` | `IS NOT NULL` |

**Return Values:**
- `result.data` — `T[]`
- `result.total` — total count for server-side pagination
- `query` — TanStack `useQuery` result (`isLoading`, `isError`, `refetch`, etc.)
- `overtime.elapsedTime` — `number | undefined`

---

## `useOne()` — Fetch Single Record

```typescript
const { result, query, overtime } = useOne<IProduct>({
  resource: "products",
  id: productId,

  meta: {
    select: "*, category:categories(*), supplier:suppliers(*)"
  },

  queryOptions: {
    enabled: !!productId,
    staleTime: 5 * 60 * 1000
  },

  liveMode: "auto",
  onLiveEvent: (event) => refetch(),
  liveParams: {},

  overtimeOptions: {
    interval: 1000,
    onInterval: (elapsed) => {}
  }
});

// result IS the data object directly — no .data needed
const product = result;
// e.g. product?.name, product?.id
```

**Return Values:**
- `result` — the data object directly of type `T` (NOT wrapped — access fields directly)
- `query` — TanStack `useQuery` result
- `overtime.elapsedTime` — `number | undefined`

---

## `useMany()` — Fetch Multiple Records by IDs

Falls back to multiple `getOne` calls if the provider lacks `getMany`.

```typescript
const { result, query } = useMany<IProduct>({
  resource: "products",
  ids: [1, 2, 3, 4, 5],

  meta: {
    select: "id, name, price"
  },

  queryOptions: { enabled: ids.length > 0 },
  liveMode: "off"
});

const products = result.data ?? [];
```

---

## `useShow()` — Show Page Data

Like `useOne` but auto-reads `resource` and `id` from the current URL route.

```typescript
const { result, query, showId, setShowId, overtime } = useShow<IProduct>({
  // resource and id are inferred from URL — no need to pass them
  // Override if needed:
  resource: "products",
  id: productId,

  meta: { select: "*, category:categories(*)" },
  queryOptions: { enabled: !!productId },
  liveMode: "auto"
});

// result IS the data object directly — same as useOne
const product = result;
const { isLoading, isFetching, refetch } = query;
```

**Return Values:**
- `result` — the data object directly of type `T` (NOT wrapped — access fields directly)
- `query` — TanStack `useQuery` result
- `showId` — current record ID
- `setShowId(id)` — change ID and trigger refetch
- `overtime.elapsedTime` — `number | undefined`

---

## `useInfiniteList()` — Infinite Scroll

```typescript
const {
  data,
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  isFetchingNextPage,
  query
} = useInfiniteList<IProduct>({
  resource: "products",
  pagination: { pageSize: 20 },
  sorters: [{ field: "created_at", order: "desc" }],
  meta: { select: "id, name, price" },

  // Cursor-based pagination (override next page logic)
  queryOptions: {
    getNextPageParam: (lastPage) => lastPage.cursor?.next ?? undefined
  }
});

// Flatten all pages
const products = data?.pages.flatMap(page => page.data) ?? [];

<button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
  {isFetchingNextPage ? "Loading..." : "Load More"}
</button>
```
