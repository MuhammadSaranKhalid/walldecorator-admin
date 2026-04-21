---
title: Permission Hooks — useCan, CanAccess, button access control, sider access control
impact: HIGH
tags: useCan, CanAccess, permissions, rbac, abac, conditional-render, sider, buttons, staleTime
---

## Permission Hooks

---

## `useCan()` — Check a Single Permission

Calls `accessControlProvider.can()` and caches the result via TanStack Query.

```typescript
import { useCan } from "@refinedev/core";

const { data, isLoading } = useCan({
  resource: "products",
  action: "create",      // "list" | "create" | "edit" | "delete" | "show" | any string

  // Extra context passed to accessControlProvider.can()
  params: {
    id: productId,                 // Record ID (for record-level checks)
    location_id: currentLocation,  // Custom ABAC conditions
    // Any key-value pairs your provider needs
  },

  queryOptions: {
    staleTime: 5 * 60 * 1000,    // Cache for 5 minutes (default: 0)
    // cacheTime: 5 * 60 * 1000  // Default in Refine: 5 minutes
  }
});

if (isLoading) return <Spinner />;

if (data?.can) {
  // Render the action
}

if (!data?.can && data?.reason) {
  // Show reason in tooltip
  console.log(data.reason);
}
```

**Return values:**
- `data.can` — `boolean`
- `data.reason` — `string | undefined` — shown in disabled button tooltips
- `isLoading` — TanStack Query loading state

**Default caching (Refine):**
- `cacheTime`: 5 minutes
- `staleTime`: 0 (background refetch on every access)
- Override via `queryOptions` per call or `accessControlProvider.options.queryOptions`

---

## `<CanAccess>` — Conditional Rendering

```tsx
import { CanAccess } from "@refinedev/core";

<CanAccess
  resource="products"
  action="create"
  params={{ id: productId, location_id: storeId }}
  fallback={<p className="text-muted">You don't have permission</p>}
>
  <CreateProductButton />
</CanAccess>
```

**Props:**
- `resource` — resource name
- `action` — action string
- `params` — custom conditions passed to `accessControlProvider.can()`
- `fallback` — rendered when denied (if omitted, nothing renders on denial)

---

## Automatic Access Control on Action Buttons

All Refine action buttons check permissions automatically:

```tsx
// These call useCan internally — no extra code needed
<CreateButton resource="products" />
<EditButton   resource="products" recordItemId={id} />
<DeleteButton resource="products" recordItemId={id} />
<ShowButton   resource="products" recordItemId={id} />
<CloneButton  resource="products" recordItemId={id} />
<ListButton   resource="products" />
```

**What each button checks:**

| Button | action | params |
|--------|--------|--------|
| `CreateButton` | `"create"` | `{}` |
| `EditButton` | `"edit"` | `{ id }` |
| `DeleteButton` | `"delete"` | `{ id }` |
| `ShowButton` | `"show"` | `{ id }` |
| `CloneButton` | `"clone"` | `{ id }` |
| `ListButton` | `"list"` | `{}` |

**Control disabled vs hidden behavior globally:**

```typescript
accessControlProvider = {
  can: async (params) => { /* ... */ },
  options: {
    buttons: {
      enableAccessControl: true,   // Enable checks (default: true)
      hideIfUnauthorized: false    // false = disabled, true = hidden (default: false)
    },
    queryOptions: {
      staleTime: 5 * 60 * 1000
    }
  }
};
```

---

## Automatic Sider Menu Filtering

The sidebar automatically hides menu items when the user lacks `"list"` permission:

```typescript
// Checked automatically for each resource in the menu:
can({ resource: "products", action: "list" });

// No code needed — useMenu() respects access control
```

---

## ABAC — Attribute-Based Access Control

Pass resource metadata to access control checks via `params`:

```typescript
const { data } = useCan({
  resource: "products",
  action: "edit",
  params: {
    id: productId,
    // The provider receives full ResourceProps — use any attribute
    location_id:     currentStoreId,
    department_id:   userDepartmentId,
    owner_id:        resourceOwnerId
  }
});
```

In the access control provider:
```typescript
can: async ({ resource, action, params }) => {
  const { id, location_id, owner_id } = params ?? {};

  // Record-level check: user can only edit their own store's products
  if (action === "edit" && location_id !== user.store_id) {
    return { can: false, reason: "You can only edit products in your store" };
  }

  return { can: true };
}
```

---

## Permission Cache Management (Project)

The project's access control provider caches permissions for 5 minutes. Clear after role changes:

```typescript
import { clearPermissionCache } from "@/lib/refine/access-control-provider";

// After updating user role:
clearPermissionCache(userId);
```

---

## Supported Action Strings

Refine uses these by convention, but you can define any custom action:

| Action | Used by |
|--------|---------|
| `"list"` | Sider, ListButton |
| `"create"` | CreateButton, create page load |
| `"edit"` | EditButton, edit page load |
| `"delete"` | DeleteButton |
| `"show"` | ShowButton, show page load |
| `"clone"` | CloneButton |
| `"field"` | Custom field-level visibility |
| any string | Custom actions via `useCan` |
