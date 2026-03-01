"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Loader2, ImagePlus, X, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import Image from "next/image";
import { categories } from "@/generated/prisma";
import {
    getCategoryOptionsWithHierarchy,
    validateCategoryStructure,
    getCategoryBreadcrumb,
} from "@/lib/category-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    createCategory,
    updateCategory,
    getCategory,
    getAllCategories,
    type CategoryFormData,
} from "@/app/admin/categories/actions";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters"),
    description: z.string().optional(),
    parent_id: z.string().uuid().nullable().optional().or(z.literal("")),
    image_path: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    display_order: z.coerce.number().int().min(0, "Order must be non-negative"),
    is_visible: z.boolean().default(true),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Category = categories;

interface CategoryFormProps {
    mode: "create" | "edit";
    categoryId?: string;
    defaultParentId?: string;
}

export function CategoryForm({ mode, categoryId, defaultParentId }: CategoryFormProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [parentValidationError, setParentValidationError] = useState<string>("");
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isLoadingData, setIsLoadingData] = useState(mode === "edit");

    const isEditMode = mode === "edit";
    const isSubcategoryMode = !!defaultParentId;

    // Build hierarchical category options for parent selector
    const categoryOptions = useMemo(() => {
        return getCategoryOptionsWithHierarchy(allCategories, categoryId);
    }, [allCategories, categoryId]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            parent_id: defaultParentId || "",
            image_path: "",
            display_order: 0,
            is_visible: true,
            seo_title: "",
            seo_description: "",
        },
    });

    const {
        handleSubmit,
        setValue,
        control,
        getValues,
        watch,
        reset,
        formState: { isSubmitting },
    } = form;

    // Load categories and category data on mount
    useEffect(() => {
        async function loadData() {
            // Load all categories for parent selector
            const categoriesResponse = await getAllCategories();
            if (categoriesResponse.success && categoriesResponse.data) {
                setAllCategories(categoriesResponse.data);
            }

            // Load category data in edit mode
            if (isEditMode && categoryId) {
                setIsLoadingData(true);
                const response = await getCategory(categoryId);
                if (response.success && response.data) {
                    const category = response.data;
                    reset({
                        name: category.name,
                        slug: category.slug,
                        description: category.description || "",
                        parent_id: category.parent_id || "",
                        image_path: category.image_path || "",
                        display_order: category.display_order || 0,
                        is_visible: category.is_visible ?? true,
                        seo_title: category.seo_title || "",
                        seo_description: category.seo_description || "",
                    });
                } else {
                    toast.error(response.error || "Failed to load category");
                }
                setIsLoadingData(false);
            }
        }

        loadData();
    }, [categoryId, isEditMode, reset]);

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

            setValue("image_path", data.publicUrl);
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(`Image upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    // Validate parent selection
    const validateParentSelection = (parentId: string | null) => {
        if (!parentId || parentId === "" || parentId === "none") {
            setParentValidationError("");
            return true;
        }

        const validation = validateCategoryStructure(
            categoryId,
            parentId,
            allCategories,
            5 // Max depth of 5 levels
        );

        if (!validation.valid) {
            setParentValidationError(validation.error || "Invalid parent selection");
            return false;
        }

        setParentValidationError("");
        return true;
    };

    const onSubmit = async (values: FormValues) => {
        // Validate parent selection before submit
        const parentId = values.parent_id === "" || values.parent_id === "none" ? null : (values.parent_id ?? null);

        if (!validateParentSelection(parentId)) {
            toast.error(parentValidationError || "Invalid parent category selection");
            return;
        }

        // Prepare form data
        const formData: CategoryFormData = {
            name: values.name,
            slug: values.slug,
            description: values.description || undefined,
            parent_id: parentId,
            image_path: values.image_path || null,
            display_order: values.display_order,
            is_visible: values.is_visible,
            seo_title: values.seo_title || undefined,
            seo_description: values.seo_description || undefined,
        };

        startTransition(async () => {
            try {
                let response;

                if (isEditMode && categoryId) {
                    response = await updateCategory(categoryId, formData);
                } else {
                    response = await createCategory(formData);
                }

                if (response.success) {
                    toast.success(
                        isEditMode ? "Category updated successfully" : "Category created successfully"
                    );
                    router.push("/admin/categories");
                    router.refresh();
                } else {
                    toast.error(response.error || "Failed to save category");
                }
            } catch (error: any) {
                console.error("Form submission error:", error);
                toast.error(error.message || "An unexpected error occurred");
            }
        });
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading category...</span>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Subcategory Info Alert */}
                {isSubcategoryMode && defaultParentId && (
                    <Alert className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Creating subcategory under:{" "}
                            <strong>{getCategoryBreadcrumb(defaultParentId, allCategories)}</strong>
                            <br />
                            <span className="text-xs text-muted-foreground">
                                You can change the parent category below if needed.
                            </span>
                        </AlertDescription>
                    </Alert>
                )}

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

                    <div className="grid grid-cols-1 gap-6">
                        <Controller
                            control={control}
                            name="parent_id"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid || !!parentValidationError}>
                                    <FieldLabel>
                                        Parent Category
                                        {isSubcategoryMode && (
                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                (Pre-selected)
                                            </span>
                                        )}
                                    </FieldLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            validateParentSelection(value === "none" ? null : value);
                                        }}
                                        value={field.value || "none"}
                                    >
                                        <SelectTrigger aria-invalid={fieldState.invalid || !!parentValidationError}>
                                            <SelectValue placeholder="Select parent (optional)" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <SelectItem value="none">None (Top Level Category)</SelectItem>
                                            {categoryOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                    disabled={option.disabled}
                                                    className={option.level > 0 ? "font-normal" : "font-semibold"}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        {isSubcategoryMode
                                            ? "Parent is pre-selected. You can change it if needed."
                                            : "Organize categories into hierarchies. Max 5 levels deep."
                                        }
                                    </FieldDescription>
                                    {parentValidationError && (
                                        <Alert variant="destructive" className="mt-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{parentValidationError}</AlertDescription>
                                        </Alert>
                                    )}
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    {field.value && field.value !== "none" && !parentValidationError && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Path: {getCategoryBreadcrumb(field.value, allCategories)}
                                        </div>
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    <Controller
                        control={control}
                        name="display_order"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Display Order</FieldLabel>
                                <Input
                                    type="number"
                                    {...field}
                                    value={field.value ?? 0}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    aria-invalid={fieldState.invalid}
                                    className="max-w-xs"
                                />
                                <FieldDescription>
                                    Lower numbers appear first. Categories at the same level are sorted by this value.
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* Image Upload */}
                    <Controller
                        control={control}
                        name="image_path"
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
                                                onClick={() => setValue("image_path", "")}
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
                        name="is_visible"
                        render={({ field, fieldState }) => (
                            <Field orientation="horizontal" className="justify-between rounded-lg border p-4 shadow-sm" data-invalid={fieldState.invalid}>
                                <div className="space-y-0.5">
                                    <FieldLabel>Visible</FieldLabel>
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
                            name="seo_title"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>SEO Title</FieldLabel>
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
                            name="seo_description"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>SEO Description</FieldLabel>
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
                        <Button type="submit" disabled={isUploading || isSubmitting || isPending}>
                            {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Create Category"}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </div>
    );
}
