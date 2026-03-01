// Orders types — aligned with actual guest-checkout migration schema
// See: supabase/migrations/20250101000009_orders.sql

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

// Shipping/Billing address stored as JSONB snapshot on the orders table
export interface OrderAddress {
  full_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;    // state/province
  postal_code?: string;
  country?: string;
  phone?: string;
  [key: string]: string | undefined; // allow extra fields from JSONB
}

// Order line item — matches order_items table exactly
export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_name: string;
  variant_description: string | null; // e.g. "Metal - 60x40cm - 3mm"
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

// Order status history — matches order_status_history table
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: string | null;
  to_status: string;
  changed_by_type: string; // 'system' | 'admin'
  notes: string | null;
  created_at: string;
}

// Main Order — matches orders table columns exactly
export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;

  // Customer Information (stored directly — guest checkout, no FK)
  customer_email: string;
  customer_name: string;
  customer_phone: string;

  // Addresses (JSONB snapshots)
  shipping_address: OrderAddress;
  billing_address: OrderAddress | null;

  // Financials
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;    // grand total (DB column: total_amount)
  currency: string;        // default 'PKR'

  // Payment
  payment_status: PaymentStatus | null;
  payment_intent_id: string | null;
  payment_method: string | null;  // 'card', 'cash_on_delivery', etc.

  // Metadata
  notes: string | null;

  // Timestamps
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations (optional, depending on query)
  order_items?: OrderItem[];
  order_status_history?: OrderStatusHistory[];
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
