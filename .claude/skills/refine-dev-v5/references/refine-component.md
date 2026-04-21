---
title: <Refine> Component — All Props & Options
impact: CRITICAL
tags: Refine, component, props, options, configuration, liveMode, mutationMode, syncWithLocation
---

## `<Refine>` Component

The central entry point of every Refine application. All providers, resources, and global options are configured here.

```typescript
import { Refine } from "@refinedev/core";

<Refine
  // === Required ===
  dataProvider={dataProvider}

  // === Providers ===
  routerProvider={routerProvider}
  authProvider={authProvider}
  accessControlProvider={accessControlProvider}
  notificationProvider={notificationProvider}
  liveProvider={liveProvider}
  i18nProvider={i18nProvider}
  auditLogProvider={auditLogProvider}

  // === Resources ===
  resources={[
    {
      name: "products",
      list:   "/products",
      create: "/products/new",
      edit:   "/products/:id/edit",
      show:   "/products/:id",
      meta: { label: "Products", icon: <Package /> }
    }
  ]}

  // === Global Options ===
  options={{
    // Mutation behavior
    mutationMode: "pessimistic",    // "pessimistic" | "optimistic" | "undoable"
    undoableTimeout: 5000,          // ms before undoable commits (default: 5000)

    // Sync table/list state to URL query params
    syncWithLocation: false,        // Default: false

    // Warn user when navigating away with unsaved form changes
    warnWhenUnsavedChanges: false,  // Default: false

    // Real-time mode (can be overridden per hook)
    liveMode: "off",                // "auto" | "manual" | "off"

    // Breadcrumb customization
    breadcrumb: true,               // false to disable globally

    // Disable server-side validation error handling
    disableServerSideValidation: false,

    // Post-mutation redirect defaults
    redirect: {
      afterCreate: "list",          // "list" | "edit" | "show" | "create" | false
      afterEdit:   "list",
      afterClone:  "list"
    },

    // Disable Refine telemetry
    disableTelemetry: false,

    // Resource name text transformers
    textTransformers: {
      humanize: (text) => text,
      plural:   (text) => text,
      singular: (text) => text
    },

    // Enable loading indicator for long requests
    overtime: {
      enabled: false,
      interval: 1000   // ms between elapsedTime increments
    },

    // Use structured (new) TanStack Query keys
    useNewQueryKeys: true,

    // React Query client configuration
    reactQuery: {
      clientConfig: {}
    },

    // App title and icon (used in ThemedLayout)
    title: {
      text: "My App",
      icon: <AppIcon />
    }
  }}

  // Real-time global event handler
  onLiveEvent={(event) => console.log(event)}
/>
```

---

## Multiple Data Providers

```typescript
<Refine
  dataProvider={{
    default:   supabaseDataProvider,
    analytics: analyticsDataProvider,
    legacy:    legacyApiDataProvider
  }}
/>

// Per-resource override
{
  name: "events",
  meta: { dataProviderName: "analytics" }
}

// Per-hook override
useList({ resource: "events", dataProviderName: "analytics" });
```

---

## Global `options.mutationMode`

Sets the default for all mutation hooks. Can be overridden per hook call:

```typescript
// Global
options={{ mutationMode: "optimistic" }}

// Per-hook override
useUpdate({ mutationMode: "undoable", undoableTimeout: 3000 });
```

---

## `options.syncWithLocation`

When `true`, table state (filters, sorters, pagination) is written to URL query params — making pages shareable and browser-history aware. Can be overridden per `useTable`:

```typescript
useTable({ refineCoreProps: { syncWithLocation: true } });
```

---

## `options.warnWhenUnsavedChanges`

When `true`, shows a browser confirmation dialog when the user tries to navigate away from a dirty form. Requires `<UnsavedChangesNotifier />` from your router package:

```tsx
// Next.js App Router
import { UnsavedChangesNotifier } from "@refinedev/nextjs-router";

<Refine options={{ warnWhenUnsavedChanges: true }}>
  <UnsavedChangesNotifier />
  {children}
</Refine>
```
