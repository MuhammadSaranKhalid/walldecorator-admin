# Refine.dev v5 Expert Guide

## Structure

```
refine-dev-v5/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Symlink to AGENTS.md
  references/    # Detailed reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand - read only what you need

Expert guidance for Refine.dev v5 — a React meta-framework for building CRUD-heavy web applications. Covers data hooks, mutations, forms, tables, RBAC, Supabase integration, and Next.js App Router patterns.

## When to Apply

Reference these guidelines when:
- Building CRUD pages (list, create, edit, show)
- Implementing data tables with sorting, filtering, pagination
- Creating forms with validation and auto-save
- Adding RBAC/permission-based access control
- Integrating with Supabase data provider
- Setting up real-time subscriptions
- Working with Next.js App Router routes

## Reference Files

### Core CRUD
| File | Topic | When to Read |
|------|-------|--------------|
| `references/hooks-data.md` | useList, useOne, useMany, useShow, useInfiniteList — all params incl. liveParams, overtimeOptions, filter operators | Fetching data |
| `references/hooks-mutation.md` | useCreate, useUpdate, useDelete + batch variants, optimisticUpdateMap, all invalidates types | Writing data |
| `references/hooks-form.md` | useForm + RHF + Zod — queryMeta, mutationMeta, optimisticUpdateMap, onFinishAutoSave, server validation | Forms & validation |
| `references/hooks-form-advanced.md` | useModalForm, useDrawerForm, useStepsForm, syncWithLocation object form, isBackValidate, invalidateOnClose | Modal/drawer/multi-step |
| `references/hooks-table.md` | useTable + TanStack Table, column meta filterOperator/filterKey, programmatic setFilters/setSorters | Data tables |
| `references/mutation-modes.md` | pessimistic / optimistic / undoable — full detail, optimisticUpdateMap functions, onCancel | Mutation modes |
| `references/relationships.md` | One-to-one, one-to-many, many-to-many, deep filtering, N+1 prevention | Relational data |

### Providers
| File | Topic | When to Read |
|------|-------|--------------|
| `references/refine-component.md` | `<Refine>` all props & options — mutationMode, syncWithLocation, warnWhenUnsavedChanges, liveMode, overtime, reactQuery | App setup & config |
| `references/providers-data.md` | Data Provider interface, meta custom headers, cursor pagination, multiple providers | Custom data backends |
| `references/providers-auth.md` | Auth Provider interface, return types | Authentication setup |
| `references/providers-access-control.md` | Access Control Provider, RBAC/ABAC, button options | Permissions setup |
| `references/providers-live.md` | Live Provider interface, useSubscription, usePublish, 3 live modes | Real-time / WebSocket |
| `references/providers-notification.md` | Notification Provider, per-mutation overrides, undoable progress toast | Toasts & alerts |
| `references/providers-i18n.md` | i18n Provider, useTranslation, built-in translation keys | Internationalization |
| `references/providers-audit-log.md` | Audit Log Provider, useLog, useLogList | Change tracking |

### Hooks & Components
| File | Topic | When to Read |
|------|-------|--------------|
| `references/hooks-extra.md` | useSelect (all params incl. searchField, selectedOptionsOrder, debounce), useCustom, useCustomMutation, useInvalidate (all types), useNotification | Select/custom/utility hooks |
| `references/hooks-access.md` | useCan, CanAccess, button auto-checks, sider filtering, ABAC patterns | Permission checks |
| `references/hooks-nav.md` | useGo (keepQuery/keepHash/type:path), useBack, useParsed, useResourceParams, useLink, useGetToPath | Routing |
| `references/hooks-utility.md` | useModal, useMenu (TreeMenuItem), useBreadcrumb, useImport (papaparseOptions, batchSize), useExport (mapData, maxItemCount) | UI utilities & CSV |
| `references/auth-hooks.md` | useLogin, useLogout, useRegister, useForgotPassword, useUpdatePassword, useGetIdentity, useIsAuthenticated, usePermissions, useOnError | Auth hooks |
| `references/auth-components.md` | `<Authenticated>` (key prop required), `<AuthPage>` (type, providers, renderContent) | Protected routes |

### Integration
| File | Topic | When to Read |
|------|-------|--------------|
| `references/supabase-meta.md` | meta.select, joins, idColumnName, schema, count, deep filters, RLS, relational real-time | Supabase queries |
| `references/nextjs-integration.md` | App Router setup, page patterns, store-scoped routes, "use client" requirement | Next.js pages |
| `references/resources-config.md` | Resource registration, meta props, naming conventions | Route mapping |
| `references/multitenancy.md` | Route-based tenancy (storeId), enterprise multitenancy, manual scoping | Multi-store/tenant |

### Reference
| File | Topic | When to Read |
|------|-------|--------------|
| `references/patterns-best-practices.md` | 12 common patterns, performance tips, troubleshooting table | Best practices |
| `references/migration-v4-to-v5.md` | All breaking changes, renamed params, removed hooks, TanStack v5 changes | Migrating from v4 |

## Quick Reference

**v5 Hook Return Shape:**
- `result` — `{ data, total }` (normalized data)
- `query` or `mutation` — TanStack Query state
- `overtime` — `{ elapsedTime }` for long-request tracking

## References

- https://refine.dev/core/docs/
- https://refine.dev/blog/refine-v5-announcement/
- https://refine.dev/core/docs/migration-guide/4x-to-5x/
