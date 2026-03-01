"use client";

import { useState } from "react";
import { useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { deleteAttributeValue } from "@/app/admin/attributes/actions";
import { AttributeValueDialog } from "./attribute-value-dialog";

interface AttributeValuesListProps {
  attributeId: string;
  attributeDisplayName: string;
}

export function AttributeValuesList({
  attributeId,
  attributeDisplayName,
}: AttributeValuesListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingValue, setDeletingValue] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    result: valuesResult,
    query: { isLoading, refetch },
  } = useList({
    resource: "product_attribute_values",
    filters: [
      {
        field: "attribute_id",
        operator: "eq",
        value: attributeId,
      },
    ],
    sorters: [
      {
        field: "display_order",
        order: "asc",
      },
    ],
    pagination: {
      mode: "off",
    },
  });

  const values = valuesResult?.data || [];

  const handleEdit = (value: any) => {
    setEditingValue(value);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingValue(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (value: any) => {
    setDeletingValue(value);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingValue) return;

    setIsDeleting(true);
    try {
      const result = await deleteAttributeValue(deletingValue.id);

      if (!result.success) {
        toast.error(result.error || "Failed to delete attribute value");
        return;
      }

      toast.success(`${attributeDisplayName} value deleted successfully`);
      refetch();
      setDeleteDialogOpen(false);
      setDeletingValue(null);
    } catch (error: any) {
      console.error("Error deleting attribute value:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{attributeDisplayName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage {attributeDisplayName.toLowerCase()} options for products
            </p>
          </div>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Value
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : values.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No {attributeDisplayName.toLowerCase()} values yet</p>
              <p className="text-sm mt-1">
                Click &quot;Add Value&quot; to create your first option
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead className="w-32">Display Order</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {values.map((value: any) => (
                  <TableRow key={value.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {value.value}
                    </TableCell>
                    <TableCell>{value.display_name}</TableCell>
                    <TableCell>{value.display_order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(value)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(value)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AttributeValueDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingValue(null);
        }}
        attributeId={attributeId}
        attributeName={attributeDisplayName}
        existingValue={editingValue}
        onSuccess={() => refetch()}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the {attributeDisplayName.toLowerCase()} value &quot;
              {deletingValue?.display_name}&quot;. This action cannot be undone.
              {"\n\n"}
              If this value is being used in any product variants, the deletion
              will be prevented.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
