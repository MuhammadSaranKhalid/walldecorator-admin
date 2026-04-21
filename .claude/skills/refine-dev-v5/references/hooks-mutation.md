---
title: Mutation Hooks — useCreate, useUpdate, useDelete + batch variants
impact: CRITICAL
tags: useCreate, useUpdate, useDelete, useCreateMany, useUpdateMany, useDeleteMany, mutation, optimistic, undoable, optimisticUpdateMap, invalidates
---

## Mutation Hooks

All mutation hooks return `mutate`, `mutateAsync`, `mutation` (TanStack Query state), and `overtime`.

---

## `useCreate()` — Create Records

```typescript
const { mutate, mutateAsync, mutation, overtime } = useCreate<IProduct>();

mutate({
  resource: "products",
  values: {
    name: "iPhone 15",
    sku:  "IPH-15-BLK",
    price: 999.99
  },

  // Return expanded data from Supabase
  meta: { select: "*, category:categories(name)" },

  // Or use mutationMeta separately (takes precedence over meta for mutations)
  // mutationMeta: { select: "..." },

  // Invalidate: "all" | "resourceAll" | "list" | "many" | "detail" | false
  invalidates: ["list", "many"],   // Default

  // Notifications
  successNotification: {
    message: "Product created successfully",
    type: "success"
  },
  errorNotification: (error, values, resource) => ({
    message: `Failed to create ${resource}`,
    description: error.message,
    type: "error"
  }),

  // Multiple providers
  dataProviderName: "default",

  // TanStack Query mutation options
  mutationOptions: {
    retry: 1
  }
}, {
  onSuccess: (data) => console.log("Created:", data.data),
  onError:   (error) => console.error("Failed:", error)
});

// Async / await
const result = await mutateAsync({ resource: "products", values: data });
```

**Return Values:**
- `mutation.isPending` — `boolean` (was `isLoading` in TanStack v4)
- `mutation.isSuccess` / `mutation.isError` — `boolean`
- `mutate` — fire-and-forget
- `mutateAsync` — returns `Promise<{ data: T }>`
- `overtime.elapsedTime` — `number | undefined`

**Default `invalidates`:** `["list", "many"]`

---

## `useUpdate()` — Update Records

```typescript
const { mutate, mutateAsync, mutation } = useUpdate<IProduct>();

mutate({
  resource: "products",
  id: productId,
  values: {
    price: 899.99,
    stock: 50
  },

  // Mutation mode
  mutationMode: "optimistic",   // "pessimistic" | "optimistic" | "undoable"
  undoableTimeout: 5000,        // ms window (undoable only)
  onCancel: (cancelFn) => {     // Custom cancel handler — suppresses auto-notification
    showCustomUndoButton(cancelFn);
  },

  // Fine-tune optimistic/undoable cache updates
  optimisticUpdateMap: {
    list:   true,    // Update list cache immediately
    many:   true,    // Update many cache immediately
    detail: true,    // Update detail cache immediately
    // Or use custom functions:
    // list: (previous, values, id) => ({ ...previous, data: previous.data.map(item => item.id === id ? { ...item, ...values } : item) })
  },

  meta: { select: "*, category:categories(name)" },
  invalidates: ["list", "many", "detail"],   // Default

  successNotification: (data, values, resource) => ({
    message: `${resource} updated`,
    type: "success"
  })
});
```

**Mutation Modes:**

| Mode | Behaviour |
|------|-----------|
| `"pessimistic"` (default) | Waits for server before updating UI |
| `"optimistic"` | Updates UI immediately; reverts on error |
| `"undoable"` | Shows countdown toast; reverts if cancelled |

**Default `invalidates`:** `["list", "many", "detail"]`

---

## `useDelete()` — Delete Records

```typescript
const { mutate, mutateAsync, mutation } = useDelete();

mutate({
  resource: "products",
  id: productId,

  mutationMode: "undoable",
  undoableTimeout: 5000,
  onCancel: (cancelFn) => showUndoButton(cancelFn),

  successNotification: false,   // Disable notification
  errorNotification: (error) => ({
    message: "Delete failed",
    description: error.message,
    type: "error"
  }),

  invalidates: ["list", "many"],   // Default
  meta: {},
  dataProviderName: "default"
});
```

---

## `useCreateMany()` — Batch Create

```typescript
const { mutate } = useCreateMany<IProduct>();

mutate({
  resource: "products",
  values: [
    { name: "Product A", price: 100 },
    { name: "Product B", price: 200 }
  ],
  invalidates: ["list", "many"]
});
```

---

## `useUpdateMany()` — Batch Update

```typescript
const { mutate } = useUpdateMany<IProduct>();

mutate({
  resource: "products",
  ids: selectedIds,
  values: { status: "inactive" },

  mutationMode: "optimistic",
  undoableTimeout: 5000,
  onCancel: (cancelFn) => {},

  optimisticUpdateMap: {
    list:   true,
    many:   true,
    detail: false
  },

  invalidates: ["list", "many", "detail"],
  dataProviderName: "default"
});
```

---

## `useDeleteMany()` — Batch Delete

```typescript
const { mutate } = useDeleteMany();

mutate({
  resource: "products",
  ids: selectedIds,
  mutationMode: "undoable",
  undoableTimeout: 5000
});
```

---

## `optimisticUpdateMap` — Fine-Tune Cache Updates

Controls exactly how the cache is updated during `optimistic` or `undoable` mutations. Set to `false` to skip cache update for a query type:

```typescript
optimisticUpdateMap: {
  list: (previous, values, id) => ({
    ...previous,
    data: previous.data.map(item =>
      item.id === id ? { ...item, ...values } : item
    )
  }),
  many: true,     // Use default update logic
  detail: false   // Skip detail cache update
}
```

---

## `invalidates` — All Types

| Value | Scope |
|-------|-------|
| `"list"` | List query of the resource |
| `"many"` | Many query of the resource |
| `"detail"` | Detail query for specific `id` |
| `"resourceAll"` | All queries for the resource |
| `"all"` | All queries in the entire app |
| `false` | Disable all invalidation |
