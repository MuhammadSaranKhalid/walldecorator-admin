import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentOrders } from "@/lib/queries/dashboard";
import { format } from "date-fns";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { OrderStatus } from "@/types/orders";

const statusConfig: Record<string, {
  label: string;
  className: string;
  dotColor: string;
}> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    dotColor: "bg-yellow-500",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    dotColor: "bg-cyan-500",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
  shipped: {
    label: "Shipped",
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    dotColor: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive",
    dotColor: "bg-destructive",
  },
  refunded: {
    label: "Refunded",
    className: "bg-primary/10 text-primary",
    dotColor: "bg-primary",
  },
};

export async function DashboardRecentOrders({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const orders = await getRecentOrders(searchParams, 5);

  if (orders.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[200px]">
          <p className="text-muted-foreground">No orders found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {orders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const isLast = index === orders.length - 1;
            return (
              <div
                key={order.id}
                className={`flex items-center gap-4 p-4 ${!isLast ? "border-b" : ""
                  } hover:bg-muted/50 transition-colors`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">
                    {order.customer_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-1 flex-col min-w-0">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-medium leading-none truncate pr-2">
                      {order.customer_name}
                    </p>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {order.currency} {order.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full mt-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                      <span className="truncate">{order.customer_email}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full mt-2">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${status.className}`}>
                      <span className={`w-1 h-1 mr-1 ${status.dotColor} rounded-full inline-block`}></span>
                      {status.label}
                    </Badge>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-block text-[10px] text-muted-foreground">#{order.order_number}</span>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[11px] font-medium text-primary hover:underline whitespace-nowrap"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
