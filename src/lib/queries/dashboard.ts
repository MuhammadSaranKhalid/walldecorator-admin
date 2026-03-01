import prisma from "@/lib/prisma";

export interface DashboardStats {
  totalRevenue: number;
  monthRevenue: number;
  monthRevenueChange: number;
  newOrders: number;
  newOrdersChange: number;
  pendingCustomizations: number;
  pendingCustomizationsChange: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  total_amount: number;
  currency: string;
  status: string;
}

export function getDateRangeFromParams(searchParams?: { [key: string]: string | string[] | undefined }) {
  const range = (searchParams?.range as string) || "30";
  const end = new Date();
  const start = new Date();
  const previousStart = new Date();
  const previousEnd = new Date();

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      previousStart.setDate(start.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setDate(start.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      break;
    case "7":
      start.setDate(end.getDate() - 7);
      previousEnd.setTime(start.getTime());
      previousStart.setDate(previousEnd.getDate() - 7);
      break;
    case "30":
    default: // 30 is default
      start.setDate(end.getDate() - 30);
      previousEnd.setTime(start.getTime());
      previousStart.setDate(previousEnd.getDate() - 30);
      break;
    case "90":
      start.setDate(end.getDate() - 90);
      previousEnd.setTime(start.getTime());
      previousStart.setDate(previousEnd.getDate() - 90);
      break;
    case "ytd":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      previousStart.setFullYear(start.getFullYear() - 1, 0, 1);
      previousEnd.setFullYear(start.getFullYear() - 1, end.getMonth(), end.getDate());
      break;
    case "all":
      start.setFullYear(2000, 0, 1);
      previousStart.setFullYear(1900, 0, 1);
      previousEnd.setTime(start.getTime());
      break;
  }
  return { start, end, previousStart, previousEnd };
}

export async function getDashboardStats(
  searchParams?: { [key: string]: string | string[] | undefined }
): Promise<DashboardStats> {
  const { start: currentStart, end: currentEnd, previousStart, previousEnd } = getDateRangeFromParams(searchParams);

  const [allOrders, currentPeriodOrders, previousPeriodOrders] = await Promise.all([
    prisma.orders.findMany({
      where: { status: { not: 'cancelled' } },
      select: { total_amount: true },
    }),
    prisma.orders.findMany({
      where: {
        status: { not: 'cancelled' },
        created_at: { gte: currentStart, lte: currentEnd },
      },
      select: { total_amount: true },
    }),
    prisma.orders.findMany({
      where: {
        status: { not: 'cancelled' },
        created_at: { gte: previousStart, lte: previousEnd },
      },
      select: { total_amount: true },
    }),
  ]);

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total_amount.toNumber(), 0);
  const monthRevenue = currentPeriodOrders.reduce((sum, o) => sum + o.total_amount.toNumber(), 0);
  const lastMonthRevenue = previousPeriodOrders.reduce((sum, o) => sum + o.total_amount.toNumber(), 0);

  const monthRevenueChange = lastMonthRevenue > 0
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  const newOrders = currentPeriodOrders.length;
  const lastMonthOrdersCount = previousPeriodOrders.length;
  const newOrdersChange = lastMonthOrdersCount > 0
    ? ((newOrders - lastMonthOrdersCount) / lastMonthOrdersCount) * 100
    : 0;

  const [currentPeriodC, previousPeriodC] = await Promise.all([
    prisma.custom_orders.count({
      where: {
        status: { in: ['pending', 'reviewing'] },
        created_at: { gte: currentStart, lte: currentEnd },
      },
    }),
    prisma.custom_orders.count({
      where: {
        status: { in: ['pending', 'reviewing'] },
        created_at: { gte: previousStart, lte: previousEnd },
      },
    }),
  ]);

  const pendingCustomizations = currentPeriodC;
  const pendingCustomizationsChange = previousPeriodC > 0
    ? ((currentPeriodC - previousPeriodC) / previousPeriodC) * 100
    : 0;

  return {
    totalRevenue,
    monthRevenue,
    monthRevenueChange,
    newOrders,
    newOrdersChange,
    pendingCustomizations,
    pendingCustomizationsChange,
  };
}

export async function getRecentOrders(
  searchParams?: { [key: string]: string | string[] | undefined },
  limit: number = 5
): Promise<RecentOrder[]> {
  const { start, end } = getDateRangeFromParams(searchParams);

  const orders = await prisma.orders.findMany({
    where: {
      status: { not: 'cancelled' },
      created_at: { gte: start, lte: end },
    },
    select: {
      id: true,
      order_number: true,
      customer_name: true,
      customer_email: true,
      created_at: true,
      total_amount: true,
      currency: true,
      status: true,
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });

  return orders.map(o => ({
    id: o.id,
    order_number: o.order_number,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    created_at: o.created_at.toISOString(),
    total_amount: o.total_amount.toNumber(),
    currency: o.currency,
    status: o.status ?? 'pending',
  }));
}

export async function getSalesChartData(
  searchParams?: { [key: string]: string | string[] | undefined }
) {
  const { start, end } = getDateRangeFromParams(searchParams);
  const range = (searchParams?.range as string) || "30";

  // Decide grouping based on range duration
  const groupByMonth = range === "ytd" || range === "all";

  const orders = await prisma.orders.findMany({
    where: {
      status: { not: 'cancelled' },
      created_at: { gte: start, lte: end },
    },
    select: { total_amount: true, created_at: true },
    orderBy: { created_at: 'asc' },
  });

  const chartData = new Map<string, number>();

  orders.forEach(o => {
    const date = o.created_at;
    let key;
    if (groupByMonth) {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    const current = chartData.get(key) || 0;
    chartData.set(key, current + o.total_amount.toNumber());
  });

  return Array.from(chartData.entries()).map(([label, total]) => ({
    label,
    total,
  }));
}

export async function getLowStockAlerts(limit: number = 5) {
  const alerts = await prisma.inventory.findMany({
    where: {
      quantity_available: {
        lte: prisma.inventory.fields.low_stock_threshold,
      },
    },
    include: {
      product_variants: {
        include: {
          products: {
            select: { name: true, slug: true },
          },
          product_attribute_values_product_variants_size_idToproduct_attribute_values: {
            select: { display_name: true },
          },
          product_attribute_values_product_variants_material_idToproduct_attribute_values: {
            select: { display_name: true },
          },
        },
      },
    },
    take: limit,
    orderBy: { quantity_available: 'asc' },
  });

  return alerts.map(alert => ({
    id: alert.id,
    variant_id: alert.variant_id,
    quantity_available: alert.quantity_available,
    low_stock_threshold: alert.low_stock_threshold,
    product_name: alert.product_variants.products.name,
    sku: alert.product_variants.sku,
    size: alert.product_variants.product_attribute_values_product_variants_size_idToproduct_attribute_values?.display_name,
    material: alert.product_variants.product_attribute_values_product_variants_material_idToproduct_attribute_values?.display_name,
  }));
}

export async function getTopProducts(limit: number = 5) {
  const products = await prisma.products.findMany({
    where: { status: 'active' },
    orderBy: { total_sold: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      total_sold: true,
      product_images: {
        where: { is_primary: true },
        select: { storage_path: true },
        take: 1
      },
      product_variants: {
        where: { is_default: true },
        select: { price: true },
        take: 1
      }
    }
  });

  return products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    total_sold: p.total_sold,
    image_url: p.product_images[0]?.storage_path,
    price: p.product_variants[0]?.price?.toNumber() || 0,
  }));
}
