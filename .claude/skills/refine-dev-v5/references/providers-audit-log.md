---
title: Audit Log Provider — Change Tracking
impact: LOW
tags: auditLogProvider, useLog, useLogList, audit, history, change-tracking
---

## Audit Log Provider

Tracks data mutations (create, update, delete) automatically. Useful for compliance, debugging, and showing record history.

---

## Provider Interface

```typescript
interface AuditLogProvider {
  create: (params: {
    resource: string;
    action: string;
    data?: unknown;
    author?: Record<string, unknown>;
    previousData?: unknown;
    meta?: Record<string, unknown>;
  }) => Promise<any>;

  get?: (params: {
    resource: string;
    action?: string;
    meta?: Record<string, unknown>;
    author?: Record<string, unknown>;
    id?: BaseKey;
  }) => Promise<any>;

  update?: (params: {
    id: BaseKey;
    name: string;
  }) => Promise<any>;
}
```

---

## Registration

```typescript
<Refine auditLogProvider={auditLogProvider} />
```

---

## Automatic Logging

When an `auditLogProvider` is registered, Refine **automatically calls `create`** after every successful mutation:

| Mutation | `action` value |
|----------|---------------|
| `useCreate` | `"create"` |
| `useUpdate` | `"update"` |
| `useDelete` | `"delete"` |

The log entry includes `resource`, `action`, `data`, `previousData` (for updates), and `author` from `authProvider.getIdentity()`.

---

## `useLog()` — Manually Create a Log Entry

```typescript
import { useLog } from "@refinedev/core";

const { log } = useLog();

log.mutate({
  resource: "products",
  action: "export",
  data: { count: exportedRows }
});
```

---

## `useLogList()` — Fetch Log Entries

```typescript
import { useLogList } from "@refinedev/core";

const { data, isLoading } = useLogList({
  resource: "products",
  action: "update",
  meta: { id: productId }
});

// data — array of log entries from auditLogProvider.get()
```

**Usage:** Display a change history panel on a Show page to show who changed what and when.
