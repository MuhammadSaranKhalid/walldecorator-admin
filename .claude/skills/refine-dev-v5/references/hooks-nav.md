---
title: Navigation Hooks — useGo, useBack, useParsed, useLink, useGetToPath, useResourceParams
impact: MEDIUM
tags: useGo, useBack, useParsed, useLink, useGetToPath, useResourceParams, routing, redirect, keepQuery, keepHash, type-path
---

## Navigation Hooks

> **v5 Change:** `useResource()` was **removed** — use `useResourceParams()` instead.
> `useNavigation()` is **legacy/not recommended** (still available, not deprecated) — prefer `useGo()` + `useBack()`.

---

## `useGo()` — Navigate to Resources or Arbitrary Routes

```typescript
import { useGo } from "@refinedev/core";

const go = useGo();

// Navigate to a resource action
go({
  to: {
    resource: "products",
    action: "list"    // "list" | "create" | "edit" | "show" | "clone"
  },
  type: "push"        // "push" | "replace" | "path"
});

// Navigate to edit with ID
go({
  to: { resource: "products", action: "edit", id: productId },
  type: "push"
});

// Navigate with query params
go({
  to: "/products",
  query: {
    filters: [{ field: "status", operator: "eq", value: "active" }],
    current: 2,
    pageSize: 20
  },
  hash: "section-id",
  type: "push"
});

// Merge current URL query params into new URL
go({
  to: "/products",
  query: { tab: "details" },
  options: {
    keepQuery: true,    // Merge current query params (default: false)
    keepHash:  false    // Preserve current hash (default: false)
  },
  type: "replace"
});

// Get the path string WITHOUT navigating
const path = go({
  to: { resource: "products", action: "show", id: productId },
  type: "path"    // Returns string, does NOT navigate
});
```

**`type` values:**
- `"push"` — adds new entry to history stack
- `"replace"` — replaces current history entry
- `"path"` — returns path string, no navigation

---

## `useBack()` — Go Back in History

```typescript
import { useBack } from "@refinedev/core";

const back = useBack();

<button onClick={back}>Back</button>
```

---

## `useParsed()` — Parse Current Route

Returns resource, action, id, and all URL params including table state from `syncWithLocation`.

```typescript
import { useParsed } from "@refinedev/core";

const {
  resource,    // IResourceItem | undefined — matched resource config
  action,      // "list" | "create" | "edit" | "show" | undefined
  id,          // BaseKey | undefined — record ID from URL
  pathname,    // string — current pathname
  params: {
    filters,      // CrudFilter[] | undefined — from URL (syncWithLocation)
    sorters,      // CrudSort[] | undefined — from URL
    currentPage,  // number | undefined
    pageSize,     // number | undefined
    ...restParams // any other URL query params
  }
} = useParsed();
```

---

## `useResourceParams()` — Get Current Resource Context

> Replaces the removed `useResource()` from v4.

```typescript
import { useResourceParams } from "@refinedev/core";

const {
  resource,     // IResourceItem | undefined — current resource config object
  identifier,   // string | undefined — resource name or alias
  id,           // BaseKey | undefined — current record ID (from URL)
  setId,        // (id: BaseKey) => void — programmatically set record ID
  action,       // "list" | "create" | "edit" | "show" | "clone" | undefined
  formAction,   // "create" | "edit" | "clone" — derived action for form contexts
  select,       // (nameOrIdentifier: string) => { resource, identifier } — look up resource by name
  resources,    // IResourceItem[] — all registered resources
} = useResourceParams();
```

---

## `useLink()` — Router-Agnostic Link Component

Returns the `Link` component from the configured router provider.

```typescript
import { useLink } from "@refinedev/core";

const Link = useLink();

<Link to="/products">Products List</Link>
<Link to={`/products/${id}/edit`}>Edit</Link>
```

---

## `useGetToPath()` — Convert Resource + Action to Path String

```typescript
import { useGetToPath } from "@refinedev/core";

const getToPath = useGetToPath();

const listPath = getToPath({
  resource: "products",
  action: "list"
});
// → "/products"

const editPath = getToPath({
  resource: "products",
  action: "edit",
  meta: { id: productId }
});
// → "/products/123/edit"
```

---

## Redirect After Form Submission

In `useForm` / `useModalForm`, set `redirect` in `refineCoreProps`:

```typescript
refineCoreProps: {
  redirect: "show",    // → show page after create/update
  // redirect: "list"
  // redirect: "edit"
  // redirect: false   // Stay on current page
}
```

Programmatic redirect inside `onMutationSuccess`:

```typescript
const { refineCore: { redirect } } = useForm({ ... });

onMutationSuccess: (data) => {
  redirect("show", data.data.id);
  // or
  redirect("list");
}
```
