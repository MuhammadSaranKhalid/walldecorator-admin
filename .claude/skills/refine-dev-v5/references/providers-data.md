---
title: Data Provider
impact: CRITICAL
tags: data-provider, supabase, custom, getList, getOne, create, update, delete
---

## Data Provider

The data provider is the bridge between Refine and your backend. Every data hook call routes through it.

**Required Interface:**

```typescript
interface DataProvider {
  getList:   (params: GetListParams)   => Promise<GetListResponse<T>>
  getOne:    (params: GetOneParams)    => Promise<GetOneResponse<T>>
  create:    (params: CreateParams)    => Promise<CreateResponse<T>>
  update:    (params: UpdateParams)    => Promise<UpdateResponse<T>>
  deleteOne: (params: DeleteOneParams) => Promise<DeleteOneResponse<T>>
  getApiUrl: ()                        => string
}
```

**Optional Methods:**
- `getMany()` — Fetch multiple by IDs (falls back to multiple `getOne` calls)
- `createMany()`, `updateMany()`, `deleteMany()` — Batch operations
- `custom()` — Non-standard endpoints

---

## Supabase Data Provider (Project Implementation)

Location: [smart-inventory-platform/lib/refine/data-provider.ts](smart-inventory-platform/lib/refine/data-provider.ts)

```typescript
import { dataProvider } from "@refinedev/supabase";
import { createClient }  from "@/lib/supabase/client";

const supabaseClient = createClient();
export const refineDataProvider = dataProvider(supabaseClient);
```

The Supabase provider implements all required methods via PostgREST:
- `getList` → `supabase.from(resource).select(...).range(...).order(...)`
- `getOne` → `supabase.from(resource).select(...).eq("id", id).single()`
- `create` → `supabase.from(resource).insert(values).select(...).single()`
- `update` → `supabase.from(resource).update(values).eq("id", id).select(...).single()`
- `deleteOne` → `supabase.from(resource).delete().eq("id", id)`

---

## Custom Data Provider (Non-Supabase Backends)

```typescript
import { DataProvider } from "@refinedev/core";

export const myDataProvider: DataProvider = {
  getApiUrl: () => "https://api.example.com",

  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};
    const response = await fetch(`/api/${resource}?page=${current}&limit=${pageSize}`);
    const { data, total } = await response.json();
    return { data, total };
  },

  getOne: async ({ resource, id }) => {
    const response = await fetch(`/api/${resource}/${id}`);
    const data = await response.json();
    return { data };
  },

  create: async ({ resource, values }) => {
    const response = await fetch(`/api/${resource}`, {
      method: "POST",
      body: JSON.stringify(values)
    });
    const data = await response.json();
    return { data };
  },

  update: async ({ resource, id, values }) => {
    const response = await fetch(`/api/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values)
    });
    const data = await response.json();
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
    return { data: {} as any };
  }
};
```

---

## Multiple Data Providers

```typescript
<Refine
  dataProvider={{
    default:   supabaseDataProvider,
    analytics: analyticsDataProvider
  }}
/>

// Use in hooks
useList({
  resource: "events",
  dataProviderName: "analytics"
});
```
