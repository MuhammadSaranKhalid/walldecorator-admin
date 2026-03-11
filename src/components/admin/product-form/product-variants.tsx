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
import { useSelect, useList } from "@refinedev/core";

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

  // Fetch Existing Relationships for filtering
  const { result: relationshipsResult } = useList({
    resource: "material_attribute_relationships",
    pagination: { mode: "off" },
  });

  const relationships = relationshipsResult?.data || [];

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
      inventory: {
        quantity_on_hand: 0,
        low_stock_threshold: 5,
        allow_backorder: false,
      },
    });
  };

  // Check if a specific size + thickness combo is used
  const isCombinationUsed = (currentIndex: number, materialId: string, sizeId: string, thicknessId: string) => {
    if (!materialId || !sizeId || !thicknessId) return false;

    return fields.some((field, index) => {
      if (index === currentIndex) return false;
      const variant = watch(`variants.${index}`);
      return (
        variant.material_id === materialId &&
        variant.size_id === sizeId &&
        variant.thickness_id === thicknessId
      );
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">Product Variants *</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create variants for different material, size, and thickness combinations
          </p>
        </div>
        <Button type="button" onClick={addVariant} size="default" className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading attributes...
          </div>
        ) : fields.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
            <p className="text-sm font-medium">No variants added yet</p>
            <p className="text-xs mt-2">Click "Add Variant" to create your first variant</p>
          </div>
        ) : (
          fields.map((field, index) => {
            const selectedMaterialId = watch(`variants.${index}.material_id`);
            const selectedSizeId = watch(`variants.${index}.size_id`);

            // Filter sizes based on selected material
            const filteredSizes = selectedMaterialId
              ? sizes.filter((size: any) => {
                // First check if size is available for this material
                if (!relationships.some((r: any) => r.material_id === selectedMaterialId && r.attribute_value_id === size.value)) {
                  return false;
                }
                // Then check if ALL thicknesses for this size are already used
                const availableThicknesses = thicknesses.filter((t: any) => {
                  const isRelated = relationships.some((r: any) => r.material_id === selectedMaterialId && r.attribute_value_id === t.value);
                  const isUsed = isCombinationUsed(index, selectedMaterialId, size.value, t.value);
                  return isRelated && !isUsed;
                });
                return availableThicknesses.length > 0;
              })
              : [];

            // Filter thicknesses based on selected material and size
            const filteredThicknesses = selectedMaterialId
              ? thicknesses.filter((thickness: any) => {
                // Check if thickness is available for this material
                if (!relationships.some((r: any) => r.material_id === selectedMaterialId && r.attribute_value_id === thickness.value)) {
                  return false;
                }
                // If a size is selected, filter out used combinations
                if (selectedSizeId) {
                  return !isCombinationUsed(index, selectedMaterialId, selectedSizeId, thickness.value);
                }
                return true;
              })
              : [];

            return (
              <div key={field.id} className="border rounded-lg p-6 space-y-5 bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-base">
                      Variant {index + 1}
                    </h4>
                    {watch(`variants.${index}.is_default`) && (
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    title="Remove variant"
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Row 1: Attributes */}
                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name={`variants.${index}.material_id`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Material *</FieldLabel>
                        <Select
                          value={controllerField.value}
                          onValueChange={(val) => {
                            controllerField.onChange(val);
                            // Clear size and thickness when material changes
                            setValue(`variants.${index}.size_id`, "");
                            setValue(`variants.${index}.thickness_id`, "");
                          }}
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
                          disabled={!selectedMaterialId || filteredSizes.length === 0}
                        >
                          <SelectTrigger aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder={
                              !selectedMaterialId
                                ? "Select material first"
                                : filteredSizes.length === 0
                                  ? "No sizes available"
                                  : "Select size"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSizes.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                {selectedMaterialId ? "No available sizes for this material" : "No sizes configured for this material"}
                              </div>
                            ) : (
                              filteredSizes.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {selectedMaterialId && filteredSizes.length === 0 && (
                          <FieldDescription className="text-xs text-destructive">
                            No sizes available for this material. Please configure relationships first.
                          </FieldDescription>
                        )}
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
                          disabled={!selectedMaterialId || filteredThicknesses.length === 0}
                        >
                          <SelectTrigger aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder={
                              !selectedMaterialId
                                ? "Select material first"
                                : filteredThicknesses.length === 0
                                  ? "No thicknesses available"
                                  : "Select thickness"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredThicknesses.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                {selectedMaterialId ? "No available thicknesses for this material" : "No thicknesses configured for this material"}
                              </div>
                            ) : (
                              filteredThicknesses.map((thickness) => (
                                <SelectItem key={thickness.value} value={thickness.value}>
                                  {thickness.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {selectedMaterialId && filteredThicknesses.length === 0 && (
                          <FieldDescription className="text-xs text-destructive">
                            No thicknesses available for this material. Please configure relationships first.
                          </FieldDescription>
                        )}
                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                {/* Row 2: Pricing */}
                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name={`variants.${index}.price`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Price (Rs.) *</FieldLabel>
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
                        <FieldLabel>Compare at Price (Rs.)</FieldLabel>
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
                        <FieldDescription className="text-xs text-muted-foreground">
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
                        <FieldLabel>Cost per Item (Rs.)</FieldLabel>
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
                        <FieldDescription className="text-xs text-muted-foreground">
                          Your cost (for profit tracking)
                        </FieldDescription>
                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                {/* Row 3: Inventory */}
                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name={`variants.${index}.inventory.quantity_on_hand`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Stock Quantity *</FieldLabel>
                        <Input
                          {...controllerField}
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          aria-invalid={fieldState.invalid}
                          onChange={(e) =>
                            controllerField.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                        <FieldDescription className="text-xs text-muted-foreground">
                          Available units in stock
                        </FieldDescription>
                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name={`variants.${index}.inventory.low_stock_threshold`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Low Stock Threshold</FieldLabel>
                        <Input
                          {...controllerField}
                          type="number"
                          step="1"
                          min="0"
                          placeholder="5"
                          aria-invalid={fieldState.invalid}
                          onChange={(e) =>
                            controllerField.onChange(parseInt(e.target.value) || 5)
                          }
                        />
                        <FieldDescription className="text-xs text-muted-foreground">
                          Alert when stock falls below this
                        </FieldDescription>
                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name={`variants.${index}.inventory.allow_backorder`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Allow Backorder</FieldLabel>
                        <div className="flex items-center space-x-2 h-10">
                          <Checkbox
                            checked={controllerField.value || false}
                            onCheckedChange={controllerField.onChange}
                          />
                          <span className="text-sm text-muted-foreground">
                            Accept orders when out of stock
                          </span>
                        </div>
                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                {/* Display reserved/available stock for existing variants */}
                {watch(`variants.${index}.inventory.quantity_reserved`) !== undefined && (
                  <div className="grid grid-cols-2 gap-4 px-4 py-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="text-sm">
                      <span className="text-muted-foreground font-medium">Reserved:</span>
                      <span className="ml-2 font-semibold">
                        {watch(`variants.${index}.inventory.quantity_reserved`) || 0}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground font-medium">Available:</span>
                      <span className="ml-2 font-semibold">
                        {watch(`variants.${index}.inventory.quantity_available`) || 0}
                      </span>
                    </div>
                  </div>
                )}

                {/* Row 4: Default checkbox */}
                <Controller
                  name={`variants.${index}.is_default`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <div className="flex flex-row items-start space-x-3 pt-2 border-t">
                      <Checkbox
                        id={`variant-${index}-default`}
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
                        <label
                          htmlFor={`variant-${index}-default`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Set as default variant
                        </label>
                        <p className="text-xs text-muted-foreground">
                          This variant will be shown by default on the product page
                        </p>
                      </div>
                    </div>
                  )}
                />
              </div>
            );
          })
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
