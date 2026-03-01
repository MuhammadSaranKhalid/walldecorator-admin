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
                  Display this product in the featured section on the homepage
                </FieldDescription>
              </div>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
