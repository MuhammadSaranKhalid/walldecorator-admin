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
