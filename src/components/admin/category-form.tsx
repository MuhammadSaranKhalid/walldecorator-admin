"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelect } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Controller } from "react-hook-form";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
    FieldGroup,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import Image from "next/image";
import { Tables } from "@/types/supabase";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters"),
    description: z.string().optional(),
    parent_id: z.string().uuid().nullable().optional().or(z.literal("")),
    image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    display_order: z.coerce.number().int().min(0, "Order must be non-negative"),
    is_active: z.boolean().default(true),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Category = Tables<"categories">;

interface CategoryFormProps {
    mode: "create" | "edit";
    categoryId?: string;
}

export function CategoryForm({ mode, categoryId }: CategoryFormProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const isEditMode = mode === "edit";

    // Fetch parent categories options
    const { options: categoryOptions } = useSelect<Category>({
        resource: "categories",
        optionLabel: "name",
        optionValue: "id",
        sorters: [{ field: "name", order: "asc" }],
        pagination: { mode: "off" },
    });

    const form = useForm<any, any, FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            parent_id: "", // "" handles empty selection
            image_url: "",
            display_order: 0,
            is_active: true,
            meta_title: "",
            meta_description: "",
        },
        refineCoreProps: {
            resource: "categories",
            action: mode,
            id: categoryId,
            redirect: false,
            onMutationSuccess: () => {
                toast.success(`Category ${mode === "create" ? "created" : "updated"} successfully`);
                router.push("/admin/categories");
            },
            onMutationError: (error) => {
                console.error("Submission error:", error);
                toast.error(`Error saving category: ${error?.message || "Unknown error"}`);
            }
        },
    });

    const {
        saveButtonProps,
        refineCore: { onFinish, formLoading },
        handleSubmit,
        setValue,
        control,
        getValues,
    } = form;

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        if (!isEditMode || !getValues("slug")) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setValue("slug", slug);
        }
    };

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `categories/${fileName}`;

            const { error: uploadError } = await supabaseBrowserClient.storage
                .from("product-images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabaseBrowserClient.storage
                .from("product-images")
                .getPublicUrl(filePath);

            setValue("image_url", data.publicUrl);
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(`Image upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (values: FormValues) => {
        // Clean data: convert empty strings to null for UUID/Optional fields
        const payload = {
            ...values,
            parent_id: values.parent_id === "" || values.parent_id === "none" ? null : values.parent_id,
            image_url: values.image_url === "" ? null : values.image_url,
        };

        await onFinish(payload as any);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller
                            control={control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Name</FieldLabel>
                                    <Input
                                        placeholder="Category Name"
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            handleNameChange(e.target.value);
                                        }}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="slug"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Slug</FieldLabel>
                                    <Input
                                        placeholder="category-slug"
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>Unique URL identifier.</FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    <Controller
                        control={control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Description</FieldLabel>
                                <Textarea
                                    placeholder="Category description..."
                                    {...field}
                                    value={field.value ?? ""}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller
                            control={control}
                            name="parent_id"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Parent Category</FieldLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || "none"}
                                        value={field.value || "none"}
                                    >
                                        <SelectTrigger aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select parent (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (Top Level)</SelectItem>
                                            {categoryOptions
                                                .filter((c) => c.value !== categoryId) // Prevent self-parenting
                                                .map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="display_order"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Display Order</FieldLabel>
                                    <Input
                                        type="number"
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    {/* Image Upload */}
                    <Controller
                        control={control}
                        name="image_url"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Category Image</FieldLabel>
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                                    {field.value ? (
                                        <div className="relative w-40 h-40 border rounded-md overflow-hidden group mx-auto">
                                            <Image
                                                src={field.value}
                                                alt="Category preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setValue("image_url", "")}
                                                className="absolute top-1 right-1 bg-destructive/90 text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-40 w-40 mx-auto border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-background">
                                            <ImagePlus className="h-8 w-8 mb-2 opacity-50" />
                                            <span className="text-xs">No image</span>
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isUploading}
                                            onClick={() => document.getElementById("cat-image-upload")?.click()}
                                            className="w-full max-w-[200px]"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <ImagePlus className="h-4 w-4 mr-2" />
                                            )}
                                            {field.value ? "Change Image" : "Upload Image"}
                                        </Button>
                                        <input
                                            id="cat-image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                </div>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="is_active"
                        render={({ field, fieldState }) => (
                            <Field orientation="horizontal" className="justify-between rounded-lg border p-4 shadow-sm" data-invalid={fieldState.invalid}>
                                <div className="space-y-0.5">
                                    <FieldLabel>Active</FieldLabel>
                                    <FieldDescription>
                                        Visible in the store.
                                    </FieldDescription>
                                </div>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    aria-invalid={fieldState.invalid}
                                />
                            </Field>
                        )}
                    />

                    {/* SEO Meta Fields */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-medium text-muted-foreground">SEO Settings</h3>
                        <Controller
                            control={control}
                            name="meta_title"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Meta Title</FieldLabel>
                                    <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            control={control}
                            name="meta_description"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Meta Description</FieldLabel>
                                    <Textarea
                                        className="h-20"
                                        {...field}
                                        value={field.value ?? ""}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUploading || formLoading}>
                            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Create Category"}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </div>
    );
}
