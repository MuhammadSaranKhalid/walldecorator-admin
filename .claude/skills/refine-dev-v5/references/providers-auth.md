---
title: Auth Provider
impact: HIGH
tags: auth-provider, login, logout, check, identity, permissions, supabase
---

## Auth Provider

Manages authentication state, user identity, and session lifecycle.

**Required Interface:**

```typescript
interface AuthProvider {
  login:   (params: any) => Promise<AuthActionResponse>
  logout:  (params?: any) => Promise<AuthActionResponse>
  check:   (params?: any) => Promise<CheckResponse>
  onError: (error: any)   => Promise<OnErrorResponse>
}
```

**Return Types:**

```typescript
type AuthActionResponse = {
  success: boolean;
  redirectTo?: string;    // Navigate after action
  error?: Error;          // Shown to user on failure
  [key: string]: unknown;
};

type CheckResponse = {
  authenticated: boolean;
  redirectTo?: string;    // Where to redirect if not authenticated
  logout?: boolean;       // Force logout on check failure
  error?: Error;
};
```

**Optional Methods:**
- `getIdentity()` — Returns current user profile
- `getPermissions()` — Returns user roles / permission set
- `register()` — User registration
- `forgotPassword()` — Password recovery flow
- `updatePassword()` — Password reset

---

## Project Implementation

Location: [smart-inventory-platform/lib/refine/auth-provider.ts](smart-inventory-platform/lib/refine/auth-provider.ts)

Supports three auth methods:
- **Email/password** — Standard Supabase `signInWithPassword`
- **OTP** — `signInWithOtp` (sends magic link / email OTP)
- **Two-step OTP verification** — Separate step to verify the OTP code

---

## Minimal Supabase Auth Provider Example

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const authProvider = {
  login: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error };
    return { success: true, redirectTo: "/dashboard" };
  },

  logout: async () => {
    await supabase.auth.signOut();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return { authenticated: true };
    return { authenticated: false, redirectTo: "/login" };
  },

  onError: async (error) => {
    if (error?.status === 401) return { logout: true };
    return { error };
  },

  getIdentity: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id:     user.id,
      name:   user.user_metadata?.full_name ?? user.email,
      email:  user.email,
      avatar: user.user_metadata?.avatar_url
    };
  }
};
```

---

## Using Auth in Components

```typescript
// Get current user
const { data: user, isLoading } = useGetIdentity<UserType>();

// Check if authenticated (redirect handled automatically)
// Just render — Refine's <Authenticated> wrapper handles redirects

// Trigger logout
const { mutate: logout } = useLogout();
<button onClick={() => logout()}>Sign out</button>

// Trigger login
const { mutate: login } = useLogin<{ email: string; password: string }>();
login({ email, password });
```
