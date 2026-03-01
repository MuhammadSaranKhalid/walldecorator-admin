"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { FormValues } from "./types";

export function SEOFields() {
  const { control } = useFormContext<FormValues>();

  return (
    <div className="pt-4 border-t">
      <h3 className="text-sm font-semibold mb-4">SEO Settings</h3>
      <div className="space-y-4">
        <Controller
          name="seo_title"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>SEO Title</FieldLabel>
              <Input
                {...field}
                placeholder="Custom page title for search engines (leave empty to use product name)"
                maxLength={60}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                {field.value?.length || 0}/60 characters. Appears in search engine results.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="seo_description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>SEO Description</FieldLabel>
              <Textarea
                {...field}
                placeholder="Brief description for search engines (leave empty to use product description)"
                className="min-h-[80px]"
                maxLength={160}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                {field.value?.length || 0}/160 characters. Appears in search engine snippets.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </div>
  );
}
