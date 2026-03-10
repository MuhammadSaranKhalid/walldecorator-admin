"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleMaterialAttributeRelationship, getMaterialAttributeData } from "@/app/admin/attributes/actions";

export function MaterialAttributeManager() {
    const [toggling, setToggling] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [materials, setMaterials] = useState<any[]>([]);
    const [attributes, setAttributes] = useState<any[]>([]);
    const [relationships, setRelationships] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const loadData = async () => {
        setIsLoading(true);
        try {
            const result = await getMaterialAttributeData();
            if (result.success && result.data) {
                setMaterials(result.data.materials);
                setAttributes([...result.data.sizes, ...result.data.thicknesses]);
                setRelationships(result.data.relationships);
            } else {
                toast.error(result.error || "Failed to load data");
            }
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter materials based on search query
    const filteredMaterials = useMemo(() => {
        if (!searchQuery.trim()) return materials;
        const query = searchQuery.toLowerCase();
        return materials.filter((material) =>
            material.display_name.toLowerCase().includes(query) ||
            material.value.toLowerCase().includes(query)
        );
    }, [materials, searchQuery]);

    // Group attributes by type
    const { sizes, thicknesses } = useMemo(() => {
        const sizes = attributes.filter((attr) => attr.product_attributes?.name === "size");
        const thicknesses = attributes.filter((attr) => attr.product_attributes?.name === "thickness");
        return { sizes, thicknesses };
    }, [attributes]);

    // Get relationship count for a material
    const getRelationshipCount = (materialId: string) => {
        return relationships.filter((r) => r.material_id === materialId).length;
    };

    // Check if an attribute is enabled for a material
    const isAttributeEnabled = (materialId: string, attributeId: string) => {
        return relationships.some(
            (r) => r.material_id === materialId && r.attribute_value_id === attributeId
        );
    };

    // Check if all attributes are enabled for a material
    const areAllEnabled = (materialId: string) => {
        return attributes.every((attr) =>
            relationships.some((r) => r.material_id === materialId && r.attribute_value_id === attr.id)
        );
    };

    const handleToggle = async (materialId: string, attributeId: string, enabled: boolean) => {
        const key = `${materialId}-${attributeId}`;
        setToggling(key);
        try {
            const result = await toggleMaterialAttributeRelationship(materialId, attributeId, enabled);
            if (!result.success) {
                toast.error(result.error || "Failed to update relationship");
            } else {
                await loadData();
                toast.success("Relationship updated");
            }
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setToggling(null);
        }
    };

    const handleToggleAll = async (materialId: string) => {
        const allEnabled = areAllEnabled(materialId);
        setToggling(`all-${materialId}`);

        try {
            const promises = attributes.map((attr) =>
                toggleMaterialAttributeRelationship(materialId, attr.id, !allEnabled)
            );

            const results = await Promise.all(promises);
            const failed = results.filter((r) => !r.success);

            if (failed.length > 0) {
                toast.error(`Failed to update ${failed.length} relationship(s)`);
            } else {
                await loadData();
                toast.success(allEnabled ? "All relationships disabled" : "All relationships enabled");
            }
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setToggling(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading relationships...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Search */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Material-Attribute Relationships</h2>
                    <p className="text-muted-foreground">
                        Define which sizes and thicknesses are available for each material.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {searchQuery && (
                        <Badge variant="secondary">
                            {filteredMaterials.length} of {materials.length} materials
                        </Badge>
                    )}
                </div>
            </div>

            {/* Material Cards Grid */}
            {filteredMaterials.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        {searchQuery ? "No materials match your search" : "No materials available"}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredMaterials.map((material: any) => {
                        const count = getRelationshipCount(material.id);
                        const isBulkToggling = toggling === `all-${material.id}`;

                        return (
                            <Card key={material.id} className="overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-shadow">
                                {/* Card Header */}
                                <div className="flex items-start justify-between px-6 pb-4">
                                    <div className="space-y-1.5">
                                        <h3 className="font-semibold text-xl leading-none tracking-tight">
                                            {material.display_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {count}/{attributes.length} Active
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:bg-muted"
                                                disabled={isBulkToggling}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleToggleAll(material.id)}>
                                                {areAllEnabled(material.id) ? "Deselect all" : "Select all"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <CardContent className="space-y-5 px-6 pb-6 pt-0">
                                    {/* Sizes Section */}
                                    {sizes.length > 0 && (
                                        <div className="space-y-2.5">
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                Sizes
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {sizes.map((size: any) => {
                                                    const isEnabled = isAttributeEnabled(material.id, size.id);
                                                    const key = `${material.id}-${size.id}`;
                                                    const isToggling = toggling === key;

                                                    return (
                                                        <Button
                                                            key={size.id}
                                                            variant={isEnabled ? "default" : "outline"}
                                                            size="sm"
                                                            className={`h-9 px-4 text-sm font-medium rounded-md transition-all ${
                                                                isEnabled
                                                                    ? "bg-foreground text-background hover:bg-foreground/90"
                                                                    : "hover:bg-muted"
                                                            }`}
                                                            onClick={() => handleToggle(material.id, size.id, !isEnabled)}
                                                            disabled={isToggling || isBulkToggling}
                                                        >
                                                            {isToggling && (
                                                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                                            )}
                                                            <span>{size.display_name}</span>
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Thicknesses Section */}
                                    {thicknesses.length > 0 && (
                                        <div className="space-y-2.5">
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                Thicknesses
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {thicknesses.map((thickness: any) => {
                                                    const isEnabled = isAttributeEnabled(material.id, thickness.id);
                                                    const key = `${material.id}-${thickness.id}`;
                                                    const isToggling = toggling === key;

                                                    return (
                                                        <Button
                                                            key={thickness.id}
                                                            variant={isEnabled ? "default" : "outline"}
                                                            size="sm"
                                                            className={`h-9 px-4 text-sm font-medium rounded-md transition-all ${
                                                                isEnabled
                                                                    ? "bg-foreground text-background hover:bg-foreground/90"
                                                                    : "hover:bg-muted"
                                                            }`}
                                                            onClick={() => handleToggle(material.id, thickness.id, !isEnabled)}
                                                            disabled={isToggling || isBulkToggling}
                                                        >
                                                            {isToggling && (
                                                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                                            )}
                                                            <span>{thickness.display_name}</span>
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
