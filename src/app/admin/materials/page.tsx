"use client";

import { useTable } from "@refinedev/react-table";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Trash, Plus } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { useDelete, type HttpError } from "@refinedev/core";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Controller } from "react-hook-form";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
    FieldGroup,
} from "@/components/ui/field";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const materialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
    description: z.string().optional(),
    is_active: z.boolean().default(true).optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

export default function MaterialsList() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const { mutate: deleteMaterial } = useDelete();

    const columns = useMemo<ColumnDef<Tables<"materials">>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
            },
            {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }) => (
                    <span className="truncate max-w-[300px] block" title={row.getValue("description")}>
                        {row.getValue("description")}
                    </span>
                ),
            },
            {
                accessorKey: "created_at",
                header: "Created At",
                cell: ({ row }) => {
                    return format(new Date(row.getValue("created_at")), "MMM d, yyyy HH:mm");
                },
            },
            {
                accessorKey: "is_active",
                header: "Status",
                cell: ({ row }) => {
                    const isActive = row.getValue("is_active");
                    return (
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {isActive ? "Active" : "Inactive"}
                        </div>
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const material = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => setEditingId(material.id)}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this material?")) {
                                            deleteMaterial({
                                                resource: "materials",
                                                id: material.id,
                                            });
                                        }
                                    }}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [deleteMaterial]
    );

    const table = useTable({
        refineCoreProps: {
            resource: "materials",
            sorters: {
                initial: [
                    {
                        field: "created_at",
                        order: "desc",
                    },
                ],
            },
        },
        columns,
    });

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight">Materials</h1>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Material
                    </Button>
                </div>
                <DataTable table={table} />
            </div>

            <MaterialDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />

            {editingId && (
                <MaterialDialog
                    id={editingId}
                    open={!!editingId}
                    onOpenChange={(open) => !open && setEditingId(null)}
                />
            )}
        </>
    );
}

interface MaterialDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    id?: string | number | null;
}

function MaterialDialog({ open, onOpenChange, id }: MaterialDialogProps) {
    const isEdit = !!id;
    const {
        control,
        refineCore: { onFinish, formLoading, query: queryResult },
        handleSubmit,
        reset,
        setValue,
    } = useForm<Tables<"materials">, HttpError, MaterialFormValues>({
        resolver: zodResolver(materialSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            is_active: true,
        },
        refineCoreProps: {
            resource: "materials",
            action: isEdit ? "edit" : "create",
            id: id ?? undefined,
            redirect: false,
            onMutationSuccess: () => {
                onOpenChange(false);
                if (!isEdit) {
                    reset();
                }
            },
        },
    });

    const material = queryResult?.data?.data;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Material" : "Create Material"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? `Edit details for ${material?.name}` : "Add a new material for your products."}
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit(onFinish)}
                    className="space-y-4 py-4"
                >
                    <FieldGroup>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Material name"
                                        aria-invalid={fieldState.invalid}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            // Auto-generate slug from name only if creating
                                            if (!isEdit) {
                                                const slug = e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9]+/g, "-")
                                                    .replace(/(^-|-$)+/g, "");
                                                setValue("slug", slug);
                                            }
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
                                    <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="material-slug"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <FieldDescription>
                                        Unique identifier for URLs (e.g. "matte-black").
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                        <Controller
                            control={control}
                            name="description"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                                    <Textarea
                                        {...field}
                                        id={field.name}
                                        placeholder="Material description"
                                        className="resize-none"
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
                            name="is_active"
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                                    <div className="space-y-0.5">
                                        <FieldLabel className="text-base">Active Status</FieldLabel>
                                        <FieldDescription>
                                            Whether this material is available for selection.
                                        </FieldDescription>
                                    </div>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={formLoading}
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
