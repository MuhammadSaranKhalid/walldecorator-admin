"use client";

import { useList } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { AttributeValuesList } from "@/components/admin/attributes/attribute-values-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialAttributeManager } from "@/components/admin/attributes/material-attribute-manager";

export default function AttributesPage() {
  const {
    result: attributesResult,
    query: { isLoading },
  } = useList({
    resource: "product_attributes",
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

  const attributes = attributesResult?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Loading attributes...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Attributes</h1>
        <p className="text-muted-foreground mt-2">
          Manage materials, sizes, and thickness options for your products
        </p>
      </div>

      <Tabs defaultValue="values" className="space-y-6">
        <TabsList>
          <TabsTrigger value="values">Attribute Values</TabsTrigger>
          <TabsTrigger value="mapping">Material Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="values" className="space-y-6 mt-0">
          {attributes.map((attribute: any) => (
            <AttributeValuesList
              key={attribute.id}
              attributeId={attribute.id}
              attributeDisplayName={attribute.display_name}
            />
          ))}
        </TabsContent>

        <TabsContent value="mapping" className="mt-0">
          <MaterialAttributeManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
