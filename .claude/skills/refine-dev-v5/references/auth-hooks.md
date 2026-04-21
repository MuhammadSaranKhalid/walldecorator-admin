---
title: Auth Hooks — useLogin, useLogout, useRegister, useForgotPassword, useUpdatePassword, useGetIdentity, useIsAuthenticated, usePermissions, useOnError
impact: HIGH
tags: useLogin, useLogout, useRegister, useForgotPassword, useUpdatePassword, useGetIdentity, useIsAuthenticated, usePermissions, useOnError
---

## Auth Hooks

All auth hooks call the corresponding `authProvider` method. They return TanStack Query mutation/query results.

---

## `useLogin()` — Authenticate User

```typescript
import { useLogin } from "@refinedev/core";

const { mutate: login, mutation } = useLogin<{ email: string; password: string }>();

login({ email, password }, {
  onSuccess: (data) => {
    if (data.success) {
      // Redirect handled automatically by authProvider.login returning redirectTo
    }
  },
  onError: (error) => console.error(error)
});

// Or async
const { mutateAsync: loginAsync } = useLogin();
const result = await loginAsync({ email, password });
if (result.success) router.push(result.redirectTo ?? "/dashboard");
```

**Return from `authProvider.login`:**
```typescript
{ success: boolean; redirectTo?: string; error?: Error }
```

Supports any shape — OTP login, social login, etc.:
```typescript
// OTP step 1
login({ email, type: "otp" });
// OTP step 2
login({ email, code: otpCode, type: "verify" });
```

---

## `useLogout()` — Sign Out

```typescript
import { useLogout } from "@refinedev/core";

const { mutate: logout } = useLogout();

<button onClick={() => logout()}>Sign out</button>

// With params
logout({ redirectTo: "/login" });
```

---

## `useRegister()` — Create Account

```typescript
import { useRegister } from "@refinedev/core";

const { mutate: register, mutation } = useRegister<{
  email: string;
  password: string;
  name: string;
}>();

register({ email, password, name }, {
  onSuccess: (data) => {
    if (data.success) router.push(data.redirectTo ?? "/login");
  }
});
```

---

## `useForgotPassword()` — Initiate Password Reset

```typescript
import { useForgotPassword } from "@refinedev/core";

const { mutate: forgotPassword, mutation } = useForgotPassword<{ email: string }>();

forgotPassword({ email }, {
  onSuccess: (data) => {
    if (data.success) showMessage("Check your email for a reset link");
  }
});
```

---

## `useUpdatePassword()` — Reset / Change Password

```typescript
import { useUpdatePassword } from "@refinedev/core";

const { mutate: updatePassword, mutation } = useUpdatePassword<{
  password: string;
  confirmPassword: string;
  token?: string;   // From URL query param (reset flow)
}>();

updatePassword({ password, confirmPassword, token }, {
  onSuccess: (data) => {
    if (data.success) router.push(data.redirectTo ?? "/login");
  }
});
```

---

## `useGetIdentity()` — Get Current User Profile

Calls `authProvider.getIdentity()`. Cached by TanStack Query.

```typescript
import { useGetIdentity } from "@refinedev/core";

const { data: user, isLoading } = useGetIdentity<{
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}>();

if (isLoading) return <Spinner />;

return (
  <div>
    <img src={user?.avatar} alt={user?.name} />
    <span>{user?.name}</span>
  </div>
);
```

---

## `useIsAuthenticated()` — Check Auth Status

Calls `authProvider.check()`. Used internally by `<Authenticated>`.

```typescript
import { useIsAuthenticated } from "@refinedev/core";

const { data, isLoading } = useIsAuthenticated();

// data.authenticated — boolean
// data.redirectTo    — string | undefined
// data.logout        — boolean — force logout
// data.error         — Error | undefined
```

---

## `usePermissions()` — Get User Roles / Permissions

Calls `authProvider.getPermissions()`. For simple checks. Prefer `useCan()` for fine-grained RBAC.

```typescript
import { usePermissions } from "@refinedev/core";

const { data: permissions } = usePermissions<string[]>();

if (permissions?.includes("admin")) {
  // Admin-only UI
}
```

---

## `useOnError()` — Handle API Errors

Calls `authProvider.onError()`. Handles 401/403 responses — typically triggers logout or token refresh.

```typescript
import { useOnError } from "@refinedev/core";

const { mutate: onError } = useOnError();

// Triggered automatically by Refine data hooks on 401/403
// Manual use:
onError(new Error("Unauthorized"));
```

In most cases Refine calls this automatically — you don't need to call it manually.

---

## Auth Flow Summary

```
useLogin()          → authProvider.login()
useLogout()         → authProvider.logout()
useRegister()       → authProvider.register()
useForgotPassword() → authProvider.forgotPassword()
useUpdatePassword() → authProvider.updatePassword()
useGetIdentity()    → authProvider.getIdentity()
useIsAuthenticated()→ authProvider.check()
usePermissions()    → authProvider.getPermissions()
useOnError()        → authProvider.onError()
```

All return TanStack Query `useMutation` or `useQuery` results. Notifications (errors) are shown automatically via the Notification Provider.
