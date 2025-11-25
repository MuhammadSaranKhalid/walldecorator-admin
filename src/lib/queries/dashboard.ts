import { supabaseBrowserClient as supabase } from "@/utils/supabase/client";

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
  total: number;
  status: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get all orders
  const { data: allOrders } = await supabase
    .from('orders')
    .select('total, created_at, status')
    .neq('status', 'cancelled');

  // Calculate total revenue
  const totalRevenue = allOrders?.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0) || 0;

  // Get this month's orders
  const { data: thisMonthOrders } = await supabase
    .from('orders')
    .select('total, created_at')
    .gte('created_at', firstDayThisMonth.toISOString())
    .neq('status', 'cancelled');

  // Get last month's orders
  const { data: lastMonthOrders } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', firstDayLastMonth.toISOString())
    .lte('created_at', lastDayLastMonth.toISOString())
    .neq('status', 'cancelled');

  const monthRevenue = thisMonthOrders?.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0) || 0;
  const lastMonthRevenue = lastMonthOrders?.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0) || 0;
  const monthRevenueChange = lastMonthRevenue > 0
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  // Get new orders count (this month)
  const newOrders = thisMonthOrders?.length || 0;
  const lastMonthOrdersCount = lastMonthOrders?.length || 0;
  const newOrdersChange = lastMonthOrdersCount > 0
    ? ((newOrders - lastMonthOrdersCount) / lastMonthOrdersCount) * 100
    : 0;

  // Get pending customizations
  const { data: thisMonthCustomizations } = await supabase
    .from('customization_requests')
    .select('id, created_at')
    .eq('status', 'pending')
    .gte('created_at', firstDayThisMonth.toISOString());

  const { data: lastMonthCustomizations } = await supabase
    .from('customization_requests')
    .select('id')
    .eq('status', 'pending')
    .gte('created_at', firstDayLastMonth.toISOString())
    .lte('created_at', lastDayLastMonth.toISOString());

  const pendingCustomizations = thisMonthCustomizations?.length || 0;
  const lastMonthCustomizationsCount = lastMonthCustomizations?.length || 0;
  const pendingCustomizationsChange = lastMonthCustomizationsCount > 0
    ? ((pendingCustomizations - lastMonthCustomizationsCount) / lastMonthCustomizationsCount) * 100
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

export async function getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      total,
      status,
      customer:customers (
        first_name,
        last_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }

  return (data || []).map(order => {
    // Supabase returns customer as an array, so we need to get the first element
    const customerData = order.customer as any;
    const customer = Array.isArray(customerData) ? customerData[0] : customerData;

    return {
      id: order.id,
      order_number: order.order_number,
      customer_name: customer
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Guest'
        : 'Guest',
      customer_email: customer?.email || '',
      created_at: order.created_at,
      total: parseFloat(order.total || '0'),
      status: order.status,
    };
  });
}

export async function getMonthlySalesData() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const { data, error } = await supabase
    .from('orders')
    .select('total, created_at')
    .gte('created_at', startDate.toISOString())
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching monthly sales data:', error);
    return [];
  }

  // Group by month
  const monthlyData = new Map<string, number>();

  data?.forEach(order => {
    const date = new Date(order.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyData.get(monthKey) || 0;
    monthlyData.set(monthKey, current + parseFloat(order.total || '0'));
  });

  return Array.from(monthlyData.entries()).map(([month, total]) => ({
    month,
    total,
  }));
}
