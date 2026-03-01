"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order, OrderStatus } from "@/types/orders";
import { format } from "date-fns";

interface OrdersTableProps {
  orders: Order[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
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

export function OrdersTable({ orders, total, currentPage, totalPages, limit }: OrdersTableProps) {
  const router = useRouter();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`/admin/orders?${params.toString()}`);
  };

  const getCustomerInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No orders found matching your criteria.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const status = statusConfig[order.status];
              const itemCount = order.order_items?.length || 0;

              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOrder(order.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    #{order.order_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getCustomerInitials(order.customer_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm">{order.customer_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {order.customer_email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.currency} {Number(order.total_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={status.className}>
                      <span className={`w-2 h-2 mr-1.5 ${status.dotColor} rounded-full inline-block`}></span>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 flex flex-col md:flex-row justify-between items-center text-sm border-t">
        <div className="text-muted-foreground mb-4 md:mb-0">
          Showing <span className="font-semibold text-foreground">{from}–{to}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span> orders
        </div>
        <nav className="inline-flex items-center -space-x-px">
          <Button
            variant="outline"
            size="sm"
            className="rounded-r-none"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                className="rounded-none"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            className="rounded-l-none"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </nav>
      </div>
    </Card>
  );
}
