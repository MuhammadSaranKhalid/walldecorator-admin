// Database types for orders based on schema

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  accepts_marketing: boolean;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  customer_id: string;
  address_type: 'shipping' | 'billing' | 'both';
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  primary_image_url: string | null;
}

export interface Material {
  id: string;
  name: string;
  slug: string;
}

export interface ProductMaterial {
  id: string;
  product_id: string;
  material_id: string;
  price: number;
  material?: Material;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_material_id: string | null;
  product_name: string;
  product_sku: string | null;
  material_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
  product_material?: ProductMaterial;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  shipping_address_id: string | null;
  shipping_method: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  billing_address_id: string | null;
  customer_note: string | null;
  admin_note: string | null;
  payment_method: string | null;
  payment_status: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  shipping_address?: Address;
  billing_address?: Address;
  order_items?: OrderItem[];
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
