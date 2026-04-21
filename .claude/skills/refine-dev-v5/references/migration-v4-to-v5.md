---
title: Migration Guide — v4 to v5 Breaking Changes
impact: CRITICAL
tags: migration, breaking-changes, v4, v5, rename, removed, codemod
---

## v4 → v5 Breaking Changes

Run the automated codemod first:
```bash
npx @refinedev/codemod@latest refine4-to-refine5
```

---

## Hook Return Type Restructuring

The biggest v5 change. Data and state are now in separate objects:

| v4 | v5 |
|----|-----|
| `data?.data` | `result.data` |
| `data?.total` | `result.total` |
| `queryResult` | `query` |
| `mutationResult` | `mutation` |

```typescript
// v4
const { data, isLoading } = useList({ resource: "products" });
const products = data?.data;

// v5
const { result, query } = useList({ resource: "products" });
const products = result.data;
const { isLoading } = query;
```

---

## Removed / Legacy Hooks (v5)

| Status | Hook | Use Instead |
|--------|------|------------|
| **Removed** | `useResource()` | `useResourceParams()` |
| **Legacy** (still available, not recommended) | `useNavigation()` | `useGo()` + `useBack()` |

---

## Parameter Renames

| v4 Parameter | v5 Parameter |
|-------------|-------------|
| `metaData` | `meta` |
| `sort` / `sorter` | `sorters` |
| `hasPagination` | `pagination: { mode: "off" }` |
| `current` | `currentPage` (in useTable refineCore) |
| `setCurrent` | `setCurrentPage` |
| `resourceName` | `resource` |
| `ignoreAccessControlProvider` | `accessControl: { enabled: false }` |
| `queryResult` | `query` |
| `mutationResult` | `mutation` |

---

## Type Renames

| v4 Type | v5 Type |
|---------|---------|
| `AuthBindings` | `AuthProvider` |
| `RouterBindings` | `RouterProvider` |
| `queryKeys` | `keys` |
| `ITreeMenu` | `TreeMenuItem` |

---

## Component Renames

| v4 Component | v5 Component |
|-------------|-------------|
| `ThemedLayoutV2` | `ThemedLayout` |
| `ThemedTitleV2` | `ThemedTitle` |

---

## Filter / Pagination / Sorter Config Changes

v4 used nested `config` objects, v5 uses flat sub-objects:

```typescript
// v4
useList({
  config: {
    pagination: { current: 1, pageSize: 10 },
    sort: [{ field: "created_at", order: "desc" }],
    filters: [{ field: "status", operator: "eq", value: "active" }]
  }
})

// v5
useList({
  pagination: { current: 1, pageSize: 10, mode: "server" },
  sorters:    [{ field: "created_at", order: "desc" }],
  filters:    [{ field: "status", operator: "eq", value: "active" }]
})
```

In `useTable`:
```typescript
// v5 — initial/permanent/mode are sub-objects
refineCoreProps: {
  filters:  { initial: [], permanent: [] },
  sorters:  { initial: [], permanent: [], mode: "server" },
  pagination: { mode: "server", pageSize: 20 }
}
```

---

## Removed APIs

- `legacyRouterProvider` prop — removed entirely
- `legacyAuthProvider` prop — removed entirely
- Resource `options` prop — consolidated into `meta`

---

## TanStack Query v5 Changes

Refine v5 requires TanStack Query v5:

```bash
npm install @tanstack/react-query@5
```

Key TanStack Query v5 changes:

```typescript
// Mutations: isLoading → isPending
const { isPending } = mutation;   // was isLoading in TanStack Query v4

// Query keys: queryKeys → keys
import { keys } from "@refinedev/core";   // was queryKeys

// useNewQueryKeys option in <Refine options={{ useNewQueryKeys: true }} />
// Switches to structured query keys for better DevTools experience
```

---

## Package Version Matrix

| Package | v4 | v5 |
|---------|----|----|
| `@refinedev/core` | 4.x | 5.x |
| `@refinedev/supabase` | 5.x | 6.x |
| `@refinedev/react-hook-form` | 4.x | 5.x |
| `@refinedev/react-table` | 5.x | 6.x |
| `@refinedev/antd` | 5.x | 6.x |
| `@refinedev/mui` | 6.x | 7.x |
