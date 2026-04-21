---
title: Form Integration — useForm with React Hook Form
impact: CRITICAL
tags: useForm, react-hook-form, zod, validation, create, edit, clone, auto-save, queryMeta, mutationMeta, optimisticUpdateMap, warnWhenUnsavedChanges, server-side-validation
---

## `useForm()` — Integrated Form Management

Package: `@refinedev/react-hook-form`

Combines React Hook Form with Refine's data layer.

```typescript
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name:  z.string().min(1, "Name is required"),
  sku:   z.string().min(1, "SKU is required"),
  price: z.number().positive("Price must be positive")
});

const {
  // React Hook Form methods
  register,
  handleSubmit,
  control,
  formState: { errors, isDirty, isValid },
  setValue,
  watch,
  reset,
  resetField,

  // Refine integration
  refineCore: {
    onFinish,           // Submit handler — pass to handleSubmit(onFinish)
    onFinishAutoSave,   // Auto-save submit — does NOT set formLoading
    formLoading,        // true while submitting or fetching (edit mode)
    query,              // useOne result (edit/clone mode)
    mutation,           // useCreate/useUpdate result
    setId,              // Dynamically change record ID
    redirect,           // redirect(action, id?) — programmatic navigation
    overtime            // { elapsedTime }
  },

  // Helper props
  saveButtonProps,    // { disabled: boolean, onClick: handler }
  autoSaveProps       // { data, error, status: "loading"|"error"|"idle"|"success" }

} = useForm({
  // React Hook Form config
  resolver: zodResolver(schema),
  defaultValues: { name: "", price: 0 },
  mode: "onChange",

  // Warn before leaving with unsaved changes (requires <UnsavedChangesNotifier />)
  warnWhenUnsavedChanges: true,

  // Refine config
  refineCoreProps: {
    resource: "products",
    action: "create",     // "create" | "edit" | "clone"
    id: productId,        // Required for "edit" and "clone"

    redirect: "show",     // "list" | "edit" | "show" | "create" | false

    mutationMode: "pessimistic",   // "pessimistic" | "optimistic" | "undoable"
    undoableTimeout: 5000,

    // Separate meta for query (edit/clone) and mutations
    meta: { select: "*, category:categories(*)" },          // Both query and mutation
    queryMeta:    { select: "*, category:categories(*)" },  // Overrides meta for useOne
    mutationMeta: { select: "*" },                          // Overrides meta for mutations

    // Separate TanStack Query options
    queryOptions: { enabled: !!productId },
    createMutationOptions: { retry: 1 },
    updateMutationOptions: { retry: 1 },

    // Cache invalidation scope
    invalidates: ["list", "many", "detail"],

    // Optimistic/undoable cache control
    optimisticUpdateMap: {
      list:   true,
      many:   true,
      detail: true
    },

    // Auto-save configuration
    autoSave: {
      enabled: true,
      debounce: 1000,                    // ms debounce
      invalidateOnUnmount: true,         // Invalidate queries when component unmounts
      invalidateOnClose: true,           // For useModalForm/useDrawerForm
      onFinish: (values) => values       // Optional transform before auto-save
    },

    dataProviderName: "default",

    // Callbacks
    onMutationSuccess: (data, variables, context, isAutoSave) => {
      console.log("Saved:", data.data, "isAutoSave:", isAutoSave);
    },
    onMutationError: (error, variables, context, isAutoSave) => {
      console.error("Failed:", error);
    },

    // Notifications
    successNotification: (data, values, resource) => ({
      message: `${resource} saved`,
      type: "success"
    }),
    errorNotification: (error, values, resource) => ({
      message: "Save failed",
      description: error.message,
      type: "error"
    }),

    // Real-time
    liveMode: "off",
    onLiveEvent: (event) => {}
  }
});
```

**Usage in JSX:**

```tsx
<form onSubmit={handleSubmit(onFinish)}>
  <input {...register("name")} />
  {errors.name && <span>{errors.name.message}</span>}

  <Controller
    name="category_id"
    control={control}
    render={({ field }) => (
      <Select {...field} options={categoryOptions} />
    )}
  />

  <button type="submit" {...saveButtonProps}>
    {formLoading ? "Saving..." : "Save"}
  </button>

  {/* Auto-save status */}
  {autoSaveProps.status === "loading" && <span>Auto-saving...</span>}
  {autoSaveProps.status === "success" && <span>Saved</span>}
</form>
```

---

## Action Modes

| Action | Data fetch | Mutation |
|--------|------------|----------|
| `"create"` | None | `useCreate` |
| `"edit"`   | `useOne` (by `id`) | `useUpdate` |
| `"clone"`  | `useOne` (by `id`) | `useCreate` (new record) |

---

## Server-Side Validation

When your API returns validation errors in this format, form fields are automatically populated with errors:

```typescript
// API returns HttpError with field-level errors:
const httpError: HttpError = {
  message: "Validation failed",
  statusCode: 422,
  errors: {
    name:  ["Name already exists"],
    price: "Must be positive"
  }
};
```

Refine maps `errors.fieldName` → `formState.errors.fieldName.message` automatically.

---

## `warnWhenUnsavedChanges`

Requires `<UnsavedChangesNotifier />` from your router package in the layout:

```tsx
import { UnsavedChangesNotifier } from "@refinedev/nextjs-router";

// In layout.tsx
<Refine options={{ warnWhenUnsavedChanges: true }}>
  <UnsavedChangesNotifier />
  {children}
</Refine>
```

Can also be enabled per-form:
```typescript
useForm({ warnWhenUnsavedChanges: true, refineCoreProps: { ... } })
```

---

## Dependent Field Pattern

```typescript
const watchedCategory = watch("category_id");

const { result: subcategories } = useList({
  resource: "subcategories",
  filters: [{ field: "category_id", operator: "eq", value: watchedCategory }],
  queryOptions: { enabled: !!watchedCategory }
});
```

---

## Key Return Values Summary

| Property | Type | Description |
|----------|------|-------------|
| `refineCore.onFinish` | `(values) => void` | Submit handler |
| `refineCore.onFinishAutoSave` | `(values) => void` | Auto-save (no formLoading) |
| `refineCore.formLoading` | `boolean` | Query or mutation in progress |
| `refineCore.query` | `QueryResult` | useOne result (edit/clone) |
| `refineCore.mutation` | `MutationResult` | useCreate/useUpdate result |
| `refineCore.setId` | `(id) => void` | Change record ID dynamically |
| `refineCore.redirect` | `(action, id?) => void` | Navigate after custom logic |
| `saveButtonProps` | `{ disabled, onClick }` | Wire directly to submit button |
| `autoSaveProps` | `{ data, error, status }` | Auto-save state for UI |
