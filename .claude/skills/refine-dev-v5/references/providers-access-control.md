---
title: Access Control Provider — RBAC
impact: HIGH
tags: access-control, rbac, permissions, useCan, CanAccess, roles, policies
---

## Access Control Provider

Implements resource + action based RBAC. Called automatically by Refine's action buttons and navigation.

**Interface:**

```typescript
interface IAccessControlContext {
  can?: (params: CanParams) => Promise<CanResponse>;
  options?: {
    buttons?: {
      enableAccessControl?: boolean;   // Default: true
      hideIfUnauthorized?: boolean;    // Default: false
    };
    queryOptions?: UseQueryOptions<CanReturnType>;
  };
}

type CanParams = {
  resource?: string;
  action: string;
  params?: {
    id?: string | number;
    [key: string]: any;  // Custom conditions (location_id, owner_id, etc.)
  };
};

type CanResponse = {
  can: boolean;
  reason?: string;  // Shown in button tooltips when denied
};
```

---

## Project Implementation

Location: [smart-inventory-platform/lib/refine/access-control-provider.ts](smart-inventory-platform/lib/refine/access-control-provider.ts)

**Features:**
- Role-based policies: `ADMIN`, `MANAGER`, `STAFF`, `VIEWER`
- Resource-level permissions
- Action-level: `list`, `create`, `edit`, `delete`, `show`, `field`
- Record-level conditional access (location, owner)
- 5-minute permission cache (call `clearPermissionCache(userId)` after role change)
- Supabase RPC: `check_permission(user_id, resource_name, action_name, record_id, conditions)`

**Clear Cache After Role Change:**

```typescript
import { clearPermissionCache } from "@/lib/refine/access-control-provider";
clearPermissionCache(userId);
```

---

## Registration in Refine

```typescript
import { accessControlProvider } from "@/lib/refine/access-control-provider";

<Refine
  accessControlProvider={accessControlProvider}
/>
```

---

## Custom Access Control Provider

```typescript
export const accessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = await getCurrentUser();

    // Admin can do everything
    if (user.role === "admin") return { can: true };

    // Example: staff can only list and show
    if (user.role === "staff" && ["list", "show"].includes(action)) {
      return { can: true };
    }

    return {
      can: false,
      reason: "You do not have permission to perform this action"
    };
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: false   // false = disabled, true = hidden
    }
  }
};
```

---

## Standard Actions

| Action | Triggered by |
|--------|-------------|
| `list`   | Sider menu item, ListButton |
| `create` | CreateButton, create page load |
| `edit`   | EditButton, edit page load |
| `delete` | DeleteButton |
| `show`   | ShowButton, show page load |
| `field`  | Custom field-level visibility checks |
