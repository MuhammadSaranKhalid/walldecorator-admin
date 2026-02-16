"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel, FieldDescription } from "@/components/ui/field";
import { FormValues } from "./types";

export function DisplayOptions() {
  const { control } = useFormContext<FormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Controller
          name="is_featured"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-row items-start space-x-3">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <div className="space-y-1 leading-none">
                <FieldLabel>Featured Product</FieldLabel>
                <FieldDescription>
                  Display this product in the featured section
                </FieldDescription>
              </div>
            </div>
          )}
        />

        <Controller
          name="is_new_arrival"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-row items-start space-x-3">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <div className="space-y-1 leading-none">
                <FieldLabel>New Arrival</FieldLabel>
                <FieldDescription>Mark as a new arrival product</FieldDescription>
              </div>
            </div>
          )}
        />

        <Controller
          name="is_best_seller"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-row items-start space-x-3">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <div className="space-y-1 leading-none">
                <FieldLabel>Best Seller</FieldLabel>
                <FieldDescription>Mark as a best seller product</FieldDescription>
              </div>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
