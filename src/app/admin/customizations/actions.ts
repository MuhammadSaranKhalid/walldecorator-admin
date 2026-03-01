"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCustomOrderStatus(orderId: string, status: string) {
    try {
        const validStatuses = [
            'pending', 'reviewing', 'quoted', 'approved',
            'in_production', 'shipped', 'completed', 'cancelled'
        ];

        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }

        const order = await prisma.custom_orders.update({
            where: { id: orderId },
            data: { status },
        });

        revalidatePath(`/admin/customizations/${orderId}`);
        revalidatePath(`/admin/customizations`);
        revalidatePath(`/admin`); // for dashboard stats
        return { success: true, order };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update status." };
    }
}

export async function quoteCustomOrderPrice(orderId: string, price: number, notes: string) {
    try {
        if (price <= 0) throw new Error("Price must be greater than zero.");

        const order = await prisma.custom_orders.update({
            where: { id: orderId },
            data: {
                quoted_price: price,
                admin_notes: notes,
                status: 'quoted', // automatically update status
            },
        });

        revalidatePath(`/admin/customizations/${orderId}`);
        revalidatePath(`/admin/customizations`);
        revalidatePath(`/admin`); // update dashboard stats
        return { success: true, order };
    } catch (error) {
        console.error("Failed to quote price:", error);
        return { success: false, error: "Failed to quote price." };
    }
}
