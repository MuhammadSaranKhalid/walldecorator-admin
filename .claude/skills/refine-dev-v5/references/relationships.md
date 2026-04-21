---
title: Data Relationships — One-to-One, One-to-Many, Many-to-Many
impact: MEDIUM
tags: relationships, one-to-one, one-to-many, many-to-many, useOne, useList, useMany, supabase, joins
---

## Data Relationships

Refine handles relationships through hook composition and Supabase PostgREST joins.

---

## One-to-One Relationships

A product belongs to one category. Fetch with sequential queries:

**Option A — Supabase join (preferred, single request):**

```typescript
const { result } = useOne({
  resource: "products",
  id: productId,
  meta: {
    select: "*, category:categories(id, name, description)"
  }
});

const { product, category } = {
  product:  result.data,
  category: result.data?.category
};
```

**Option B — Sequential hooks (non-Supabase):**

```typescript
const { result: productResult } = useOne({
  resource: "products",
  id: productId
});

const { result: categoryResult } = useOne({
  resource: "categories",
  id: productResult.data?.category_id,
  queryOptions: {
    enabled: !!productResult.data?.category_id  // Wait for parent
  }
});
```

---

## One-to-Many Relationships

An order has many line items:

**Option A — Supabase join:**

```typescript
const { result } = useOne({
  resource: "orders",
  id: orderId,
  meta: {
    select: "*, line_items(id, product_id, quantity, unit_price)"
  }
});

const lineItems = result.data?.line_items ?? [];
```

**Option B — Filtered list:**

```typescript
const { result: lineItems } = useList({
  resource: "order_line_items",
  filters: [{ field: "order_id", operator: "eq", value: orderId }],
  queryOptions: { enabled: !!orderId }
});
```

---

## Many-to-Many Relationships

Products ↔ Tags via `product_tags` junction table:

**Option A — Supabase join through junction:**

```typescript
// Uses PostgREST many-to-many shorthand
const { result } = useOne({
  resource: "products",
  id: productId,
  meta: {
    select: "*, tags(id, name)"   // Supabase resolves through product_tags
  }
});
```

**Option B — Fetch junction, then `useMany`:**

```typescript
// Step 1: Get junction table IDs
const { result: junctionResult } = useList({
  resource: "product_tags",
  filters: [{ field: "product_id", operator: "eq", value: productId }],
  queryOptions: { enabled: !!productId }
});

const tagIds = junctionResult.data?.map(pt => pt.tag_id) ?? [];

// Step 2: Fetch the actual tag records
const { result: tagsResult } = useMany({
  resource: "tags",
  ids: tagIds,
  queryOptions: { enabled: tagIds.length > 0 }
});

const tags = tagsResult.data ?? [];
```

---

## Deep Filtering Through Relations (Supabase)

Filter by a related field using dot notation + inner join:

```typescript
useList({
  resource: "products",
  filters: [
    { field: "categories.name", operator: "eq", value: "Electronics" }
  ],
  meta: {
    select: "*, categories!inner(name)"   // !inner required for filter to work
  }
});
```

---

## Performance: Avoid N+1

**Wrong — N+1 pattern (one query per row):**

```typescript
// Don't do this in a table
products.map(p => useOne({ resource: "categories", id: p.category_id }));
```

**Correct — Single join:**

```typescript
useList({
  resource: "products",
  meta: { select: "*, category:categories(name)" }  // One query total
});
```

**Correct — Batch fetch:**

```typescript
const categoryIds = [...new Set(products.map(p => p.category_id))];
useMany({ resource: "categories", ids: categoryIds });
```
