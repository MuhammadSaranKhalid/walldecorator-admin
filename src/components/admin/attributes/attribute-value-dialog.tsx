"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createAttributeValue,
  updateAttributeValue,
} from "@/app/admin/attributes/actions";

const formSchema = z.object({
  value: z.string().min(1, "Value is required"),
  display_name: z.string().min(1, "Display name is required"),
  display_order: z.number().min(0, "Display order must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

interface AttributeValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributeId: string;
  attributeName: string;
  existingValue?: {
    id: string;
    value: string;
    display_name: string;
    display_order: number;
  };
  onSuccess: () => void;
}

export function AttributeValueDialog({
  open,
  onOpenChange,
  attributeId,
  attributeName,
  existingValue,
  onSuccess,
}: AttributeValueDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!existingValue;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingValue || {
      value: "",
      display_name: "",
      display_order: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = isEditMode
        ? await updateAttributeValue(existingValue.id, data)
        : await createAttributeValue({
            attribute_id: attributeId,
            ...data,
          });

      if (!result.success) {
        toast.error(result.error || "Failed to save attribute value");
        return;
      }

      toast.success(
        `${attributeName} value ${isEditMode ? "updated" : "created"} successfully`
      );
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error saving attribute value:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit" : "Add"} {attributeName} Value
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the ${attributeName.toLowerCase()} value details`
              : `Add a new ${attributeName.toLowerCase()} option for products`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.value}>
            <FieldLabel>Value (internal) *</FieldLabel>
            <Input
              {...register("value")}
              placeholder="e.g., metal, 2x2, 3"
              aria-invalid={!!errors.value}
            />
            <p className="text-xs text-muted-foreground">
              Internal value used in the system (lowercase, no spaces)
            </p>
            {errors.value && <FieldError errors={[errors.value]} />}
          </Field>

          <Field data-invalid={!!errors.display_name}>
            <FieldLabel>Display Name *</FieldLabel>
            <Input
              {...register("display_name")}
              placeholder="e.g., Metal, 2ft × 2ft, 3mm"
              aria-invalid={!!errors.display_name}
            />
            <p className="text-xs text-muted-foreground">
              Name shown to customers
            </p>
            {errors.display_name && <FieldError errors={[errors.display_name]} />}
          </Field>

          <Field data-invalid={!!errors.display_order}>
            <FieldLabel>Display Order *</FieldLabel>
            <Input
              {...register("display_order", { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="0"
              aria-invalid={!!errors.display_order}
            />
            <p className="text-xs text-muted-foreground">
              Order in which this value appears (lower numbers first)
            </p>
            {errors.display_order && <FieldError errors={[errors.display_order]} />}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
