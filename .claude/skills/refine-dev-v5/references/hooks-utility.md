---
title: Utility Hooks — useModal, useMenu, useBreadcrumb, useImport, useExport
impact: LOW-MEDIUM
tags: useModal, useMenu, useBreadcrumb, useImport, useExport, csv, menu, breadcrumb, papaparse, batchSize, mapData
---

## Utility Hooks

---

## `useModal()` — Simple Modal Toggle

```typescript
import { useModal } from "@refinedev/core";

const { visible, show, close } = useModal({
  defaultVisible: false   // Optional initial state
});

<button onClick={show}>Open Modal</button>

{visible && (
  <dialog>
    <button onClick={close}>Close</button>
  </dialog>
)}
```

---

## `useMenu()` — Sidebar Navigation Tree

Returns the resource tree respecting access control (auto-hides unauthorized items).

```typescript
import { useMenu } from "@refinedev/core";

const {
  menuItems,        // TreeMenuItem[]
  defaultOpenKeys,  // string[] — keys that should start expanded
  selectedKey       // string — currently active route key
} = useMenu();

menuItems.map((item) => (
  <NavItem key={item.key} href={item.route}>
    {item.icon}
    <span>{item.label}</span>
    {item.children?.map(child => (
      <NavItem key={child.key} href={child.route}>
        {child.label}
      </NavItem>
    ))}
  </NavItem>
));
```

**`TreeMenuItem` shape:**
```typescript
{
  key:       string;           // Unique identifier
  label:     string;           // From resource meta.label
  route?:    string;           // Navigation target (resource list route)
  icon?:     ReactNode;        // From resource meta.icon
  children?: TreeMenuItem[];   // Sub-resources (from meta.parent)
  meta?:     ResourceMeta;     // Full resource meta
}
```

---

## `useBreadcrumb()` — Auto-Generated Breadcrumbs

Derives breadcrumbs from the current route and resource config.

```typescript
import { useBreadcrumb } from "@refinedev/core";

const { breadcrumbs } = useBreadcrumb();

// breadcrumbs: Array<{ label: string; href?: string; icon?: ReactNode }>
// Example for /products/123/edit:
// [{ label: "Products", href: "/products" }, { label: "Edit", href: undefined }]

breadcrumbs.map((crumb, i) => (
  <span key={i}>
    {crumb.href
      ? <a href={crumb.href}>{crumb.icon}{crumb.label}</a>
      : <span>{crumb.label}</span>
    }
    {i < breadcrumbs.length - 1 && <span> / </span>}
  </span>
));
```

---

## `useImport()` — CSV Import

Parses CSV using Papa Parse and calls `create` (or `createMany`) per row.

```typescript
import { useImport } from "@refinedev/core";

const { inputProps, isLoading } = useImport<IProduct>({
  resource: "products",       // Optional — inferred from route

  // Transform CSV row to record shape before insert
  mapData: (row: Record<string, string>) => ({
    name:   row.Name,
    price:  parseFloat(row.Price),
    sku:    row.SKU,
    status: row.Status ?? "active"
  }),

  // 1 = useCreate per row; >1 = useCreateMany batches
  batchSize: 1,

  // Papa Parse options
  papaparseOptions: {
    header: true,               // First row is headers
    skipEmptyLines: true,
    delimiter: ",",
    encoding: "UTF-8"
  },

  onFinish: (result) => {
    console.log("Succeeded:", result.succeeded.length);
    console.log("Errored:", result.errored.length);
  },

  onProgress: ({ processedAmount, totalAmount }) => {
    console.log(`${processedAmount} / ${totalAmount} rows processed`);
  },

  meta: {},
  dataProviderName: "default"
});

// Wire to a file input
<input type="file" accept=".csv" {...inputProps} />
{isLoading && <progress>Importing...</progress>}
```

**Return values:**
- `inputProps` — spread onto `<input type="file">` — handles file selection and parsing
- `isLoading` — `boolean` — true during import

---

## `useExport()` — CSV Export

Fetches all records via `getList` and downloads as CSV using Papa Parse.

```typescript
import { useExport } from "@refinedev/core";

const { triggerExport, isLoading } = useExport<IProduct>({
  resource: "products",       // Optional — inferred from route

  // Transform each record before CSV generation
  mapData: (item) => ({
    Name:     item.name,
    Price:    item.price,
    SKU:      item.sku,
    Category: item.category?.name ?? "",
    Status:   item.status
  }),

  // Only export filtered/sorted subset
  filters: activeFilters,
  sorters: activeSorters,

  // Safety limit for large datasets
  maxItemCount: 50000,

  // Fetch in batches (avoids memory issues)
  pageSize: 100,

  meta: { select: "*, category:categories(name)" },
  dataProviderName: "default",

  onError: (error) => {
    console.error("Export failed:", error);
  }
});

<button onClick={triggerExport} disabled={isLoading}>
  {isLoading ? "Exporting..." : "Export CSV"}
</button>
```

**Return values:**
- `triggerExport()` — starts fetch + download
- `isLoading` — `boolean` — true during export
