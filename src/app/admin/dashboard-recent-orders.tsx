import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getRecentOrders } from "@/lib/queries/dashboard";
import { format } from "date-fns";
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

export async function DashboardRecentOrders() {
  const orders = await getRecentOrders(5);

  if (orders.length === 0) {
    return (
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-3 pt-5">
          Recent Orders
        </h2>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No orders found.</p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-3 pt-5">
        Recent Orders
      </h2>
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.order_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{order.customer_name}</span>
                        {order.customer_email && (
                          <span className="text-xs text-muted-foreground">
                            {order.customer_email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={status.className}>
                        <span className={`w-2 h-2 mr-1.5 ${status.dotColor} rounded-full inline-block`}></span>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </section>
  );
}
