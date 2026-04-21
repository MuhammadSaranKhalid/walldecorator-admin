---
title: Resources Configuration
impact: MEDIUM
tags: resources, routes, navigation, meta, sidebar, crud
---

## Resources Configuration

Resources map data entities to routes and register them for navigation, breadcrumbs, and access control checks.

```typescript
<Refine
  resources={[
    {
      name: "products",            // Must match Supabase table name
      list:   "/products",
      create: "/products/new",
      edit:   "/products/:id/edit",
      show:   "/products/:id",
      meta: {
        label:     "Products",     // Sidebar display name
        icon:      <Package />,    // Sidebar icon (Lucide or any React node)
        parent:    "inventory",    // Groups under "inventory" in sidebar
        hide:      false,          // Hide from sidebar (still accessible)
        canDelete: true            // Enables delete in show pages
      }
    },

    // Parent group (no routes — just a sidebar group label)
    {
      name: "inventory",
      meta: {
        label: "Inventory",
        icon: <Boxes />
      }
    },

    // Store-scoped resource
    {
      name: "purchase_orders",
      list:   "/store/:storeId/purchase-orders",
      create: "/store/:storeId/purchase-orders/create",
      edit:   "/store/:storeId/purchase-orders/:id/edit",
      show:   "/store/:storeId/purchase-orders/:id",
      meta: {
        label: "Purchase Orders",
        icon:  <ShoppingCart />,
        parent: "procurement"
      }
    }
  ]}
/>
```

**`meta` Options:**

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Display name in sidebar and breadcrumbs |
| `icon` | `ReactNode` | Icon rendered in sidebar |
| `parent` | `string` | Parent resource name for nested nav groups |
| `hide` | `boolean` | Hides from sidebar (default: `false`) |
| `canDelete` | `boolean` | Enables delete button on show pages |
| `dataProviderName` | `string` | Use non-default data provider for this resource |

---

## Accessing Resource Context in Components

```typescript
// v5: useResource() was removed — use useResourceParams()
const { resource, id, action } = useResourceParams();

// resource.name     → "products"
// resource.meta     → { label: "Products", ... }
// id                → current record ID (from URL)
// action            → "list" | "create" | "edit" | "show"
```

---

## Resource Name Convention

The resource `name` must match the Supabase table name exactly (the Supabase data provider uses it directly as the table name in PostgREST queries).

```typescript
// Supabase table: "purchase_orders"
{ name: "purchase_orders", ... }

// NOT: "purchaseOrders", "purchase-orders"
```
