---
title: Advanced Form Hooks — useModalForm, useDrawerForm, useStepsForm
impact: MEDIUM
tags: useModalForm, useDrawerForm, useStepsForm, modal, drawer, multi-step, isBackValidate, syncWithLocation, invalidateOnClose, autoResetFormWhenClose
---

## Advanced Form Hooks

Package: `@refinedev/react-hook-form`

---

## `useModalForm()` — Form in a Modal

Extends `useForm` with modal visibility state.

```typescript
import { useModalForm } from "@refinedev/react-hook-form";

const {
  modal: {
    visible,      // boolean — is modal open
    show,         // (id?: BaseKey) => void
    close,        // () => void
    submit,       // () => void — submit without closing
    title         // string — auto: "Create Product" / "Edit Product"
  },
  register,
  handleSubmit,
  control,
  formState: { errors },
  refineCore: { onFinish, formLoading, query },
  saveButtonProps

} = useModalForm({
  refineCoreProps: {
    resource: "products",
    action: "create",    // "create" | "edit" | "clone"
    id: recordId,        // Pass for edit/clone; OR use modal.show(id)
    redirect: false      // Stay on same page
  },

  // React Hook Form config
  resolver: zodResolver(schema),
  defaultValues: { name: "", price: 0 },
  warnWhenUnsavedChanges: true,

  // Modal behavior
  defaultVisible: false,
  autoSubmitClose: true,          // Close on successful submit (default: true)
  autoResetForm: true,            // Reset form after submit (default: true)
  autoResetFormWhenClose: true,   // Reset to defaultValues on close (default: true)

  // Sync modal state + record ID to URL query params
  syncWithLocation: true,
  // OR use object form for custom param name:
  // syncWithLocation: { key: "product-modal", syncId: true },

  // Auto-save
  autoSave: {
    enabled: true,
    debounce: 1000,
    invalidateOnUnmount: true,
    invalidateOnClose: true    // Invalidate when modal closes
  }
});

// Open for create
<button onClick={() => modal.show()}>New Product</button>

// Open for edit (fetches record automatically)
<button onClick={() => modal.show(recordId)}>Edit</button>

{modal.visible && (
  <dialog>
    <h2>{modal.title}</h2>
    <form onSubmit={handleSubmit(onFinish)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
      <button {...saveButtonProps}>Save</button>
      <button type="button" onClick={modal.close}>Cancel</button>
    </form>
  </dialog>
)}
```

**`syncWithLocation` with custom key:**
```typescript
syncWithLocation: { key: "category-modal", syncId: true }
// URL: ?category-modal=true&category-modal-id=123
```

---

## `useDrawerForm()` — Form in a Side Drawer

Identical API to `useModalForm` but named for drawer/slide-over UI patterns.

```typescript
import { useDrawerForm } from "@refinedev/react-hook-form";

const {
  drawer: { visible, show, close, submit, title },
  register,
  handleSubmit,
  refineCore: { onFinish, formLoading },
  saveButtonProps

} = useDrawerForm({
  refineCoreProps: {
    resource: "products",
    action: "edit",
    redirect: false
  },
  autoSubmitClose: true,
  autoResetForm: true,
  autoResetFormWhenClose: true,
  warnWhenUnsavedChanges: true,
  syncWithLocation: { key: "product-drawer", syncId: true }
});

// Open drawer for a specific record
<button onClick={() => drawer.show(recordId)}>Edit</button>

{drawer.visible && (
  <aside className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl">
    <h2>{drawer.title}</h2>
    <form onSubmit={handleSubmit(onFinish)}>
      {/* fields */}
      <button {...saveButtonProps}>Save</button>
      <button type="button" onClick={drawer.close}>Close</button>
    </form>
  </aside>
)}
```

---

## `useStepsForm()` — Multi-Step Form

```typescript
import { useStepsForm } from "@refinedev/react-hook-form";

const {
  steps: {
    currentStep,    // number — zero-indexed
    gotoStep        // (step: number) => void
  },
  register,
  handleSubmit,
  trigger,          // React Hook Form — validate fields on demand
  refineCore: { onFinish, formLoading },
  saveButtonProps

} = useStepsForm({
  refineCoreProps: {
    resource: "products",
    action: "create",
    redirect: "list"
  },

  stepsProps: {
    defaultStep: 0,
    isBackValidate: false    // Validate fields when going to previous step (default: false)
  },

  // Auto-save supported in edit mode
  autoSave: {
    enabled: true,
    debounce: 2000
  }
});

const steps = ["Basic Info", "Pricing", "Inventory"];

const stepContent = () => {
  switch (currentStep) {
    case 0: return (
      <>
        <input {...register("name")} placeholder="Product name" />
        <input {...register("sku")}  placeholder="SKU" />
      </>
    );
    case 1: return (
      <input {...register("price")} type="number" placeholder="Price" />
    );
    case 2: return (
      <input {...register("stock")} type="number" placeholder="Stock" />
    );
  }
};

// Step navigation with optional validation
const handleNext = async () => {
  const fieldsToValidate = currentStep === 0 ? ["name", "sku"] : ["price"];
  const valid = await trigger(fieldsToValidate);
  if (valid) gotoStep(currentStep + 1);
};
```

**`stepsProps.isBackValidate`:**
- `false` (default) — going to previous step skips validation
- `true` — validates current step fields when navigating backward

---

## `<AutoSaveIndicator>` Component

Shows auto-save status. Available in all UI packages:

```tsx
import { AutoSaveIndicator } from "@refinedev/core";   // headless

<AutoSaveIndicator />
// Renders based on autoSaveProps.status:
// "idle"    → nothing shown
// "loading" → "Saving..."
// "success" → "Saved"
// "error"   → "Auto-save failed"
```

---

## `<UnsavedChangesNotifier>` — Warn on Navigation

Required for `warnWhenUnsavedChanges` to work. Place once in your layout:

```tsx
import { UnsavedChangesNotifier } from "@refinedev/nextjs-router";

// app/(dashboard)/layout.tsx
export default function Layout({ children }) {
  return (
    <Refine options={{ warnWhenUnsavedChanges: true }}>
      <UnsavedChangesNotifier />
      {children}
    </Refine>
  );
}
```

---

## Server-Side Validation

All form hooks surface API field errors automatically when `HttpError.errors` is set:

```typescript
// API returns:
const httpError: HttpError = {
  message: "Validation failed",
  statusCode: 422,
  errors: {
    name:  ["Name already exists"],
    price: "Must be a positive number"
  }
};

// Form automatically populates:
// errors.name.message  → "Name already exists"
// errors.price.message → "Must be a positive number"
```
