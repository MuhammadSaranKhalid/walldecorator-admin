"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import { FormValues, Category } from "./types";

import { useSelect } from "@refinedev/core";

interface ProductSettingsProps { }

export function ProductSettings() {
  const { control } = useFormContext<FormValues>();

  const { query: { data: categoriesData, isLoading: categoriesLoading } } = useSelect<Category>({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
    sorters: [{ field: "display_order", order: "asc" }],
    pagination: { mode: "off" },
  });

  const categories = categoriesData?.data || [];

  // Helper function to format categories hierarchically
  const getCategoryDisplayName = (category: Category): string => {
    if (category.parent_id) {
      const parent = categories.find((c) => c.id === category.parent_id);
      if (parent) {
        return `${parent.name} → ${category.name}`;
      }
    }
    return category.name;
  };

  // Sort categories to show parents first, then children
  const sortedCategories = [...categories].sort((a, b) => {
    if (!a.parent_id && b.parent_id) return -1;
    if (a.parent_id && !b.parent_id) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="category_id"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Category (Optional)</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "none" ? "" : value);
                  }}
                  value={field.value || "none"}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue
                      placeholder={categoriesLoading ? "Loading..." : "Select category"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {sortedCategories.length === 0 && !categoriesLoading ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No categories available
                      </div>
                    ) : (
                      sortedCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {getCategoryDisplayName(category)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Status *</FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
