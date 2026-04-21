---
title: Notification Provider — Alerts & Toasts
impact: MEDIUM
tags: notificationProvider, useNotification, toast, success, error, progress, undoable
---

## Notification Provider

Handles all success/error/progress feedback shown to users. Refine calls it automatically after mutations — you only need to wire the UI library.

---

## Provider Interface

```typescript
interface NotificationProvider {
  open: (params: OpenNotificationParams) => void;
  close: (key: string) => void;
}

interface OpenNotificationParams {
  key?: string;             // Unique ID for programmatic closing
  message: string;          // Main notification text
  type: "success" | "error" | "progress";
  description?: string;     // Optional subtitle
  cancelMutation?: () => void;   // For undoable mutations
  undoableTimeout?: number;      // ms countdown for undoable
}
```

---

## Registration

```typescript
import { useNotificationProvider } from "@refinedev/antd";   // or MUI, shadcn/ui, etc.

<Refine notificationProvider={useNotificationProvider()} />
```

For shadcn/ui (this project):

```typescript
// The project's RefineProvider already sets up notifications
// via its custom notificationProvider implementation
```

---

## `useNotification()` — Manual Notifications

```typescript
import { useNotification } from "@refinedev/core";

const { open, close } = useNotification();

// Success
open({
  type: "success",
  message: "Product saved",
  description: "Changes have been committed",
  key: "product-saved"
});

// Error
open({
  type: "error",
  message: "Failed to delete",
  description: error.message,
  key: "delete-error"
});

// Progress (used internally for undoable mutations)
open({
  type: "progress",
  message: "Deleting product...",
  undoableTimeout: 5000,
  cancelMutation: () => undoFn(),
  key: "delete-progress"
});

// Close programmatically
close("product-saved");
```

---

## Automatic Notifications

Refine shows notifications automatically for all mutation hooks:

| Event | Default message |
|-------|----------------|
| Create success | `"Successfully created {resource}"` |
| Update success | `"Successfully edited {resource}"` |
| Delete success | `"Successfully deleted {resource}"` |
| Any error | Error message from `HttpError` |
| Undoable action | Progress toast with countdown and "Undo" button |

**Override per mutation:**

```typescript
mutate({
  resource: "products",
  values: data,
  successNotification: {
    message: "Product published",
    type: "success"
  },
  errorNotification: (error) => ({
    message: "Publish failed",
    description: error.message,
    type: "error"
  })
});

// Disable notification
mutate({ ..., successNotification: false });
```

**Override for queries:**

```typescript
useList({
  resource: "products",
  errorNotification: (error) => ({
    message: "Could not load products",
    type: "error"
  }),
  successNotification: false   // Don't show on success
});
```
