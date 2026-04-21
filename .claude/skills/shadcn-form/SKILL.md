---
name: shadcn-form
description: Expert guidance for building forms using the shadcn/ui approach with React Hook Form and Zod. Use when creating or refactoring forms, adding validation, working with Controller/Field/FieldLabel/FieldError, or replacing legacy FormField/FormItem patterns with the current shadcn form API.
user-invocable: true
disable-model-invocation: false
argument-hint: [form|field|validation]
allowed-tools: Read, Grep, Glob
---

# shadcn/ui Form Guide (React Hook Form + Zod)

Based on the official shadcn/ui forms documentation.

## Core Approach

Forms use:
- **React Hook Form** `useForm` for form state management
- **`<Controller />`** from React Hook Form for controlled inputs
- **`<Field />`** components for accessible, flexible markup
- **Zod** with `zodResolver` for schema validation

The `<Field />` components give **complete flexibility over markup and styling** — no monolithic form builder.

---

## Anatomy

```tsx
<Controller
  name="title"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
      <Input
        {...field}
        id={field.name}
        aria-invalid={fieldState.invalid}
        placeholder="Login button not working on mobile"
      />
      <FieldDescription>
        Provide a concise title for your bug report.
      </FieldDescription>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

---

## Setup

### 1. Define Zod Schema

```tsx
import * as z from "zod"

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
})
```

### 2. Set Up `useForm`

```tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

export function BugReportForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* fields go here */}
    </form>
  )
}
```

---

## Displaying Errors

For styling and accessibility:
- Add `data-invalid={fieldState.invalid}` to `<Field />`
- Add `aria-invalid={fieldState.invalid}` to the input control
- Render `<FieldError />` conditionally

```tsx
<Controller
  name="email"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
      <Input
        {...field}
        id={field.name}
        type="email"
        aria-invalid={fieldState.invalid}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

---

## Field Type Patterns

### Input

Spread the `field` object directly onto `<Input />`.

```tsx
<Controller
  name="name"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### Textarea

Same pattern as Input — spread `field` onto `<Textarea />`.

```tsx
<Controller
  name="about"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="about">More about you</FieldLabel>
      <Textarea
        {...field}
        id="about"
        aria-invalid={fieldState.invalid}
        placeholder="I'm a software engineer..."
        className="min-h-[120px]"
      />
      <FieldDescription>
        Tell us more about yourself.
      </FieldDescription>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### Select

Use `field.value` and `field.onChange` on `<Select />`. Add `aria-invalid` to `<SelectTrigger />`.

```tsx
<Controller
  name="language"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field orientation="responsive" data-invalid={fieldState.invalid}>
      <FieldContent>
        <FieldLabel htmlFor="language">Spoken Language</FieldLabel>
        <FieldDescription>Select the language you speak.</FieldDescription>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </FieldContent>
      <Select
        name={field.name}
        value={field.value}
        onValueChange={field.onChange}
      >
        <SelectTrigger id="language" aria-invalid={fieldState.invalid}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Spanish</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  )}
/>
```

### Checkbox (Array)

Use `field.value` and `field.onChange` with array manipulation. Add `data-slot="checkbox-group"` to `<FieldGroup />`.

```tsx
<Controller
  name="tasks"
  control={form.control}
  render={({ field, fieldState }) => (
    <FieldSet>
      <FieldLegend variant="label">Tasks</FieldLegend>
      <FieldDescription>Get notified when tasks have updates.</FieldDescription>
      <FieldGroup data-slot="checkbox-group">
        {tasks.map((task) => (
          <Field
            key={task.id}
            orientation="horizontal"
            data-invalid={fieldState.invalid}
          >
            <Checkbox
              id={`task-${task.id}`}
              name={field.name}
              aria-invalid={fieldState.invalid}
              checked={field.value.includes(task.id)}
              onCheckedChange={(checked) => {
                const newValue = checked
                  ? [...field.value, task.id]
                  : field.value.filter((value) => value !== task.id)
                field.onChange(newValue)
              }}
            />
            <FieldLabel htmlFor={`task-${task.id}`} className="font-normal">
              {task.label}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </FieldSet>
  )}
/>
```

### Radio Group

