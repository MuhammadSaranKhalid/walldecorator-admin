"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface AttributeValueInput {
  attribute_id: string;
  value: string;
  display_name: string;
  display_order?: number;
}

export async function createAttributeValue(input: AttributeValueInput) {
  try {
    const attributeValue = await prisma.product_attribute_values.create({
      data: {
        attribute_id: input.attribute_id,
        value: input.value,
        display_name: input.display_name,
        display_order: input.display_order || 0,
      },
    });

    revalidatePath("/admin/attributes");
    return {
      success: true,
      data: attributeValue,
    };
  } catch (error: any) {
    console.error("Error in createAttributeValue:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return {
        success: false,
        error: "This value already exists for this attribute",
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

export async function updateAttributeValue(
  id: string,
  input: Partial<AttributeValueInput>
) {
  try {
    const attributeValue = await prisma.product_attribute_values.update({
      where: { id },
      data: {
        value: input.value,
        display_name: input.display_name,
        display_order: input.display_order,
      },
    });

    revalidatePath("/admin/attributes");
    return {
      success: true,
      data: attributeValue,
    };
  } catch (error: any) {
    console.error("Error in updateAttributeValue:", error);

    if (error.code === "P2025") {
      return {
        success: false,
        error: "Attribute value not found",
      };
    }

    if (error.code === "P2002") {
      return {
        success: false,
        error: "This value already exists for this attribute",
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

export async function deleteAttributeValue(id: string) {
  try {
    // Check if this attribute value is being used in any variants
    const variantCount = await prisma.product_variants.count({
      where: {
        OR: [
          { material_id: id },
          { size_id: id },
          { thickness_id: id },
        ],
      },
    });

    if (variantCount > 0) {
      return {
        success: false,
        error: `Cannot delete. This value is used in ${variantCount} product variant(s)`,
      };
    }

    await prisma.product_attribute_values.delete({
      where: { id },
    });

    revalidatePath("/admin/attributes");
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error in deleteAttributeValue:", error);

    if (error.code === "P2025") {
      return {
        success: false,
        error: "Attribute value not found",
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

export async function reorderAttributeValues(
  updates: { id: string; display_order: number }[]
) {
  try {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.product_attribute_values.update({
          where: { id: update.id },
          data: { display_order: update.display_order },
        })
      )
    );

    revalidatePath("/admin/attributes");
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error in reorderAttributeValues:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
