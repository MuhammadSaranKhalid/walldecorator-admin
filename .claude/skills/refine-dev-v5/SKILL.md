---
name: refine-dev-v5
description: Expert guidance for Refine.dev v5 framework. Use when building CRUD operations, data tables, forms, implementing RBAC/permissions, working with Supabase data providers, or creating admin panel features. Based on official Refine v5 documentation.
user-invocable: true
disable-model-invocation: false
argument-hint: [feature|component]
allowed-tools: Read, Grep, Glob
---

# Refine.dev v5 Expert Guide

You are an expert in **Refine.dev v5**, a React meta-framework for building CRUD-heavy web applications including internal tools, admin panels, dashboards, and B2B apps.

**Before writing any Refine code, read the relevant reference file(s) from `references/` via the index in `AGENTS.md`.**

## Project Stack

- **Refine v5**: @refinedev/core v5.0.11
- **React**: 19.2.1 (Refine v5 supports both React 18 and 19)
- **TanStack Query v5**: Built into Refine v5
- **Supabase**: Backend with PostgreSQL (@refinedev/supabase v6.0.2)
- **Next.js 16**: App Router
- **shadcn/ui**: Radix UI components
- **React Hook Form**: @refinedev/react-hook-form v5.0.4
- **TanStack React Table**: @refinedev/react-table v6.0.1
- **TypeScript**

## Project File Locations

**Core Refine Setup:**
- Data Provider: [smart-inventory-platform/lib/refine/data-provider.ts](smart-inventory-platform/lib/refine/data-provider.ts)
- Auth Provider: [smart-inventory-platform/lib/refine/auth-provider.ts](smart-inventory-platform/lib/refine/auth-provider.ts)
- Access Control: [smart-inventory-platform/lib/refine/access-control-provider.ts](smart-inventory-platform/lib/refine/access-control-provider.ts)
- Refine Provider: [smart-inventory-platform/components/providers/refine-provider.tsx](smart-inventory-platform/components/providers/refine-provider.tsx)

**UI Components:**
- Action Buttons: [smart-inventory-platform/components/refine-ui/buttons/](smart-inventory-platform/components/refine-ui/buttons/)
- Data Tables: [smart-inventory-platform/components/refine-ui/data-table/](smart-inventory-platform/components/refine-ui/data-table/)
- Views: [smart-inventory-platform/components/refine-ui/views/](smart-inventory-platform/components/refine-ui/views/)

**Hooks & Utilities:**
- Custom Permissions: [smart-inventory-platform/lib/hooks/use-permissions.ts](smart-inventory-platform/lib/hooks/use-permissions.ts)
- Database Types: [smart-inventory-platform/lib/supabase/database.types.ts](smart-inventory-platform/lib/supabase/database.types.ts)
- Store Context: [smart-inventory-platform/lib/stores/store-context.tsx](smart-inventory-platform/lib/stores/store-context.tsx)

## v5 Hook Return Shape

Data hooks use `{ result, query, overtime }` — but `result` shape varies by hook:
- `useList` — `result.data` (array), `result.total` (count)
- `useOne` / `useShow` — `result` IS the data object directly (no `.data` needed)
- `useMany` — `result.data` (array)
- `query` or `mutation` — TanStack Query state (`isLoading`, `isError`, `refetch`)
- `overtime` — `{ elapsedTime }` for long-request tracking

## v5 Breaking Changes (from v4)

- `useNavigation()` **legacy** (still available, not recommended) → prefer `useGo()` + `useBack()`
- `useResource()` **removed** → use `useResourceParams()`
- `metaData` → `meta` | `sort`/`sorter` → `sorters` | `hasPagination` → `pagination.mode`
- `queryResult` → `query` | `mutationResult` → `mutation`
- `current`/`setCurrent` → `currentPage`/`setCurrentPage`
- `AuthBindings` → `AuthProvider` | `RouterBindings` → `RouterProvider`
- Run `npx @refinedev/codemod@latest refine4-to-refine5` for automated migration

For full details see `references/migration-v4-to-v5.md`.

## Reference Index

See `AGENTS.md` for the full index of reference files and when to read each one.
