"use server";

import prisma from "@/lib/prisma";
import { Order, OrderStatus } from "@/types/orders";
import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

function mapOrder(raw: Prisma.ordersGetPayload<{
    include: { order_items: true; order_status_history: true }
}>): Order {
    return {
        id: raw.id,
        order_number: raw.order_number,
        status: (raw.status ?? 'pending') as OrderStatus,
        customer_email: raw.customer_email,
        customer_name: raw.customer_name,
        customer_phone: raw.customer_phone,
        shipping_address: raw.shipping_address as Order['shipping_address'],
        billing_address: raw.billing_address as Order['billing_address'],
        subtotal: raw.subtotal.toNumber(),
        discount_amount: raw.discount_amount?.toNumber() ?? 0,
        shipping_cost: raw.shipping_cost?.toNumber() ?? 0,
        tax_amount: raw.tax_amount?.toNumber() ?? 0,
        total_amount: raw.total_amount.toNumber(),
        currency: raw.currency,
        payment_status: raw.payment_status as Order['payment_status'],
        payment_intent_id: raw.payment_intent_id ?? null,
        payment_method: raw.payment_method ?? null,
        notes: raw.notes ?? null,
        confirmed_at: raw.confirmed_at?.toISOString() ?? null,
        shipped_at: raw.shipped_at?.toISOString() ?? null,
        delivered_at: raw.delivered_at?.toISOString() ?? null,
        cancelled_at: raw.cancelled_at?.toISOString() ?? null,
        created_at: raw.created_at.toISOString(),
        updated_at: raw.updated_at.toISOString(),
        order_items: raw.order_items.map(item => ({
            id: item.id,
            order_id: item.order_id,
            variant_id: item.variant_id ?? null,
            product_name: item.product_name,
            variant_description: item.variant_description ?? null,
            sku: item.sku,
            quantity: item.quantity,
            unit_price: item.unit_price.toNumber(),
            total_price: item.total_price.toNumber(),
            created_at: item.created_at.toISOString(),
        })),
        order_status_history: raw.order_status_history.map(h => ({
            id: h.id,
            order_id: h.order_id,
            from_status: h.from_status ?? null,
            to_status: h.to_status,
            changed_by_type: h.changed_by_type ?? 'system',
            notes: h.notes ?? null,
            created_at: h.created_at.toISOString(),
        })),
    };
}

export async function updateOrderStatusAction(
    orderId: string,
    status: OrderStatus,
    notes?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        const updateData: Prisma.ordersUpdateInput = {
            status,
            updated_at: new Date(),
        };

        if (notes !== undefined && notes !== '') {
            updateData.notes = notes;
        }

        const raw = await prisma.orders.update({
            where: { id: orderId },
            data: updateData,
            include: {
                order_items: true,
                order_status_history: { orderBy: { created_at: 'asc' } },
            },
        });

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');

        return { success: true, order: mapOrder(raw) };
    } catch (error: unknown) {
        console.error('updateOrderStatusAction error:', error);
        const message = error instanceof Error ? error.message : 'Failed to update order';
        return { success: false, error: message };
    }
}
