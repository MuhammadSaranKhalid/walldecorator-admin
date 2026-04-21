---
title: Multitenancy — Tenant-Scoped Data and Routing
impact: MEDIUM
tags: multitenancy, tenant, store, organization, route-based, data-scoping
---

## Multitenancy

Serving multiple isolated customers (tenants/organizations/stores) from a single app instance.

---

## Route-Based Tenant Pattern (This Project)

This project uses route-based tenancy via `[storeId]` in the URL:

```
app/(dashboard)/store/[storeId]/products/page.tsx
app/(dashboard)/store/[storeId]/purchase-orders/create/page.tsx
```

Access the current store via the store context:

```typescript
import { useStoreContext } from "@/lib/stores/store-context";

const { currentStore } = useStoreContext();

// Always pass storeId as a permanent filter
useList({
  resource: "products",
  filters: [
    { field: "store_id", operator: "eq", value: currentStore.id }
  ]
});

// Pass storeId in form values on create
useForm({
  refineCoreProps: {
    resource: "products",
    action: "create"
  },
  defaultValues: {
    store_id: currentStore.id
  }
});
```

---

## Refine Enterprise Multitenancy (Optional)

For more advanced multitenancy with tenant switching, use `@refinedev/multitenancy`:

```bash
npm install @refinedev/enterprise @refinedev/multitenancy
```

```typescript
import { RefineEnterprise } from "@refinedev/enterprise";
import { MultitenancyProvider } from "@refinedev/multitenancy";

<RefineEnterprise
  multitenancyProvider={{
    adapter: routeBasedAdapter,   // Extracts tenantId from URL
    fetchTenants: async () => {
      const { data } = await supabase.from("stores").select("*");
      return data.map(store => ({ id: store.id, name: store.name }));
    }
  }}
  {...otherProps}
>
  <WithTenant
    fallback={<TenantSelector />}
    loading={<Spinner />}
  >
    {children}
  </WithTenant>
</RefineEnterprise>
```

Refine automatically passes `tenantId` via `meta` to all data provider calls. Filter in your data provider:

```typescript
getList: async ({ resource, meta }) => {
  const { tenantId } = meta ?? {};
  return supabase
    .from(resource)
    .select("*")
    .eq("organization_id", tenantId);
}
```

---

## Tenant Selector UI (Enterprise)

Available for Ant Design and Material UI:

```typescript
import { TenantSelect } from "@refinedev/antd";
// or
import { TenantSelect } from "@refinedev/mui";

<TenantSelect />
```

---

## Manual Tenant Scoping (Without Enterprise Package)

The simplest approach — pass tenant ID as a permanent filter in every hook:

```typescript
// Centralize in a custom hook
function useStoreList(resource: string, extraFilters = []) {
  const { currentStore } = useStoreContext();

  return useList({
    resource,
    filters: [
      { field: "store_id", operator: "eq", value: currentStore.id },
      ...extraFilters
    ]
  });
}
```
