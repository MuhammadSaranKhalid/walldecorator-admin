---
title: Next.js App Router Integration
impact: MEDIUM
tags: nextjs, app-router, layout, provider, routes, pages, "use client"
---

## Next.js App Router Integration

Refine v5 works with Next.js App Router. All Refine hooks require `"use client"` — they rely on React context.

---

## Route Structure Convention

```
app/
  (dashboard)/
    layout.tsx                    # Authenticated layout with Refine provider
    products/
      page.tsx                    # List page
      new/
        page.tsx                  # Create page
      [id]/
        page.tsx                  # Show page
        edit/
          page.tsx                # Edit page
    purchase-orders/
      create/
        page.tsx                  # Create purchase order
```

---

## Provider Setup

Location: [smart-inventory-platform/components/providers/refine-provider.tsx](smart-inventory-platform/components/providers/refine-provider.tsx)

```tsx
// app/(dashboard)/layout.tsx
import { RefineProvider } from "@/components/providers/refine-provider";

export default function DashboardLayout({ children }) {
  return (
    <RefineProvider>
      {children}
    </RefineProvider>
  );
}
```

The `RefineProvider` component wraps:
```tsx
"use client";

import { Refine } from "@refinedev/core";
import { refineDataProvider }      from "@/lib/refine/data-provider";
import { authProvider }            from "@/lib/refine/auth-provider";
import { accessControlProvider }   from "@/lib/refine/access-control-provider";

export function RefineProvider({ children }) {
  return (
    <Refine
      dataProvider={refineDataProvider}
      authProvider={authProvider}
      accessControlProvider={accessControlProvider}
      resources={[
        {
          name: "products",
          list:   "/products",
          create: "/products/new",
          edit:   "/products/:id/edit",
          show:   "/products/:id"
        }
      ]}
    >
      {children}
    </Refine>
  );
}
```

---

## Page Implementation Pattern

**List page:**

```tsx
// app/(dashboard)/products/page.tsx
"use client";

import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView }  from "@/components/refine-ui/views";

export default function ProductsPage() {
  const table = useTable({
    columns: [...],
    refineCoreProps: { resource: "products" }
  });

  return (
    <ListView resource="products">
      <DataTable table={table} />
    </ListView>
  );
}
```

**Create page:**

```tsx
// app/(dashboard)/products/new/page.tsx
"use client";

import { useForm }  from "@refinedev/react-hook-form";
import { CreateView } from "@/components/refine-ui/views";

export default function ProductCreatePage() {
  const { register, handleSubmit, refineCore: { onFinish, formLoading } } = useForm({
    refineCoreProps: { resource: "products", action: "create" }
  });

  return (
    <CreateView resource="products">
      <form onSubmit={handleSubmit(onFinish)}>
        {/* fields */}
      </form>
    </CreateView>
  );
}
```

**Edit page:**

```tsx
// app/(dashboard)/products/[id]/edit/page.tsx
"use client";

import { useForm }  from "@refinedev/react-hook-form";
import { EditView }  from "@/components/refine-ui/views";
import { useParams } from "next/navigation";

export default function ProductEditPage() {
  const { id } = useParams();

  const { register, handleSubmit, refineCore: { onFinish, formLoading } } = useForm({
    refineCoreProps: {
      resource: "products",
      action: "edit",
      id: id as string
    }
  });

  return (
    <EditView resource="products">
      <form onSubmit={handleSubmit(onFinish)}>
        {/* fields */}
      </form>
    </EditView>
  );
}
```

---

## Store-Scoped Routes

For store-specific resources, the route includes `[storeId]`:

```
app/(dashboard)/store/[storeId]/purchase-orders/create/page.tsx
```

Access the store context via:
```typescript
import { useStoreContext } from "@/lib/stores/store-context";
const { currentStore } = useStoreContext();
```

Then pass `store_id` as a permanent filter or form value.

---

## Important Notes

- All pages using Refine hooks must have `"use client"` at the top
- Server Components cannot use Refine hooks (they need React context)
- Use `useParams()` from `next/navigation` to get URL params in App Router
- The `<Refine>` component itself should be in a Client Component provider
