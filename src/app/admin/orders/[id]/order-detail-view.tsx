"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order, OrderStatus } from "@/types/orders";
import { format } from "date-fns";
import { OrderStatusUpdate } from "./order-status-update";

interface OrderDetailViewProps {
  order: Order;
}

const statusConfig: Record<OrderStatus, {
  label: string;
  className: string;
  dotColor: string;
}> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    dotColor: "bg-yellow-500",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300",
    dotColor: "bg-cyan-500",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  shipped: {
    label: "Shipped",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    dotColor: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    dotColor: "bg-red-500",
  },
  refunded: {
    label: "Refunded",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
    dotColor: "bg-orange-500",
  },
};

export function OrderDetailView({ order: initialOrder }: OrderDetailViewProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const status = statusConfig[order.status];

  const getCustomerName = () => {
    if (order.customer?.first_name || order.customer?.last_name) {
      return `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
    }
    return 'Guest';
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    return (
      <>
        <div>{address.address_line1}</div>
        {address.address_line2 && <div>{address.address_line2}</div>}
        <div>
          {address.city}, {address.state} {address.postal_code}
        </div>
        <div>{address.country}</div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/orders')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy \'at\' hh:mm a')}
          </p>
        </div>
        <Badge variant="secondary" className={status.className}>
          <span className={`w-2 h-2 mr-1.5 ${status.dotColor} rounded-full inline-block`}></span>
          {status.label}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Order Items */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    {item.product?.primary_image_url && (
                      <img
                        src={item.product.primary_image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      {item.material_name && (
                        <p className="text-sm text-muted-foreground">
                          Material: {item.material_name}
                        </p>
                      )}
                      {item.product_sku && (
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.product_sku}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${item.unit_price.toFixed(2)} × {item.quantity}
                      </p>
                      <p className="text-sm font-semibold">
                        ${item.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${order.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax_amount.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Shipping Address
                  </p>
                  <div className="text-sm">
                    {formatAddress(order.shipping_address)}
                  </div>
                </div>
                {order.shipping_method && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Shipping Method
                    </p>
                    <p className="text-sm">{order.shipping_method}</p>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Tracking Number
                    </p>
                    <p className="text-sm font-mono">{order.tracking_number}</p>
                  </div>
                )}
                {order.shipped_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Shipped At
                    </p>
                    <p className="text-sm">
                      {format(new Date(order.shipped_at), 'MMMM dd, yyyy \'at\' hh:mm a')}
                    </p>
                  </div>
                )}
                {order.delivered_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Delivered At
                    </p>
                    <p className="text-sm">
                      {format(new Date(order.delivered_at), 'MMMM dd, yyyy \'at\' hh:mm a')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{getCustomerName()}</p>
                {order.customer?.email && (
                  <p className="text-sm text-muted-foreground">
                    {order.customer.email}
                  </p>
                )}
                {order.customer?.phone && (
                  <p className="text-sm text-muted-foreground">
                    {order.customer.phone}
                  </p>
                )}
              </div>
              {order.customer && (
                <>
                  <Separator />
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Total Orders: {order.customer.total_orders}
                    </p>
                    <p className="text-muted-foreground">
                      Total Spent: ${order.customer.total_spent?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.payment_method && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Payment Method
                  </p>
                  <p className="text-sm capitalize">{order.payment_method}</p>
                </div>
              )}
              {order.payment_status && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Payment Status
                  </p>
                  <Badge
                    variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {order.payment_status}
                  </Badge>
                </div>
              )}
              {order.paid_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Paid At
                  </p>
                  <p className="text-sm">
                    {format(new Date(order.paid_at), 'MMMM dd, yyyy \'at\' hh:mm a')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Address */}
          {order.billing_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {formatAddress(order.billing_address)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Status Update */}
          <OrderStatusUpdate order={order} onUpdate={setOrder} />

          {/* Notes */}
          {(order.customer_note || order.admin_note) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.customer_note && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Customer Note
                    </p>
                    <p className="text-sm">{order.customer_note}</p>
                  </div>
                )}
                {order.admin_note && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Admin Note
                    </p>
                    <p className="text-sm">{order.admin_note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
