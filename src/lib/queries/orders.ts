import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { Order, OrderFilters, OrderListResponse, OrderStatus } from "@/types/orders";

// Helper: convert Prisma orders row → our Order type (handles Decimal → number)
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

// Helper for list queries (no relations included)
function mapOrderRow(raw: Prisma.ordersGetPayload<{
  include: { order_items: true }
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
  };
}

export async function getOrders(
  filters: OrderFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<OrderListResponse> {
  // Build Prisma where clause
  const where: Prisma.ordersWhereInput = {};

  if (filters.search) {
    const q = filters.search;
    where.OR = [
      { order_number: { contains: q, mode: 'insensitive' } },
      { customer_email: { contains: q, mode: 'insensitive' } },
      { customer_name: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (filters.status && filters.status !== 'all') {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.created_at = {};
    if (filters.dateFrom) {
      where.created_at.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setDate(dateTo.getDate() + 1);
      where.created_at.lt = dateTo;
    }
  }

  const [rawOrders, total] = await Promise.all([
    prisma.orders.findMany({
      where,
      include: { order_items: true },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.orders.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    orders: rawOrders.map(mapOrderRow),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const raw = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      order_items: true,
      order_status_history: {
        orderBy: { created_at: 'asc' },
      },
    },
  });

  if (!raw) return null;
  return mapOrder(raw);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<Order | null> {
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
      order_status_history: {
        orderBy: { created_at: 'asc' },
      },
    },
  });

  return mapOrder(raw);
}

export async function updateOrderNotes(
  orderId: string,
  notes: string
): Promise<Order | null> {
  const raw = await prisma.orders.update({
    where: { id: orderId },
    data: { notes, updated_at: new Date() },
    include: {
      order_items: true,
      order_status_history: {
        orderBy: { created_at: 'asc' },
      },
    },
  });

  return mapOrder(raw);
}

export async function getOrderStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const stats = await prisma.orders.findMany({
    where: { created_at: { gte: thirtyDaysAgo } },
    select: { status: true, total_amount: true },
  });

  const statusCounts = stats.reduce((acc: Record<string, number>, o) => {
    const s = o.status ?? 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const totalRevenue = stats.reduce((sum, o) => sum + o.total_amount.toNumber(), 0);

  return {
    statusCounts,
    totalRevenue,
    totalOrders: stats.length,
  };
}
