"use client";

import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { FormValues } from "./types";
import { useSelect } from "@refinedev/core";

export function ProductVariants() {
  const { control, watch, setValue } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // First, fetch product attributes to get their IDs
  const { query: attributesQuery } = useSelect({
    resource: "product_attributes",
    optionLabel: "name",
    optionValue: "id",
    pagination: { mode: "off" },
  });

  const attributes = attributesQuery?.data?.data || [];
  const materialAttr = attributes.find((attr: any) => attr.name === 'material');
  const sizeAttr = attributes.find((attr: any) => attr.name === 'size');
  const thicknessAttr = attributes.find((attr: any) => attr.name === 'thickness');

  // Fetch attribute values for materials
  const { options: materials, query: materialsQuery } = useSelect({
    resource: "product_attribute_values",
    optionLabel: "display_name",
    optionValue: "id",
    filters: materialAttr ? [
      {
        field: "attribute_id",
        operator: "eq",
        value: materialAttr.id,
      },
    ] : [],
    sorters: [{ field: "display_order", order: "asc" }],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!materialAttr,
    },
  });

  // Fetch attribute values for sizes
  const { options: sizes, query: sizesQuery } = useSelect({
    resource: "product_attribute_values",
    optionLabel: "display_name",
    optionValue: "id",
    filters: sizeAttr ? [
      {
        field: "attribute_id",
        operator: "eq",
        value: sizeAttr.id,
      },
    ] : [],
    sorters: [{ field: "display_order", order: "asc" }],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!sizeAttr,
    },
  });

  // Fetch attribute values for thickness
  const { options: thicknesses, query: thicknessQuery } = useSelect({
    resource: "product_attribute_values",
    optionLabel: "display_name",
    optionValue: "id",
    filters: thicknessAttr ? [
      {
        field: "attribute_id",
        operator: "eq",
        value: thicknessAttr.id,
      },
    ] : [],
    sorters: [{ field: "display_order", order: "asc" }],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!thicknessAttr,
    },
  });

  const isLoading =
    attributesQuery?.isLoading ||
    materialsQuery?.isLoading ||
    sizesQuery?.isLoading ||
    thicknessQuery?.isLoading;

  const addVariant = () => {
    append({
      material_id: "",
      size_id: "",
      thickness_id: "",
      price: 0,
      compare_at_price: null,
      cost_per_item: null,
      is_default: fields.length === 0, // First variant is default
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Product Variants *</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Create variants for different material, size, and thickness combinations
          </p>
        </div>
        <Button type="button" onClick={addVariant} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading attributes...
          </div>
        ) : fields.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
            <p className="text-sm">No variants added yet</p>
            <p className="text-xs mt-1">Click "Add Variant" to create your first variant</p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">
                  Variant {index + 1}
                  {watch(`variants.${index}.is_default`) && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  title="Remove variant"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Row 1: Attributes */}
              <div className="grid grid-cols-3 gap-3">
                <Controller
                  name={`variants.${index}.material_id`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Material *</FieldLabel>
                      <Select
                        value={controllerField.value}
                        onValueChange={controllerField.onChange}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material.value} value={material.value}>
                              {material.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name={`variants.${index}.size_id`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Size *</FieldLabel>
                      <Select
                        value={controllerField.value}
                        onValueChange={controllerField.onChange}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name={`variants.${index}.thickness_id`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Thickness *</FieldLabel>
                      <Select
                        value={controllerField.value}
                        onValueChange={controllerField.onChange}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select thickness" />
                        </SelectTrigger>
                        <SelectContent>
                          {thicknesses.map((thickness) => (
                            <SelectItem key={thickness.value} value={thickness.value}>
                              {thickness.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              {/* Row 2: Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <Controller
                  name={`variants.${index}.price`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Price ($) *</FieldLabel>
                      <Input
                        {...controllerField}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        aria-invalid={fieldState.invalid}
                        onChange={(e) =>
                          controllerField.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name={`variants.${index}.compare_at_price`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Compare at Price ($)</FieldLabel>
                      <Input
                        {...controllerField}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        aria-invalid={fieldState.invalid}
                        value={controllerField.value || ""}
                        onChange={(e) =>
                          controllerField.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                      <FieldDescription className="text-xs">
                        Original price (for showing discounts)
                      </FieldDescription>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name={`variants.${index}.cost_per_item`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Cost per Item ($)</FieldLabel>
                      <Input
                        {...controllerField}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        aria-invalid={fieldState.invalid}
                        value={controllerField.value || ""}
                        onChange={(e) =>
                          controllerField.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                      <FieldDescription className="text-xs">
                        Your cost (for profit tracking)
                      </FieldDescription>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              {/* Row 3: Default checkbox */}
              <Controller
                name={`variants.${index}.is_default`}
                control={control}
                render={({ field: controllerField }) => (
                  <div className="flex flex-row items-start space-x-3">
                    <Checkbox
                      checked={controllerField.value || false}
                      onCheckedChange={(checked) => {
                        // Uncheck all other variants
                        if (checked) {
                          fields.forEach((_, i) => {
                            if (i !== index) {
                              setValue(`variants.${i}.is_default`, false);
                            }
                          });
                        }
                        controllerField.onChange(checked);
                      }}
                    />
                    <div className="space-y-1 leading-none">
                      <FieldLabel className="cursor-pointer">
                        Set as default variant
                      </FieldLabel>
                      <FieldDescription>
                        This variant will be shown by default on the product page
                      </FieldDescription>
                    </div>
                  </div>
                )}
              />
            </div>
          ))
        )}

        <Controller
          name="variants"
          control={control}
          render={({ fieldState }) => (
            <div>{fieldState.error && <FieldError errors={[fieldState.error]} />}</div>
          )}
        />
      </CardContent>
    </Card>
  );
}
