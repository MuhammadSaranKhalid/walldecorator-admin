"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import { FormValues, Material } from "./types";

import { useSelect } from "@refinedev/core";

interface MaterialsPricingProps {
  getMaterialSuffix: (materialName: string) => string;
}

export function MaterialsPricing({
  getMaterialSuffix,
}: MaterialsPricingProps) {
  const { control, watch, setValue, getValues } = useFormContext<FormValues>();

  const { query: { data: materialsData, isLoading: materialsLoading } } = useSelect<Material>({
    resource: "materials",
    optionLabel: "name",
    optionValue: "id",
    filters: [{ field: "is_active", operator: "eq", value: true }],
    sorters: [{ field: "display_order", order: "asc" }],
    pagination: { mode: "off" },
  });

  const materials = materialsData?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials & Pricing *</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldDescription>
          Select materials and set price/inventory for each variant
        </FieldDescription>

        {watch("sku") && watch("materials")?.length > 0 && (
          <div className="bg-muted/50 border rounded-lg p-3">
            <p className="text-xs font-medium mb-2">Material Variant SKUs Preview:</p>
            <div className="space-y-1">
              {watch("materials")?.map((materialId: string) => {
                const material = materials.find((m: Material) => m.id === materialId);
                if (!material) return null;
                const baseSKU = watch("sku");
                const suffix = getMaterialSuffix(material.name);
                return (
                  <div key={materialId} className="text-xs text-muted-foreground font-mono">
                    → {baseSKU}-{suffix}{" "}
                    <span className="text-foreground/60">({material.name})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {materialsLoading ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading materials...
          </div>
        ) : materials.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
            <p className="text-sm">No materials found</p>
            <p className="text-xs mt-1">Please add materials in the admin panel first</p>
          </div>
        ) : (
          materials.map((material: Material) => {
            const selectedMaterials = watch("materials");
            const isSelected = selectedMaterials?.includes(material.id);

            return (
              <div key={material.id} className="border rounded-lg p-4 space-y-3">
                <Controller
                  name="materials"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-row items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        aria-invalid={fieldState.invalid}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, material.id]);
                            setValue(`materialPricing.${material.id}`, {
                              price: 0,
                              inventory: 0,
                              lowStockThreshold: 10,
                              finish: "",
                              compareAtPrice: 0,
                              costPrice: 0,
                            });
                          } else {
                            field.onChange(
                              field.value?.filter((value: string) => value !== material.id)
                            );
                            const currentPricing = getValues("materialPricing");
                            const { [material.id]: _, ...rest } = currentPricing;
                            setValue("materialPricing", rest);
                          }
                        }}
                      />
                      <div className="flex-1">
                        <FieldLabel className="font-semibold cursor-pointer">
                          {material.name}
                        </FieldLabel>
                        {material.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {material.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                />

                {isSelected && (
                  <div className="space-y-3 pl-7">
                    {/* Row 1: Pricing */}
                    <div className="grid grid-cols-3 gap-3">
                      <Controller
                        name={`materialPricing.${material.id}.price` as any}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className="text-xs">
                              Sale Price ($) *
                            </FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              aria-invalid={fieldState.invalid}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />

                      <Controller
                        name={`materialPricing.${material.id}.compareAtPrice` as any}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className="text-xs">
                              Compare at Price ($)
                            </FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              aria-invalid={fieldState.invalid}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            <FieldDescription className="text-xs">
                              Original price (for showing discounts)
                            </FieldDescription>
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />

                      <Controller
                        name={`materialPricing.${material.id}.costPrice` as any}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className="text-xs">
                              Cost Price ($)
                            </FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              aria-invalid={fieldState.invalid}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            <FieldDescription className="text-xs">
                              Your cost (for profit tracking)
                            </FieldDescription>
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </div>

                    {/* Row 2: Inventory & Details */}
                    <div className="grid grid-cols-3 gap-3">
                      <Controller
                        name={`materialPricing.${material.id}.inventory` as any}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className="text-xs">
                              Inventory
                            </FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              placeholder="0"
                              aria-invalid={fieldState.invalid}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />

                      <Controller
                        name={`materialPricing.${material.id}.lowStockThreshold` as any}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className="text-xs">
                              Low Stock Alert
                            </FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              placeholder="10"
                              aria-invalid={fieldState.invalid}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                            />
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />

                      <Controller
                        name={`materialPricing.${material.id}.finish` as any}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name} className="text-xs">
                              Finish
                            </FieldLabel>
                            <Input
                              {...field}
                              type="text"
                              placeholder="e.g., Brushed"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        <Controller
          name="materials"
          control={control}
          render={({ fieldState }) => (
            <div>{fieldState.error && <FieldError errors={[fieldState.error]} />}</div>
          )}
        />
      </CardContent>
    </Card>
  );
}
