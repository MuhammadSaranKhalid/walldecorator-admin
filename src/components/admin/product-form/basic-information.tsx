"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { FormValues } from "./types";

interface BasicInformationProps {
  handleNameChange: (value: string) => void;
  children?: React.ReactNode;
}

export function BasicInformation({
  handleNameChange,
  children,
}: BasicInformationProps) {
  const { control } = useFormContext<FormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Product Name *</FieldLabel>
              <Input
                {...field}
                placeholder="Geometric Lion Head"
                aria-invalid={fieldState.invalid}
                onChange={(e) => {
                  field.onChange(e);
                  handleNameChange(e.target.value);
                }}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="slug"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Slug *</FieldLabel>
                <Input
                  {...field}
                  placeholder="geometric-lion-head"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>Auto-generated from name</FieldDescription>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="sku"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Base SKU</FieldLabel>
                <Input
                  {...field}
                  placeholder="Auto-generated on save"
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
                <FieldDescription>
                  SKU will be automatically generated when product is saved.
                </FieldDescription>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description *</FieldLabel>
              <Textarea
                {...field}
                placeholder="Detailed product description..."
                className="min-h-[100px]"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {children}
      </CardContent>
    </Card>
  );
}