Use `field.value` and `field.onChange` on `<RadioGroup />`. Add `aria-invalid` to `<RadioGroupItem />`.

```tsx
<Controller
  name="plan"
  control={form.control}
  render={({ field, fieldState }) => (
    <FieldSet>
      <FieldLegend>Plan</FieldLegend>
      <FieldDescription>You can change your plan at any time.</FieldDescription>
      <RadioGroup
        name={field.name}
        value={field.value}
        onValueChange={field.onChange}
      >
        {plans.map((plan) => (
          <FieldLabel key={plan.id} htmlFor={`plan-${plan.id}`}>
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldTitle>{plan.title}</FieldTitle>
                <FieldDescription>{plan.description}</FieldDescription>
              </FieldContent>
              <RadioGroupItem
                value={plan.id}
                id={`plan-${plan.id}`}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </FieldSet>
  )}
/>
```

### Switch

Use `field.value` and `field.onChange` on `<Switch />`.

```tsx
<Controller
  name="twoFactor"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
      <FieldContent>
        <FieldLabel htmlFor="twoFactor">Multi-factor authentication</FieldLabel>
        <FieldDescription>Enable MFA to secure your account.</FieldDescription>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </FieldContent>
      <Switch
        id="twoFactor"
        name={field.name}
        checked={field.value}
        onCheckedChange={field.onChange}
        aria-invalid={fieldState.invalid}
      />
    </Field>
  )}
/>
```

---

## Validation Modes

```tsx
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  mode: "onChange",
})
```

| Mode          | Description                                              |
| ------------- | -------------------------------------------------------- |
| `"onChange"`  | Validation triggers on every change.                     |
| `"onBlur"`    | Validation triggers on blur.                             |
| `"onSubmit"`  | Validation triggers on submit (default).                 |
| `"onTouched"` | Validation triggers on first blur, then on every change. |
| `"all"`       | Validation triggers on blur and change.                  |

---

## Form Reset

```tsx
<Button type="button" variant="outline" onClick={() => form.reset()}>
  Reset
</Button>
```

---

## Array Fields with `useFieldArray`

### Setup

```tsx
import { useFieldArray, useForm } from "react-hook-form"

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "emails",
})
```

### Schema

```tsx
const formSchema = z.object({
  emails: z
    .array(
      z.object({
        address: z.string().email("Enter a valid email address."),
      })
    )
    .min(1, "Add at least one email address.")
    .max(5, "You can add up to 5 email addresses."),
})
```

### Structure

Wrap in `<FieldSet />` with `<FieldLegend />`.

```tsx
<FieldSet className="gap-4">
  <FieldLegend variant="label">Email Addresses</FieldLegend>
  <FieldDescription>Add up to 5 email addresses.</FieldDescription>
  <FieldGroup className="gap-4">
    {fields.map((field, index) => (
      <Controller
        key={field.id}  // Always field.id — never index
        name={`emails.${index}.address`}
        control={form.control}
        render={({ field: controllerField, fieldState }) => (
          <Field orientation="horizontal" data-invalid={fieldState.invalid}>
            <FieldContent>
              <Input
                {...controllerField}
                id={`email-${index}`}
                aria-invalid={fieldState.invalid}
                placeholder="name@example.com"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => remove(index)}
                aria-label={`Remove email ${index + 1}`}
              >
                <XIcon />
              </Button>
            )}
          </Field>
        )}
      />
    ))}
  </FieldGroup>
</FieldSet>

<Button
  type="button"
  variant="outline"
  size="sm"
  onClick={() => append({ address: "" })}
  disabled={fields.length >= 5}
>
  Add Email Address
</Button>
```

---

## Key Rules

1. Always add `data-invalid={fieldState.invalid}` to `<Field />` for styling
2. Always add `aria-invalid={fieldState.invalid}` to the input control for accessibility
3. Render `<FieldError />` conditionally — only when `fieldState.invalid` is true
4. For **Select**: `aria-invalid` goes on `<SelectTrigger />`, not `<Select />`
5. For **array fields**: always use `field.id` as the React key, never `index`
6. `<FieldDescription />` goes inside `<Field />` or `<FieldContent />` for proper `aria-describedby` wiring
