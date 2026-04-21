---
title: Mutation Modes — pessimistic, optimistic, undoable
impact: HIGH
tags: mutationMode, pessimistic, optimistic, undoable, optimisticUpdateMap, undoableTimeout, onCancel
---

## Mutation Modes

Controls how UI state is updated relative to server confirmation. Set globally in `<Refine>` or per mutation hook call.

---

## Global Default

```typescript
<Refine
  options={{
    mutationMode: "optimistic",   // "pessimistic" | "optimistic" | "undoable"
    undoableTimeout: 5000
  }}
/>
```

---

## `"pessimistic"` (Default)

Waits for the server to confirm before updating the UI.

```
User action → API request → Server confirms → UI updates
```

```typescript
useUpdate({
  mutationMode: "pessimistic"
  // UI shows loading until server responds
  // On error: shows error notification, no UI change
});
```

**Best for:** destructive operations, financial data, anything where optimistic state would be confusing.

---

## `"optimistic"`

Updates the UI immediately, reverts if the server returns an error.

```
User action → UI updates instantly → API request (background)
                                    ↓ success: keep
                                    ↓ error:   revert + error notification
```

```typescript
useUpdate({
  mutationMode: "optimistic",

  // Fine-tune which caches are updated immediately
  optimisticUpdateMap: {
    list:   true,    // Update list cache immediately
    many:   true,    // Update many cache immediately
    detail: true     // Update detail cache immediately
  }
});
```

**`optimisticUpdateMap` with custom function:**

```typescript
optimisticUpdateMap: {
  list: (previous, values, id) => ({
    ...previous,
    data: previous.data.map(item =>
      item.id === id ? { ...item, ...values } : item
    )
  }),
  many: true,
  detail: (previous, values, id) => ({
    ...previous,
    data: { ...previous.data, ...values }
  })
}
```

**Best for:** status toggles, non-critical field updates, high-frequency interactions.

---

## `"undoable"`

Shows a progress toast with a countdown. The mutation executes after the timeout unless the user cancels.

```
User action → UI updates instantly → Countdown toast (N seconds)
                                    ↓ timeout: API request executes
                                    ↓ cancel:  revert UI, no API call
```

```typescript
useUpdate({
  mutationMode: "undoable",
  undoableTimeout: 5000,   // ms — default: 5000 (from global options)

  // Optional: suppress automatic progress notification
  // and handle the cancel button yourself
  onCancel: (cancelMutation) => {
    // cancelMutation() — call to cancel
    showCustomUndoToast(cancelMutation);
  }
});
```

**Default behavior (no `onCancel`):**
- Refine shows a built-in progress notification via `notificationProvider`
- The notification includes an "Undo" button that calls `cancelMutation()`
- After `undoableTimeout` ms, the API request fires automatically

**`onCancel` behavior:**
- When `onCancel` is provided, the automatic notification is **suppressed**
- You control the undo UI entirely
- Call `cancelMutation()` to revert the optimistic UI update

**Best for:** delete operations, bulk updates, cases where the user might want to undo.

---

## Per-Hook Override

Any mutation hook accepts `mutationMode` to override the global setting:

```typescript
// Global: pessimistic
// This hook: undoable
const { mutate: deleteProduct } = useDelete();
deleteProduct({
  resource: "products",
  id: productId,
  mutationMode: "undoable",
  undoableTimeout: 8000
});
```

---

## In `useForm`

```typescript
useForm({
  refineCoreProps: {
    mutationMode: "optimistic",
    undoableTimeout: 5000,
    optimisticUpdateMap: {
      list:   true,
      many:   true,
      detail: true
    }
  }
});
```

---

## Summary

| Mode | UI Update | API Call | On Error |
|------|-----------|----------|----------|
| `pessimistic` | After server confirms | Immediately | Error notification, no UI change |
| `optimistic` | Immediately | Immediately | Revert UI + error notification |
| `undoable` | Immediately | After timeout | If cancelled: revert. If error: revert + error |
