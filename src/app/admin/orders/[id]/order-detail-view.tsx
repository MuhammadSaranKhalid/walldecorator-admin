"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  User,
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  RefreshCw,
  ShoppingBag,
  Mail,
  Phone,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order, OrderAddress, OrderStatus } from "@/types/orders";
import { format, formatDistanceToNow } from "date-fns";
import { OrderStatusUpdate } from "./order-status-update";

interface OrderDetailViewProps {
  order: Order;
}

/* ─── Status config ─────────────────────────────────────── */
const statusConfig: Record<OrderStatus, {
  label: string;
  badgeClass: string;
  dotColor: string;
  bgClass: string;
  textClass: string;
  icon: React.ElementType;
}> = {
  pending: { label: "Pending", badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dotColor: "bg-amber-400", bgClass: "bg-amber-50 dark:bg-amber-950/30", textClass: "text-amber-700 dark:text-amber-300", icon: Clock },
  confirmed: { label: "Confirmed", badgeClass: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300", dotColor: "bg-cyan-500", bgClass: "bg-cyan-50 dark:bg-cyan-950/30", textClass: "text-cyan-700 dark:text-cyan-300", icon: CheckCircle2 },
  processing: { label: "Processing", badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300", dotColor: "bg-blue-500", bgClass: "bg-blue-50 dark:bg-blue-950/30", textClass: "text-blue-700 dark:text-blue-300", icon: RefreshCw },
  shipped: { label: "Shipped", badgeClass: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300", dotColor: "bg-violet-500", bgClass: "bg-violet-50 dark:bg-violet-950/30", textClass: "text-violet-700 dark:text-violet-300", icon: Truck },
  delivered: { label: "Delivered", badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", dotColor: "bg-emerald-500", bgClass: "bg-emerald-50 dark:bg-emerald-950/30", textClass: "text-emerald-700 dark:text-emerald-300", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", dotColor: "bg-red-500", bgClass: "bg-red-50 dark:bg-red-950/30", textClass: "text-red-700 dark:text-red-300", icon: XCircle },
  refunded: { label: "Refunded", badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", dotColor: "bg-orange-500", bgClass: "bg-orange-50 dark:bg-orange-950/30", textClass: "text-orange-700 dark:text-orange-300", icon: RefreshCw },
};

/* Progress steps shown at top */
const progressSteps: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "processing", label: "Processing" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

const terminalStatuses: OrderStatus[] = ["cancelled", "refunded"];

/* ─── Helpers ───────────────────────────────────────────── */
const fmt = (amount: number, currency: string) =>
  `${currency} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const paymentStatusStyles: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  authorized: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  partially_refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

function AddressBlock({ address, label }: { address: OrderAddress | null; label: string }) {
  if (!address) return null;
  return (
    <div className="space-y-0.5 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      {address.full_name && <p className="font-medium text-foreground">{address.full_name}</p>}
      {address.address_line1 && <p className="text-muted-foreground">{address.address_line1}</p>}
      {address.address_line2 && <p className="text-muted-foreground">{address.address_line2}</p>}
      {(address.city || address.province || address.postal_code) && (
        <p className="text-muted-foreground">
          {[address.city, address.province, address.postal_code].filter(Boolean).join(", ")}
        </p>
      )}
      {address.country && <p className="text-muted-foreground">{address.country}</p>}
      {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────── */
export function OrderDetailView({ order: initialOrder }: OrderDetailViewProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);

  const orderStatus = order.status;
  const s = statusConfig[orderStatus];
  const StatusIcon = s.icon;
  const isTerminal = terminalStatuses.includes(orderStatus);

  /* progress bar current index */
  const progressIndex = progressSteps.findIndex(p => p.status === orderStatus);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Breadcrumb / Back ─────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push("/admin/orders")}
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Orders
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">#{order.order_number}</span>
      </div>

      {/* ── Hero header ──────────────────────────────── */}
      <div className={`rounded-2xl border p-6 ${s.bgClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${s.dotColor} bg-opacity-20`}>
              <StatusIcon className={`h-6 w-6 ${s.textClass}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Order #{order.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })} ·{" "}
                {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${s.badgeClass} px-3 py-1 text-sm font-semibold border-0`}>
              <span className={`w-2 h-2 mr-2 ${s.dotColor} rounded-full inline-block`} />
              {s.label}
            </Badge>
          </div>
        </div>

        {/* Progress stepper — only for non-terminal statuses */}
        {!isTerminal && (
          <div className="mt-6">
            <div className="flex items-center">
              {progressSteps.map((step, i) => {
                const isCompleted = progressIndex > i;
                const isCurrent = progressIndex === i;
                return (
                  <div key={step.status} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                          ? "bg-emerald-500 border-emerald-500"
                          : isCurrent
                            ? `${s.dotColor} border-current opacity-100`
                            : "border-muted-foreground/30 bg-background"
                        }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : isCurrent ? (
                          <Circle className={`h-4 w-4 ${s.textClass} fill-current`} />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/30" />
                        )}
                      </div>
                      <span className={`text-xs font-medium mt-1 hidden sm:block whitespace-nowrap ${isCurrent ? s.textClass : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50"
                        }`}>{step.label}</span>
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 rounded ${isCompleted ? "bg-emerald-400" : "bg-muted-foreground/20"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isTerminal && (
          <div className={`mt-4 flex items-center gap-2 text-sm ${s.textClass} font-medium`}>
            <StatusIcon className="h-4 w-4" />
            This order has been {orderStatus}.
            {order.cancelled_at && ` · ${format(new Date(order.cancelled_at), "MMM d, yyyy 'at' h:mm a")}`}
          </div>
        )}
      </div>

      {/* ── Quick-stat strip ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Order Total", value: fmt(order.total_amount, order.currency), icon: ShoppingBag, color: "text-primary" },
          { label: "Items", value: `${order.order_items?.length ?? 0} items`, icon: Package, color: "text-blue-500" },
          { label: "Payment", value: (order.payment_status ?? "N/A").replace(/_/g, " "), icon: CreditCard, color: order.payment_status === "paid" ? "text-emerald-500" : "text-amber-500" },
          { label: "Method", value: (order.payment_method ?? "N/A").replace(/_/g, " "), icon: CreditCard, color: "text-purple-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
            <p className="font-semibold text-foreground capitalize">{value}</p>
          </Card>
        ))}
      </div>

      {/* ── Main grid ────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-muted-foreground" />
                Order Items
                <Badge variant="secondary" className="ml-auto font-normal">{order.order_items?.length ?? 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {order.order_items && order.order_items.length > 0 ? (
                <div>
                  {order.order_items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 p-4 ${idx < order.order_items!.length - 1 ? "border-b" : ""}`}
                    >
                      {/* Thumbnail placeholder */}
                      <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight">{item.product_name}</p>
                        {item.variant_description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.variant_description}</p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono mt-1">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {fmt(item.unit_price, order.currency)} × {item.quantity}
                        </p>
                        <p className="font-bold text-sm mt-0.5">
                          {fmt(item.total_price, order.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Totals */}
                  <div className="bg-muted/30 px-4 py-3 space-y-2 border-t">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{fmt(order.subtotal, order.currency)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                        <span>Discount</span>
                        <span>− {fmt(order.discount_amount, order.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping</span>
                      <span>{fmt(order.shipping_cost, order.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tax</span>
                      <span>{fmt(order.tax_amount, order.currency)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>{fmt(order.total_amount, order.currency)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">No items found.</div>
              )}
            </CardContent>
          </Card>

          {/* Shipping & Billing Addresses side by side */}
          {(order.shipping_address || order.billing_address) && (
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid sm:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <Truck className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <AddressBlock address={order.shipping_address} label="Shipping" />
                </div>
                {order.billing_address && (
                  <>
                    <Separator className="sm:hidden" />
                    <div className="flex gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <AddressBlock address={order.billing_address} label="Billing" />
                    </div>
                  </>
                )}
                {/* Fulfillment timestamps */}
                {(order.shipped_at || order.delivered_at) && (
                  <div className="sm:col-span-2 pt-2 border-t flex flex-wrap gap-6">
                    {order.shipped_at && (
                      <InfoRow label="Shipped">
                        {format(new Date(order.shipped_at), "MMM d, yyyy 'at' h:mm a")}
                      </InfoRow>
                    )}
                    {order.delivered_at && (
                      <InfoRow label="Delivered">
                        {format(new Date(order.delivered_at), "MMM d, yyyy 'at' h:mm a")}
                      </InfoRow>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          {order.order_status_history && order.order_status_history.length > 0 && (
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ol className="relative space-y-5">
                  {[...order.order_status_history].reverse().map((entry, i, arr) => {
                    const toStatus = (entry.to_status ?? "pending") as OrderStatus;
                    const cfg = statusConfig[toStatus] ?? statusConfig.pending;
                    const Icon = cfg.icon;
                    const isLast = i === arr.length - 1;
                    return (
                      <li key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${cfg.bgClass} border-current ${cfg.textClass}`}>
                            <Icon className={`h-3.5 w-3.5 ${cfg.textClass}`} />
                          </div>
                          {!isLast && <div className="w-0.5 flex-1 bg-border mt-1 min-h-[16px]" />}
                        </div>
                        <div className="pb-4 flex-1">
                          <div className="flex items-baseline gap-2">
                            <p className="text-sm font-semibold capitalize">
                              {entry.from_status
                                ? <>
                                  <span className="text-muted-foreground line-through">{entry.from_status}</span>
                                  {" → "}
                                  <span>{entry.to_status}</span>
                                </>
                                : entry.to_status}
                            </p>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.badgeClass}`}>
                              {entry.changed_by_type ?? "system"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })} ·{" "}
                            {format(new Date(entry.created_at), "MMM d, yyyy h:mm a")}
                          </p>
                          {entry.notes && (
                            <p className="text-xs mt-1.5 text-muted-foreground bg-muted rounded-md px-2.5 py-1.5 italic">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {order.customer_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{order.customer_name}</p>
                </div>
              </div>
              <Separator />
              <a href={`mailto:${order.customer_email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <Mail className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                <span className="truncate">{order.customer_email}</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <Phone className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                <span>{order.customer_phone}</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Payment status pill */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${paymentStatusStyles[order.payment_status ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                  {(order.payment_status ?? "N/A").replace(/_/g, " ")}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Method</span>
                  <span className="text-sm capitalize">{order.payment_method.replace(/_/g, " ")}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</span>
                <span className="text-sm font-bold">{fmt(order.total_amount, order.currency)}</span>
              </div>
              {order.payment_intent_id && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Transaction ID</p>
                    <p className="text-xs font-mono text-muted-foreground break-all bg-muted px-2 py-1.5 rounded">
                      {order.payment_intent_id}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground italic">"{order.notes}"</p>
              </CardContent>
            </Card>
          )}

          {/* Update Panel */}
          <OrderStatusUpdate order={order} onUpdate={setOrder} />
        </div>
      </div>
    </div>
  );
}
