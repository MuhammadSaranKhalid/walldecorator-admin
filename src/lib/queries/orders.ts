// import { createSupabaseServerClient } from "@/utils/supabase/server";
import { Order, OrderFilters, OrderListResponse } from "@/types/orders";
import { supabaseBrowserClient as supabase } from "@utils/supabase/client";

export async function getOrders(
  filters: OrderFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<OrderListResponse> {
  // const supabase = await supabaseBrowserClient();

  let query = supabase
    .from('orders')
    .select(`
      *,
      customer:customers (
        id,
        email,
        first_name,
        last_name,
        phone
      ),
      shipping_address:addresses!orders_shipping_address_id_fkey (
        id,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country
      ),
      order_items (
        id,
        product_name,
        material_name,
        quantity,
        unit_price,
        total_price
      )
    `, { count: 'exact' });

  // Apply filters
  if (filters.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,customer.email.ilike.%${filters.search}%`
    );
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    orders: (data as Order[]) || [],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  // const supabase = await createBrowserClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers (
        id,
        email,
        first_name,
        last_name,
        phone,
        accepts_marketing
      ),
      shipping_address:addresses!orders_shipping_address_id_fkey (
        *
      ),
      billing_address:addresses!orders_billing_address_id_fkey (
        *
      ),
      order_items (
        *,
        product:products (
          id,
          name,
          slug,
          sku,
          primary_image_url
        ),
        product_material:product_materials (
          id,
          price,
          material:materials (
            id,
            name,
            slug
          )
        )
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data as Order;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  adminNote?: string
): Promise<Order | null> {
  // const supabase = await createBrowserClient();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (adminNote) {
    updateData.admin_note = adminNote;
  }

  // Update timestamps based on status
  if (status === 'shipped' && !updateData.shipped_at) {
    updateData.shipped_at = new Date().toISOString();
  } else if (status === 'delivered' && !updateData.delivered_at) {
    updateData.delivered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  return data as Order;
}

export async function updateTrackingNumber(
  orderId: string,
  trackingNumber: string
): Promise<Order | null> {
  // const supabase = await createBrowserClient();

  const { data, error } = await supabase
    .from('orders')
    .update({
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating tracking number:', error);
    throw error;
  }

  return data as Order;
}

export async function getOrderStats() {
  // const supabase = await createBrowserClient();

  const { data: stats, error } = await supabase
    .from('orders')
    .select('status, total')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching order stats:', error);
    return null;
  }

  const statusCounts = stats?.reduce((acc: any, order: any) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const totalRevenue = stats?.reduce((sum: number, order: any) => sum + parseFloat(order.total || 0), 0);

  return {
    statusCounts,
    totalRevenue,
    totalOrders: stats?.length || 0,
  };
}
