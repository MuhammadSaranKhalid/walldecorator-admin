---
title: Live Provider — Real-Time Updates
impact: MEDIUM
tags: liveProvider, live, realtime, useSubscription, usePublish, supabase, ably
---

## Live Provider

Enables real-time data synchronization. Refine is agnostic — works with Supabase, Ably, Appwrite, Hasura, or any WebSocket solution.

---

## Provider Interface

```typescript
const liveProvider = {
  subscribe: ({ channel, params, types, callback, meta }) => any,
  unsubscribe: (subscription: any) => void,
  publish?: ({ channel, type, payload, date, meta }) => void
};
```

**`subscribe`** — Called by `useList`, `useOne`, `useMany` when `liveMode` is active. Returns a subscription handle passed to `unsubscribe`.

**`unsubscribe`** — Called on cleanup to cancel the subscription.

**`publish`** _(optional)_ — Called by `useCreate`, `useUpdate`, `useDelete` after mutations to broadcast events.

---

## Registration

```typescript
import { liveProvider } from "@refinedev/supabase";

<Refine
  liveProvider={liveProvider(supabaseClient)}
  options={{ liveMode: "auto" }}   // Global default
/>
```

---

## Live Modes

| Mode | Behaviour |
|------|-----------|
| `"auto"` | Re-fetches data automatically on any matching event |
| `"manual"` | Fires `onLiveEvent` callback; you control when to re-fetch |
| `"off"` (default) | No real-time subscription |

Set globally in `<Refine options={{ liveMode }}>` or per hook (hook-level overrides global):

```typescript
useList({
  resource: "orders",
  liveMode: "manual",
  onLiveEvent: (event) => {
    if (event.type === "created") refetch();
  }
});
```

---

## Automatic Event Publishing

Mutation hooks automatically publish events after success:

| Hook | Published Event |
|------|----------------|
| `useCreate` | `{ type: "created", payload: { ids: [id] } }` |
| `useUpdate` | `{ type: "updated", payload: { ids: [id] } }` |
| `useDelete` | `{ type: "deleted", payload: { ids: [id] } }` |

---

## `useSubscription()` — Manual Subscription

Subscribe to any channel and respond to events:

```typescript
import { useSubscription } from "@refinedev/core";

useSubscription({
  channel: "products",
  types: ["created", "updated", "deleted"],   // or ["*"] for all
  params: { ids: [productId] },               // Optional — filter by IDs
  onLiveEvent: (event) => {
    console.log(event.type, event.payload);
    // event.type    — "created" | "updated" | "deleted"
    // event.channel — "products"
    // event.payload — { ids: [...] }
    // event.date    — Date
  },
  enabled: !!productId
});
```

---

## `usePublish()` — Manually Publish Events

```typescript
import { usePublish } from "@refinedev/core";

const publish = usePublish();

publish({
  channel: "products",
  type: "updated",
  payload: { ids: [productId] },
  date: new Date()
});
```

---

## Supabase Real-Time Setup

```typescript
// Register liveProvider
import { liveProvider } from "@refinedev/supabase";

<Refine liveProvider={liveProvider(supabaseClient)} options={{ liveMode: "auto" }} />
```

**Important:** Supabase Realtime does **not** track changes in joined tables. If you use `meta.select` with relations, manually subscribe to the related table:

```typescript
const table = useTable({
  refineCoreProps: { resource: "products", meta: { select: "*, categories(name)" } }
});

// Subscribe to category changes separately
useSubscription({
  channel: "categories",
  types: ["*"],
  onLiveEvent: () => table.refineCore.tableQuery.query.refetch()
});
```

---

## Built-In Integrations

- **Supabase** — `@refinedev/supabase` (PostgreSQL + Realtime)
- **Ably** — `@refinedev/ably`
- **Appwrite** — `@refinedev/appwrite`
- **Hasura** — `@refinedev/hasura`
