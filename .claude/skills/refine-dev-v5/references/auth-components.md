---
title: Auth Components — Authenticated, AuthPage
impact: HIGH
tags: Authenticated, AuthPage, protected-routes, login, register, forgot-password
---

## Auth Components

---

## `<Authenticated>` — Protected Route Wrapper

Conditionally renders content based on authentication status. Wraps `useIsAuthenticated` internally.

```tsx
import { Authenticated } from "@refinedev/core";

// Protect a page
<Authenticated
  key="dashboard"           // REQUIRED — unique key per usage (prevents flash)
  redirectOnFail="/login"   // Where to redirect if not authenticated
  appendCurrentPathToQuery  // Append current URL to redirect query (default: true)
  fallback={<div>Not authorized</div>}  // Shown instead of redirect
  loading={<Spinner />}     // Shown while checking auth status
>
  <Dashboard />
</Authenticated>
```

**Important:** The `key` prop is **required** and must be unique at the same tree level. It forces React to remount the component when navigating between protected pages, preventing stale content from flashing.

**Three render states:**
1. Authenticated → renders `children`
2. Not authenticated → renders `fallback` OR redirects to `redirectOnFail`
3. Checking → renders `loading`

**In Next.js App Router layout:**

```tsx
// app/(dashboard)/layout.tsx
import { Authenticated } from "@refinedev/core";

export default function DashboardLayout({ children }) {
  return (
    <Authenticated key="dashboard-layout" redirectOnFail="/login">
      {children}
    </Authenticated>
  );
}
```

---

## `<AuthPage>` — Pre-Built Auth Forms

Ready-made authentication UI available in all UI packages (Ant Design, MUI, Chakra, Mantine, shadcn/ui).

```tsx
import { AuthPage } from "@refinedev/core";   // headless
// OR
import { AuthPage } from "@refinedev/antd";   // with Ant Design styling

// Login page
<AuthPage type="login" />

// Register page
<AuthPage type="register" />

// Forgot password page
<AuthPage type="forgotPassword" />

// Reset password page
<AuthPage type="updatePassword" />
```

**Social login:**

```tsx
<AuthPage
  type="login"
  providers={[
    { name: "google",  label: "Sign in with Google" },
    { name: "github",  label: "Sign in with GitHub" },
    { name: "twitter", label: "Sign in with Twitter" }
  ]}
/>
```

**Custom content:**

```tsx
<AuthPage
  type="login"
  title={<Logo />}
  renderContent={(content, title) => (
    <div className="custom-wrapper">
      {title}
      {content}
      <footer>© 2026 My App</footer>
    </div>
  )}
/>
```

---

## shadcn/ui Sign-In Form (Project)

The project uses shadcn/ui components. Instead of `<AuthPage>`, it has custom auth forms located in the Refine UI components directory.

Supported auth flows (from `authProvider.ts`):
- Email + password login
- OTP (One-Time Password) magic link
- Two-step OTP verification
