---
title: Supabase Integration — meta, joins, RLS, real-time
impact: MEDIUM
tags: supabase, meta, select, joins, rls, real-time, postgrest, idColumnName, schema, count
---

## Supabase Integration

The Supabase data provider uses PostgREST. All query customization goes through the `meta` option.

---

## Query Customization with `meta.select`

**Select specific columns (avoid `*` on large tables):**

```typescript
meta: { select: "id, name, price, status" }
```

**Left join (include related data):**

```typescript
meta: {
  select: "*, category:categories(id, name), supplier:suppliers(company_name)"
}
```

**Inner join (filters rows without related record):**

```typescript
meta: {
  select: "*, category:categories!inner(name)"
}
```

**Count aggregate:**

```typescript
meta: {
  select: "id, name, items_count:inventory(count)"
}
```

**Nested relations:**

```typescript
meta: {
  select: "*, category:categories(*, parent:parent_id(name))"
}
```

**Custom primary key column:**

```typescript
// Table uses "post_id" instead of "id"
useMany({
  resource: "posts",
  ids: [1, 2],
  meta: { idColumnName: "post_id" }
});
```

**Custom schema:**

```typescript
useTable({
  resource: "audit_logs",
  meta: { schema: "audit" }   // Uses the "audit" Postgres schema
});
```

**Estimated count for large tables:**

```typescript
// Avoids slow COUNT(*) on large tables
useList({
  resource: "events",
  meta: { count: "estimated" }   // Uses PostgreSQL's estimated row count
});
```

**Deep filtering through relations:**

```typescript
// Filter products by their category title
useTable({
  filters: {
    initial: [{ field: "categories.title", operator: "eq", value: "Electronics" }]
  },
  meta: { select: "*, categories!inner(title)" }
});
```

---

## Using with Hooks

```typescript
// useList
const { result } = useList({
  resource: "products",
  meta: { select: "*, category:categories(name)" }
});

// useOne
const { result } = useOne({
  resource: "products",
  id: productId,
  meta: { select: "*, category:categories(*), supplier:suppliers(*)" }
});

// useForm (edit mode)
useForm({
  refineCoreProps: {
    resource: "products",
    action: "edit",
    id: productId,
    meta: { select: "*, category:categories(*)" }
  }
});
```

---

## Row Level Security (RLS)

Supabase enforces RLS automatically on every request:
- The user's JWT is passed with all requests via the Supabase client
- Table-level policies determine what rows are returned or modified
- No extra code needed — RLS is transparent to Refine hooks

**Troubleshooting permission errors:**
1. Check `supabase.auth.getSession()` returns a valid session
2. Check RLS policies on the table in Supabase dashboard
3. Ensure the user's role has the correct policy applied

---

## Real-time Subscriptions

**Auto mode (re-fetches list on changes):**

```typescript
useList({
  resource: "products",
  liveMode: "auto"   // Default: "off"
});
```

**Manual mode (callback only, you control re-fetch):**

```typescript
useList({
  resource: "products",
  liveMode: "manual",
  onLiveEvent: (event) => {
    console.log("Change type:", event.type);  // INSERT | UPDATE | DELETE
    invalidate({ resource: "products", invalidates: ["list"] });
  }
});
```

**Direct subscription:**

```typescript
import { useSubscription } from "@refinedev/core";

useSubscription({
  channel: "products",
  types: ["INSERT", "UPDATE", "DELETE"],
  params: { ids: [productId] },
  onLiveEvent: (event) => {
    console.log("Real-time update:", event);
  }
});
```

**Relational queries need manual subscription:**

Supabase Realtime does not track changes in joined tables. When using `meta.select` with relations, manually subscribe to the related table and trigger a refetch:

```typescript
const table = useTable({
  refineCoreProps: {
    resource: "products",
    meta: { select: "*, categories(name)" }
  }
});

useSubscription({
  channel: "categories",
  types: ["*"],
  onLiveEvent: () => table.refineCore.tableQuery.query.refetch()
});
```

---

## TypeScript Types from Supabase

```typescript
import type { Database } from "@/lib/supabase/database.types";

type Product       = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
```

Regenerate types after schema changes:
```bash
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```
