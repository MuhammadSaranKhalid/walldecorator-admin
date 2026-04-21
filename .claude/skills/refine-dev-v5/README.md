# Refine.dev v5 - Contributor Guide

This skill contains Refine.dev v5 guidance optimized for AI agents and LLMs.
It follows the [Agent Skills Open Standard](https://agentskills.io/).

## Skill Structure

```
skills/refine-dev-v5/
├── SKILL.md           # Agent-facing skill manifest (entry point)
├── AGENTS.md          # Navigation guide / reference index
├── CLAUDE.md          # Alias for AGENTS.md
├── README.md          # This file
└── references/
    ├── hooks-data.md                  # useList, useOne, useMany, useShow, useInfiniteList
    ├── hooks-mutation.md              # useCreate, useUpdate, useDelete + batch variants
    ├── hooks-form.md                  # useForm + React Hook Form + Zod
    ├── hooks-form-advanced.md         # useModalForm, useDrawerForm, useStepsForm
    ├── hooks-table.md                 # useTable + TanStack Table
    ├── hooks-access.md                # useCan, CanAccess, RBAC/ABAC patterns
    ├── hooks-nav.md                   # useGo, useBack, useParsed, useResourceParams
    ├── hooks-extra.md                 # useSelect, useCustom, useInvalidate, useNotification
    ├── hooks-utility.md               # useModal, useMenu, useBreadcrumb, useImport, useExport
    ├── auth-hooks.md                  # useLogin, useLogout, useGetIdentity, usePermissions
    ├── auth-components.md             # <Authenticated>, <AuthPage>
    ├── mutation-modes.md              # pessimistic / optimistic / undoable
    ├── relationships.md               # One-to-one, one-to-many, many-to-many, N+1 prevention
    ├── refine-component.md            # <Refine> all props & options
    ├── providers-data.md              # Data Provider interface
    ├── providers-auth.md              # Auth Provider interface
    ├── providers-access-control.md    # Access Control Provider
    ├── providers-live.md              # Live Provider, useSubscription, usePublish
    ├── providers-notification.md      # Notification Provider
    ├── providers-i18n.md              # i18n Provider
    ├── providers-audit-log.md         # Audit Log Provider, useLog, useLogList
    ├── supabase-meta.md               # meta.select, joins, idColumnName, RLS, real-time
    ├── nextjs-integration.md          # App Router setup, page patterns, store-scoped routes
    ├── resources-config.md            # Resource registration, meta props, naming conventions
    ├── multitenancy.md                # Route-based tenancy (storeId), multi-store patterns
    ├── patterns-best-practices.md     # Common patterns, performance tips, troubleshooting
    └── migration-v4-to-v5.md          # All breaking changes, renamed params, removed hooks
```

## Creating a New Reference

1. **Choose a category prefix:**
   - `hooks-data-` — Data fetching hooks
   - `hooks-mutation-` — Mutation hooks
   - `hooks-form-` — Form management
   - `hooks-table-` — Table management
   - `providers-` — Data/Auth/Access providers
   - `hooks-access-` — Permission/RBAC hooks
   - `hooks-nav-` — Navigation hooks
   - `supabase-` — Supabase-specific patterns
   - `nextjs-` — Next.js integration
   - `resources-` — Resource configuration
   - `patterns-` — Reusable patterns

2. **Use the reference template:**

```markdown
---
title: Clear, Action-Oriented Title
impact: CRITICAL|HIGH|MEDIUM|LOW
tags: hook, refine, crud, supabase
---

## [Title]

[1-2 sentence explanation of what this is and when to use it.]

**Parameters:**

\`\`\`typescript
// TypeScript interface
\`\`\`

**Usage Example:**

\`\`\`typescript
// Full working example
\`\`\`

**Return Values:**
- `result` — description
- `query` — description

**Key Features:**
- Feature 1
- Feature 2

**Project Implementation:**
Location: `smart-inventory-platform/...`
```

3. **Update `AGENTS.md`** — Add a row to the Reference Files table.

## Writing Guidelines

1. **Show complete examples** — All TypeScript examples must be runnable
2. **Document all options** — Include common parameters with comments
3. **v5 return shapes** — Always use `result`/`query`/`mutation` structure
4. **Project-specific notes** — Reference actual project files where relevant
5. **Keep references focused** — One hook or concept per file

## Impact Levels

| Level | Description |
|-------|-------------|
| CRITICAL | Core data operations — apps won't work without these |
| HIGH | Important for common CRUD features |
| MEDIUM | Enhances UX or developer experience |
| LOW | Advanced patterns and edge cases |
